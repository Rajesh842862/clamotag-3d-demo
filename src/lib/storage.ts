import { z } from "zod";
import type { PunchEvent, Theme } from "./types";

const themeSchema = z.enum(["light", "dark"]);

const eventSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  department: z.string(),
  type: z.enum(["recorded", "buffered", "denied"]),
  syncStatus: z.enum(["synced", "pending"]),
  timestamp: z.number().finite(),
  scenario: z.enum(["authorized", "unauthorized", "offline", "ap"]),
});

const eventsSchema = z.array(eventSchema);

const THEME_KEY = "clamotag.theme";
const EVENTS_KEY = "clamotag.events.v1";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable in private browsing; the demo still works.
  }
}

export function readStoredTheme(): Theme | null {
  const parsed = themeSchema.safeParse(read(THEME_KEY));
  return parsed.success ? parsed.data : null;
}

export function writeStoredTheme(theme: Theme): void {
  write(THEME_KEY, theme);
}

export function readStoredEvents(): PunchEvent[] {
  const raw = read(EVENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = eventsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.slice(0, 100) : [];
  } catch {
    return [];
  }
}

export function writeStoredEvents(events: PunchEvent[]): void {
  write(EVENTS_KEY, JSON.stringify(events.slice(0, 100)));
}
