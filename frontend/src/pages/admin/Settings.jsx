import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";

export default function AdminSettings() {
  const { t } = useI18n();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");

  const updateField = (field) => (e) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  useEffect(() => {
    api
      .get("/settings")
      .then((r) => setForm(r.data))
      .catch((err) => setLoadError(formatApiError(err.response?.data?.detail)));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api.put("/admin/settings", form);
      toast.success(t("settings.saved"));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <AdminLayout
        title={t("admin.settings")}
        subtitle={t("settings.subtitle")}
      >
        <EmptyState icon={AlertCircle} className="py-16">
          <span role="alert" className="text-status-error">{loadError}</span>
        </EmptyState>
      </AdminLayout>
    );
  }

  if (!form) {
    return (
      <AdminLayout
        title={t("admin.settings")}
        subtitle={t("settings.subtitle")}
      >
        <div className="space-y-6 p-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" className="w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("admin.settings")}
      subtitle={t("settings.subtitle")}
    >
      <SurfacePanel className="max-w-2xl" data-testid="settings-panel">
        {/* Warning Header */}
        <SurfacePanelHeader className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-semibold text-text-primary mb-1">
              {t("settings.paymentTitle")}
            </h3>
            <p className="type-body-small text-text-secondary">
              {t("settings.paymentDesc")}
            </p>
          </div>
        </SurfacePanelHeader>

        {/* Form */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <Label>{t("settings.bankName")}</Label>
            <Input
              data-testid="settings-bank"
              value={form.bank_name}
              onChange={updateField("bank_name")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("settings.accountNumber")}</Label>
            <Input
              data-testid="settings-account"
              value={form.account_number}
              onChange={updateField("account_number")}
              className="font-mono text-lg tracking-wider"
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("settings.accountHolder")}</Label>
            <Input
              data-testid="settings-holder"
              value={form.account_holder}
              onChange={updateField("account_holder")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border-default bg-surface-page p-6">
          <Button
            disabled={busy}
            data-testid="save-settings"
            onClick={save}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {busy ? t("common.saving") : t("settings.save")}
          </Button>
        </div>
      </SurfacePanel>
    </AdminLayout>
  );
}
