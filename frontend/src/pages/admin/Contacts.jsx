import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { api } from "../../lib/api";
import { AdminLayout } from "./AdminLayout";
import { fmtDate } from "../../lib/format";
import { EmptyState } from "../../components/ui/empty-state";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";

export default function AdminContacts() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/contacts").then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title={t("admin.contacts")} subtitle="Inbound Communications Log">
      <SurfacePanel>
        <SurfacePanelHeader>
          <TechnicalLabel>MESSAGE_REGISTRY // TOTAL: {items.length}</TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? (
          <EmptyState>[ FETCHING_DATA... ]</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>NO_MESSAGES_FOUND</EmptyState>
        ) : (
          <div className="divide-y divide-border/50">
            {items.map((it) => (
              <div key={it.id} className="p-6 hover:bg-surface-2/30 transition-colors" data-testid="admin-contact-list">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight">{it.subject}</h3>
                    <TechnicalLabel tone="primary" as="p" className="mt-1">
                      {it.name} // {it.email}
                    </TechnicalLabel>
                  </div>
                  <TechnicalLabel className="border border-border px-2 py-0.5 bg-background">
                    {fmtDate(it.created_at)}
                  </TechnicalLabel>
                </div>

                <div className="border border-border/50 bg-background p-4">
                  <TechnicalLabel as="p" className="mb-1">PAYLOAD_BLOB</TechnicalLabel>
                  <p className="font-mono text-xs text-foreground leading-relaxed">{it.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
