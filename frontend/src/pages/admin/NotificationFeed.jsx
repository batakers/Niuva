import { ArrowRight, Bell, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { OperationalState } from "@/components/ui/operational-state";
import { SurfacePanel, SurfacePanelHeader } from "@/components/ui/surface-panel";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { AdminLayout } from "./AdminLayout";

/**
 * The full system feed behind the bell. Outbound communication a human
 * composes lives at /admin/communication and is a separate surface.
 */
export default function NotificationFeed() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/notifications", {
        params: { limit: 100, unread_only: unreadOnly },
      }),
      api.get("/notifications/unread-count"),
    ])
      .then(([feed, count]) => {
        setItems(feed.data || []);
        setUnread(count.data?.unread || 0);
      })
      .catch((requestError) =>
        setError(formatApiError(requestError.response?.data?.detail))
      )
      .finally(() => setLoading(false));
  }, [unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (item) => {
    try {
      await api.post(`/notifications/${item.id}/read`);
      load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      toast.success(t("notifications.allMarkedRead"));
      load();
    } catch (requestError) {
      toast.error(formatApiError(requestError.response?.data?.detail));
    }
  };

  return (
    <AdminLayout
      title={t("admin.notificationFeed")}
      subtitle={t("notifications.feedSubtitle")}
    >
      <SurfacePanel>
        <SurfacePanelHeader className="flex flex-wrap items-center justify-between gap-3">
          <p className="type-label text-text-secondary" role="status" aria-live="polite">
            {unread > 0
              ? `${unread} ${t("notifications.unreadSuffix")}`
              : t("notifications.allRead")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11"
              onClick={() => setUnreadOnly((current) => !current)}
              aria-pressed={unreadOnly}
              data-testid="notification-filter-unread"
            >
              {unreadOnly
                ? t("notifications.showAll")
                : t("notifications.showUnreadOnly")}
            </Button>
            {unread > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={markAllRead}
                data-testid="notification-feed-mark-all"
              >
                <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("notifications.markAllRead")}
              </Button>
            )}
          </div>
        </SurfacePanelHeader>

        {loading ? (
          <OperationalState state="loading" title={t("common.loading")} />
        ) : error ? (
          <OperationalState
            state="error"
            title={t("notifications.loadFailed")}
            description={error}
            retryLabel={t("common.retry")}
            onRetry={load}
          />
        ) : items.length === 0 ? (
          <OperationalState
            state={unreadOnly ? "no-match" : "empty"}
            title={
              unreadOnly
                ? t("notifications.noUnread")
                : t("notifications.bellEmpty")
            }
          />
        ) : (
          <ul className="divide-y divide-border-default">
            {items.map((item) => (
              <li
                key={item.id}
                className={`flex flex-wrap items-start gap-4 p-5 ${
                  item.is_read ? "" : "bg-action-primary/5"
                }`}
                data-testid={item.is_read ? "notification-read" : "notification-unread"}
              >
                <Bell
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    item.is_read ? "text-text-disabled" : "text-action-primary"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">{item.title}</p>
                  {item.body && (
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {item.body}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-[11px] text-text-disabled">
                    {fmtDate(item.created_at)}
                    {item.occurrence_count > 1
                      ? ` · ${t("notifications.recurrence")} ${item.occurrence_count}`
                      : ""}
                  </p>
                  <TechnicalLabel size="micro" className="mt-1 block">
                    {item.event}
                  </TechnicalLabel>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Only a derived link is offered; a notification without an
                      allowlisted reference simply has nowhere to go. */}
                  {item.deep_link && (
                    <Link
                      to={item.deep_link}
                      className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-action-primary"
                      data-testid="notification-deep-link"
                    >
                      {t("notifications.open")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                  {!item.is_read && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      onClick={() => markRead(item)}
                      data-testid="notification-mark-read"
                    >
                      {t("notifications.markRead")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
