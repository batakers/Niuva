import { useEffect, useState } from "react";
import { HAS_CONFIGURED_BACKEND, api, unwrap } from "./api";

export const CONTENT_TYPES = ["about", "capability", "faq", "cta", "contact"];

export const contentApi = {
  list: (contentType) => unwrap(api.get("/admin/content", { params: contentType ? { content_type: contentType } : {} })),
  get: (id) => unwrap(api.get(`/admin/content/${id}`)),
  create: (payload) => unwrap(api.post("/admin/content", payload)),
  update: (id, fields) => unwrap(api.put(`/admin/content/${id}`, { fields })),
  validate: (id) => unwrap(api.post(`/admin/content/${id}/validate`)),
  publish: (id, reason, scheduledAt) => unwrap(api.post(`/admin/content/${id}/publish`, { reason, scheduled_at: scheduledAt || null })),
  rollback: (id, versionId, reason) => unwrap(api.post(`/admin/content/${id}/rollback`, { version_id: versionId, reason })),
  archive: (id, reason) => unwrap(api.post(`/admin/content/${id}/archive`, { reason })),
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
  if (field.type === "number") return "";
  return "";
}

export function emptyFieldsFor(contentType) {
  const schema = CONTENT_TYPE_SCHEMAS[contentType] || [];
  return Object.fromEntries(schema.map((field) => [field.key, emptyValueFor(field)]));
}

export function statusTone(status) {
  if (status === "published") return "success";
  if (status === "archived") return "muted";
  if (status === "scheduled") return "warning";
  return "foreground";
}

/**
 * Fetch published CMS blocks for a content type. Returns [] on failure or when
 * no backend is configured — callers should fall back to hardcoded copy rather
 * than block rendering. ponytail: no cache/retry; add if content pages feel slow.
 */
export function usePublicContent(contentType) {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (!HAS_CONFIGURED_BACKEND) return undefined;
    let mounted = true;
    contentApi.public(contentType).then((rows) => {
      if (mounted) setBlocks(rows);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [contentType]);

  return blocks;
}

export function findBySlug(blocks, slug) {
  return blocks.find((block) => block.slug === slug)?.fields;
}
