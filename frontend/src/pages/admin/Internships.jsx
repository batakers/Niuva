import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { api } from "../../lib/api";
import { AdminLayout } from "./AdminLayout";
import { fmtDate } from "../../lib/format";
import { EmptyState } from "../../components/ui/empty-state";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";

export default function AdminInternships() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/internships").then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title={t("admin.internships")} subtitle="Internship Applications Log">
      <SurfacePanel>
        <SurfacePanelHeader>
          <TechnicalLabel>APPLICANT_REGISTRY // TOTAL: {items.length}</TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? (
          <EmptyState>[ FETCHING_DATA... ]</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>NO_APPLICATIONS_FOUND</EmptyState>
        ) : (
          <div className="divide-y divide-border/50">
            {items.map((it) => (
              <div key={it.id} className="p-6 hover:bg-surface-2/30 transition-colors" data-testid="admin-internship-list">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight">{it.full_name}</h3>
                    <TechnicalLabel as="p" className="mt-1">
                      {it.email} // {it.phone}
                    </TechnicalLabel>
                  </div>
                  <TechnicalLabel className="border border-border px-2 py-0.5 bg-background">
                    {fmtDate(it.created_at)}
                  </TechnicalLabel>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="border border-border/50 bg-background p-3">
                    <TechnicalLabel as="p" className="mb-1">UNIVERSITY_DATA</TechnicalLabel>
                    <p className="font-mono text-xs text-foreground uppercase">{it.university}</p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase">{it.major} (SEM {it.semester})</p>
                  </div>
                  <div className="border border-border/50 bg-background p-3">
                    <TechnicalLabel as="p" className="mb-1">DURATION_REQ</TechnicalLabel>
                    <p className="font-mono text-xs text-foreground uppercase">{it.duration}</p>
                  </div>
                </div>

                <div className="border border-border/50 bg-background p-4 mb-4">
                  <TechnicalLabel as="p" className="mb-1">MOTIVATION_BLOB</TechnicalLabel>
                  <p className="font-mono text-xs text-foreground leading-relaxed">{it.motivation}</p>
                </div>

                {it.portfolio_url && (
                  <TechnicalLabel className="flex items-center gap-2">
                    PORTFOLIO_URL:
                    <a href={it.portfolio_url} target="_blank" rel="noreferrer" className="text-primary hover:underline lowercase">{it.portfolio_url}</a>
                  </TechnicalLabel>
                )}
              </div>
            ))}
          </div>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
