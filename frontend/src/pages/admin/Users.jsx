import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Dialog state
  const [selected, setSelected] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedAccessState, setSelectedAccessState] = useState("approved");
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState("");

  const canManageRoles = hasPermission(user, "roles.manage");
  const availableRoles = internalRoles(accessPolicy);
  const availableReasonCodes = reasonCodes(accessPolicy);

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
        <SurfacePanelHeader className="flex items-center justify-between">
          <TechnicalLabel>
            {t("users.total")}: {items.length}
          </TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? (
          <EmptyState>{t("common.loading")}</EmptyState>
        ) : error ? (
          <EmptyState>
            <span role="alert" className="text-status-error">{error}</span>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>{t("users.empty")}</EmptyState>
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
              {items.map((item) => (
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
            <Button onClick={saveAccess} disabled={saveDisabled}>
              {saving ? t("common.saving") : t("users.saveAccess")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
