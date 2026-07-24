import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isReasonInRange(reason, { min = 3, max = 500 } = {}) {
  const length = String(reason || "").trim().length;
  return length >= min && length <= max;
}
