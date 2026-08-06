"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { validateReleaseEnv } = require("./validate-release-env");

test("accepts explicit public and backend origins", () => {
  const result = validateReleaseEnv({
    REACT_APP_PUBLIC_SITE_URL: "https://staging.niuva.example/",
    REACT_APP_BACKEND_URL: "https://api.staging.niuva.example/",
  });

  assert.deepEqual(result, {
    publicSiteUrl: "https://staging.niuva.example",
    backendUrl: "https://api.staging.niuva.example",
  });
});

test("requires both release origins", () => {
  assert.throws(
    () => validateReleaseEnv({ REACT_APP_PUBLIC_SITE_URL: "https://staging.niuva.example" }),
    /REACT_APP_BACKEND_URL must be explicitly configured/,
  );
});

test("rejects local, path-based, credentialed, or non-http origins", () => {
  for (const value of [
    "http://localhost:3000",
    "https://staging.niuva.example/site",
    "https://user:secret@staging.niuva.example",
    "ftp://staging.niuva.example",
  ]) {
    assert.throws(
      () =>
        validateReleaseEnv({
          REACT_APP_PUBLIC_SITE_URL: value,
          REACT_APP_BACKEND_URL: "https://api.staging.niuva.example",
        }),
      /public http\(s\) origin|absolute http\(s\) URL/,
    );
  }
});
