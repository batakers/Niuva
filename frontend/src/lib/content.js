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

const CONTENT_TYPE_FIELD_KEYS = {
  about: ["intro", "dossierItems", "approachSteps", "values"],
  capability: ["title", "body", "output", "targetUsers", "cta", "priority"],
  faq: ["question", "answer", "category", "sort_order"],
  cta: ["label", "title", "body", "primaryActionLabel", "primaryActionTarget"],
  contact: ["location", "email", "whatsapp", "whatsappHref", "mapsHref"],
};

export function emptyFieldsFor(contentType) {
  const keys = CONTENT_TYPE_FIELD_KEYS[contentType] || [];
  return Object.fromEntries(keys.map((key) => [key, key.endsWith("Items") || key.endsWith("Steps") || key === "values" ? [] : ""]));
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
