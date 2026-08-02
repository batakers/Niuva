#!/usr/bin/env node
/**
 * Reports CRA-style gzipped JavaScript sizes and, only when explicitly
 * configured, enforces approved budgets.
 *
 * Usage:
 *   node scripts/check-bundle-size.js --report-only
 *   BUNDLE_TOTAL_GZIP_BUDGET=... \
 *   BUNDLE_ENTRY_GZIP_BUDGET=... \
 *   BUNDLE_ASYNC_GZIP_BUDGET=... \
 *     node scripts/check-bundle-size.js
 *
 * Every budget is expressed in bytes. Gate mode intentionally has no default:
 * repository measurements are evidence, not authorization to invent policy.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const KB = 1024;
const BUDGET_NAMES = [
  "BUNDLE_TOTAL_GZIP_BUDGET",
  "BUNDLE_ENTRY_GZIP_BUDGET",
  "BUNDLE_ASYNC_GZIP_BUDGET",
];

function formatBytes(bytes) {
  return `${(bytes / KB).toFixed(2)} kB`;
}

function readBudgets(env) {
  const missing = [];
  const invalid = [];
  const values = {};

  for (const name of BUDGET_NAMES) {
    const raw = String(env[name] || "").trim();
    if (!raw) {
      missing.push(name);
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      invalid.push(name);
      continue;
    }
    values[name] = value;
  }

  if (missing.length > 0 || invalid.length > 0) {
    const details = [];
    if (missing.length > 0) details.push(`missing: ${missing.join(", ")}`);
    if (invalid.length > 0) {
      details.push(`must be a positive number of bytes: ${invalid.join(", ")}`);
    }
    throw new Error(details.join("; "));
  }

  return {
    total: values.BUNDLE_TOTAL_GZIP_BUDGET,
    entry: values.BUNDLE_ENTRY_GZIP_BUDGET,
    async: values.BUNDLE_ASYNC_GZIP_BUDGET,
  };
}

function loadAssets(buildRoot) {
  const jsRoot = path.join(buildRoot, "static", "js");
  const manifestPath = path.join(buildRoot, "asset-manifest.json");
  if (!fs.existsSync(jsRoot)) {
    throw new Error(`Build directory not found: ${jsRoot}. Run the frontend build first.`);
  }
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Asset manifest not found: ${manifestPath}. Asset classification is unavailable.`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const entryNames = new Set(
    (manifest.entrypoints || [])
      .filter((entry) => entry.endsWith(".js"))
      .map((entry) => path.basename(entry))
  );

  const assets = fs
    .readdirSync(jsRoot)
    .filter((name) => name.endsWith(".js"))
    .map((name) => {
      const raw = fs.readFileSync(path.join(jsRoot, name));
      return {
        name,
        kind: entryNames.has(name) ? "entry" : "async",
        gzip: zlib.gzipSync(raw).length,
      };
    })
    .sort((left, right) => right.gzip - left.gzip);

  if (assets.length === 0) {
    throw new Error("No JavaScript assets were emitted.");
  }
  if (!assets.some((asset) => asset.kind === "entry")) {
    throw new Error("No JavaScript entrypoint was identified from asset-manifest.json.");
  }
  return assets;
}

function largestOf(assets, kind) {
  return assets.filter((asset) => asset.kind === kind).sort((a, b) => b.gzip - a.gzip)[0];
}

function evaluate(assets, budgets) {
  const total = assets.reduce((sum, asset) => sum + asset.gzip, 0);
  const largestEntry = largestOf(assets, "entry");
  const largestAsync = largestOf(assets, "async");
  const failures = [];

  if (total > budgets.total) {
    failures.push(`Total gzip size ${formatBytes(total)} exceeds budget ${formatBytes(budgets.total)}.`);
  }
  if (largestEntry && largestEntry.gzip > budgets.entry) {
    failures.push(
      `Entrypoint asset ${largestEntry.name} at ${formatBytes(largestEntry.gzip)} exceeds budget ${formatBytes(budgets.entry)}.`
    );
  }
  if (largestAsync && largestAsync.gzip > budgets.async) {
    failures.push(
      `Async asset ${largestAsync.name} at ${formatBytes(largestAsync.gzip)} exceeds budget ${formatBytes(budgets.async)}.`
    );
  }
  return failures;
}

function main() {
  const reportOnly = process.argv.includes("--report-only");
  const buildRoot = path.resolve(
    process.env.BUNDLE_BUILD_DIR || path.resolve(__dirname, "..", "build")
  );

  let assets;
  try {
    assets = loadAssets(buildRoot);
  } catch (error) {
    console.error(`[check-bundle-size] ${error.message}`);
    return 2;
  }

  console.log(`[check-bundle-size] Mode: ${reportOnly ? "report-only" : "gate"}`);
  console.log("[check-bundle-size] Gzipped JavaScript assets:");
  for (const asset of assets) {
    console.log(
      `  ${asset.kind.padEnd(7)} ${asset.name.padEnd(48)} ${formatBytes(asset.gzip).padStart(12)}`
    );
  }

  const total = assets.reduce((sum, asset) => sum + asset.gzip, 0);
  const largestEntry = largestOf(assets, "entry");
  const largestAsync = largestOf(assets, "async");
  console.log(`[check-bundle-size] Total gzip: ${formatBytes(total)}`);
  console.log(
    `[check-bundle-size] Largest entrypoint: ${largestEntry.name} at ${formatBytes(largestEntry.gzip)}`
  );
  if (largestAsync) {
    console.log(
      `[check-bundle-size] Largest async asset: ${largestAsync.name} at ${formatBytes(largestAsync.gzip)}`
    );
  }

  if (reportOnly) {
    console.log("[check-bundle-size] Measurement complete; no budget decision was applied.");
    return 0;
  }

  let budgets;
  try {
    budgets = readBudgets(process.env);
  } catch (error) {
    console.error(`[check-bundle-size] Budget configuration required (${error.message}).`);
    console.error(
      "[check-bundle-size] Use --report-only for measurement or provide all approved budget variables."
    );
    return 2;
  }

  const failures = evaluate(assets, budgets);
  if (failures.length > 0) {
    console.error("\n[check-bundle-size] Configured budget violated:");
    for (const line of failures) console.error(`  - ${line}`);
    return 1;
  }

  console.log("\n[check-bundle-size] All configured budgets respected.");
  return 0;
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = {
  evaluate,
  loadAssets,
  readBudgets,
};
