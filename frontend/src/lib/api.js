import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const HAS_CONFIGURED_BACKEND = Boolean(BACKEND_URL);
export const API = `${BACKEND_URL}/api`;
export const TOKEN_KEY = "niuva_token";

export const api = axios.create({ baseURL: API, withCredentials: true });
let adminCsrfToken = null;
const SAFE_METHODS = new Set(["get", "head", "options"]);

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setAdminCsrfToken(token) {
  adminCsrfToken = token || null;
}

export function clearAdminCsrfToken() {
  adminCsrfToken = null;
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  const path = String(config.url || "");
  const isAdminPath = path === "/admin" || path.startsWith("/admin/") || path.startsWith("/auth/admin/");
  if (token && !isAdminPath) config.headers.Authorization = `Bearer ${token}`;
  if (adminCsrfToken && !SAFE_METHODS.has((config.method || "get").toLowerCase())) {
    config.headers["X-CSRF-Token"] = adminCsrfToken;
  }
  return config;
});

export function unwrap(request) {
  return request.then((response) => response.data);
}

export function fileUrl(path) {
  const normalized = String(path || "").split("/").map(encodeURIComponent).join("/");
  return `${API}/files/${normalized}`;
}

async function authenticatedFetch(url, options = {}) {
  const token = getStoredToken();
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (adminCsrfToken && !SAFE_METHODS.has(method.toLowerCase())) {
    headers.set("X-CSRF-Token", adminCsrfToken);
  }
  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}

export async function fetchFile(path, options) {
  const response = await authenticatedFetch(fileUrl(path), options);
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

export async function downloadCsv(apiPath, filename = "export.csv") {
  const response = await authenticatedFetch(`${API}${apiPath}`);
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
