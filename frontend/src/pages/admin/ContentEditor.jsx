import React, { useCallback, useEffect, useState } from "react";
import { Archive, Edit3, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TechnicalLabel } from "../../components/ui/technical-label";
import { useI18n } from "../../i18n";
import { formatApiError } from "../../lib/api";
import { CONTENT_TYPES, contentApi, emptyFieldsFor, statusTone } from "../../lib/content";
import { AdminLayout } from "./AdminLayout";

export default function ContentEditor() {
  const { t } = useI18n();
  const [contentType, setContentType] = useState("about");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await contentApi.list(contentType));
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  useEffect(() => { load(); }, [load]);

  const createDraft = async () => {
    if (!creating?.slug.trim()) return;
    setBusy(true);
    try {
      const block = await contentApi.create({ content_type: contentType, slug: creating.slug.trim(), fields: emptyFieldsFor(contentType) });
      toast.success(t("content.createSuccess"));
      setCreating(null);
      setEditingId(block.id);
      await load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const archive = async () => {
    if (archiveReason.trim().length < 3) return;
    setBusy(true);
    try {
      await contentApi.archive(archiveTarget.id, archiveReason.trim());
      toast.success(t("content.archiveSuccess"));
      setArchiveTarget(null);
      setArchiveReason("");
      await load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  if (editingId) {
    return <ContentBlockEditorPanel blockId={editingId} onBack={() => { setEditingId(null); load(); }} />;
  }

  return (
    <AdminLayout title={t("admin.content")} subtitle={t("content.subtitle")}>
      <SurfacePanel>
        <SurfacePanelHeader padding="sm" className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            {CONTENT_TYPES.map((type) => (
              <Button key={type} variant={type === contentType ? "technical" : "outline"} size="sm" onClick={() => setContentType(type)}>
                {t(`content.type.${type}`)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />{t("common.refresh")}</Button>
            <Button variant="technical" size="sm" onClick={() => setCreating({ slug: "" })}><Plus className="mr-2 h-4 w-4" />{t("content.create")}</Button>
          </div>
        </SurfacePanelHeader>
      </SurfacePanel>

      <SurfacePanel className="mt-4">
        {loading ? <EmptyState>{t("common.loading")}</EmptyState>
          : error ? <EmptyState><span role="alert">{error}</span></EmptyState>
            : items.length === 0 ? <EmptyState>{t("content.empty")}</EmptyState>
              : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("content.version")}</TableHead>
                    <TableHead>{t("common.updated")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell><div className="font-semibold">{item.slug}</div></TableCell>
                      <TableCell><TechnicalLabel tone={statusTone(item.status)}>{item.status}</TechnicalLabel></TableCell>
                      <TableCell>{item.version}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(item.id)} aria-label={`${t("common.open")} ${item.slug}`}><Edit3 className="h-4 w-4" /></Button>
                          {item.status !== "archived" && <Button variant="ghost" size="sm" onClick={() => setArchiveTarget(item)} aria-label={`${t("content.archive")} ${item.slug}`}><Archive className="h-4 w-4" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              )}
      </SurfacePanel>

      <Dialog open={Boolean(creating)} onOpenChange={(open) => !open && setCreating(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("content.create")} · {t(`content.type.${contentType}`)}</DialogTitle></DialogHeader>
          <label className="space-y-1"><TechnicalLabel>Slug</TechnicalLabel><Input value={creating?.slug || ""} onChange={(event) => setCreating({ slug: event.target.value })} placeholder="mis. company-profile" /></label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(null)}>{t("common.cancel")}</Button>
            <Button disabled={busy || !creating?.slug.trim()} onClick={createDraft}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(archiveTarget)} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("content.archive")} · {archiveTarget?.slug}</DialogTitle></DialogHeader>
          <label className="space-y-1"><TechnicalLabel>{t("common.reason")}</TechnicalLabel><Input value={archiveReason} onChange={(event) => setArchiveReason(event.target.value)} minLength={3} maxLength={500} /></label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveTarget(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" disabled={busy || archiveReason.trim().length < 3} onClick={archive}>{t("content.archive")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export function ContentBlockEditorPanel({ blockId, onBack }) {
  const { t } = useI18n();
  const [block, setBlock] = useState(null);
  const [fieldsJson, setFieldsJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [versions, setVersions] = useState([]);
  const [reason, setReason] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const load = useCallback(async () => {
    const [current, history] = await Promise.all([contentApi.get(blockId), contentApi.versions(blockId)]);
    setBlock(current);
    setFieldsJson(JSON.stringify(current.fields, null, 2));
    setVersions(history);
  }, [blockId]);

  useEffect(() => { load().catch((error) => toast.error(formatApiError(error.response?.data?.detail))); }, [load]);

  const saveDraft = async () => {
    let parsed;
    try {
      parsed = JSON.parse(fieldsJson);
      setJsonError("");
    } catch {
      setJsonError(t("content.invalidJson"));
      return;
    }
    setBusy(true);
    try {
      await contentApi.update(blockId, parsed);
      toast.success(t("content.saveSuccess"));
      await load();
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const runValidate = async () => {
    try {
      const errors = await contentApi.validate(blockId);
      setValidationErrors(errors);
      if (errors.length === 0) toast.success(t("content.validationPassed"));
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    }
  };

  const publish = async () => {
    if (reason.trim().length < 3) return;
    setBusy(true);
    try {
      await contentApi.publish(blockId, reason.trim(), scheduledAt || null);
      toast.success(scheduledAt ? t("content.scheduleSuccess") : t("content.publishSuccess"));
      setReason("");
      setScheduledAt("");
      setValidationErrors([]);
      await load();
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (detail?.errors) setValidationErrors(detail.errors);
      toast.error(formatApiError(detail));
    } finally {
      setBusy(false);
    }
  };

  const rollback = async (versionId) => {
    setBusy(true);
    try {
      await contentApi.rollback(blockId, versionId, "Rollback via admin panel");
      toast.success(t("content.rollbackSuccess"));
      await load();
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  if (!block) return <AdminLayout title={t("admin.content")}><EmptyState>{t("common.loading")}</EmptyState></AdminLayout>;

  return (
    <AdminLayout title={`${t(`content.type.${block.content_type}`)} · ${block.slug}`} subtitle={t("content.editorSubtitle")}>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">← {t("common.back")}</Button>

      <SurfacePanel>
        <SurfacePanelHeader padding="sm" className="flex items-center justify-between">
          <TechnicalLabel tone={statusTone(block.status)}>{block.status} · v{block.version}</TechnicalLabel>
        </SurfacePanelHeader>
        <div className="p-4 space-y-3">
          <label className="space-y-1 block">
            <TechnicalLabel>{t("content.fieldsJson")}</TechnicalLabel>
            <textarea
              value={fieldsJson}
              onChange={(event) => setFieldsJson(event.target.value)}
              rows={12}
              className="w-full border border-border bg-background p-3 font-mono text-xs"
              disabled={block.status === "archived"}
            />
          </label>
          {jsonError && <p className="text-sm text-destructive" role="alert">{jsonError}</p>}
          {validationErrors.length > 0 && (
            <div className="border border-destructive/40 bg-destructive/5 p-3 text-sm">
              {validationErrors.map((err) => <p key={err.field}>{err.field}: {err.message}</p>)}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={busy || block.status === "archived"}>{t("common.save")}</Button>
            <Button variant="outline" size="sm" onClick={runValidate} disabled={block.status === "archived"}>{t("content.validate")}</Button>
          </div>
        </div>
      </SurfacePanel>

      {block.status !== "archived" && (
        <SurfacePanel className="mt-4">
          <SurfacePanelHeader padding="sm"><TechnicalLabel>{t("content.publish")}</TechnicalLabel></SurfacePanelHeader>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            <label className="space-y-1"><TechnicalLabel>{t("common.reason")}</TechnicalLabel><Input value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} /></label>
            <label className="space-y-1"><TechnicalLabel>{t("content.scheduleOptional")}</TechnicalLabel><Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label>
          </div>
          <div className="p-4 pt-0">
            <Button disabled={busy || reason.trim().length < 3} onClick={publish}>{scheduledAt ? t("content.schedule") : t("content.publishNow")}</Button>
          </div>
        </SurfacePanel>
      )}

      <SurfacePanel className="mt-4">
        <SurfacePanelHeader padding="sm"><TechnicalLabel>{t("content.versionHistory")}</TechnicalLabel></SurfacePanelHeader>
        {versions.length === 0 ? <EmptyState>{t("content.noVersions")}</EmptyState> : (
          <Table>
            <TableHeader><TableRow><TableHead>{t("common.date")}</TableHead><TableHead>{t("content.event")}</TableHead><TableHead>{t("common.reason")}</TableHead><TableHead className="text-right">{t("common.actions")}</TableHead></TableRow></TableHeader>
            <TableBody>{versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell className="whitespace-nowrap">{new Date(version.created_at).toLocaleString()}</TableCell>
                <TableCell>{version.event}</TableCell>
                <TableCell>{version.reason}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => rollback(version.id)} disabled={busy}>{t("content.rollback")}</Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
