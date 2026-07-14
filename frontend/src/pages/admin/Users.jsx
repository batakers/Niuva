import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError } from "../../lib/api";
import { fmtDay } from "../../lib/format";
import { hasPermission } from "../../lib/permissions";
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
import { Textarea } from "../../components/ui/textarea";


function StatusBadge({ status }) {
  const active = status !== "disabled";
  return (
    <span
      className={`inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
        active
          ? "border-status-success/40 bg-status-success/10 text-status-success"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      {active ? "ACTIVE" : "DISABLED"}
    </span>
  );
}


function RoleList({ roles = [] }) {
  if (roles.length === 0) {
    return <span className="text-muted-foreground">UNASSIGNED</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <span
          key={role}
          className="border border-border bg-surface-2 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground"
        >
          {role.replaceAll("_", " ")}
        </span>
      ))}
    </div>
  );
}


export default function AdminUsers() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [roleCatalog, setRoleCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const canManageRoles = hasPermission(user, "roles.manage");

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/admin/users"), api.get("/admin/roles")])
      .then(([usersResponse, rolesResponse]) => {
        if (!active) return;
        setItems(usersResponse.data);
        setRoleCatalog(rolesResponse.data);
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
    setSelectedRoles(item.roles || []);
    setSelectedStatus(item.status || "active");
    setReason("");
    setMutationError("");
  };

  const toggleRole = (role) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role].sort()
    );
  };

  const saveAccess = async () => {
    if (!selected) return;
    setSaving(true);
    setMutationError("");
    try {
      const response = await api.put(`/admin/users/${selected.id}/access`, {
        roles: selectedRoles,
        status: selectedStatus,
        reason: reason.trim(),
      });
      setItems((current) =>
        current.map((item) => (item.id === response.data.id ? response.data : item))
      );
      setSelected(null);
      toast.success("Akses pengguna berhasil diperbarui.");
    } catch (requestError) {
      setMutationError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const saveDisabled =
    saving || selectedRoles.length === 0 || reason.trim().length < 3;

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
                  <th className="px-6 py-4 font-normal">Roles</th>
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
                    <td className="min-w-64 px-6 py-4"><RoleList roles={item.roles} /></td>
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

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Platform roles</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {roleCatalog.map((role) => {
                  const checked = selectedRoles.includes(role.role);
                  return (
                    <label
                      key={role.role}
                      className={`flex cursor-pointer items-start gap-3 border p-3 transition-colors ${
                        checked ? "border-primary bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRole(role.role)}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span>
                        <span className="block font-mono text-xs uppercase text-foreground">
                          {role.role.replaceAll("_", " ")}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {role.kind} · {role.permissions.length} permissions
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="access-change-reason">Alasan perubahan</Label>
              <Textarea
                id="access-change-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Contoh: Ditugaskan mengelola operasional gudang"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">Minimal 3 karakter. Tersimpan di audit log.</p>
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
