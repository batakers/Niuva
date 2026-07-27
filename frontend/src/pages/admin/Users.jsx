import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

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
import { api, formatApiError } from "@/lib/api";
import { fmtDay } from "@/lib/format";
import { accountStatusLabel } from "@/lib/identityAccess";
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

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex rounded-control border px-2 py-1 type-body-small ${
        active
          ? "border-status-success/40 bg-status-success/10 text-status-success"
          : "border-status-error/40 bg-status-error/10 text-status-error"
      }`}
    >
      {accountStatusLabel(status)}
    </span>
  );
}

export default function AdminUsers() {
  const { user } = useAuth();
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
      title="Staff Governance"
      subtitle="Undangan, role, dan status akun internal. Customer dikelola terpisah."
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-3">
          <p className="type-label text-text-secondary">
            Total staff: {items.length}
          </p>
          {canManage && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Undang staff
            </Button>
          )}
        </SurfacePanelHeader>

        {!loading && !error && items.length > 0 && (
          <div className="border-b border-border-default px-4 py-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, email, atau role…"
              aria-label="Cari staff"
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
            Belum ada staff yang dapat ditampilkan.
          </EmptyState>
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Users} className="py-16">
            Staff tidak ditemukan.
          </EmptyState>
        ) : (
          <Table data-testid="admin-users-table">
            <TableHeader>
              <TableRow>
                <TableHead>Identitas</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                {canManage && <TableHead>Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold text-text-primary">
                      {item.name || "Staff tanpa nama"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-action-primary">
                      {item.email}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-text-secondary">
                    {(item.roles || []).join(", ") || "—"}
                  </TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
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
                          {item.status === "active" ? "Nonaktifkan" : "Aktifkan"}
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
      setSetupToken(response.data.setup_token || "");
      toast.success("Undangan staff berhasil dibuat.");
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
          <DialogTitle>Undang staff</DialogTitle>
          <DialogDescription>
            Pilih role internal. Token setup hanya ditampilkan sekali dan harus
            dibagikan melalui kanal yang disetujui.
          </DialogDescription>
        </DialogHeader>
        {setupToken ? (
          <div className="space-y-4">
            <Alert>Simpan token setup ini sebelum menutup dialog.</Alert>
            <Input readOnly value={setupToken} aria-label="Token setup staff" />
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Nama">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </FormField>
            <fieldset>
              <legend className="mb-2 type-label text-text-primary">Role</legend>
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
            <FormField label="Alasan">
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
            Tutup
          </Button>
          {!setupToken && (
            <Button onClick={submit} disabled={!canSubmit} loading={busy}>
              Buat undangan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({ target, onOpenChange, onUpdated }) {
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
      toast.success("Status staff diperbarui.");
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
            {nextAction === "deactivate" ? "Nonaktifkan" : "Aktifkan"} staff
          </DialogTitle>
          <DialogDescription>{target?.email}</DialogDescription>
        </DialogHeader>
        <FormField label="Alasan perubahan">
          <Input value={reason} onChange={(event) => setReason(event.target.value)} />
        </FormField>
        {error && <Alert>{error}</Alert>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={reason.trim().length < 3 || busy}
            loading={busy}
          >
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
