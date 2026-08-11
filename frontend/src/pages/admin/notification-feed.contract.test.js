const fs = require("fs");
const path = require("path");

const { ADMIN_ROUTE_PERMISSIONS } = require("@/lib/permissions");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const appSource = read("..", "..", "App.js");
const feedSource = read("NotificationFeed.jsx");
const composerSource = read("Notifications.jsx");
const bellSource = read("..", "..", "components", "admin", "NotificationBell.jsx");
const i18nSource = read("..", "..", "i18n.js");

describe("The bell is a system feed, the composer is not", () => {
  test("the feed and the composer are different pages", () => {
    expect(appSource).toContain(
      '<Route path="/admin/notifications" element={protectedPage("/admin/notifications", <AdminNotificationFeed />)} />'
    );
    expect(appSource).toContain(
      '<Route path="/admin/communication" element={protectedPage("/admin/communication", <AdminNotifications />)} />'
    );
  });

  test("the reader's own feed needs authentication, not send authority", () => {
    // Requiring notifications.write to read your own feed would gate it on the
    // authority to broadcast to others.
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/notifications"]).toBe("admin.access");
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/communication"]).toBe(
      "notifications.write"
    );
  });

  test("every protected Admin route has an explicit permission mapping", () => {
    const protectedPaths = [
      ...appSource.matchAll(/protectedPage\("([^"]+)"/g),
    ].map(([, routePath]) => routePath);

    for (const routePath of new Set(protectedPaths)) {
      expect(
        Object.prototype.hasOwnProperty.call(ADMIN_ROUTE_PERMISSIONS, routePath),
      ).toBe(true);
      expect(ADMIN_ROUTE_PERMISSIONS[routePath]).toEqual(expect.any(String));
    }
  });

  test("the feed never composes and the composer never reads the feed", () => {
    expect(feedSource).not.toContain("/admin/notifications\"");
    expect(feedSource).not.toContain("broadcast");
    expect(composerSource).not.toContain("/notifications/unread-count");
    expect(composerSource).not.toContain("read-all");
  });
});

describe("Unread state", () => {
  test("the badge uses the authoritative count, not the loaded page", () => {
    expect(bellSource).toContain("/notifications/unread-count");
    // Counting unread items in the page would stop at whatever it holds.
    expect(bellSource).not.toContain("items.filter");
  });

  test("the bell offers mark-one and mark-all", () => {
    expect(bellSource).toContain("/read`");
    expect(bellSource).toContain("/notifications/read-all");
    expect(bellSource).toContain('data-testid="notification-mark-all"');
  });

  test("the feed page offers mark-one, mark-all, and an unread filter", () => {
    expect(feedSource).toContain('data-testid="notification-mark-read"');
    expect(feedSource).toContain('data-testid="notification-feed-mark-all"');
    expect(feedSource).toContain("unread_only: unreadOnly");
  });

  test("unread state is announced, not only coloured", () => {
    expect(bellSource).toContain('aria-live="polite"');
    expect(feedSource).toContain('aria-live="polite"');
  });
});

describe("Deep links", () => {
  test("navigation follows the derived link and nothing else", () => {
    expect(bellSource).toContain("item.deep_link");
    expect(feedSource).toContain("item.deep_link");
    // No client-side mapping of event type to destination: a new notifiable
    // event becomes navigable without touching these components.
    expect(bellSource).not.toContain('=== "restock_alert"');
    expect(bellSource).not.toContain("/admin/restock-alerts");
  });

  test("reads the normalized shape rather than the pre-normalization one", () => {
    for (const source of [bellSource, feedSource]) {
      expect(source).toContain("item.is_read");
      expect(source).toContain("item.title");
      expect(source).not.toContain("item.read");
      expect(source).not.toContain("body_html");
      expect(source).not.toContain("item.subject");
    }
  });
});

describe("Notification localization", () => {
  test("localizes the feed copy in Indonesian and English", () => {
    for (const key of [
      "admin.notificationFeed",
      "notifications.feedSubtitle",
      "notifications.unreadSuffix",
      "notifications.allRead",
      "notifications.markRead",
      "notifications.markAllRead",
      "notifications.noUnread",
      "notifications.loadFailed",
      "notifications.recurrence",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
  });
});
