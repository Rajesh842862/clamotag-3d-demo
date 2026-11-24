export type Theme = "light" | "dark";

export type Scenario = "authorized" | "unauthorized" | "offline" | "ap";

export type ConnectionStatus = "online" | "offline" | "provisioning";

export type EventType = "recorded" | "buffered" | "denied";

export type SyncStatus = "synced" | "pending";

export interface Employee {
  id: string;
  name: string;
  department: string;
  initials: string;
  registered: boolean;
  tone: string;
}

export interface PunchEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: EventType;
  syncStatus: SyncStatus;
  timestamp: number;
  scenario: Scenario;
}

export type ScanPhase = "idle" | "approaching" | "reading" | "result";

export interface ScanState {
  id: number;
  phase: ScanPhase;
  result: EventType | null;
}

export interface LedState {
  wifi: boolean;
  ap: boolean;
  sync: boolean;
  card: boolean;
}
