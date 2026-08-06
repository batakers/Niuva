import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { AccountStatusBadge } from "@/components/admin/AccountStatusBadge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SkeletonTableRow } from "@/components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDay } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

const STAFF_ROLES = [
  "content_editor",
  "catalog_manager",
  "warehouse",
  "order_admin",
  "sales_estimator",
  "designer_engineer",
  "production",
  "quality_control",
  "finance",
  "manager_approver",
];

export default function AdminUsers() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const canManage = hasPermission(user, "roles.manage");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/users");
      setItems(response.data);
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.email, ...(item.roles || [])].some((field) =>
        field?.toLowerCase().includes(term),
      ),
    );
  }, [items, search]);

  return (
    <AdminLayout
      title={t("admin.users")}
      subtitle={t("staff.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-3">
          <p className="type-label text-text-secondary">
            {t("staff.total").replace("{count}", items.length)}
          </p>
          {canManage && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("staff.invite")}
            </Button>
          )}
        </SurfacePanelHeader>

        {!loading && !error && items.length > 0 && (
          <div className="border-b border-border-default px-4 py-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("staff.searchPlaceholder")}
              aria-label={t("staff.searchLabel")}
              className="max-w-sm"
            />
          </div>
        )}

        {loading ? (
          <Table>
            <TableBody>
              {[1, 2, 3].map((item) => (
                <SkeletonTableRow key={item} columns={4} />
              ))}
            </TableBody>
          </Table>
        ) : error ? (
          <ErrorState error={error} onRetry={loadUsers} />
        ) : items.length === 0 ? (
          <EmptyState icon={ShieldCheck} className="py-16">
            {t("staff.empty")}
          </EmptyState>
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Users} className="py-16">
            {t("staff.noMatch")}
          </EmptyState>
        ) : (
          <Table data-testid="admin-users-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.identity")}</TableHead>
                <TableHead>{t("admin.role")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.created")}</TableHead>
                {canManage && <TableHead>{t("common.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold text-text-primary">
                      {item.name || t("staff.unnamed")}
                    </p>
                    <p className="mt-1 text-sm text-action-primary">
                      {item.email}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-text-secondary">
                    {(item.roles || []).join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <AccountStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                    {fmtDay(item.created_at)}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      {item.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatusTarget(item)}
                        >
                          {item.status === "active"
                            ? t("admin.deactivate")
                            : t("admin.reactivate")}
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SurfacePanel>

      {canManage && (
        <>
          <InviteStaffDialog
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            onCreated={loadUsers}
          />
          <StatusDialog
            target={statusTarget}
            onOpenChange={(open) => !open && setStatusTarget(null)}
            onUpdated={loadUsers}
          />
        </>
      )}
    </AdminLayout>
  );
}

function InviteStaffDialog({ open, onOpenChange, onCreated }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    roles: [],
    reason: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const canSubmit =
    form.name.trim().length >= 2 &&
    form.email.trim() &&
    form.roles.length > 0 &&
    form.reason.trim().length >= 3 &&
    !busy;

  const toggleRole = (role) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await api.post("/admin/staff-invitations", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        reason: form.reason.trim(),
      });
      const token = response.data.setup_token || "";
      setSetupToken(
        token
          ? `${window.location.origin}/staff-invitation?token=${encodeURIComponent(token)}`
          : ""
      );
      toast.success(t("staff.inviteSuccess"));
      await onCreated();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (busy) return;
    setForm({ name: "", email: "", roles: [], reason: "" });
    setSetupToken("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("staff.invite")}</DialogTitle>
          <DialogDescription>
            {t("staff.inviteDescription")}
          </DialogDescription>
        </DialogHeader>
        {setupToken ? (
          <div className="space-y-4">
            <Alert>{t("staff.setupWarning")}</Alert>
            <Input
              readOnly
              value={setupToken}
              aria-label={t("staff.setupLinkLabel")}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label={t("common.name")}>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </FormField>
            <FormField label={t("common.email")}>
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </FormField>
            <fieldset>
              <legend className="mb-2 type-label text-text-primary">
                {t("admin.role")}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {STAFF_ROLES.map((role) => (
                  <label key={role} className="flex min-h-11 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    <span className="text-sm">{role}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <FormField label={t("common.reason")}>
              <Input
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({ ...current, reason: event.target.value }))
                }
              />
            </FormField>
            {error && <Alert>{error}</Alert>}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={busy}>
            {t("common.close")}
          </Button>
          {!setupToken && (
            <Button onClick={submit} disabled={!canSubmit} loading={busy}>
              {t("staff.createInvite")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({ target, onOpenChange, onUpdated }) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nextAction = target?.status === "active" ? "deactivate" : "reactivate";

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post(`/admin/staff/${target.id}/${nextAction}`, {
        expected_version: target.version,
        reason: reason.trim(),
      });
      toast.success(t("staff.statusUpdated"));
      setReason("");
      onOpenChange(false);
      await onUpdated();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {nextAction === "deactivate"
              ? t("admin.deactivate")
              : t("admin.reactivate")} {t("staff.singular")}
          </DialogTitle>
          <DialogDescription>{target?.email}</DialogDescription>
        </DialogHeader>
        <FormField label={t("staff.changeReason")}>
          <Input value={reason} onChange={(event) => setReason(event.target.value)} />
        </FormField>
        {error && <Alert>{error}</Alert>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={submit}
            disabled={reason.trim().length < 3 || busy}
            loading={busy}
          >
            {t("admin.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
