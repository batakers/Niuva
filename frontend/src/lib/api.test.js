import { downloadFile, fileUrl } from "./api";

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
