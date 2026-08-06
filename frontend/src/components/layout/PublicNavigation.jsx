import React from "react";
import { Link } from "react-router-dom";

import {
  navigationControlClass,
  quietNavigationControlClass,
} from "./navigationStyles";

export const PUBLIC_NAVIGATION_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/capabilities", label: "Capabilities", aliases: ["/services"] },
  { to: "/projects", label: "Projects", aliases: ["/portfolio"] },
  { to: "/contact", label: "Contact" },
];

function isActive(pathname, item) {
  return pathname === item.to || item.aliases?.includes(pathname);
}

export function PublicNavigation({ pathname, mobile = false, menuOpen = false }) {
  if (mobile) {
    return (
      <>
        {PUBLIC_NAVIGATION_LINKS.map((item, index) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive(pathname, item) ? "page" : undefined}
            className={`rounded-control px-4 py-4 text-lg font-semibold transition-all duration-emphasis ease-snap ${
              isActive(pathname, item)
                ? "bg-surface-page text-action-primary ring-1 ring-border-default"
                : "text-text-primary hover:bg-surface-muted"
            }`}
            style={{ transitionDelay: menuOpen ? `${index * 36}ms` : "0ms" }}
          >
            {item.label}
          </Link>
        ))}
        <Link
          to="/retail"
          aria-current={pathname.startsWith("/retail") ? "page" : undefined}
          className="mt-2 rounded-control border border-border-default bg-surface-muted px-4 py-4 text-lg font-semibold text-text-primary"
        >
          Retail · Explore
        </Link>
        <div className="mt-4 grid gap-3 border-t border-border-default pt-4">
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-control bg-action-primary px-4 py-3 text-center text-sm font-semibold text-text-inverse transition-all duration-emphasis ease-snap hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            Diskusikan Project
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <nav
        className="hidden items-center gap-1 lg:flex"
        aria-label="Primary navigation"
      >
        {PUBLIC_NAVIGATION_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive(pathname, item) ? "page" : undefined}
            className={`type-navigation inline-flex min-h-11 items-center rounded-control px-4 py-2 transition-all duration-emphasis ease-snap ${
              isActive(pathname, item)
                ? "bg-surface-page text-action-primary ring-1 ring-border-default"
                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="hidden items-center gap-2 sm:flex">
        <Link to="/retail" className={quietNavigationControlClass}>
          Retail
        </Link>
        <Link
          to="/contact"
          className={`${navigationControlClass} bg-action-primary text-text-inverse hover:bg-action-primary-hover`}
        >
          Diskusikan Project
        </Link>
      </div>
    </>
  );
}
