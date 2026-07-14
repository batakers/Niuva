const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const buildDirectory = path.resolve(__dirname, "..", "build");
const frontendDirectory = path.resolve(__dirname, "..");
for (const filename of [".env.production.local", ".env.local", ".env.production", ".env"]) {
  const envPath = path.join(frontendDirectory, filename);
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath, override: false });
}

const configuredPublicSiteUrl = (process.env.REACT_APP_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const publicRoutes = ["/", "/about", "/capabilities", "/projects", "/contact"];

if (!configuredPublicSiteUrl) {
  console.warn("[release] REACT_APP_PUBLIC_SITE_URL is not configured; sitemap generation skipped.");
  process.exit(0);
}

let siteUrl;
try {
  siteUrl = new URL(configuredPublicSiteUrl);
} catch {
  throw new Error("REACT_APP_PUBLIC_SITE_URL must be an absolute http(s) URL.");
}

if (
  !/^https?:$/.test(siteUrl.protocol) ||
  /^(localhost|127\.0\.0\.1)$/i.test(siteUrl.hostname) ||
  siteUrl.pathname !== "/" ||
  siteUrl.search ||
  siteUrl.hash
) {
  throw new Error("REACT_APP_PUBLIC_SITE_URL must use the confirmed public production origin.");
}

const publicSiteUrl = siteUrl.origin;

if (!fs.existsSync(buildDirectory)) {
  throw new Error("Production build directory is missing; run this script after craco build.");
}

const urls = publicRoutes
  .map((route) => `  <url><loc>${publicSiteUrl}${route}</loc></url>`)
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
fs.writeFileSync(path.join(buildDirectory, "sitemap.xml"), sitemap, "utf8");

const robotsPath = path.join(buildDirectory, "robots.txt");
const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, "utf8").trimEnd() : "User-agent: *\nAllow: /";
fs.writeFileSync(robotsPath, `${robots}\nSitemap: ${publicSiteUrl}/sitemap.xml\n`, "utf8");

console.log(`[release] Sitemap generated for ${publicSiteUrl}.`);
