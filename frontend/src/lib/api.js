import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const HAS_CONFIGURED_BACKEND = Boolean(BACKEND_URL);
export const API = `${BACKEND_URL}/api`;
export const TOKEN_KEY = "niuva_token";

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function fileUrl(path) {
  const normalized = String(path || "").split("/").map(encodeURIComponent).join("/");
  return `${API}/files/${normalized}`;
}

export async function fetchFile(path) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Not authenticated");
  const response = await fetch(fileUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`File request failed (${response.status})`);
  return response.blob();
}

export async function downloadFile(path, filename = "download") {
  const blob = await fetchFile(path);
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
