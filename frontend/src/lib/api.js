import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const HAS_CONFIGURED_BACKEND = Boolean(BACKEND_URL);
export const API = `${BACKEND_URL}/api`;
const CSRF_COOKIE = "niuva_csrf";
const CSRF_HEADER = "X-CSRF-Token";
let adminCsrfToken = null;

export const API_ERROR_MESSAGES = Object.freeze({
  transaction_unavailable:
    "Operasi ini belum tersedia karena kemampuan transaksi belum siap.",
  retail_transaction_inactive: "Transaksi Retail belum aktif.",
  legacy_order_creation_inactive:
    "Pembuatan pesanan belum aktif. Gunakan katalog Retail untuk discovery.",
  legacy_order_mutations_disabled: "Pesanan historis hanya dapat dibaca.",
  legacy_manual_transfer_disabled: "Pembayaran transfer manual baru dinonaktifkan.",
  organization_portal_inactive: "Organization Portal belum aktif.",
  permission_denied: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
  http_401: "Sesi Anda berakhir. Silakan masuk kembali.",
  http_403: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
  http_404: "Data yang diminta tidak ditemukan.",
  http_409: "Data berubah oleh pengguna lain. Muat ulang lalu coba lagi.",
  http_422: "Periksa kembali data yang dimasukkan.",
  http_429: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  http_500: "Terjadi kesalahan internal. Coba lagi.",
  http_503: "Layanan belum tersedia. Coba lagi nanti.",
  internal_server_error: "Terjadi kesalahan internal. Coba lagi.",
});

const DEFAULT_API_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi.";

export const api = axios.create({
  baseURL: API,
  timeout: 15_000,
  withCredentials: true,
});

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : "";
}

export function setAdminCsrfToken(token) {
  adminCsrfToken = token || null;
}

export function clearAdminCsrfToken() {
  adminCsrfToken = null;
}

function canonicalErrorValue(value) {
  if (value?.response?.data) return canonicalErrorValue(value.response.data);
  if (value?.error && typeof value.error === "object") return value.error;
  if (value && Object.prototype.hasOwnProperty.call(value, "detail")) {
    return value.detail;
  }
  return value;
}

function errorCode(value) {
  const candidate = canonicalErrorValue(value);
  return candidate && typeof candidate.code === "string" ? candidate.code : "";
}

export class ApiError extends Error {
  constructor(status, body, fallbackMessage) {
    const normalizedMessage = formatApiError(body);
    super(
      normalizedMessage !== DEFAULT_API_ERROR_MESSAGE && normalizedMessage
        ? normalizedMessage
        : fallbackMessage || normalizedMessage,
    );
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.code = errorCode(body) || null;
  }
}

api.interceptors.request.use((config) => {
  const method = String(config.method || "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = adminCsrfToken || readCookie(CSRF_COOKIE);
    if (csrf) config.headers[CSRF_HEADER] = csrf;
  }
  return config;
});

let refreshPromise = null;

function shouldRetrySafeRead(error, original) {
  const method = String(original?.method || "get").toUpperCase();
  return (
    Boolean(original) &&
    !original._networkRetry &&
    !error.response &&
    Boolean(error.request) &&
    !axios.isCancel(error) &&
    error.code !== "ERR_CANCELED" &&
    ["GET", "HEAD"].includes(method)
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (shouldRetrySafeRead(error, original)) {
      original._networkRetry = true;
      return api(original);
    }
    const path = String(original?.url || "");
    const isAuthOperation =
      path.includes("/auth/login") ||
      path.includes("/auth/admin/login") ||
      path.includes("/auth/admin/session") ||
      path.includes("/auth/admin/logout") ||
      path.includes("/auth/refresh") ||
      path.includes("/auth/logout");
    const isAdminOperation =
      path === "/admin" ||
      path.startsWith("/admin/") ||
      path.startsWith("/auth/admin/");
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthOperation ||
      isAdminOperation
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    if (!refreshPromise) {
      refreshPromise = api.post("/auth/refresh").finally(() => {
        refreshPromise = null;
      });
    }
    try {
      await refreshPromise;
      return api(original);
    } catch {
      return Promise.reject(error);
    }
  },
);

export function unwrap(request) {
  return request.then((response) => response.data);
}

export function fileUrl(path) {
  const normalized = String(path || "").split("/").map(encodeURIComponent).join("/");
  return `${API}/files/${normalized}`;
}

export function resolveMediaUrl(reference) {
  const value = String(reference || "").trim();
  const mediaMatch = /^media:([A-Za-z0-9-]+)$/.exec(value);
  if (mediaMatch) return `${API}/media/${encodeURIComponent(mediaMatch[1])}`;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password
    ) ? value : "";
  } catch {
    return "";
  }
}

export function safeExternalUrl(value) {
  const candidate = String(value || "").trim();
  try {
    const parsed = new URL(candidate);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password
    ) {
      return "";
    }
    return candidate;
  } catch {
    return "";
  }
}

export async function fetchFile(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);
  const csrf = adminCsrfToken || readCookie(CSRF_COOKIE);
  if (csrf && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set(CSRF_HEADER, csrf);
  }
  const response = await fetch(fileUrl(path), {
    ...options,
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      await readResponseBody(response),
      `File request failed (${response.status})`,
    );
  }
  return response.blob();
}

function triggerBlobDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadFile(path, filename = "download") {
  triggerBlobDownload(await fetchFile(path), filename);
}

export async function downloadApiFile(apiPath, filename = "download") {
  const response = await fetch(`${API}${apiPath}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      await readResponseBody(response),
      `File request failed (${response.status})`,
    );
  }
  triggerBlobDownload(await response.blob(), filename);
}

export async function downloadCsv(apiPath, filename = "export.csv") {
  const headers = new Headers();
  if (adminCsrfToken) headers.set(CSRF_HEADER, adminCsrfToken);
  const response = await fetch(`${API}${apiPath}`, {
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      await readResponseBody(response),
      `Export failed (${response.status})`,
    );
  }
  triggerBlobDownload(await response.blob(), filename);
}

async function readResponseBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function formatApiError(detail) {
  const candidate = canonicalErrorValue(detail);
  if (candidate == null) return DEFAULT_API_ERROR_MESSAGE;
  if (typeof candidate === "string") return candidate;
  if (Array.isArray(candidate)) {
    return candidate.map((error) => formatApiError(error)).join(" ");
  }
  const code = errorCode(candidate);
  if (code && API_ERROR_MESSAGES[code]) return API_ERROR_MESSAGES[code];
  if (typeof candidate.message === "string") return candidate.message;
  if (typeof candidate.msg === "string") return candidate.msg;
  return DEFAULT_API_ERROR_MESSAGE;
}
