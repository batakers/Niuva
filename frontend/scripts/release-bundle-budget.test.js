"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  loadApprovedBundleBudget,
  resolveNpmInvocation,
} = require("./run-release-build");

test("loads the owner-approved G3 bundle budget as release environment values", () => {
  assert.deepEqual(loadApprovedBundleBudget(), {
    BUNDLE_TOTAL_GZIP_BUDGET: "655000",
    BUNDLE_ENTRY_GZIP_BUDGET: "229000",
    BUNDLE_ASYNC_GZIP_BUDGET: "113000",
  });
});

test("rejects a budget config that is not approved", () => {
  const tempDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "niuva-release-budget-"),
  );
  const configPath = path.join(tempDirectory, "budget.json");

  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        status: "proposed",
        budgets: {
          BUNDLE_TOTAL_GZIP_BUDGET: 655000,
          BUNDLE_ENTRY_GZIP_BUDGET: 229000,
          BUNDLE_ASYNC_GZIP_BUDGET: 113000,
        },
      }),
    );

    assert.throws(
      () => loadApprovedBundleBudget(configPath),
      /status=approved/,
    );
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test("invokes the npm CLI through the current Node executable", () => {
  const invocation = resolveNpmInvocation({
    npm_execpath: "npm-cli.js",
    npm_node_execpath: "node.exe",
  });

  assert.deepEqual(invocation, {
    command: "node.exe",
    args: ["npm-cli.js"],
  });
});
