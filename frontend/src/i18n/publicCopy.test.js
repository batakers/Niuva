import React from "react";
import { localizePublicContent } from "./publicCopy";
import { getLocalizedField } from "../i18n";

test("localizes nested public page props and children", () => {
  const source = React.createElement("section", {
    title: "Mitra strategis untuk kebutuhan produk yang harus diuji.",
    items: ["Riset kebutuhan", "Validasi prototipe"],
  }, "Diskusikan Project");
  const result = localizePublicContent(source, "en");

  expect(result.props.title).toBe("A strategic partner for products that need to be tested.");
  expect(result.props.items).toEqual(["Needs research", "Prototype validation"]);
  expect(result.props.children).toBe("Discuss Your Project");
});

test("keeps Indonesian public copy unchanged", () => {
  expect(localizePublicContent("Diskusikan Project", "id")).toBe("Diskusikan Project");
});

test("handles circular props safely during a language switch", () => {
  const circular = { label: "Diskusikan Project" };
  circular.self = circular;
  const result = localizePublicContent(React.createElement("div", { circular }), "en");

  expect(result.props.circular.label).toBe("Discuss Your Project");
  expect(result.props.circular.self).toBe(result.props.circular);
});

test("localizes backend fields with Indonesian fallback", () => {
  expect(getLocalizedField({ title_id: "Judul", title_en: "Title" }, "title", "en")).toBe("Title");
  expect(getLocalizedField({ title_id: "Judul", title_en: "" }, "title", "en")).toBe("Judul");
  expect(getLocalizedField({ title_id: "Judul" }, "title", "en")).toBe("Judul");
});
