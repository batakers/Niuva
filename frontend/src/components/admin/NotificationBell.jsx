import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";

/**
 * NotificationBell - header bell + popover for GET /api/notifications.
 * Restock alerts and other in-app notifications surface here instead of a
 * dedicated sidebar page; clicking a restock item still navigates to
 * /admin/restock-alerts so the resolve+reason workflow keeps its own screen.
 */
export function NotificationBell() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/notifications")
      .then((r) => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = items.filter((item) => !item.read).length;

  const handleItemClick = (item) => {
    setOpen(false);
    if (item.type === "restock_alert") {
      navigate("/admin/restock-alerts");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t("notifications.bellLabel")}
        aria-expanded={open}
        className="relative rounded-control p-2 text-text-secondary transition-colors duration-fast hover:bg-surface-muted hover:text-text-primary"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-error px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-control border border-border-default bg-surface-default shadow-navigation">
          <div className="border-b border-border-default px-4 py-3">
            <p className="type-label text-text-secondary">
              {t("notifications.bellTitle")}
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center type-body-small text-text-secondary">
                {t("common.loading")}
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center type-body-small text-text-secondary">
                {t("notifications.bellEmpty")}
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "block w-full border-b border-border-default px-4 py-3 text-left transition-colors last:border-0",
                    "hover:bg-surface-muted focus:bg-surface-muted focus:outline-none",
                    !item.read && "bg-action-primary/5"
                  )}
                >
                  <p className="type-body-small font-medium text-text-primary">
                    {item.subject}
                  </p>
                  {item.body_html && (
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                      {item.body_html.replace(/<[^>]*>/g, " ").trim()}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
