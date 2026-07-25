import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Archive, Building2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { Alert } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { SkeletonCard } from "@/components/ui/skeleton";
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
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

const MEMBER_ROLES = ["owner", "project_pic", "approver", "finance", "viewer"];

const EMPTY_ORGANIZATION_FORM = {
  name: "",
  legal_name: "",
  tax_id: "",
  status: "active",
};

function roleLabel(value) {
  return value.replaceAll("_", " ");
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export default function AdminOrganizations() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Dialog state
  const [selectedId, setSelectedId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_ORGANIZATION_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Membership state
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState("viewer");
  const [membershipBusy, setMembershipBusy] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);

  const canManage = hasPermission(user, "organizations.manage");

  const loadData = useCallback(async () => {
    setError("");
    setPermissionDenied(false);
    try {
      const [organizationsResponse, usersResponse] = await Promise.all([
        api.get("/admin/organizations"),
        api.get("/admin/users"),
      ]);
      setItems(organizationsResponse.data);
      setUsers(usersResponse.data);
    } catch (requestError) {
      if (requestError.response?.status === 403) setPermissionDenied(true);
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selected = items.find((item) => item.id === selectedId) || null;
  const organizationCustomers = users.filter((item) =>
    item.roles?.includes("organization_customer")
  );
  const activeMemberIds = new Set(
    (selected?.memberships || [])
      .filter((membership) => membership.status === "active")
      .map((membership) => membership.user_id)
  );
  const availableMembers = organizationCustomers.filter(
    (item) => !activeMemberIds.has(item.id)
  );
  const userById = new Map(users.map((item) => [item.id, item]));

  const createOrganization = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/admin/organizations", form);
      setCreateOpen(false);
      setForm(EMPTY_ORGANIZATION_FORM);
      await loadData();
      toast.success(t("organizations.created"));
    } catch (requestError) {
      setFormError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!selected || !memberUserId) return;
    setMembershipBusy(true);
    setMembershipError("");
    try {
      await api.post(`/admin/organizations/${selected.id}/members`, {
        user_id: memberUserId,
        member_role: memberRole,
      });
      setMemberUserId("");
      setMemberRole("viewer");
      await loadData();
      toast.success(t("organizations.memberAdded"));
    } catch (requestError) {
      setMembershipError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setMembershipBusy(false);
    }
  };

  const updateMemberRole = async (membership, nextRole) => {
    if (!selected) return;
    setMembershipBusy(true);
    setMembershipError("");
    try {
      await api.put(
        `/admin/organizations/${selected.id}/members/${membership.id}`,
        { member_role: nextRole }
      );
      await loadData();
      toast.success(t("organizations.roleUpdated"));
    } catch (requestError) {
      setMembershipError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setMembershipBusy(false);
    }
  };

  const archiveMember = async () => {
    if (!selected || !archiveTarget) return;
    setMembershipBusy(true);
    setMembershipError("");
    try {
      await api.delete(
        `/admin/organizations/${selected.id}/members/${archiveTarget.id}`
      );
      setArchiveTarget(null);
      await loadData();
      toast.success(t("organizations.memberArchived"));
    } catch (requestError) {
      setMembershipError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setMembershipBusy(false);
    }
  };

  return (
    <AdminLayout
      title={t("admin.organizations")}
      subtitle={t("organizations.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-4">
          <p className="type-label text-text-secondary">
            {t("organizations.total")}: {items.length}
          </p>
          {canManage && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("organizations.add")}
            </Button>
          )}
        </SurfacePanelHeader>

        {loading ? (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : permissionDenied ? (
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">
              {t("organizations.permissionDenied")}
            </span>
          </EmptyState>
        ) : error ? (
          <EmptyState icon={AlertCircle} className="py-16">
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState icon={Building2} className="py-16">{t("organizations.empty")}</EmptyState>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((organization) => {
              const activeMembers =
                organization.memberships?.filter(
                  (membership) => membership.status === "active"
                ).length || 0;

              const accentClass =
                organization.status === "active"
                  ? "border-l-status-success"
                  : "border-l-border-strong";

              return (
                <SurfacePanel
                  key={organization.id}
                  className={`space-y-5 border-l-4 p-4 ${accentClass}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-control border border-border-default bg-surface-muted">
                      <Building2 className="h-5 w-5 text-action-primary" />
                    </div>
                    <TechnicalLabel>{organization.status}</TechnicalLabel>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      {organization.name}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {organization.legal_name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-default pt-4 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-2 tabular-nums">
                      <Users className="h-4 w-4" /> {activeMembers}{" "}
                      {t("organizations.activeMembers")}
                    </span>
                    <span className="font-mono">{fmtDay(organization.created_at)}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedId(organization.id)}
                  >
                    {t("common.viewDetails")}
                  </Button>
                </SurfacePanel>
              );
            })}
          </div>
        )}
      </SurfacePanel>

      {/* Create Organization Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={createOrganization}>
            <DialogHeader>
              <DialogTitle>{t("organizations.addTitle")}</DialogTitle>
              <DialogDescription>
                {t("organizations.addDesc")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="space-y-1.5">
                <Label htmlFor="organization-name">
                  {t("organizations.shortName")}
                </Label>
                <Input
                  id="organization-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="organization-legal-name">
                  {t("organizations.legalName")}
                </Label>
                <Input
                  id="organization-legal-name"
                  value={form.legal_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      legal_name: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="organization-tax-id">
                  {t("organizations.taxId")}
                </Label>
                <Input
                  id="organization-tax-id"
                  value={form.tax_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tax_id: event.target.value,
                    }))
                  }
                />
              </div>

              {formError && <Alert>{formError}</Alert>}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t("common.saving") : t("organizations.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Organization Detail Dialog */}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setMembershipError("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.legal_name} ·{" "}
              {selected?.tax_id || t("organizations.noTaxId")}
            </DialogDescription>
          </DialogHeader>

          {/* Add Member */}
          {canManage && (
            <SurfacePanel className="space-y-4 p-4">
              <p className="type-label text-text-secondary">{t("organizations.addMember")}</p>
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <Select value={memberUserId} onValueChange={setMemberUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("organizations.selectUser")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} · {item.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={memberRole} onValueChange={setMemberRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={addMember}
                  disabled={membershipBusy || !memberUserId}
                >
                  {t("common.add")}
                </Button>
              </div>

              {availableMembers.length === 0 && (
                <p className="text-xs text-text-secondary">
                  {t("organizations.noAvailableMembers")}
                </p>
              )}
            </SurfacePanel>
          )}

          {membershipError && <Alert>{membershipError}</Alert>}

          {/* Members Table */}
          <SurfacePanel className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("organizations.member")}</TableHead>
                  <TableHead>{t("organizations.role")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  {canManage && (
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selected?.memberships || []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 4 : 3}
                      className="text-center text-text-secondary"
                    >
                      {t("organizations.noMembers")}
                    </TableCell>
                  </TableRow>
                ) : (
                  (selected?.memberships || []).map((membership) => {
                    const memberUser = userById.get(membership.user_id);
                    return (
                      <TableRow key={membership.id}>
                        <TableCell>
                          <p className="font-medium text-text-primary">
                            {memberUser?.name || membership.user_id}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {memberUser?.email || membership.user_id}
                          </p>
                        </TableCell>
                        <TableCell className="min-w-44">
                          {canManage && membership.status === "active" ? (
                            <Select
                              value={membership.member_role}
                              onValueChange={(value) =>
                                updateMemberRole(membership, value)
                              }
                              disabled={membershipBusy}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MEMBER_ROLES.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {roleLabel(role)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            roleLabel(membership.member_role)
                          )}
                        </TableCell>
                        <TableCell>
                          <TechnicalLabel
                            tone={
                              membership.status === "active" ? "success" : "muted"
                            }
                          >
                            {membership.status}
                          </TechnicalLabel>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            {membership.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setArchiveTarget(membership)}
                                disabled={membershipBusy}
                              >
                                <Archive className="mr-2 h-3.5 w-3.5" />
                                {t("common.archive")}
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </SurfacePanel>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("organizations.archiveMemberTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("organizations.archiveMemberDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={archiveMember} disabled={membershipBusy}>
              {t("common.archive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
