import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TechnicalLabel } from "../../components/ui/technical-label";
import { Textarea } from "../../components/ui/textarea";
import { useI18n } from "../../i18n";
import { api, formatApiError } from "../../lib/api";
import { fmtDate } from "../../lib/format";
import { AdminLayout } from "./AdminLayout";

const initialForm = { target: "user", user_id: "", segment: "active_orders", subject: "", message: "" };

export default function AdminNotifications() {
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    setLoading(true);
    api.get("/admin/notifications/sent").then((r) => setSent(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadHistory(); }, []);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const valid = form.subject.trim().length >= 3 && form.message.trim().length >= 3
    && (form.target !== "user" || form.user_id.trim().length > 0);

  const send = async () => {
    setSending(true);
    try {
      const payload = { target: form.target, subject: form.subject.trim(), message: form.message.trim() };
      if (form.target === "user") payload.user_id = form.user_id.trim();
      if (form.target === "segment") payload.segment = form.segment;
      const { data } = await api.post("/admin/notifications", payload);
      toast.success(`${t("notifications.sentTo")} ${data.recipient_count} ${t("notifications.recipients")}`);
      setForm(initialForm);
      loadHistory();
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout title={t("admin.notifications")} subtitle={t("notifications.subtitle")}>
      <SurfacePanel>
        <SurfacePanelHeader padding="sm">
          <TechnicalLabel>{t("notifications.compose")}</TechnicalLabel>
        </SurfacePanelHeader>
        <div className="grid gap-4 p-4">
          <div className="space-y-2">
            <Label>{t("notifications.target")}</Label>
            <Select value={form.target} onValueChange={(value) => setForm((current) => ({ ...current, target: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t("notifications.targetUser")}</SelectItem>
                <SelectItem value="segment">{t("notifications.targetSegment")}</SelectItem>
                <SelectItem value="broadcast">{t("notifications.targetBroadcast")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.target === "user" && (
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={form.user_id} onChange={set("user_id")} placeholder={t("notifications.userIdHint")} />
            </div>
          )}

          {form.target === "segment" && (
            <div className="space-y-2">
              <Label>{t("notifications.segment")}</Label>
              <Select value={form.segment} onValueChange={(value) => setForm((current) => ({ ...current, segment: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active_orders">{t("notifications.segmentActiveOrders")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {form.target === "broadcast" && (
            <p className="text-sm text-muted-foreground" role="alert">{t("notifications.broadcastWarning")}</p>
          )}

          <div className="space-y-2">
            <Label>{t("notifications.subject")}</Label>
            <Input value={form.subject} onChange={set("subject")} maxLength={180} />
          </div>
          <div className="space-y-2">
            <Label>{t("notifications.message")}</Label>
            <Textarea value={form.message} onChange={set("message")} maxLength={2000} rows={5} />
          </div>
          <Button disabled={sending || !valid} onClick={send} className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" />{t("notifications.send")}
          </Button>
        </div>
      </SurfacePanel>

      <SurfacePanel className="mt-4">
        <SurfacePanelHeader padding="sm">
          <TechnicalLabel>{t("notifications.history")}</TechnicalLabel>
        </SurfacePanelHeader>
        {loading ? <EmptyState>{t("common.loading")}</EmptyState>
          : sent.length === 0 ? <EmptyState>{t("notifications.empty")}</EmptyState>
            : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("notifications.target")}</TableHead>
                  <TableHead>{t("notifications.subject")}</TableHead>
                  <TableHead>{t("notifications.recipients")}</TableHead>
                  <TableHead>{t("notifications.sentBy")}</TableHead>
                </TableRow></TableHeader>
                <TableBody>{sent.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{fmtDate(row.created_at)}</TableCell>
                    <TableCell>{row.target}{row.segment ? ` · ${row.segment}` : ""}</TableCell>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>{row.recipient_count}</TableCell>
                    <TableCell><TechnicalLabel size="micro">{row.sent_by}</TechnicalLabel></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            )}
      </SurfacePanel>
    </AdminLayout>
  );
}
