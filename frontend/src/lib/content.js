import { useEffect, useState } from "react";
import { z } from "zod";
import { HAS_CONFIGURED_BACKEND, api, unwrap } from "./api";

// Public content block shape. Backend may add fields; we only validate the
// keys the frontend actually reads (slug + fields object) so contract drift on
// other keys does not break rendering.
const publicContentBlockSchema = z.object({
  slug: z.string(),
  fields: z.record(z.unknown()).optional().default({}),
}).passthrough();

const publicContentListSchema = z.array(publicContentBlockSchema);

export function parsePublicContentResponse(rows) {
  const result = publicContentListSchema.safeParse(rows);
  if (result.success) {
    return { success: true, blocks: result.data };
  }
  // Public copy must not become a plausible-looking partial result. The
  // caller receives one explicit invalid state for either a malformed
  // top-level value or a malformed row.
  return { success: false, blocks: [] };
}

export const CONTENT_TYPES = ["about", "capability", "faq", "cta", "contact"];

export const contentApi = {
  list: (contentType) => unwrap(api.get("/admin/content", { params: contentType ? { content_type: contentType } : {} })),
  get: (id) => unwrap(api.get(`/admin/content/${id}`)),
  create: (payload) => unwrap(api.post("/admin/content", payload)),
  update: (id, fields, expectedVersion, reason) =>
    unwrap(api.put(`/admin/content/${id}`, {
      fields,
      expected_version: expectedVersion,
      reason,
    })),
  validate: (id) => unwrap(api.post(`/admin/content/${id}/validate`)),
  publish: (id, reason, expectedVersion, scheduledAt) =>
    unwrap(api.post(`/admin/content/${id}/publish`, {
      reason,
      expected_version: expectedVersion,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    })),
  rollback: (id, versionId, reason, expectedVersion) =>
    unwrap(api.post(`/admin/content/${id}/rollback`, {
      version_id: versionId,
      reason,
      expected_version: expectedVersion,
    })),
  archive: (id, reason, expectedVersion) =>
    unwrap(api.post(`/admin/content/${id}/archive`, {
      reason,
      expected_version: expectedVersion,
    })),
  transition: (id, targetStatus, reason, expectedVersion) =>
    unwrap(
      api.post(`/admin/content/${id}/transitions`, {
        target_status: targetStatus,
        reason,
        expected_version: expectedVersion,
      })
    ),
  versions: (id) => unwrap(api.get(`/admin/content/${id}/versions`)),
  public: (contentType) => unwrap(api.get("/content", { params: contentType ? { content_type: contentType } : {} })),
};

// Structured field schema per content type, mirroring the required fields in
// backend/content_domain.py validate_content_fields(). Drives a real form
// instead of a raw JSON textarea.
export const CONTENT_TYPE_SCHEMAS = {
  about: [
    { key: "intro", label: "Intro", type: "textarea" },
    { key: "dossierItems", label: "Dossier Items", type: "itemList", itemFields: ["label", "title", "body"] },
    { key: "approachSteps", label: "Approach Steps", type: "itemList", itemFields: ["label", "title", "body"] },
    { key: "values", label: "Values", type: "stringList" },
  ],
  capability: [
    { key: "title", label: "Title", type: "text" },
    { key: "body", label: "Body", type: "textarea" },
    { key: "output", label: "Output", type: "textarea" },
    { key: "targetUsers", label: "Target Users", type: "text" },
    { key: "cta", label: "CTA Label", type: "text" },
    { key: "priority", label: "Priority", type: "select", options: ["primary", "supporting"] },
    { key: "display_order", label: "Display Order", type: "number", optional: true },
  ],
  faq: [
    { key: "question", label: "Question", type: "text" },
    { key: "answer", label: "Answer", type: "textarea" },
    { key: "category", label: "Category", type: "text", optional: true },
    { key: "sort_order", label: "Sort Order", type: "number", optional: true },
  ],
  cta: [
    { key: "label", label: "Label", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "body", label: "Body", type: "textarea" },
    { key: "primaryActionLabel", label: "Primary Action Label", type: "text" },
    { key: "primaryActionTarget", label: "Primary Action Target (path)", type: "text" },
  ],
  contact: [
    { key: "location", label: "Location", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "whatsapp", label: "WhatsApp (display)", type: "text" },
    { key: "whatsappHref", label: "WhatsApp Link", type: "text" },
    { key: "mapsHref", label: "Maps Link", type: "text", optional: true },
  ],
};

