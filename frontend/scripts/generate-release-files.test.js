"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, test } = require("node:test");
const {
  PUBLIC_ROUTES,
  generateReleaseFiles,
  resolvePublicSiteUrl,
} = require("./generate-release-files");

const fixtureRoots = [];

after(() => {
  for (const root of fixtureRoots) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function createBuildFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "niuva-release-files-"));
  fixtureRoots.push(root);
  return root;
}

test("accepts only a public origin and normalizes its trailing slash", () => {
  assert.equal(
    resolvePublicSiteUrl("https://staging.niuva.example/"),
    "https://staging.niuva.example",
  );
  assert.equal(resolvePublicSiteUrl(""), "");

  for (const value of [
    "http://localhost:3000",
    "https://staging.niuva.example/site",
    "https://user:secret@staging.niuva.example",
    "not-a-url",
  ]) {
    assert.throws(
      () => resolvePublicSiteUrl(value),
      /confirmed public production origin|absolute http\(s\) URL/,
    );
  }
});

test("generates sitemap and robots from one canonical origin", () => {
  const buildDirectory = createBuildFixture();
  const result = generateReleaseFiles({
    buildDirectory,
    publicSiteUrlValue: "https://staging.niuva.example/",
  });

  assert.equal(result.generated, true);
  assert.equal(result.publicSiteUrl, "https://staging.niuva.example");
  const sitemap = fs.readFileSync(path.join(buildDirectory, "sitemap.xml"), "utf8");
  for (const route of PUBLIC_ROUTES) {
    assert.ok(sitemap.includes("<loc>https://staging.niuva.example" + route + "</loc>"));
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, PUBLIC_ROUTES.length);

  const robots = fs.readFileSync(path.join(buildDirectory, "robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/staging\.niuva\.example\/sitemap\.xml/);
});
