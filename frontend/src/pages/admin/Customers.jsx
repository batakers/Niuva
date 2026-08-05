import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
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
import {
  fetchPasswordPolicy,
  passwordPolicySummary,
  passwordSatisfiesPolicy,
} from "@/lib/passwordPolicy";
import { hasPermission } from "@/lib/permissions";
import { AdminLayout } from "./AdminLayout";

export default function Customers() {
  const { user } = useAuth();
  const { t } = useI18n();
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
      title={t("admin.customers")}
      subtitle={t("customers.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between gap-3">
          <p className="type-label text-text-secondary">
            {t("customers.total").replace("{count}", items.length)}
          </p>
          {canManage && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("customers.add")}
            </Button>
          )}
        </SurfacePanelHeader>
        {!loading && !error && items.length > 0 && (
          <div className="border-b border-border-default px-4 py-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("customers.searchPlaceholder")}
              aria-label={t("customers.searchLabel")}
              className="max-w-sm"
            />
          </div>
        )}
        {loading ? (
          <div className="p-6 text-sm text-text-secondary">
            {t("customers.loading")}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} className="py-16">
            {items.length ? t("customers.noMatch") : t("customers.empty")}
          </EmptyState>
        ) : (
          <Table data-testid="admin-customers-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.identity")}</TableHead>
                <TableHead>{t("admin.company")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.created")}</TableHead>
                {canManage && <TableHead>{t("common.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-action-primary">{item.email}</p>
                  </TableCell>
                  <TableCell>{item.company || "—"}</TableCell>
                  <TableCell>
                    <AccountStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{fmtDay(item.created_at)}</TableCell>
                  {canManage && (
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setStatusTarget(item)}>
                        {item.status === "active"
                          ? t("admin.deactivate")
                          : t("admin.reactivate")}
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
  const [passwordPolicy, setPasswordPolicy] = useState(null);
  const [policyError, setPolicyError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setPasswordPolicy(null);
    setPolicyError("");
    fetchPasswordPolicy(api)
      .then((policy) => {
        if (active) setPasswordPolicy(policy);
      })
      .catch(() => {
        if (active) {
          setPolicyError(
            t("customers.passwordPolicyError"),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [open, t]);

  const canSubmit =
    form.name.trim().length >= 2 &&
    form.email.trim() &&
    passwordSatisfiesPolicy(form.password, passwordPolicy) &&
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
      toast.success(t("customers.createSuccess"));
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
          <DialogTitle>{t("customers.add")}</DialogTitle>
          <DialogDescription>
            {t("customers.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label={t("common.name")}><Input value={form.name} onChange={update("name")} /></FormField>
          <FormField label={t("common.email")}><Input type="email" value={form.email} onChange={update("email")} /></FormField>
          <FormField label={t("common.password")}>
            <Input
              type="password"
              data-testid="customer-create-password"
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
              aria-describedby="customer-password-policy"
            />
            <p
              id="customer-password-policy"
              className="mt-1 text-xs text-text-secondary"
            >
              {passwordPolicy
                ? passwordPolicySummary(passwordPolicy)
                : t("customers.passwordPolicyLoading")}
            </p>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t("common.phone")}><Input value={form.phone} onChange={update("phone")} /></FormField>
            <FormField label={t("admin.company")}><Input value={form.company} onChange={update("company")} /></FormField>
          </div>
          {policyError && <Alert>{policyError}</Alert>}
          {error && <Alert>{error}</Alert>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>{t("common.cancel")}</Button>
          <Button
            data-testid="customer-create-submit"
            onClick={submit}
            disabled={!canSubmit}
            loading={busy}
          >
            {t("customers.createAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomerStatusDialog({ target, onOpenChange, onUpdated }) {
  const { t } = useI18n();
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
      toast.success(t("customers.statusUpdated"));
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
            {action === "deactivate"
              ? t("admin.deactivate")
              : t("admin.reactivate")} {t("customers.singular")}
          </DialogTitle>
          <DialogDescription>{target?.email}</DialogDescription>
        </DialogHeader>
        <FormField label={t("staff.changeReason")}>
          <Input value={reason} onChange={(event) => setReason(event.target.value)} />
        </FormField>
        {error && <Alert>{error}</Alert>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>{t("common.cancel")}</Button>
          <Button onClick={submit} disabled={reason.trim().length < 3 || busy} loading={busy}>
            {t("admin.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
