export function rupiah(n) {
  if (n == null) return "-";
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function fmtDay(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" });
}
