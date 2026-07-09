import React, { useEffect, useState } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { api, formatApiError } from "../../lib/api";
import { AdminLayout } from "./AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { EmptyState } from "../../components/ui/empty-state";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";

export default function AdminSettings() {
  const { t } = useI18n();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api.get("/settings").then((r) => setForm(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api.put("/admin/settings", form);
      toast.success("SYSTEM_CONFIG_SAVED");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  if (!form) {
    return (
      <AdminLayout title={t("admin.settings")} subtitle="System Configuration Panel">
        <EmptyState frame="solid">[ FETCHING_CONFIG... ]</EmptyState>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t("admin.settings")} subtitle="System Configuration Panel">
      <SurfacePanel className="max-w-2xl" data-testid="settings-panel">
        <SurfacePanelHeader padding="lg" className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warm shrink-0 mt-0.5" />
          <div>
            <TechnicalLabel as="h3" size="sm" tone="foreground" className="mb-1">GLOBAL_VARIABLES // PAYMENT_GATEWAY</TechnicalLabel>
            <TechnicalLabel as="p" className="leading-relaxed">
              These settings control the financial routing for all client orders. Changes take effect immediately upon commit.
            </TechnicalLabel>
          </div>
        </SurfacePanelHeader>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <TechnicalLabel as={Label} className="block">INSTITUTION_NAME (BANK)</TechnicalLabel>
            <Input
              data-testid="settings-bank"
              value={form.bank_name}
              onChange={set("bank_name")}
              className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-12"
            />
          </div>

          <div className="space-y-2">
            <TechnicalLabel as={Label} className="block">ROUTING_ID (ACCOUNT NUMBER)</TechnicalLabel>
            <Input
              data-testid="settings-account"
              value={form.account_number}
              onChange={set("account_number")}
              className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-lg font-bold h-12 tracking-wider"
            />
          </div>

          <div className="space-y-2">
            <TechnicalLabel as={Label} className="block">ENTITY_HOLDER (NAME)</TechnicalLabel>
            <Input
              data-testid="settings-holder"
              value={form.account_holder}
              onChange={set("account_holder")}
              className="rounded-none bg-background border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 font-mono text-sm h-12"
            />
          </div>
        </div>

        <div className="border-t border-border bg-background p-6">
          <Button
            disabled={busy}
            data-testid="save-settings"
            onClick={save}
            variant="technical"
            className="w-full h-12"
          >
            <Save className="mr-2 h-4 w-4" /> {busy ? "COMMITTING..." : "COMMIT_CONFIGURATION"}
          </Button>
        </div>
      </SurfacePanel>
    </AdminLayout>
  );
}
