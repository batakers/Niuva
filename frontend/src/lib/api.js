import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const HAS_CONFIGURED_BACKEND = Boolean(BACKEND_URL);
export const API = `${BACKEND_URL}/api`;
export const TOKEN_KEY = "niuva_token";

export const api = axios.create({ baseURL: API });

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function unwrap(request) {
  return request.then((response) => response.data);
}

export function fileUrl(path) {
  const normalized = String(path || "").split("/").map(encodeURIComponent).join("/");
  return `${API}/files/${normalized}`;
}

export async function fetchFile(path) {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  const response = await fetch(fileUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
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

export async function downloadCsv(apiPath, filename = "export.csv") {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  const response = await fetch(`${API}${apiPath}`, {
    headers: { Authorization: `Bearer ${token}` },
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
