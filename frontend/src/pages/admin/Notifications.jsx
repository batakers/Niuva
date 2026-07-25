import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurfacePanel } from "@/components/ui/surface-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";
import { UserSelector } from "@/components/admin/UserSelector";
import { ConfirmSendDialog } from "@/components/admin/ConfirmSendDialog";

const INITIAL_FORM = {
  target: "user",
  user_id: "",
  segment: "active_orders",
  subject: "",
  message: "",
};

const TARGET_OPTIONS = [
  { value: "user", labelKey: "notifications.targetUser" },
  { value: "segment", labelKey: "notifications.targetSegment" },
  { value: "broadcast", labelKey: "notifications.targetBroadcast" },
];

const SEGMENT_OPTIONS = [
  { value: "active_orders", labelKey: "notifications.segmentActiveOrders" },
];

export default function AdminNotifications() {
  const { t } = useI18n();
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");

  // Load notification history
  const loadHistory = () => {
    setLoading(true);
    api
      .get("/admin/notifications/sent")
      .then((r) => setSent(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Form field updater
  const updateField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // Validation
  const isValid = useMemo(() => {
    const hasSubject = form.subject.trim().length >= 3;
    const hasMessage = form.message.trim().length >= 3;
    const hasUser = form.target !== "user" || form.user_id.trim().length > 0;
    return hasSubject && hasMessage && hasUser;
  }, [form]);

  // Get target label for confirmation
  const targetLabel = useMemo(() => {
    const option = TARGET_OPTIONS.find((o) => o.value === form.target);
    return option ? t(option.labelKey) : form.target;
  }, [form.target, t]);

  // Handle user selection
  const handleUserSelect = (userId) => {
    updateField("user_id")(userId);
  };

  // Open confirmation dialog
  const handleSendClick = () => {
    setConfirmOpen(true);
  };

  // Send notification
  const sendNotification = async () => {
    setSending(true);
    try {
      const payload = {
        target: form.target,
        subject: form.subject.trim(),
        message: form.message.trim(),
      };

      if (form.target === "user") {
        payload.user_id = form.user_id.trim();
      }
      if (form.target === "segment") {
        payload.segment = form.segment;
      }

      const { data } = await api.post("/admin/notifications", payload);

      toast.success(
        `${t("notifications.sentTo")} ${data.recipient_count} ${t("notifications.recipients")}`
      );

      setForm(INITIAL_FORM);
      setSelectedUserName("");
      setConfirmOpen(false);
      loadHistory();
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout
      title={t("admin.notifications")}
      subtitle={t("notifications.subtitle")}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        {/* Composer Panel */}
        <SurfacePanel className="p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-6">
            {t("notifications.composeTitle")}
          </h2>

          <div className="space-y-5">
            {/* Target */}
            <div className="space-y-1.5">
              <Label>{t("notifications.target")}</Label>
              <Select
                value={form.target}
                onValueChange={updateField("target")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: User selector */}
            {form.target === "user" && (
              <div className="space-y-1.5">
                <Label>{t("notifications.selectUser")}</Label>
                <UserSelector
                  value={form.user_id}
                  onChange={handleUserSelect}
                  placeholder={t("notifications.userSearchPlaceholder")}
                />
              </div>
            )}

            {/* Conditional: Segment selector */}
            {form.target === "segment" && (
              <div className="space-y-1.5">
                <Label>{t("notifications.segment")}</Label>
                <Select
                  value={form.segment}
                  onValueChange={updateField("segment")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEGMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Conditional: Broadcast warning */}
            {form.target === "broadcast" && (
              <div className="rounded-control border border-status-warning/40 bg-status-warning/10 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
                <p className="type-body-small text-status-warning">
                  {t("notifications.broadcastWarning")}
                </p>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <Label>{t("notifications.subject")}</Label>
              <Input
                value={form.subject}
                onChange={(e) => updateField("subject")(e.target.value)}
                maxLength={180}
                placeholder={t("notifications.subjectPlaceholder")}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label>{t("notifications.message")}</Label>
              <Textarea
                value={form.message}
                onChange={(e) => updateField("message")(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder={t("notifications.messagePlaceholder")}
              />
              <p className="text-xs text-text-secondary">
                {form.message.length}/2000
              </p>
            </div>

            {/* Send button */}
            <Button
              disabled={sending || !isValid}
              onClick={handleSendClick}
              className="w-full"
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              {t("notifications.send")}
            </Button>
          </div>
        </SurfacePanel>

        {/* History Panel */}
        <SurfacePanel className="flex flex-col">
          <div className="p-4 border-b border-border-default">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              {t("notifications.historyTitle")}
            </h2>
            <p className="type-body-small text-text-secondary mt-0.5">
              {t("notifications.historyDesc")}
            </p>
          </div>

          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="p-8 text-center">
                <p className="type-body-small text-text-secondary">
                  {t("common.loading")}
                </p>
              </div>
            ) : sent.length === 0 ? (
              <div className="p-8 text-center">
                <p className="type-body-small text-text-secondary">
                  {t("notifications.empty")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("notifications.target")}</TableHead>
                      <TableHead>{t("notifications.subject")}</TableHead>
                      <TableHead className="text-right">
                        {t("notifications.recipients")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sent.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {fmtDate(row.created_at)}
                        </TableCell>
                        <TableCell>
                          <span className="type-body-small">
                            {row.target}
                            {row.segment && (
                              <span className="text-text-secondary">
                                {" "}/ {row.segment}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="type-body-small line-clamp-1">
                            {row.subject}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {row.recipient_count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SurfacePanel>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmSendDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={sendNotification}
        loading={sending}
        target={form.target}
        targetLabel={targetLabel}
        recipientName={selectedUserName}
        subject={form.subject}
        message={form.message}
      />
    </AdminLayout>
  );
}
