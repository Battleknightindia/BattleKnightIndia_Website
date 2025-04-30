import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeDecodeURIComponent(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch (e) {
    console.error("safeDecodeURIComponent error:", e);
    return null;
  }
}