import React, { useCallback, useEffect, useState } from "react";
import { Archive, Edit3, FileText, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorState } from "../../components/ui/error-state";
import { FormField } from "../../components/ui/form-field";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton, SkeletonTableRow } from "../../components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TechnicalLabel } from "../../components/ui/technical-label";
import { Textarea } from "../../components/ui/textarea";
import { useI18n } from "../../i18n";
import { formatApiError } from "../../lib/api";
import { CONTENT_TYPES, CONTENT_TYPE_SCHEMAS, contentApi, emptyFieldsFor, statusTone } from "../../lib/content";
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
          <div className="flex flex-wrap gap-1">
            {CONTENT_TYPES.map((type) => (
              <Button key={type} variant={type === contentType ? "default" : "outline"} size="sm" onClick={() => setContentType(type)}>
                {t(`content.type.${type}`)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />{t("common.refresh")}</Button>
            <Button size="sm" onClick={() => setCreating({ slug: "" })}><Plus className="mr-2 h-4 w-4" />{t("content.create")}</Button>
          </div>
        </SurfacePanelHeader>
      </SurfacePanel>

      <SurfacePanel className="mt-4">
        {loading ? (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Slug</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("content.version")}</TableHead>
              <TableHead>{t("common.updated")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>{[1, 2, 3, 4].map((i) => (<SkeletonTableRow key={i} columns={5} />))}</TableBody>
          </Table>
        )
          : error ? <ErrorState error={error} onRetry={load} />
            : items.length === 0 ? <EmptyState icon={FileText} className="py-16">{t("content.empty")}</EmptyState>
              : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>{t("content.slug")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("content.version")}</TableHead>
                        <TableHead>{t("common.updated")}</TableHead>
                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>{items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell><div className="font-semibold">{item.slug}</div></TableCell>
                          <TableCell><TechnicalLabel tone={statusTone(item.status)}>{item.status}</TechnicalLabel></TableCell>
                          <TableCell className="font-mono tabular-nums text-text-secondary">{item.version}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">{item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setEditingId(item.id)} aria-label={`${t("common.open")} ${item.slug}`}><Edit3 className="h-4 w-4" /></Button>
                              {item.status !== "archived" && <Button variant="ghost" size="icon" onClick={() => setArchiveTarget(item)} aria-label={`${t("content.archive")} ${item.slug}`}><Archive className="h-4 w-4" /></Button>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}</TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-border-default">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-surface-muted/50 active:bg-surface-muted transition-colors duration-fast"
                        onClick={() => setEditingId(item.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-text-primary truncate">{item.slug}</span>
                          <TechnicalLabel tone={statusTone(item.status)} size="micro">{item.status}</TechnicalLabel>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-text-secondary">
                          <span>{t("content.version")} {item.version}</span>
                          <span className="font-mono">
                            {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
      </SurfacePanel>

      <Dialog open={Boolean(creating)} onOpenChange={(open) => !open && setCreating(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("content.create")} · {t(`content.type.${contentType}`)}</DialogTitle></DialogHeader>
          <FormField label={t("content.slug")}>
            <Input value={creating?.slug || ""} onChange={(event) => setCreating({ slug: event.target.value })} placeholder={t("content.slugPlaceholder")} />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(null)}>{t("common.cancel")}</Button>
            <Button disabled={busy || !creating?.slug.trim()} onClick={createDraft}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(archiveTarget)} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("content.archive")} · {archiveTarget?.slug}</DialogTitle></DialogHeader>
          <FormField label={t("common.reason")}>
            <Input value={archiveReason} onChange={(event) => setArchiveReason(event.target.value)} minLength={3} maxLength={500} />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveTarget(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" disabled={busy || archiveReason.trim().length < 3} onClick={archive}>{t("content.archive")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

/** Single scalar field: text / textarea / select / number, per schema entry. */
function ScalarField({ field, value, onChange, disabled }) {
  const { t } = useI18n();
  const commonProps = {
    id: `content-field-${field.key}`,
    value: value ?? "",
    onChange: (event) => onChange(event.target.value),
    disabled,
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={commonProps.id}>{field.label}{!field.optional && <span className="text-destructive"> *</span>}</Label>
      {field.type === "textarea" ? (
        <Textarea {...commonProps} rows={4} />
      ) : field.type === "select" ? (
        <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger id={commonProps.id}><SelectValue placeholder={t("content.selectFieldPlaceholder").replace("{field}", field.label.toLowerCase())} /></SelectTrigger>
          <SelectContent>
            {field.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input {...commonProps} type={field.type === "number" ? "number" : "text"} />
      )}
    </div>
  );
}

/** A list of plain strings (e.g. About.values) with add/remove rows. */
function StringListField({ field, value, onChange, disabled }) {
  const { t } = useI18n();
  const items = value || [];
  const update = (index, next) => onChange(items.map((item, i) => (i === index ? next : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));
  return (
    <div className="space-y-2">
      <Label>{field.label}<span className="text-destructive"> *</span></Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input value={item} onChange={(event) => update(index, event.target.value)} disabled={disabled} />
            {!disabled && <Button variant="ghost" size="icon" onClick={() => remove(index)} aria-label={t("content.removeItem")}><Trash2 className="h-4 w-4" /></Button>}
          </div>
        ))}
      </div>
      {!disabled && <Button variant="outline" size="sm" onClick={() => onChange([...items, ""])}><Plus className="mr-2 h-4 w-4" />{t("content.addItem")}</Button>}
    </div>
  );
}

/** A list of objects with fixed sub-fields (e.g. About.dossierItems: {label, title, body}). */
function ItemListField({ field, value, onChange, disabled }) {
  const { t } = useI18n();
  const items = value || [];
  const emptyItem = () => Object.fromEntries(field.itemFields.map((key) => [key, ""]));
  const update = (index, key, next) => onChange(items.map((item, i) => (i === index ? { ...item, [key]: next } : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));
  return (
    <div className="space-y-2">
      <Label>{field.label}<span className="text-destructive"> *</span></Label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-control border border-border-default p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="type-label text-text-secondary">{t("content.itemNumber").replace("{n}", String(index + 1))}</span>
              {!disabled && <Button variant="ghost" size="icon" onClick={() => remove(index)} aria-label={t("content.removeItem")}><Trash2 className="h-4 w-4" /></Button>}
            </div>
            <div className="grid gap-2">
              {field.itemFields.map((key) => (
                <Input
                  key={key}
                  value={item?.[key] || ""}
                  onChange={(event) => update(index, key, event.target.value)}
                  placeholder={key}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {!disabled && <Button variant="outline" size="sm" onClick={() => onChange([...items, emptyItem()])}><Plus className="mr-2 h-4 w-4" />{t("content.addItem")}</Button>}
    </div>
  );
}

function ContentFieldsForm({ contentType, fields, onChange, disabled }) {
  const schema = CONTENT_TYPE_SCHEMAS[contentType] || [];
  const setField = (key) => (value) => onChange({ ...fields, [key]: value });

  return (
    <div className="grid gap-5">
      {schema.map((field) => {
        if (field.type === "stringList") {
          return <StringListField key={field.key} field={field} value={fields[field.key]} onChange={setField(field.key)} disabled={disabled} />;
        }
        if (field.type === "itemList") {
          return <ItemListField key={field.key} field={field} value={fields[field.key]} onChange={setField(field.key)} disabled={disabled} />;
        }
        return <ScalarField key={field.key} field={field} value={fields[field.key]} onChange={setField(field.key)} disabled={disabled} />;
      })}
    </div>
  );
}

export function ContentBlockEditorPanel({ blockId, onBack }) {
  const { t } = useI18n();
  const [block, setBlock] = useState(null);
  const [fields, setFields] = useState({});
  const [versions, setVersions] = useState([]);
  const [reason, setReason] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const load = useCallback(async () => {
    const [current, history] = await Promise.all([contentApi.get(blockId), contentApi.versions(blockId)]);
    setBlock(current);
    setFields(current.fields || {});
    setVersions(history);
  }, [blockId]);

  useEffect(() => { load().catch((error) => toast.error(formatApiError(error.response?.data?.detail))); }, [load]);

  const isArchived = block?.status === "archived";

  const saveDraft = async () => {
    setBusy(true);
    try {
      await contentApi.update(blockId, fields);
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
      await contentApi.rollback(blockId, versionId, t("content.rollbackReason"));
      toast.success(t("content.rollbackSuccess"));
      await load();
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  if (!block) return <AdminLayout title={t("admin.content")}><div className="space-y-6 p-6"><Skeleton variant="heading" className="w-64" /><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></div></AdminLayout>;

  return (
    <AdminLayout title={`${t(`content.type.${block.content_type}`)} · ${block.slug}`} subtitle={t("content.editorSubtitle")}>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">← {t("common.back")}</Button>

      <SurfacePanel>
        <SurfacePanelHeader padding="sm" className="flex items-center justify-between">
          <TechnicalLabel tone={statusTone(block.status)}>{block.status} · v{block.version}</TechnicalLabel>
        </SurfacePanelHeader>
        <div className="p-4 space-y-4">
          <ContentFieldsForm contentType={block.content_type} fields={fields} onChange={setFields} disabled={isArchived} />

          {validationErrors.length > 0 && (
            <Alert>
              {validationErrors.map((err) => <p key={err.field}>{err.field}: {err.message}</p>)}
            </Alert>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={busy || isArchived}>{t("common.save")}</Button>
            <Button variant="outline" size="sm" onClick={runValidate} disabled={isArchived}>{t("content.validate")}</Button>
          </div>
        </div>
      </SurfacePanel>

      {!isArchived && (
        <SurfacePanel className="mt-4">
          <SurfacePanelHeader padding="sm"><p className="type-label text-text-secondary">{t("content.publish")}</p></SurfacePanelHeader>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <FormField label={t("common.reason")}>
              <Input value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} />
            </FormField>
            <FormField label={t("content.scheduleOptional")}>
              <Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
            </FormField>
          </div>
          <div className="p-4 pt-0">
            <Button disabled={busy || reason.trim().length < 3} onClick={publish}>{scheduledAt ? t("content.schedule") : t("content.publishNow")}</Button>
          </div>
        </SurfacePanel>
      )}

      <SurfacePanel className="mt-4">
        <SurfacePanelHeader padding="sm"><p className="type-label text-text-secondary">{t("content.versionHistory")}</p></SurfacePanelHeader>
        {versions.length === 0 ? <EmptyState>{t("content.noVersions")}</EmptyState> : (
          <Table>
            <TableHeader><TableRow><TableHead>{t("common.date")}</TableHead><TableHead>{t("content.event")}</TableHead><TableHead>{t("common.reason")}</TableHead><TableHead className="text-right">{t("common.actions")}</TableHead></TableRow></TableHeader>
            <TableBody>{versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">{new Date(version.created_at).toLocaleString()}</TableCell>
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
