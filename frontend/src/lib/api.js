import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const HAS_CONFIGURED_BACKEND = Boolean(BACKEND_URL);
export const API = `${BACKEND_URL}/api`;
const CSRF_COOKIE = "niuva_csrf";
const CSRF_HEADER = "X-CSRF-Token";
let adminCsrfToken = null;

export const api = axios.create({
  baseURL: API,
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

api.interceptors.request.use((config) => {
  const method = String(config.method || "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = adminCsrfToken || readCookie(CSRF_COOKIE);
    if (csrf) config.headers[CSRF_HEADER] = csrf;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
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
  if (!response.ok) throw new Error(`File request failed (${response.status})`);
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
  if (!response.ok) throw new Error(`File request failed (${response.status})`);
  triggerBlobDownload(await response.blob(), filename);
}

export async function downloadCsv(apiPath, filename = "export.csv") {
  const headers = new Headers();
  if (adminCsrfToken) headers.set(CSRF_HEADER, adminCsrfToken);
  const response = await fetch(`${API}${apiPath}`, {
    credentials: "include",
    headers,
  });
  if (!response.ok) throw new Error(`Export failed (${response.status})`);
  triggerBlobDownload(await response.blob(), filename);
}

export function formatApiError(detail) {
  if (detail == null) return "Terjadi kesalahan. Coba lagi.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((error) => formatApiError(error)).join(" ");
  if (typeof detail.message === "string") return detail.message;
  if (typeof detail.msg === "string") return detail.msg;
  if (typeof detail.code === "string") return detail.code;
  try { return JSON.stringify(detail); }
  catch { return "Terjadi kesalahan. Coba lagi."; }
}
