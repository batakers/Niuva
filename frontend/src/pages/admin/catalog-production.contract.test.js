const fs = require("fs");
const path = require("path");

const editorSource = fs.readFileSync(
  path.join(__dirname, "ProductEditor.jsx"),
  "utf8",
);
const catalogSource = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "lib", "catalog.js"),
  "utf8",
);
const translationsSource = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "lib", "domain-translations.js"),
  "utf8",
);

describe("Product Editor split-save contract", () => {
  test("uses the three existing resource-owned mutation adapters", () => {
    expect(catalogSource).toContain(
      'api.put(`/admin/products/${id}`, payload)',
    );
    expect(catalogSource).toContain(
      'api.put(`/admin/products/${id}/variants`, { variants })',
    );
    expect(catalogSource).toContain(
      'api.put(`/admin/products/${id}/options`, { options })',
    );
    expect(editorSource).toContain("catalogApi.updateProduct");
    expect(editorSource).toContain("catalogApi.replaceVariants");
    expect(editorSource).toContain("catalogApi.replaceOptions");
    expect(editorSource).not.toContain("Promise.all");
  });

  test("gates child editing until a new product has an authoritative id", () => {
    expect(editorSource).toContain(
      'disabled={isNew && ["variants", "options"].includes(tab)}',
    );
    expect(editorSource).toContain('if (isNew) return;');
    expect(editorSource).toContain("catalog.childRequiresProduct");
  });

  test("keeps independent state and reconciliation for each save section", () => {
    for (const section of ["product", "variants", "options"]) {
      expect(editorSource).toContain(`sectionStates.${section}`);
      expect(editorSource).toContain(`section=\"${section}\"`);
    }
    for (const state of [
      "not_attempted",
      "submitting",
      "success",
      "validation_error",
      "conflict",
      "dependency_error",
    ]) {
      expect(editorSource).toContain(`\"${state}\"`);
    }
    expect(editorSource).toContain('reconcileSection("variants"');
    expect(editorSource).toContain('reconcileSection("options"');
    expect(editorSource).toContain("sectionActionLabel");
    expect(editorSource).toContain('t("common.retry")');
    expect(editorSource).toContain('role="status" aria-live="polite"');
  });

  test("provides localized labels and recovery hints for every section state", () => {
    for (const key of [
      "catalog.saveProduct",
      "catalog.saveVariants",
      "catalog.saveOptions",
      "catalog.productSaved",
      "catalog.variantsSaved",
      "catalog.optionsSaved",
      "catalog.childRequiresProduct",
      "catalog.sectionState.notAttempted",
      "catalog.sectionState.submitting",
      "catalog.sectionState.success",
      "catalog.sectionState.validation",
      "catalog.sectionState.conflict",
      "catalog.sectionState.dependency",
      "catalog.sectionHint.validation",
      "catalog.sectionHint.conflict",
      "catalog.sectionHint.dependency",
      "catalog.sectionHint.error",
    ]) {
      expect(translationsSource.match(new RegExp(`"${key.replaceAll(".", "\\.")}":`, "g"))).toHaveLength(2);
    }
  });
});
