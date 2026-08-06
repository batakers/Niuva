"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"),
);

test("release build enforces the configured bundle gate and persists its report", () => {
  assert.match(packageJson.scripts["build:release"], /npm run check:bundle/);
  assert.match(
    packageJson.scripts["check:bundle"],
    /--report-path build\/bundle-report\.json/,
  );
});
