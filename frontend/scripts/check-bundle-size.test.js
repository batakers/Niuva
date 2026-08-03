"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, before, test } = require("node:test");
const { spawnSync } = require("node:child_process");

const scriptPath = path.resolve(__dirname, "check-bundle-size.js");
let fixtureRoot;
let buildRoot;

before(() => {
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "niuva-bundle-check-"));
  buildRoot = path.join(fixtureRoot, "build");
  const jsRoot = path.join(buildRoot, "static", "js");
  fs.mkdirSync(jsRoot, { recursive: true });
  fs.writeFileSync(path.join(jsRoot, "main.abc.js"), "m".repeat(4096));
  fs.writeFileSync(path.join(jsRoot, "101.def.chunk.js"), "a".repeat(2048));
  fs.writeFileSync(
    path.join(buildRoot, "asset-manifest.json"),
    JSON.stringify({
      files: {
        "main.js": "/static/js/main.abc.js",
        "static/js/101.def.chunk.js": "/static/js/101.def.chunk.js",
      },
      entrypoints: ["static/js/main.abc.js"],
    })
  );
});

after(() => {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
});

function run(args = [], env = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      BUNDLE_BUILD_DIR: buildRoot,
      BUNDLE_TOTAL_GZIP_BUDGET: "",
      BUNDLE_ENTRY_GZIP_BUDGET: "",
      BUNDLE_ASYNC_GZIP_BUDGET: "",
      ...env,
    },
  });
}

test("report-only mode measures entry and async assets without inventing budgets", () => {
  const result = run(["--report-only"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Mode: report-only/);
  assert.match(result.stdout, /entry\s+main\.abc\.js/);
  assert.match(result.stdout, /async\s+101\.def\.chunk\.js/);
  assert.doesNotMatch(result.stdout, /All budgets respected/);
});

test("gate mode fails configuration when approved budgets are absent", () => {
  const result = run();

  assert.equal(result.status, 2);
  assert.match(result.stderr, /BUNDLE_TOTAL_GZIP_BUDGET/);
  assert.match(result.stderr, /BUNDLE_ENTRY_GZIP_BUDGET/);
  assert.match(result.stderr, /BUNDLE_ASYNC_GZIP_BUDGET/);
  assert.doesNotMatch(result.stdout, /All budgets respected/);
});

test("gate mode distinguishes entry and async limits", () => {
  const passing = run([], {
    BUNDLE_TOTAL_GZIP_BUDGET: "1000",
    BUNDLE_ENTRY_GZIP_BUDGET: "1000",
    BUNDLE_ASYNC_GZIP_BUDGET: "1000",
  });
  assert.equal(passing.status, 0, passing.stderr);
  assert.match(passing.stdout, /All configured budgets respected/);

  const failing = run([], {
    BUNDLE_TOTAL_GZIP_BUDGET: "1000",
    BUNDLE_ENTRY_GZIP_BUDGET: "10",
    BUNDLE_ASYNC_GZIP_BUDGET: "1000",
  });
  assert.equal(failing.status, 1);
  assert.match(failing.stderr, /Entrypoint asset/);
  assert.doesNotMatch(failing.stderr, /Async asset/);
});

test("gate mode rejects non-positive, non-numeric, or fractional budget values", () => {
  const result = run([], {
    BUNDLE_TOTAL_GZIP_BUDGET: "not-a-number",
    BUNDLE_ENTRY_GZIP_BUDGET: "0",
    BUNDLE_ASYNC_GZIP_BUDGET: "-1",
  });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /positive integer number of bytes/);

  const fractional = run([], {
    BUNDLE_TOTAL_GZIP_BUDGET: "1000.5",
    BUNDLE_ENTRY_GZIP_BUDGET: "1000",
    BUNDLE_ASYNC_GZIP_BUDGET: "1000",
  });

  assert.equal(fractional.status, 2);
  assert.match(fractional.stderr, /BUNDLE_TOTAL_GZIP_BUDGET/);
  assert.match(fractional.stderr, /positive integer number of bytes/);
});
