import React, { useCallback, useEffect, useState } from "react";
import { Archive, Building2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError } from "../../lib/api";
import { fmtDay } from "../../lib/format";
import { hasPermission } from "../../lib/permissions";
import { AdminLayout } from "./AdminLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
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
import { Input } from "../../components/ui/input";
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


export default function AdminOrganizations() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_ORGANIZATION_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
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
      toast.success("Organisasi berhasil dibuat.");
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
      toast.success("Anggota organisasi berhasil ditambahkan.");
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
      toast.success("Peran anggota berhasil diperbarui.");
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
      toast.success("Membership berhasil diarsipkan.");
    } catch (requestError) {
      setMembershipError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setMembershipBusy(false);
    }
  };

  return (
    <AdminLayout title={t("admin.organizations")} subtitle="B2B Organization Directory">
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-4">
          <TechnicalLabel>ORGANIZATIONS // TOTAL: {items.length}</TechnicalLabel>
          {canManage ? (
            <Button type="button" variant="technical" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus /> Tambah organisasi
            </Button>
          ) : null}
        </SurfacePanelHeader>

        {loading ? <EmptyState>[ FETCHING_ORGANIZATIONS... ]</EmptyState> : null}
        {!loading && permissionDenied ? (
          <EmptyState frame="dashed" className="text-destructive">
            Anda tidak memiliki izin untuk melihat organisasi.
          </EmptyState>
        ) : null}
        {!loading && !permissionDenied && error ? (
          <EmptyState frame="dashed" className="text-destructive">{error}</EmptyState>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyState>NO_ORGANIZATIONS_FOUND</EmptyState>
        ) : null}
        {!loading && !error && items.length > 0 ? (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((organization) => {
              const activeMembers = organization.memberships?.filter(
                (membership) => membership.status === "active"
              ).length;
              return (
                <SurfacePanel key={organization.id} padding="md" className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-10 w-10 place-items-center border border-border bg-surface-2">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {organization.status}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">{organization.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{organization.legal_name}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {activeMembers || 0} active</span>
                    <span>{fmtDay(organization.created_at)}</span>
                  </div>
                  <Button type="button" variant="technicalOutline" className="w-full" onClick={() => setSelectedId(organization.id)}>
                    Lihat detail
                  </Button>
                </SurfacePanel>
              );
            })}
          </div>
        ) : null}
      </SurfacePanel>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl rounded-none border-border bg-surface-1 text-foreground">
          <form onSubmit={createOrganization}>
            <DialogHeader>
              <DialogTitle>Tambah organisasi B2B</DialogTitle>
              <DialogDescription>Identitas organisasi ini menjadi induk membership pelanggan B2B.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="organization-name">Nama singkat</Label>
                <Input id="organization-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization-legal-name">Nama legal</Label>
                <Input id="organization-legal-name" value={form.legal_name} onChange={(event) => setForm((current) => ({ ...current, legal_name: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization-tax-id">NPWP / Tax ID (opsional)</Label>
                <Input id="organization-tax-id" value={form.tax_id} onChange={(event) => setForm((current) => ({ ...current, tax_id: event.target.value }))} />
              </div>
              {formError ? <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Buat organisasi"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setMembershipError("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-none border-border bg-surface-1 text-foreground">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>{selected?.legal_name} · {selected?.tax_id || "Tax ID belum diisi"}</DialogDescription>
          </DialogHeader>

          {canManage ? (
            <SurfacePanel padding="md" className="space-y-4">
              <TechnicalLabel>ADD_EXISTING_ORGANIZATION_CUSTOMER</TechnicalLabel>
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <Select value={memberUserId} onValueChange={setMemberUserId}>
                  <SelectTrigger><SelectValue placeholder="Pilih pengguna" /></SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name} · {item.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={memberRole} onValueChange={setMemberRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEMBER_ROLES.map((role) => <SelectItem key={role} value={role}>{roleLabel(role)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addMember} disabled={membershipBusy || !memberUserId}>Tambah</Button>
              </div>
              {availableMembers.length === 0 ? <p className="text-xs text-muted-foreground">Tidak ada organization customer lain yang tersedia.</p> : null}
            </SurfacePanel>
          ) : null}

          {membershipError ? <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{membershipError}</p> : null}

          <div className="overflow-x-auto border border-border">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-3 font-normal">Member</th>
                  <th className="px-4 py-3 font-normal">Role</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  {canManage ? <th className="px-4 py-3 text-right font-normal">Action</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {(selected?.memberships || []).map((membership) => {
                  const memberUser = userById.get(membership.user_id);
                  return (
                    <tr key={membership.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{memberUser?.name || membership.user_id}</p>
                        <p className="text-xs text-muted-foreground">{memberUser?.email || membership.user_id}</p>
                      </td>
                      <td className="min-w-44 px-4 py-3">
                        {canManage && membership.status === "active" ? (
                          <Select value={membership.member_role} onValueChange={(value) => updateMemberRole(membership, value)} disabled={membershipBusy}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{MEMBER_ROLES.map((role) => <SelectItem key={role} value={role}>{roleLabel(role)}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : roleLabel(membership.member_role)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs uppercase text-muted-foreground">{membership.status}</td>
                      {canManage ? (
                        <td className="px-4 py-3 text-right">
                          {membership.status === "active" ? (
                            <Button type="button" variant="ghost" size="sm" onClick={() => setArchiveTarget(membership)} disabled={membershipBusy}>
                              <Archive /> Archive
                            </Button>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
                {(selected?.memberships || []).length === 0 ? (
                  <tr><td colSpan={canManage ? 4 : 3}><EmptyState>NO_MEMBERSHIPS_FOUND</EmptyState></td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(archiveTarget)} onOpenChange={(open) => { if (!open) setArchiveTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arsipkan membership?</AlertDialogTitle>
            <AlertDialogDescription>
              Akses organisasi akan dinonaktifkan, tetapi histori membership dan audit tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={archiveMember} disabled={membershipBusy}>Arsipkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
