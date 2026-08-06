"use strict";

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const defaultBuildDirectory = path.resolve(__dirname, "..", "build");
const publicRoutes = ["/", "/about", "/capabilities", "/projects", "/contact"];

function resolvePublicSiteUrl(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";

  let siteUrl;
  try {
    siteUrl = new URL(normalized);
  } catch {
    throw new Error("REACT_APP_PUBLIC_SITE_URL must be an absolute http(s) URL.");
  }

  if (
    !/^https?:$/.test(siteUrl.protocol) ||
    /^(localhost|127\.0\.0\.1)$/i.test(siteUrl.hostname) ||
    siteUrl.username ||
    siteUrl.password ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error("REACT_APP_PUBLIC_SITE_URL must use the confirmed public production origin.");
  }

  return siteUrl.origin;
}

function generateReleaseFiles({
  buildDirectory = defaultBuildDirectory,
  publicSiteUrlValue,
}) {
  const publicSiteUrl = resolvePublicSiteUrl(publicSiteUrlValue);
  if (!publicSiteUrl) {
    return { generated: false, publicSiteUrl: "" };
  }

  if (!fs.existsSync(buildDirectory)) {
    throw new Error("Production build directory is missing; run this script after craco build.");
  }

  const urls = publicRoutes
    .map((route) => "  <url><loc>" + publicSiteUrl + route + "</loc></url>")
    .join("\n");
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
  const sitemapPath = path.join(buildDirectory, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemap, "utf8");

  const robotsPath = path.join(buildDirectory, "robots.txt");
  const robots = fs.existsSync(robotsPath)
    ? fs.readFileSync(robotsPath, "utf8").trimEnd()
    : "User-agent: *\nAllow: /";
  fs.writeFileSync(
    robotsPath,
    robots + "\nSitemap: " + publicSiteUrl + "/sitemap.xml\n",
    "utf8",
  );

  return {
    generated: true,
    publicSiteUrl,
    sitemapPath,
    robotsPath,
  };
}

function loadLocalEnvironment() {
  const frontendDirectory = path.resolve(__dirname, "..");
  for (const filename of [".env.production.local", ".env.local", ".env.production", ".env"]) {
    const envPath = path.join(frontendDirectory, filename);
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath, override: false });
  }
}

if (require.main === module) {
  loadLocalEnvironment();
  const publicSiteUrlValue = process.env.REACT_APP_PUBLIC_SITE_URL || "";
  if (!publicSiteUrlValue) {
    console.warn("[release] REACT_APP_PUBLIC_SITE_URL is not configured; sitemap generation skipped.");
  } else {
    const result = generateReleaseFiles({ publicSiteUrlValue });
    console.log("[release] Sitemap generated for " + result.publicSiteUrl + ".");
  }
}

module.exports = {
  PUBLIC_ROUTES: publicRoutes,
  resolvePublicSiteUrl,
  generateReleaseFiles,
};
