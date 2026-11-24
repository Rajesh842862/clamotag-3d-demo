import { createContext } from "react";
import type {
  ConnectionStatus,
  LedState,
  PunchEvent,
  Scenario,
  ScanState,
} from "../lib/types";

export interface DemoState {
  scenario: Scenario;
  connection: ConnectionStatus;
  selectedEmployeeId: string;
  events: PunchEvent[];
  scan: ScanState;
  scanning: boolean;
  syncing: boolean;
  wifiBlinking: boolean;
  soundEnabled: boolean;
  rotationEnabled: boolean;
  lastSyncAt: number | null;
}

export interface DemoApi {
  state: DemoState;
  leds: LedState;
  pendingCount: number;
  recordedCount: number;
  deniedCount: number;
  bufferedCount: number;
  tap: () => void;
  syncNow: () => void;
  resetDemo: () => void;
  setScenario: (scenario: Scenario) => void;
  selectEmployee: (id: string) => void;
  toggleSound: () => void;
  toggleRotation: () => void;
}

export const DemoContext = createContext<DemoApi | null>(null);
