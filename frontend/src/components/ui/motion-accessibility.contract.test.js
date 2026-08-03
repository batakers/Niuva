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
