import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonText } from "@/components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { useI18n } from "@/i18n";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

export default function AdminContacts() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/contacts")
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      title={t("admin.contacts")}
      subtitle={t("contacts.subtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between">
          <TechnicalLabel>
            {t("contacts.total")}: {items.length}
          </TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? (
          <div className="divide-y divide-border-default">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Mail} className="py-16">{t("contacts.empty")}</EmptyState>
        ) : (
          <div className="divide-y divide-border-default">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-surface-muted transition-colors"
                data-testid="admin-contact-list"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      {item.subject}
                    </h3>
                    <p className="type-body-small text-action-primary mt-1">
                      {item.name} · {item.email}
                    </p>
                  </div>
                  <span className="type-body-small text-text-secondary font-mono">
                    {fmtDate(item.created_at)}
                  </span>
                </div>

                {/* Message */}
                <div className="rounded-control border border-border-default bg-surface-page p-4">
                  <p className="type-label text-text-secondary mb-2">
                    {t("contacts.message")}
                  </p>
                  <p className="type-body text-text-primary whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
