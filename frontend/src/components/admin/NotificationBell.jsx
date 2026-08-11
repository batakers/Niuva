import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Bell, CheckCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api, formatApiError } from "@/lib/api";
import { useI18n } from "@/i18n";

/**
 * The bell is the system feed: what the platform did that this reader may need
 * to act on. Outbound communication a human composes is a different surface,
 * with a different audience, and does not appear here.
 *
 * Destinations come from each notification's derived deep_link. The client
 * never decides where an item leads, so a new notifiable event becomes
 * navigable without touching this component.
 */
export function NotificationBell() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/notifications", { params: { limit: 20 } }),
      // Authoritative: counting unread items in the loaded page would stop
      // counting at whatever the page happens to hold.
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const openItem = async (item) => {
    setOpen(false);
    if (!item.is_read) {
      try {
        await api.post(`/notifications/${item.id}/read`);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, is_read: true } : entry
          )
        );
        setUnread((current) => Math.max(0, current - 1));
      } catch {
        // Reading is not the point of the click; navigation still happens.
      }
    }
    if (item.deep_link) navigate(item.deep_link);
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setItems((current) => current.map((entry) => ({ ...entry, is_read: true })));
      setUnread(0);
    } catch {
      // Leave the badge as it was rather than claiming a state we do not have.
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t("notifications.bellLabel")}
        aria-expanded={open}
        aria-haspopup="true"
        data-testid="notification-bell"
        className="relative min-h-11 min-w-11 rounded-control p-2 text-text-secondary transition-colors duration-fast hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && (
          <span
            data-testid="notification-unread-badge"
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-error px-1 text-[10px] font-semibold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <span className="sr-only" role="status" aria-live="polite">
          {unread > 0
            ? `${unread} ${t("notifications.unreadSuffix")}`
            : t("notifications.allRead")}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-control border border-border-default bg-surface-default shadow-navigation">
          <div className="flex items-center justify-between gap-2 border-b border-border-default px-4 py-3">
            <p className="type-label text-text-secondary">
              {t("notifications.bellTitle")}
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                data-testid="notification-mark-all"
                className="inline-flex items-center gap-1 text-xs font-semibold text-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center type-body-small text-text-secondary">
                {t("common.loading")}
              </p>
            ) : error ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-2 border-b border-border-default px-4 py-6 text-center"
              >
                <AlertCircle
                  className="h-6 w-6 text-status-error"
                  aria-hidden="true"
                />
                <p className="type-body-small font-medium text-text-primary">
                  {t("notifications.loadFailed")}
                </p>
                <p className="text-xs text-text-secondary">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  onClick={load}
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("common.retry")}
                </Button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center type-body-small text-text-secondary">
                {t("notifications.bellEmpty")}
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openItem(item)}
                  className={cn(
                    "block w-full border-b border-border-default px-4 py-3 text-left transition-colors last:border-0",
                    "hover:bg-surface-muted focus:bg-surface-muted focus:outline-none motion-reduce:transition-none",
                    !item.is_read && "bg-action-primary/5"
                  )}
                >
                  <p className="type-body-small font-medium text-text-primary">
                    {item.title}
                  </p>
                  {item.body && (
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                      {item.body}
                    </p>
                  )}
                  {item.occurrence_count > 1 && (
                    <p className="mt-1 font-mono text-[10px] text-text-disabled">
                      {t("notifications.recurrence")}: {item.occurrence_count}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border-default px-4 py-3">
            <Link
              to="/admin/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-action-primary"
            >
              {t("notifications.viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
