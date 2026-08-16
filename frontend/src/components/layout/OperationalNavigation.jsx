import React from "react";
import { Link } from "react-router-dom";

import {
  navigationControlClass,
  outlineNavigationControlClass,
  quietNavigationControlClass,
} from "./navigationStyles";

const languageControlClass =
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-control bg-surface-muted px-3 py-2 text-xs font-bold uppercase text-text-primary transition-colors duration-emphasis ease-snap hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default";

export function OperationalNavigation({
  lang,
  languageAriaLabel,
  logoutLabel,
  mobile = false,
  onLanguageToggle,
  onSignOut,
  onWorkspace,
  signedIn,
  siteLabel,
  workspaceLabel,
}) {
  const homePath = lang === "en" ? "/en" : "/";
  const contactPath = lang === "en" ? "/en/contact" : "/kontak";
  if (mobile) {
    return (
      <>
        <button
          type="button"
          onClick={onWorkspace}
          className="rounded-control bg-surface-muted px-4 py-4 text-left text-lg font-semibold text-text-primary ring-1 ring-border-default transition-colors hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {workspaceLabel}
        </button>
        <Link
          to={homePath}
          className="rounded-control px-4 py-4 text-lg font-semibold text-text-primary transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {siteLabel}
        </Link>
        <div className="mt-4 grid gap-3 border-t border-border-default pt-4 min-[380px]:grid-cols-2">
          <button
            type="button"
            onClick={onLanguageToggle}
            aria-label={languageAriaLabel}
            className={`${languageControlClass} px-4 py-3 text-sm`}
          >
            {lang === "id" ? "English" : "Indonesia"}
          </button>
          {signedIn && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control bg-action-primary px-4 py-3 text-sm font-semibold text-text-inverse transition-all duration-emphasis ease-snap hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              {logoutLabel}
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <button
        type="button"
        data-testid="language-toggle"
        onClick={onLanguageToggle}
        aria-label={languageAriaLabel}
        className={languageControlClass}
      >
        {lang}
      </button>
      {signedIn ? (
        <>
          <button
            onClick={onWorkspace}
            type="button"
            className={outlineNavigationControlClass}
          >
            {workspaceLabel}
          </button>
          <button
            onClick={onSignOut}
            type="button"
            className={quietNavigationControlClass}
          >
            {logoutLabel}
          </button>
        </>
      ) : (
        <Link
          to={contactPath}
          className={`${navigationControlClass} bg-action-primary text-text-inverse hover:bg-action-primary-hover`}
        >
          {lang === "en" ? "Discuss a project" : "Diskusikan project"}
        </Link>
      )}
    </div>
  );
}
