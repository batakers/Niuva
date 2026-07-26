import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, Users } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { accountStatusLabel } from "@/lib/identityAccess";
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
          : "border-status-error/40 bg-status-error/10 text-status-error"
      }`}
    >
      {accountStatusLabel(status)}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export default function AdminUsers() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const canCreateUser = hasPermission(user, "customers.manage");

  const loadUsers = () =>
    api.get("/admin/users").then((usersResponse) => setItems(usersResponse.data));

  useEffect(() => {
    let active = true;
    api
      .get("/admin/users")
      .then((usersResponse) => {
        if (!active) return;
        setItems(usersResponse.data);
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

  return (
    <AdminLayout
      title={t("admin.users")}
      subtitle={t("users.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-3">
          <p className="type-label text-text-secondary">
            {t("users.total")}: {items.length}
          </p>
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
                  <TableHead>{t("common.created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonTableRow key={i} columns={3} />
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
                <TableHead>{t("common.created")}</TableHead>
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
                  <TableCell className="whitespace-nowrap font-mono text-xs text-text-secondary">
                    {fmtDay(item.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SurfacePanel>

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

          {error && <Alert>{error}</Alert>}
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
