"use strict";

const LOOPBACK_HOSTS = /^(localhost|127\.0\.0\.1|\[?::1\]?)$/i;

function resolveRequiredOrigin(name, value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new Error(name + " must be explicitly configured for a release build.");
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(name + " must be an absolute http(s) URL.");
  }

  if (
    !/^https?:$/.test(parsed.protocol) ||
    LOOPBACK_HOSTS.test(parsed.hostname) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(name + " must be a public http(s) origin without credentials or a path.");
  }

  return parsed.origin;
}

function validateReleaseEnv(env = process.env) {
  return {
    publicSiteUrl: resolveRequiredOrigin(
      "REACT_APP_PUBLIC_SITE_URL",
      env.REACT_APP_PUBLIC_SITE_URL,
    ),
    backendUrl: resolveRequiredOrigin(
      "REACT_APP_BACKEND_URL",
      env.REACT_APP_BACKEND_URL,
    ),
  };
}

if (require.main === module) {
  try {
    const result = validateReleaseEnv();
    console.log("[release-env] validated public site and backend origins.");
    void result;
  } catch (error) {
    console.error("[release-env] " + error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  resolveRequiredOrigin,
  validateReleaseEnv,
};
