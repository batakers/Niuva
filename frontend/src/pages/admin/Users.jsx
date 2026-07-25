import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Pencil, Plus, Users } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { TechnicalLabel } from "@/components/ui/technical-label";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDay } from "@/lib/format";
import {
  accessStateLabel,
  accountStatusLabel,
  internalRoles,
  reasonCodes,
  roleLabels,
} from "@/lib/identityAccess";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

/* ─────────────────────────────────────────────────────────────────────────────
 * Badge Components
 * ────────────────────────────────────────────────────────────────────────── */

function AccountStatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex rounded-control border px-2 py-1 type-body-small ${
        active
          ? "border-status-success/40 bg-status-success/10 text-status-success"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      {accountStatusLabel(status)}
    </span>
  );
}

function AccessStateBadge({ accessState }) {
  const approved = accessState === "approved";
  return (
    <span
      className={`inline-flex rounded-control border px-2 py-1 type-body-small ${
        approved
          ? "border-action-primary/40 bg-action-primary/10 text-action-primary"
          : "border-status-warning/40 bg-status-warning/10 text-status-warning"
      }`}
    >
      {accessStateLabel(accessState)}
    </span>
  );
}

function RoleList({ user, policy }) {
  const labels = roleLabels(user, policy);
  if (labels.length === 0) {
    return <span className="text-text-secondary">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className="rounded-control border border-border-default bg-surface-muted px-2 py-1 type-body-small text-text-primary"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export default function AdminUsers() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [accessPolicy, setAccessPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Dialog state
  const [selected, setSelected] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedAccessState, setSelectedAccessState] = useState("approved");
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState("");

  const canManageRoles = hasPermission(user, "roles.manage");
  const canCreateUser = hasPermission(user, "customers.manage");
  const availableRoles = internalRoles(accessPolicy);
  const availableReasonCodes = reasonCodes(accessPolicy);

  const loadUsers = () =>
    api.get("/admin/users").then((usersResponse) => setItems(usersResponse.data));

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/admin/users"), api.get("/admin/access-policy")])
      .then(([usersResponse, policyResponse]) => {
        if (!active) return;
        setItems(usersResponse.data);
        setAccessPolicy(policyResponse.data);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(formatApiError(requestError.response?.data?.detail));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.email].some((field) =>
        field?.toLowerCase().includes(term)
      )
    );
  }, [items, search]);

  const openAccessDialog = (item) => {
    setSelected(item);
    setSelectedRole(
      availableRoles.some((role) => role.role === item.roles?.[0])
        ? item.roles[0]
        : ""
    );
    setSelectedStatus(item.status || "active");
    setSelectedAccessState(item.access_state || "approved");
    setSelectedReasonCode("");
    setMutationError("");
  };

  const saveAccess = async () => {
    if (!selected) return;
    setSaving(true);
    setMutationError("");
    try {
      const response = await api.put(`/admin/users/${selected.id}/access`, {
        roles: [selectedRole],
        status: selectedStatus,
        access_state: selectedAccessState,
        reason_code: selectedReasonCode,
      });
      setItems((current) =>
        current.map((item) =>
          item.id === response.data.id ? response.data : item
        )
      );
      setSelected(null);
      toast.success(t("users.accessUpdated"));
    } catch (requestError) {
      const detail = formatApiError(requestError.response?.data?.detail);
      setMutationError(
        requestError.response?.status === 503
          ? `${t("users.accessNotSaved")}: ${detail}`
          : detail
      );
    } finally {
      setSaving(false);
    }
  };

  const saveDisabled = saving || !selectedRole || !selectedReasonCode;

  return (
    <AdminLayout
      title={t("admin.users")}
      subtitle={t("users.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-3">
          <TechnicalLabel className="tabular-nums">
            {t("users.total")}: {items.length}
          </TechnicalLabel>
          {canCreateUser && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("users.addUser")}
            </Button>
          )}
        </SurfacePanelHeader>

        {!loading && !error && items.length > 0 && (
          <div className="border-b border-border-default px-4 py-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("users.searchPlaceholder")}
              aria-label={t("common.search")}
              className="max-w-sm"
            />
          </div>
        )}

        {loading ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("users.identity")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("users.role")}</TableHead>
                  <TableHead>{t("users.accessReview")}</TableHead>
                  <TableHead>{t("common.created")}</TableHead>
                  {canManageRoles && (
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonTableRow key={i} columns={canManageRoles ? 6 : 5} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : error ? (
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState icon={Users} className="py-16">
            {t("users.empty")}
          </EmptyState>
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Users} className="py-16">
            {t("users.noMatch")}
          </EmptyState>
        ) : (
          <Table data-testid="admin-users-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t("users.identity")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("users.role")}</TableHead>
                <TableHead>{t("users.accessReview")}</TableHead>
                <TableHead>{t("common.created")}</TableHead>
                {canManageRoles && (
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold text-text-primary">
                      {item.name || t("users.unnamed")}
                    </p>
                    <p className="mt-1 font-mono text-xs text-action-primary">
                      {item.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <AccountStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="min-w-64">
                    <RoleList user={item} policy={accessPolicy} />
                  </TableCell>
                  <TableCell>
                    <AccessStateBadge accessState={item.access_state} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                    {fmtDay(item.created_at)}
                  </TableCell>
                  {canManageRoles && (
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAccessDialog(item)}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        {t("users.editAccess")}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SurfacePanel>

      {/* Edit Access Dialog */}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("users.rolesAndAccess")}</DialogTitle>
            <DialogDescription>
              {t("users.editAccessDesc", { name: selected?.name || selected?.email })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Account Status */}
            <div className="space-y-1.5">
              <Label>{t("users.accountStatus")}</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("users.statusActive")}</SelectItem>
                  <SelectItem value="disabled">{t("users.statusDisabled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Internal Role */}
            <div className="space-y-1.5">
              <Label>{t("users.internalRole")}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t("users.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.role} value={role.role}>
                      {role.label} · {role.permissions.length} permissions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access Review Status */}
            <div className="space-y-1.5">
              <Label>{t("users.accessReviewStatus")}</Label>
              <Select
                value={selectedAccessState}
                onValueChange={setSelectedAccessState}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="access_review_required">
                    Access review required
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason Code */}
            <div className="space-y-1.5">
              <Label>{t("users.reasonCode")}</Label>
              <Select
                value={selectedReasonCode}
                onValueChange={setSelectedReasonCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("users.selectReasonCode")} />
                </SelectTrigger>
                <SelectContent>
                  {availableReasonCodes.map((reason) => (
                    <SelectItem key={reason.code} value={reason.code}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mutationError && (
              <p
                className="rounded-control border border-status-error/40 bg-status-error/10 p-3 text-sm text-status-error"
                role="alert"
              >
                {mutationError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={saveAccess} disabled={saveDisabled} loading={saving}>
              {t("users.saveAccess")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      {canCreateUser && (
        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={() => {
            setCreateOpen(false);
            loadUsers();
          }}
        />
      )}
    </AdminLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Create User Dialog — provisions a retail client via POST /admin/users
 * ────────────────────────────────────────────────────────────────────────── */

function CreateUserDialog({ open, onOpenChange, onCreated }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  // Mirrors backend ClientProvisionReq: name/email/password(min 6) required.
  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password.length >= 6 &&
    !busy;

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post("/admin/users", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
      });
      toast.success(t("users.created"));
      setForm({ name: "", email: "", password: "", phone: "", company: "" });
      onCreated();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("users.addUser")}</DialogTitle>
          <DialogDescription>{t("users.addUserDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("common.name")}</Label>
            <Input value={form.name} onChange={update("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("common.email")}</Label>
            <Input type="email" value={form.email} onChange={update("email")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("common.password")}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder={t("users.passwordHint")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("users.phone")}</Label>
              <Input value={form.phone} onChange={update("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("users.company")}</Label>
              <Input value={form.company} onChange={update("company")} />
            </div>
          </div>

          {error && (
            <p
              className="rounded-control border border-status-error/40 bg-status-error/10 p-3 text-sm text-status-error"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={!canSubmit} loading={busy}>
            {t("users.createUser")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
