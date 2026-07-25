import React, { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { useI18n } from "@/i18n";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

export default function AdminInternships() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/internships")
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      title={t("admin.internships")}
      subtitle={t("internships.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between">
          <TechnicalLabel>
            {t("internships.total")}: {items.length}
          </TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? (
          <EmptyState>{t("common.loading")}</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>{t("internships.empty")}</EmptyState>
        ) : (
          <div className="divide-y divide-border-default">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-surface-muted transition-colors"
                data-testid="admin-internship-list"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      {item.full_name}
                    </h3>
                    <p className="type-body-small text-text-secondary mt-1">
                      {item.email} · {item.phone}
                    </p>
                  </div>
                  <span className="type-body-small text-text-secondary font-mono">
                    {fmtDate(item.created_at)}
                  </span>
                </div>

                {/* University & Duration */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="rounded-control border border-border-default bg-surface-page p-3">
                    <p className="type-label text-text-secondary mb-1">
                      {t("internships.university")}
                    </p>
                    <p className="type-body font-semibold text-text-primary">
                      {item.university}
                    </p>
                    <p className="type-body-small text-text-secondary mt-1">
                      {item.major} ({t("internships.semester")} {item.semester})
                    </p>
                  </div>
                  <div className="rounded-control border border-border-default bg-surface-page p-3">
                    <p className="type-label text-text-secondary mb-1">
                      {t("internships.duration")}
                    </p>
                    <p className="type-body font-semibold text-text-primary">
                      {item.duration}
                    </p>
                  </div>
                </div>

                {/* Motivation */}
                <div className="rounded-control border border-border-default bg-surface-page p-4 mb-4">
                  <p className="type-label text-text-secondary mb-2">
                    {t("internships.motivation")}
                  </p>
                  <p className="type-body text-text-primary whitespace-pre-wrap">
                    {item.motivation}
                  </p>
                </div>

                {/* Portfolio Link */}
                {item.portfolio_url && (
                  <a
                    href={item.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 type-body-small text-action-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("internships.portfolio")}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
