import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight, Archive, Mail } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/ui/empty-state";
import { OperationalState } from "@/components/ui/operational-state";
import { SkeletonText } from "@/components/ui/skeleton";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

export default function AdminContacts() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/admin/contacts")
      .then((response) => setItems(response.data))
      .catch((requestError) =>
        setError(formatApiError(requestError.response?.data?.detail))
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout
      title={t("admin.contacts")}
      subtitle={t("contacts.subtitle")}
    >
      <SurfacePanel padding="md" intent="dashed" className="mb-5">
        <div className="flex gap-3">
          <Archive
            className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-text-primary">
              {t("contacts.legacyTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {t("contacts.legacyBody")}
            </p>
            <Link
              to="/admin/inquiries"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-action-primary"
            >
              {t("contacts.openInquiries")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </SurfacePanel>

      <SurfacePanel>
        <SurfacePanelHeader className="flex items-center justify-between">
          <p className="type-label text-text-secondary">
            {t("contacts.total")}: {items.length}
          </p>
        </SurfacePanelHeader>

        {loading ? (
          <div className="divide-y divide-border-default">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        ) : error ? (
          <OperationalState
            state="error"
            title={t("contacts.loadFailed")}
            description={error}
            retryLabel={t("common.retry")}
            onRetry={load}
          />
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
