import {
  api,
  clearAdminCsrfToken,
  downloadFile,
  fetchFile,
  fileUrl,
  setAdminCsrfToken,
} from "./api";

afterEach(() => {
  clearAdminCsrfToken();
  localStorage.clear();
  jest.restoreAllMocks();
});

test("file URLs never contain bearer tokens", () => {
  localStorage.setItem("niuva_token", "secret-token");
  const url = fileUrl("niuva/orders/customer-1/part.stl");
  expect(url).toContain("/api/files/niuva/orders/customer-1/part.stl");
  expect(url).not.toContain("secret-token");
  expect(url).not.toContain("auth=");
});

test("downloadFile includes cookies and preserves the customer bearer fallback", async () => {
  localStorage.setItem("niuva_token", "secret-token");
  const blob = new Blob(["part"], { type: "model/stl" });
  global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => blob });
  const anchor = { click: jest.fn(), remove: jest.fn(), set href(value) {}, set download(value) {} };
  jest.spyOn(document, "createElement").mockReturnValue(anchor);
  URL.createObjectURL = jest.fn().mockReturnValue("blob:download");
  URL.revokeObjectURL = jest.fn();

  await downloadFile("niuva/orders/customer-1/part.stl", "part.stl");

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/files/niuva/orders/customer-1/part.stl"),
    expect.objectContaining({ credentials: "include", headers: expect.any(Headers) }),
  );
  expect(fetch.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer secret-token");
  expect(fetch.mock.calls[0][0]).not.toContain("auth=");
});

test("cookie-authenticated downloads work without a stored bearer token", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    blob: async () => new Blob(["part"]),
  });

  await fetchFile("niuva/orders/admin/part.stl");

  expect(fetch.mock.calls[0][1].credentials).toBe("include");
  expect(fetch.mock.calls[0][1].headers.has("Authorization")).toBe(false);
});

test("axios sends CSRF only for non-safe methods", () => {
  setAdminCsrfToken("csrf-secret");
  const intercept = api.interceptors.request.handlers[0].fulfilled;

  const getConfig = intercept({ method: "get", headers: {} });
  const postConfig = intercept({ method: "post", headers: {} });

  expect(api.defaults.withCredentials).toBe(true);
  expect(getConfig.headers["X-CSRF-Token"]).toBeUndefined();
  expect(postConfig.headers["X-CSRF-Token"]).toBe("csrf-secret");
});

test("axios never sends the customer bearer token to Admin endpoints", () => {
  localStorage.setItem("niuva_token", "customer-token");
  const intercept = api.interceptors.request.handlers[0].fulfilled;

  const adminConfig = intercept({ url: "/admin/orders", method: "get", headers: {} });
  const customerConfig = intercept({ url: "/orders/mine", method: "get", headers: {} });

  expect(adminConfig.headers.Authorization).toBeUndefined();
  expect(customerConfig.headers.Authorization).toBe("Bearer customer-token");
});

test("fetch sends CSRF for non-safe methods only", async () => {
  setAdminCsrfToken("csrf-secret");
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    blob: async () => new Blob(["part"]),
  });

  await fetchFile("safe.stl");
  await fetchFile("changed.stl", { method: "POST" });

  expect(fetch.mock.calls[0][1].headers.has("X-CSRF-Token")).toBe(false);
  expect(fetch.mock.calls[1][1].headers.get("X-CSRF-Token")).toBe("csrf-secret");
});
