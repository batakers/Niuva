"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const BUDGET_CONFIG_PATH = path.resolve(
  __dirname,
  "..",
  "config",
  "release-bundle-budget.json",
);

const BUDGET_ENV_NAMES = [
  "BUNDLE_TOTAL_GZIP_BUDGET",
  "BUNDLE_ENTRY_GZIP_BUDGET",
  "BUNDLE_ASYNC_GZIP_BUDGET",
];

function loadApprovedBundleBudget(filePath = BUDGET_CONFIG_PATH) {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Unable to read approved bundle budget config: ${error.message}`,
    );
  }

  if (config.status !== "approved") {
    throw new Error("Bundle budget config must have status=approved.");
  }

  const missing = BUDGET_ENV_NAMES.filter(
    (name) => !Object.prototype.hasOwnProperty.call(config.budgets || {}, name),
  );
  if (missing.length > 0) {
    throw new Error(`Bundle budget config is missing: ${missing.join(", ")}.`);
  }

  const invalid = BUDGET_ENV_NAMES.filter((name) => {
    const value = config.budgets[name];
    return !Number.isInteger(value) || value <= 0;
  });
  if (invalid.length > 0) {
    throw new Error(
      `Bundle budget config must contain positive integer byte values: ${invalid.join(", ")}.`,
    );
  }

  return Object.fromEntries(
    BUDGET_ENV_NAMES.map((name) => [name, String(config.budgets[name])]),
  );
}

function resolveNpmInvocation(env = process.env) {
  if (!env.npm_execpath) {
    throw new Error(
      "npm_execpath is unavailable; invoke the release runner through npm.",
    );
  }

  return {
    command: env.npm_node_execpath || process.execPath,
    args: [env.npm_execpath],
  };
}

function runNpm(args, env) {
  let invocation;
  try {
    invocation = resolveNpmInvocation(env);
  } catch (error) {
    console.error(`[release] ${error.message}`);
    return 1;
  }

  const result = spawnSync(invocation.command, [...invocation.args, ...args], {
    env,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`[release] ${result.error.message}`);
    return 1;
  }

  return typeof result.status === "number" ? result.status : 1;
}

function main() {
  let approvedBudget;
  try {
    approvedBudget = loadApprovedBundleBudget();
  } catch (error) {
    console.error(`[release] ${error.message}`);
    return 1;
  }

  const releaseEnv = {
    ...process.env,
    ...approvedBudget,
  };

  const buildExit = runNpm(["run", "build"], releaseEnv);
  if (buildExit !== 0) {
    return buildExit;
  }

  return runNpm(["run", "check:bundle"], releaseEnv);
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = {
  BUDGET_CONFIG_PATH,
  BUDGET_ENV_NAMES,
  loadApprovedBundleBudget,
  resolveNpmInvocation,
  main,
};
