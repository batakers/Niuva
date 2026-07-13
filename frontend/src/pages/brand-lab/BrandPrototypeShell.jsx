import React, { useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import "./brand-prototypes.css";

const FONT_STYLESHEETS = {
  editorial:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
  experimental:
    "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap",
};

function usePrototypeDocument(concept) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousRobots = document.querySelector('meta[name="robots"]');
    const previousRobotsContent = previousRobots?.getAttribute("content");
    const robots = previousRobots || document.createElement("meta");
    const canonical = document.querySelector('link[rel="canonical"]');
    const canonicalParent = canonical?.parentNode;
    const canonicalNextSibling = canonical?.nextSibling;

    if (!previousRobots) {
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    canonical?.remove();
    document.title = `Niuva Brand Lab - ${concept}`;

    const fontId = `niuva-brand-lab-font-${concept.toLowerCase()}`;
    let fontLink = document.getElementById(fontId);
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = fontId;
      fontLink.rel = "stylesheet";
      fontLink.href = FONT_STYLESHEETS[concept.toLowerCase()];
      fontLink.media = "print";
      fontLink.onload = () => {
        fontLink.media = "all";
      };
      document.head.appendChild(fontLink);
    }

    return () => {
      document.title = previousTitle;
      if (previousRobots) {
        robots.setAttribute("content", previousRobotsContent || "");
      } else {
        robots.remove();
      }
      fontLink?.remove();
      if (canonical && canonicalParent) {
        canonicalParent.insertBefore(canonical, canonicalNextSibling || null);
      }
    };
  }, [concept]);
}

export function BrandPrototypeShell({ concept, children }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reviewMode = searchParams.get("review") === "true";
  const reviewSuffix = reviewMode ? "?review=true" : "";

  usePrototypeDocument(concept);

  return (
    <div className={`brand-prototype-shell ${reviewMode ? "is-review-mode" : ""}`}>
      {!reviewMode && (
        <aside className="brand-prototype-controls" aria-label="Brand prototype controls">
          <div className="brand-prototype-controls__identity">
            <BrandIdentity />
            <div>
              <p className="brand-prototype-controls__title">Brand Lab</p>
              <p className="brand-prototype-controls__note">Internal review - test at 360, 430, 768, 1024, 1366, and 1536px</p>
            </div>
          </div>
          <nav className="brand-prototype-switcher" aria-label="Choose Homepage concept">
            <Link
              to={`/__brand-lab/editorial${reviewSuffix}`}
              aria-current={location.pathname.endsWith("/editorial") ? "page" : undefined}
            >
              Editorial
            </Link>
            <Link
              to={`/__brand-lab/experimental${reviewSuffix}`}
              aria-current={location.pathname.endsWith("/experimental") ? "page" : undefined}
            >
              Experimental
            </Link>
            <Link to="/">Production Home</Link>
          </nav>
        </aside>
      )}
      <main id="prototype-content" className="brand-prototype-canvas">
        {children}
      </main>
    </div>
  );
}

export function PrototypeLink({ children, variant = "primary", className = "", ...props }) {
  return (
    <Link className={`bp-button bp-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </Link>
  );
}

export function PrototypeImage({ project, className = "", eager = false, sizes }) {
  return (
    <img
      src={project.image}
      alt={project.imageAlt}
      width={project.imageWidth}
      height={project.imageHeight}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      sizes={sizes}
      className={className}
    />
  );
}

