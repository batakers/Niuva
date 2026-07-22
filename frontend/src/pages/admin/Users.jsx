import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError } from "../../lib/api";
import { fmtDay } from "../../lib/format";
import { hasPermission } from "../../lib/permissions";
import { accessStateLabel, accountStatusLabel, internalRoles, reasonCodes, roleLabels } from "../../lib/identityAccess";
import { AdminLayout } from "./AdminLayout";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { EmptyState } from "../../components/ui/empty-state";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  SurfacePanel,
  SurfacePanelHeader,
} from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";


function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
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
      className={`inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
        approved
          ? "border-primary/40 bg-primary/10 text-primary"
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
    return <span className="text-muted-foreground">UNASSIGNED</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className="border border-border bg-surface-2 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground"
        >
          {label}
        </span>
      ))}
    </div>
  );
}


export default function AdminUsers() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [accessPolicy, setAccessPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        current.map((item) => (item.id === response.data.id ? response.data : item))
      );
      setSelected(null);
      toast.success("Akses pengguna berhasil diperbarui.");
    } catch (requestError) {
      const detail = formatApiError(requestError.response?.data?.detail);
      setMutationError(requestError.response?.status === 503
        ? `Perubahan akses belum disimpan: ${detail}`
        : detail);
    } finally {
      setSaving(false);
    }
  };

  const saveDisabled = saving || !selectedRole || !selectedReasonCode;

  return (
    <AdminLayout title={t("admin.users")} subtitle="Platform Identity & Access">
      <SurfacePanel>
        <SurfacePanelHeader>
          <TechnicalLabel>IDENTITY_DIRECTORY // TOTAL: {items.length}</TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? <EmptyState>[ FETCHING_IDENTITIES... ]</EmptyState> : null}
        {!loading && error ? (
          <EmptyState frame="dashed" className="text-destructive">
            {error}
          </EmptyState>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyState>NO_IDENTITIES_FOUND</EmptyState>
        ) : null}
        {!loading && !error && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left" data-testid="admin-users-table">
              <thead>
                <tr className="border-b border-border/50 bg-background/50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-4 font-normal">Identity</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 font-normal">Role</th>
                  <th className="px-6 py-4 font-normal">Access review</th>
                  <th className="px-6 py-4 font-normal">Created</th>
                  {canManageRoles ? <th className="px-6 py-4 text-right font-normal">Action</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs text-foreground">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{item.name || "Unnamed user"}</p>
                      <p className="mt-1 font-mono text-[11px] text-primary">{item.email}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="min-w-64 px-6 py-4"><RoleList user={item} policy={accessPolicy} /></td>
                    <td className="px-6 py-4"><AccessStateBadge accessState={item.access_state} /></td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-muted-foreground">
                      {fmtDay(item.created_at)}
                    </td>
                    {canManageRoles ? (
                      <td className="px-6 py-4 text-right">
                        <Button
                          type="button"
                          variant="technicalOutline"
                          size="sm"
                          onClick={() => openAccessDialog(item)}
                        >
                          <Pencil /> Edit access
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SurfacePanel>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-none border-border bg-surface-1 text-foreground">
          <DialogHeader>
            <DialogTitle>Peran & Akses</DialogTitle>
            <DialogDescription>
              Ubah akses {selected?.name || selected?.email}. Alasan perubahan akan dicatat di audit log.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label>Status akun</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="disabled">Dinonaktifkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Peran internal</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue placeholder="Pilih peran internal" /></SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.role} value={role.role}>
                      {role.label} · {role.permissions.length} permissions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status review akses</Label>
              <Select value={selectedAccessState} onValueChange={setSelectedAccessState}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="access_review_required">Access review required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason code</Label>
              <Select value={selectedReasonCode} onValueChange={setSelectedReasonCode}>
                <SelectTrigger><SelectValue placeholder="Pilih reason code" /></SelectTrigger>
                <SelectContent>
                  {availableReasonCodes.map((reason) => (
                    <SelectItem key={reason.code} value={reason.code}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mutationError ? (
              <p className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {mutationError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelected(null)}>
              Batal
            </Button>
            <Button type="button" onClick={saveAccess} disabled={saveDisabled}>
              {saving ? "Menyimpan..." : "Simpan akses"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
