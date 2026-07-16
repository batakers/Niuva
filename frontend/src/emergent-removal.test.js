const fs = require("fs");
const path = require("path");

const frontendRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(frontendRoot, "..");

const activeFrontendFiles = [
  "public/index.html",
  "craco.config.js",
  "package.json",
  "package-lock.json",
  ".env.example",
  "src/constants/testIds/home.js",
  "src/constants/testIds/index.js",
];

const activeRepositoryFiles = [
  path.join(repositoryRoot, "backend/.env.example"),
  path.join(repositoryRoot, "doc/PRODUCTION_DEPLOYMENT.md"),
  path.join(repositoryRoot, "doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md"),
];

describe("Emergent removal", () => {
  test.each(activeFrontendFiles)("%s has no active Emergent reference", (relativePath) => {
    const absolutePath = path.join(frontendRoot, relativePath);
    if (!fs.existsSync(absolutePath)) return;
    const content = fs.readFileSync(absolutePath, "utf8").toLowerCase();
    expect(content).not.toContain("emergent");
  });

  test.each(activeRepositoryFiles)("%s has no active Emergent reference", (absolutePath) => {
    const content = fs.readFileSync(absolutePath, "utf8").toLowerCase();
    expect(content).not.toContain("emergent");
  });
});
