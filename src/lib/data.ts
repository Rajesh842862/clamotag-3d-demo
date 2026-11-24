import type { Employee, Scenario } from "./types";


const BASE_URL = import.meta.env.BASE_URL


export const MODEL_URL = `${BASE_URL}models/rfid/clamotag_rfid.glb`

export const SOUND_URL = `${BASE_URL}sounds/rfid/rfid_beep_sound.mp3`

export const LOGO_DARK = `${BASE_URL}brands/clamotag-Darkmode.png`

export const LOGO_LIGHT = `${BASE_URL}brands/clamotag-Lightmode.png`


export const UNKNOWN_ID = "UNKNOWN";

export const EMPLOYEES: readonly Employee[] = [
  {
    id: "EMP-1001",
    name: "Rajesh Kumar",
    department: "Production",
    initials: "RK",
    registered: true,
    tone: "cyan",
  },
  {
    id: "EMP-1002",
    name: "Chandru",
    department: "Quality",
    initials: "CH",
    registered: true,
    tone: "blue",
  },
  {
    id: "EMP-1003",
    name: "Suresh",
    department: "Maintenance",
    initials: "SU",
    registered: true,
    tone: "amber",
  },
  {
    id: "EMP-1004",
    name: "Karthik",
    department: "Logistics",
    initials: "KA",
    registered: true,
    tone: "teal",
  },
  {
    id: "EMP-1005",
    name: "Sara",
    department: "Security",
    initials: "SA",
    registered: true,
    tone: "violet",
  },
  {
    id: UNKNOWN_ID,
    name: "Unknown Card",
    department: "Unregistered",
    initials: "?",
    registered: false,
    tone: "neutral",
  },
] as const;

export interface ScenarioInfo {
  id: Scenario;
  label: string;
  short: string;
  description: string;
}

export const SCENARIOS: readonly ScenarioInfo[] = [
  {
    id: "authorized",
    label: "Authorized access",
    short: "Authorized",
    description: "Registered card, reader online. Tap records an attendance punch.",
  },
  {
    id: "unauthorized",
    label: "Unauthorized card",
    short: "Unauthorized",
    description: "Unregistered credential. Tap denies access and logs the attempt.",
  },
  {
    id: "offline",
    label: "Offline buffering",
    short: "Offline",
    description: "Link is down. Punches buffer locally until you sync them.",
  },
  {
    id: "ap",
    label: "AP Mode",
    short: "AP mode",
    description: "Reader broadcasts a setup network. Card taps still read and log punches.",
  },
] as const;

export function getEmployee(id: string): Employee {
  return EMPLOYEES.find((employee) => employee.id === id) ?? EMPLOYEES[0];
}

export function getScenarioInfo(id: Scenario): ScenarioInfo {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0];
}