function emptyValueFor(field) {
  if (field.type === "itemList" || field.type === "stringList") return [];
  if (field.type === "number") return 0;
  return "";
}

export function coerceContentFieldValue(field, value) {
  if (field.type !== "number") return value;
  if (value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function emptyFieldsFor(contentType) {
  const schema = CONTENT_TYPE_SCHEMAS[contentType] || [];
  return Object.fromEntries(schema.map((field) => [field.key, emptyValueFor(field)]));
}

export function statusTone(status) {
  if (status === "published") return "success";
  if (status === "review") return "warning";
  if (status === "preview") return "primary";
  if (status === "scheduled") return "primary";
  if (status === "archived") return "muted";
  if (status === "scheduled") return "warning";
  return "foreground";
}

/**
 * Fetch published CMS blocks for a content type. Returns `{ blocks, status }`.
 *
 * `status` exists because callers cannot otherwise tell an in-flight request
 * from a genuinely empty result: both used to surface as `[]`, so the FAQ page
 * rendered its "no questions yet" empty state while the request was still
 * running. `disabled` means no backend is configured, which is a settled state
 * rather than a pending one.
 *
 * Blocks stay `[]` on transport failure, while malformed responses become an
 * explicit `invalid` state so callers cannot mislabel schema drift as ordinary
 * empty or fallback content. ponytail: no cache/retry; add if content pages
 * feel slow.
 */
export function usePublicContent(contentType) {
  const [state, setState] = useState(() => ({
    blocks: [],
    status: HAS_CONFIGURED_BACKEND ? "loading" : "disabled",
  }));

  useEffect(() => {
    if (!HAS_CONFIGURED_BACKEND) {
      setState({ blocks: [], status: "disabled" });
      return undefined;
    }

    let mounted = true;
    setState({ blocks: [], status: "loading" });

    contentApi.public(contentType)
      .then((rows) => {
        if (!mounted) return;
        const parsed = parsePublicContentResponse(rows);
        setState({
          blocks: parsed.blocks,
          status: parsed.success ? "ready" : "invalid",
        });
      })
      .catch(() => {
        if (mounted) setState({ blocks: [], status: "error" });
      });

    return () => { mounted = false; };
  }, [contentType]);

  return state;
}

export function findBySlug(blocks, slug) {
  return blocks.find((block) => block.slug === slug)?.fields;
}

// Mirrors the content router: authoring a block through the review stages is
// content.write, while anything that reaches the public needs content.publish.
export const CONTENT_ACTION_TARGETS = Object.freeze({
  submit_review: "review",
  return_to_draft: "draft",
  approve_preview: "preview",
  return_to_review: "review",
  return_to_preview: "preview",
  publish: "published",
  revise: "draft",
  restore: "draft",
});

export const CONTENT_ACTION_PERMISSIONS = Object.freeze({
  submit_review: "content.write",
  return_to_draft: "content.write",
  approve_preview: "content.write",
  return_to_review: "content.write",
  return_to_preview: "content.write",
  revise: "content.write",
  restore: "content.write",
  publish: "content.publish",
});

export const CONTENT_STAGE_ACTIONS = Object.freeze({
  draft: ["submit_review"],
  review: ["return_to_draft", "approve_preview"],
  preview: ["return_to_review", "publish"],
  scheduled: ["publish", "return_to_preview"],
  published: ["revise"],
  archived: ["restore"],
});
