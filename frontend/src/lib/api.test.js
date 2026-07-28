import {
  downloadFile,
  fileUrl,
  resolveMediaUrl,
  safeExternalUrl,
} from "./api";

test("file URLs never contain bearer tokens", () => {
  const url = fileUrl("niuva/orders/customer-1/part.stl");
  expect(url).toContain("/api/files/niuva/orders/customer-1/part.stl");
  expect(url).not.toContain("secret-token");
  expect(url).not.toContain("auth=");
});

test("downloadFile uses the HttpOnly cookie session", async () => {
  const blob = new Blob(["part"], { type: "model/stl" });
  global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => blob });
  const anchor = { click: jest.fn(), remove: jest.fn(), set href(value) {}, set download(value) {} };
  jest.spyOn(document, "createElement").mockReturnValue(anchor);
  URL.createObjectURL = jest.fn().mockReturnValue("blob:download");
  URL.revokeObjectURL = jest.fn();

  await downloadFile("niuva/orders/customer-1/part.stl", "part.stl");

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/files/niuva/orders/customer-1/part.stl"),
    expect.objectContaining({ credentials: "include" }),
  );
  expect(fetch.mock.calls[0][0]).not.toContain("auth=");
});

test("media references resolve through the controlled public endpoint", () => {
  expect(resolveMediaUrl("media:file-123")).toContain("/api/media/file-123");
  expect(resolveMediaUrl("https://images.example/cover.webp")).toBe(
    "https://images.example/cover.webp",
  );
  expect(resolveMediaUrl("/assets/cover.webp")).toBe("/assets/cover.webp");
  expect(resolveMediaUrl("//tracker.example/cover.webp")).toBe("");
  expect(resolveMediaUrl("http://images.example/cover.webp")).toBe("");
  expect(resolveMediaUrl("https://user:secret@images.example/cover.webp")).toBe("");
  expect(resolveMediaUrl("javascript:alert(1)")).toBe("");
});

test("accepts only credential-free HTTPS public links", () => {
  expect(safeExternalUrl("https://maps.example/location")).toBe(
    "https://maps.example/location",
  );
  expect(safeExternalUrl("javascript:alert(1)")).toBe("");
  expect(safeExternalUrl("https://user:secret@example.com/path")).toBe("");
  expect(safeExternalUrl("http://example.com/path")).toBe("");
});
