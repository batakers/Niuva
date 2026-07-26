import React, { useEffect, useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { TechnicalLabel } from "@/components/ui/technical-label";
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
      .get("/admin/settings")
      .then((r) => setForm(r.data))
      .catch((err) => setLoadError(formatApiError(err.response?.data?.detail)));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api.put("/admin/settings", {
        legal_name: form.legal_name || "",
        tagline: form.tagline || "",
        address: form.address || "",
        email: form.email || "",
        phone: form.phone || "",
        whatsapp: form.whatsapp || "",
        maps_url: form.maps_url || "",
        instagram_url: form.instagram_url || "",
        linkedin_url: form.linkedin_url || "",
      });
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
        <ErrorState error={loadError} />
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
              {t("settings.profileDesc")}
            </p>
          </div>
        </SurfacePanelHeader>

        {/* Form */}
        <div className="p-6 sm:p-8 space-y-6">
          {[
            ["legal_name", "settings.legalName"],
            ["tagline", "settings.tagline"],
            ["address", "settings.address"],
            ["email", "common.email"],
            ["phone", "common.phone"],
            ["whatsapp", "settings.whatsapp"],
            ["maps_url", "settings.mapsUrl"],
            ["instagram_url", "settings.instagramUrl"],
            ["linkedin_url", "settings.linkedinUrl"],
          ].map(([field, labelKey]) => (
            <FormField key={field} label={t(labelKey)}>
              <Input
                data-testid={`settings-${field}`}
                value={form[field] || ""}
                onChange={updateField(field)}
                className="min-h-11"
              />
            </FormField>
          ))}
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

      <SurfacePanel className="mt-4" data-testid="settings-integrations">
        <SurfacePanelHeader>
          <p className="type-label text-text-secondary">
            {t("settings.integrations")}
          </p>
          <p className="mt-1 type-body-small text-text-secondary">
            {t("settings.integrationsDesc")}
          </p>
        </SurfacePanelHeader>
        <ul className="divide-y divide-border-default">
          {(form.integrations || []).map((card) => (
            <li
              key={card.capability}
              className="flex flex-wrap items-center justify-between gap-3 p-5"
            >
              <div>
                <p className="font-semibold text-text-primary">
                  {t(`settings.capability.${card.capability}`)}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {t(`settings.integrationReason.${card.reason}`)}
                </p>
              </div>
              <TechnicalLabel tone="muted">
                {t("settings.integrationInactive")}
              </TechnicalLabel>
            </li>
          ))}
        </ul>
      </SurfacePanel>

      {form.legacy_payment_readonly && (
        /* Kept readable so historical payment records still make sense, and
           kept out of the form so it cannot be edited or re-published. */
        <SurfacePanel intent="dashed" padding="md" className="mt-4" data-testid="settings-legacy-payment">
          <p className="type-label text-text-secondary">
            {t("settings.legacyPayment")}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("settings.legacyPaymentDesc")}
          </p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-3">
            {Object.entries(form.legacy_payment_readonly).map(([field, value]) => (
              <div key={field}>
                <dt className="type-label text-text-secondary">
                  {t(`settings.${field}`)}
                </dt>
                <dd className="mt-1 font-mono text-sm text-text-primary">
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </SurfacePanel>
      )}
    </AdminLayout>
  );
}
