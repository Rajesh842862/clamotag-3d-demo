import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Centralized user-facing date/time formatting.
 *
 * Every timestamp shown in the UI uses the 12-hour clock with an AM/PM
 * suffix. Storage, API and sorting semantics are untouched — these helpers
 * only change how a Unix timestamp is rendered.
 *
 * - `formatTime`     → `hh:mm:ss A`   (e.g. "02:45:30 PM")
 * - `formatDate`     → `DD MMM YYYY`  (e.g. "24 Nov 2026")
 * - `formatDateTime` → `DD MMM YYYY, hh:mm A` (e.g. "24 Nov 2026, 02:45 PM")
 *
 * Locales are pinned so the patterns stay stable across browsers:
 * `en-US` renders an uppercase AM/PM suffix, `en-GB` renders day-first dates.
 * Both use the viewer's local timezone, matching the previous behaviour.
 */
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeShortFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function formatTime(timestamp: number): string {
  return timeFormatter.format(new Date(timestamp));
}

export function formatDate(timestamp: number): string {
  return dateFormatter.format(new Date(timestamp));
}

export function formatDateTime(timestamp: number): string {
  // Composed from the two pinned formatters so the result is exactly
  // "DD MMM YYYY, hh:mm A" (a single en-GB formatter would render "am/pm").
  const date = new Date(timestamp);
  return `${dateFormatter.format(date)}, ${timeShortFormatter.format(date)}`;
}
