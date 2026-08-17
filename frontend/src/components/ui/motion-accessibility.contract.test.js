import fs from "fs";
import path from "path";

const scopedFiles = [
  "../admin/UserSelector.jsx",
  "button.jsx",
  "empty-state.jsx",
  "operational-state.jsx",
  "responsive-table.jsx",
  "skeleton.jsx",
  "../../pages/operational/OrderDetail.jsx",
];

const foundationCss = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "index.css"),
  "utf8"
);

test.each(scopedFiles)(
  "%s does not run spinner or pulse motion when reduced motion is requested",
  (relativePath) => {
    const source = fs.readFileSync(path.resolve(__dirname, relativePath), "utf8");
    const unguardedMotion = source.match(
      /(?<!motion-safe:)animate-(?:spin|pulse)\b/g
    );

    expect(unguardedMotion).toBeNull();
  }
);

test("keeps reduced motion static without erasing essential feedback", () => {
  expect(foundationCss).toContain("@media (prefers-reduced-motion: reduce)");
  expect(foundationCss).toContain("animation: none !important");
  expect(foundationCss).toContain("opacity: 1 !important");
  expect(foundationCss).toContain("transform: none !important");
  expect(foundationCss).not.toContain("animation-duration: 0.01ms");
  expect(foundationCss).not.toContain("transition-duration: 0.01ms");
  expect(foundationCss).not.toMatch(/transition\s*:\s*all\b/);
});
