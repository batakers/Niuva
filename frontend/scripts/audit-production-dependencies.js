const { spawnSync } = require("child_process");

// React Router 7.18 closes the older router advisories. npm currently reports
// one RSC server-action advisory that is not reachable in this client-only
// BrowserRouter application. The waiver is exact and fails closed if npm adds
// any other production advisory or if the dependency graph changes.
const acceptedAdvisory =
  "https://github.com/advisories/GHSA-qwww-vcr4-c8h2";
const acceptedPackages = new Set(["react-router", "react-router-dom"]);

const auditEnv = { ...process.env };
delete auditEnv.npm_config_allow_scripts;

const auditCommand =
  process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
const auditArgs =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "npm.cmd audit --omit=dev --json"]
    : ["audit", "--omit=dev", "--json"];
const result = spawnSync(auditCommand, auditArgs, {
  encoding: "utf8",
  env: auditEnv,
});

let report;
try {
  report = JSON.parse(result.stdout || "{}");
} catch (_error) {
  process.stderr.write(result.stderr || "Unable to parse npm audit output.\n");
  process.exit(1);
}

if (
  report.auditReportVersion !== 2 ||
  typeof report.vulnerabilities !== "object" ||
  typeof report.metadata?.vulnerabilities?.total !== "number"
) {
  process.stderr.write(
    result.stderr ||
      "npm audit did not return a complete version 2 advisory report.\n",
  );
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities || {};
const rejected = [];

for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
  const directAdvisories = (vulnerability.via || []).filter(
    (item) => typeof item === "object",
  );
  const isAcceptedPackage = acceptedPackages.has(name);
  const onlyAcceptedAdvisory =
    directAdvisories.length === 0 ||
    directAdvisories.every((item) => item.url === acceptedAdvisory);
  const inheritedOnlyFromAcceptedPackage = (vulnerability.via || []).every(
    (item) =>
      typeof item === "object"
        ? item.url === acceptedAdvisory
        : acceptedPackages.has(item),
  );

  if (
    !isAcceptedPackage ||
    !onlyAcceptedAdvisory ||
    !inheritedOnlyFromAcceptedPackage
  ) {
    rejected.push({
      name,
      severity: vulnerability.severity,
      via: vulnerability.via,
    });
  }
}

if (rejected.length > 0) {
  process.stderr.write(
    `Unapproved production dependency advisories:\n${JSON.stringify(
      rejected,
      null,
      2,
    )}\n`,
  );
  process.exit(1);
}

const total = report.metadata?.vulnerabilities?.total || 0;
if (total > 0) {
  process.stdout.write(
    `Production dependency audit passed with ${total} exact RSC-only ` +
      "React Router advisory entries accepted for this BrowserRouter SPA.\n",
  );
} else {
  process.stdout.write("Production dependency audit passed with no advisories.\n");
}
