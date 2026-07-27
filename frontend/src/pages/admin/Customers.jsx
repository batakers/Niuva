import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
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
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

export default function Customers() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const canManage = hasPermission(user, "customers.manage");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/customers");
      setItems(response.data);
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.email, item.company].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [items, search]);

  return (
    <AdminLayout
      title="Customer Management"
      subtitle="Akun customer dipisahkan dari direktori dan governance staff."
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-3">
          <p className="type-label text-text-secondary">Total customer: {items.length}</p>
          {canManage && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah customer
            </Button>
          )}
        </SurfacePanelHeader>
        {!loading && !error && items.length > 0 && (
          <div className="border-b border-border-default px-4 py-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, email, atau perusahaan…"
              aria-label="Cari customer"
              className="max-w-sm"
            />
          </div>
        )}
        {loading ? (
          <div className="p-6 text-sm text-text-secondary">Memuat customer…</div>
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} className="py-16">
            {items.length ? "Customer tidak ditemukan." : "Belum ada customer."}
          </EmptyState>
        ) : (
          <Table data-testid="admin-customers-table">
            <TableHeader>
              <TableRow>
                <TableHead>Identitas</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                {canManage && <TableHead>Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold">{item.name}</p>
                    <p className="font-mono text-xs text-action-primary">{item.email}</p>
                  </TableCell>
                  <TableCell>{item.company || "—"}</TableCell>
                  <TableCell>{item.status === "active" ? "Aktif" : "Nonaktif"}</TableCell>
                  <TableCell className="font-mono text-xs">{fmtDay(item.created_at)}</TableCell>
                  {canManage && (
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setStatusTarget(item)}>
                        {item.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
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
          <CreateCustomerDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onCreated={load}
          />
          <CustomerStatusDialog
            target={statusTarget}
            onOpenChange={(open) => !open && setStatusTarget(null)}
            onUpdated={load}
          />
        </>
      )}
    </AdminLayout>
  );
}

function CreateCustomerDialog({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const passwordBytes = new TextEncoder().encode(form.password).length;
  const canSubmit =
    form.name.trim().length >= 2 &&
    form.email.trim() &&
    passwordBytes >= 12 &&
    passwordBytes <= 72 &&
    !busy;

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post("/admin/customers", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
      });
      toast.success("Customer berhasil dibuat.");
      setForm({ name: "", email: "", password: "", phone: "", company: "" });
      onOpenChange(false);
      await onCreated();
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah customer</DialogTitle>
          <DialogDescription>
            Akun ini hanya dapat login melalui halaman customer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Nama"><Input value={form.name} onChange={update("name")} /></FormField>
          <FormField label="Email"><Input type="email" value={form.email} onChange={update("email")} /></FormField>
          <FormField label="Password">
            <Input type="password" value={form.password} onChange={update("password")} />
            <p className="mt-1 text-xs text-text-secondary">12–72 byte; password umum ditolak.</p>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Telepon"><Input value={form.phone} onChange={update("phone")} /></FormField>
            <FormField label="Perusahaan"><Input value={form.company} onChange={update("company")} /></FormField>
          </div>
          {error && <Alert>{error}</Alert>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Batal</Button>
          <Button onClick={submit} disabled={!canSubmit} loading={busy}>Buat customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomerStatusDialog({ target, onOpenChange, onUpdated }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const action = target?.status === "active" ? "deactivate" : "reactivate";

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post(`/admin/customers/${target.id}/${action}`, {
        expected_version: target.version,
        reason: reason.trim(),
      });
      toast.success("Status customer diperbarui.");
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
          <DialogTitle>{action === "deactivate" ? "Nonaktifkan" : "Aktifkan"} customer</DialogTitle>
          <DialogDescription>{target?.email}</DialogDescription>
        </DialogHeader>
        <FormField label="Alasan perubahan">
          <Input value={reason} onChange={(event) => setReason(event.target.value)} />
        </FormField>
        {error && <Alert>{error}</Alert>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Batal</Button>
          <Button onClick={submit} disabled={reason.trim().length < 3 || busy} loading={busy}>
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
