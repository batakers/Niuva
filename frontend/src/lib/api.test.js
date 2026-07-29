import {
  api,
  downloadFile,
  fileUrl,
  resolveMediaUrl,
  safeExternalUrl,
} from "./api";

const defaultAdapter = api.defaults.adapter;

function networkError(config, code = "ERR_NETWORK") {
  const error = new Error("Network request failed");
  error.code = code;
  error.config = config;
  error.request = {};
  return error;
}

function httpError(config, status) {
  const error = new Error(`HTTP ${status}`);
  error.config = config;
  error.response = {
    data: { detail: "Request failed" },
    headers: {},
    status,
    statusText: "Request failed",
  };
  return error;
}

function okResponse(config, data = { ok: true }) {
  return {
    config,
    data,
    headers: {},
    status: 200,
    statusText: "OK",
  };
}

afterEach(() => {
  api.defaults.adapter = defaultAdapter;
  jest.restoreAllMocks();
});

test("configures JSON API requests with a 15-second timeout", () => {
  expect(api.defaults.timeout).toBe(15_000);
});

test.each(["get", "head"])(
  "retries a transient network failure once for %s requests",
  async (method) => {
    const adapter = jest.fn((config) => {
      if (adapter.mock.calls.length === 1) {
        return Promise.reject(networkError(config));
      }
      return Promise.resolve(okResponse(config));
    });
    api.defaults.adapter = adapter;

    await expect(api[method]("/catalog/products")).resolves.toMatchObject({
      data: { ok: true },
    });
    expect(adapter).toHaveBeenCalledTimes(2);
  },
);

test("does not retry a state-changing command after a network failure", async () => {
  const adapter = jest.fn((config) => Promise.reject(networkError(config)));
  api.defaults.adapter = adapter;

  await expect(api.post("/admin/b2b/quotes/quote-1/transitions", {})).rejects.toMatchObject({
    code: "ERR_NETWORK",
  });
  expect(adapter).toHaveBeenCalledTimes(1);
});

test.each([401, 403, 409, 422, 429])(
  "does not retry a %s response",
  async (status) => {
    const adapter = jest.fn((config) => Promise.reject(httpError(config, status)));
    api.defaults.adapter = adapter;

    await expect(api.get(status === 401 ? "/admin/users" : "/catalog/products")).rejects.toMatchObject({
      response: { status },
    });
    expect(adapter).toHaveBeenCalledTimes(1);
  },
);

test("does not retry a cancelled JSON request", async () => {
  const adapter = jest.fn((config) => {
    const error = networkError(config, "ERR_CANCELED");
    error.__CANCEL__ = true;
    return Promise.reject(error);
  });
  api.defaults.adapter = adapter;

  await expect(api.get("/catalog/products")).rejects.toMatchObject({
    code: "ERR_CANCELED",
  });
  expect(adapter).toHaveBeenCalledTimes(1);
});

test("does not automatically retry a file download", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

  await expect(downloadFile("niuva/orders/customer-1/part.stl", "part.stl")).rejects.toThrow(
    "File request failed (503)",
  );
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

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
