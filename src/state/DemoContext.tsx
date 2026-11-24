import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { useRfidAudio } from "../hooks/useRfidAudio";
import { EMPLOYEES, UNKNOWN_ID, getEmployee } from "../lib/data";
import { readStoredEvents, writeStoredEvents } from "../lib/storage";
import type {
  ConnectionStatus,
  EventType,
  LedState,
  PunchEvent,
  Scenario,
  ScanState,
} from "../lib/types";
import { createId } from "../lib/utils";
import { DemoContext, type DemoApi, type DemoState } from "./context";

type Action =
  | { type: "set-scenario"; scenario: Scenario }
  | { type: "select-employee"; id: string }
  | { type: "set-connection"; connection: ConnectionStatus }
  | { type: "set-scan"; scan: ScanState }
  | { type: "set-scanning"; scanning: boolean }
  | { type: "set-wifi-blinking"; blinking: boolean }
  | { type: "add-event"; event: PunchEvent }
  | { type: "sync-start" }
  | { type: "sync-complete" }
  | { type: "toggle-sound" }
  | { type: "toggle-rotation" }
  | { type: "reset" };

function connectionFor(scenario: Scenario): ConnectionStatus {
  if (scenario === "offline") return "offline";
  if (scenario === "ap") return "provisioning";
  return "online";
}

function initialState(): DemoState {
  return {
    scenario: "authorized",
    connection: "online",
    selectedEmployeeId: EMPLOYEES[0].id,
    events: readStoredEvents(),
    scan: { id: 0, phase: "idle", result: null },
    scanning: false,
    syncing: false,
    wifiBlinking: false,
    soundEnabled: true,
    rotationEnabled: false,
    lastSyncAt: null,
  };
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "set-scenario":
      return {
        ...state,
        scenario: action.scenario,
        connection: connectionFor(action.scenario),
      };
    case "select-employee":
      return { ...state, selectedEmployeeId: action.id };
    case "set-connection":
      return { ...state, connection: action.connection };
    case "set-scan":
      return { ...state, scan: action.scan };
    case "set-scanning":
      return { ...state, scanning: action.scanning };
    case "set-wifi-blinking":
      return { ...state, wifiBlinking: action.blinking };
    case "add-event":
      return { ...state, events: [action.event, ...state.events].slice(0, 100) };
    case "sync-start":
      return { ...state, syncing: true };
    case "sync-complete":
      return {
        ...state,
        syncing: false,
        connection: "online",
        lastSyncAt: Date.now(),
        events: state.events.map((event) =>
          event.type === "buffered" && event.syncStatus === "pending"
            ? { ...event, syncStatus: "synced" as const }
            : event,
        ),
      };
    case "toggle-sound":
      return { ...state, soundEnabled: !state.soundEnabled };
    case "toggle-rotation":
      return { ...state, rotationEnabled: !state.rotationEnabled };
    case "reset":
      return {
        ...initialState(),
        events: [],
      };
    default:
      return state;
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const playSound = useRfidAudio();
  const timers = useRef<number[]>([]);
  const lastTap = useRef<{ id: string; at: number } | null>(null);
  const blinkTimeout = useRef<number | null>(null);

  const clearBlinkTimeout = useCallback(() => {
    if (blinkTimeout.current !== null) {
      window.clearTimeout(blinkTimeout.current);
      blinkTimeout.current = null;
    }
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    timers.current.push(window.setTimeout(callback, delay));
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // AP mode blinks the Wi-Fi LED once for three seconds, then leaves it off.
  // A single timeout is created on entry and cleared on exit or unmount.
  useEffect(() => {
    if (state.scenario !== "ap") {
      clearBlinkTimeout();
      dispatch({ type: "set-wifi-blinking", blinking: false });
      return;
    }

    dispatch({ type: "set-wifi-blinking", blinking: true });
    clearBlinkTimeout();
    blinkTimeout.current = window.setTimeout(() => {
      blinkTimeout.current = null;
      dispatch({ type: "set-wifi-blinking", blinking: false });
    }, 3000);

    return clearBlinkTimeout;
  }, [state.scenario, clearBlinkTimeout]);

  useEffect(() => {
    writeStoredEvents(state.events);
  }, [state.events]);

  const pendingCount = useMemo(
    () => state.events.filter((event) => event.type === "buffered" && event.syncStatus === "pending").length,
    [state.events],
  );
  const recordedCount = useMemo(
    () => state.events.filter((event) => event.type === "recorded").length,
    [state.events],
  );
  const deniedCount = useMemo(
    () => state.events.filter((event) => event.type === "denied").length,
    [state.events],
  );
  const bufferedCount = useMemo(
    () => state.events.filter((event) => event.type === "buffered").length,
    [state.events],
  );

  const leds = useMemo<LedState>(
    () => ({
      // In AP mode Wi-Fi is only lit for the three-second blink, then stays off.
      wifi: state.scenario === "ap" ? state.wifiBlinking : state.connection === "online",
      ap: state.connection === "provisioning",
      sync: state.syncing || pendingCount > 0,
      card: state.scan.phase === "reading" || state.scan.phase === "result",
    }),
    [state.scenario, state.connection, state.wifiBlinking, state.syncing, state.scan.phase, pendingCount],
  );

  const setScenario = useCallback(
    (scenario: Scenario) => {
      dispatch({ type: "set-scenario", scenario });
      const current = getEmployee(state.selectedEmployeeId);
      if (scenario === "unauthorized" && current.registered) {
        dispatch({ type: "select-employee", id: UNKNOWN_ID });
      } else if (scenario !== "unauthorized" && !current.registered) {
        dispatch({ type: "select-employee", id: EMPLOYEES[0].id });
      }
    },
    [state.selectedEmployeeId],
  );

  // Card selection is independent of the active scenario so every credential
  // can be presented in Authorized, Unauthorized, Offline and AP mode alike.
  const selectEmployee = useCallback((id: string) => {
    dispatch({ type: "select-employee", id });
  }, []);

  const tap = useCallback(() => {
    if (state.scanning || state.syncing) return;

    const employee = getEmployee(state.selectedEmployeeId);
    const now = Date.now();
    if (lastTap.current?.id === employee.id && now - lastTap.current.at < 1600) {
      toast.message("Duplicate tap ignored", {
        description: "Wait a moment before presenting the same card again.",
      });
      return;
    }
    lastTap.current = { id: employee.id, at: now };

    let result: EventType;
    if (state.scenario === "unauthorized" || !employee.registered) {
      result = "denied";
    } else if (state.scenario === "offline") {
      result = "buffered";
    } else {
      result = "recorded";
    }

    const scanId = state.scan.id + 1;
    dispatch({ type: "set-scan", scan: { id: scanId, phase: "approaching", result: null } });
    dispatch({ type: "set-scanning", scanning: true });

    schedule(() => {
      dispatch({ type: "set-scan", scan: { id: scanId, phase: "reading", result: null } });
      if (state.soundEnabled) {
        playSound({
          rate: result === "denied" ? 0.62 : result === "buffered" ? 0.85 : 1,
          volume: result === "denied" ? 0.55 : 0.65,
        });
      }
    }, 360);

    schedule(() => {
      const event: PunchEvent = {
        id: createId(),
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        type: result,
        syncStatus: result === "buffered" ? "pending" : "synced",
        timestamp: Date.now(),
        scenario: state.scenario,
      };
      dispatch({ type: "add-event", event });
      dispatch({ type: "set-scan", scan: { id: scanId, phase: "result", result } });

      if (result === "recorded") {
        toast.success("Punch recorded", {
          description: `${employee.name} · ${employee.id} · ${employee.department}`,
        });
      } else if (result === "denied") {
        toast.error("Access denied", {
          description: employee.registered
            ? `${employee.id} is not authorized for this scenario. The attempt was logged.`
            : `${employee.id} is not registered. The attempt was logged.`,
        });
      } else {
        toast.info("Punch buffered", {
          description: "Stored locally. Use Sync Now to clear the queue.",
        });
      }
    }, 820);

    schedule(() => {
      dispatch({ type: "set-scan", scan: { id: scanId, phase: "idle", result: null } });
      dispatch({ type: "set-scanning", scanning: false });
    }, 1560);
  }, [playSound, schedule, state.scan.id, state.scenario, state.selectedEmployeeId, state.soundEnabled, state.scanning, state.syncing]);

  const syncNow = useCallback(() => {
    if (state.syncing) return;
    if (pendingCount === 0) {
      toast.message("Nothing to sync", { description: "There are no buffered punches in the queue." });
      return;
    }
    const count = pendingCount;
    dispatch({ type: "sync-start" });
    schedule(() => {
      dispatch({ type: "sync-complete" });
      toast.success(`${count} buffered ${count === 1 ? "punch" : "punches"} synced`, {
        description: "The local queue is clear and the link is back online.",
      });
    }, 950);
  }, [pendingCount, schedule, state.syncing]);

  const resetDemo = useCallback(() => {
    clearTimers();
    clearBlinkTimeout();
    lastTap.current = null;
    dispatch({ type: "reset" });
    toast.message("Demo reset", { description: "Activity cleared and the reader is back online." });
  }, [clearTimers, clearBlinkTimeout]);

  const value = useMemo<DemoApi>(
    () => ({
      state,
      leds,
      pendingCount,
      recordedCount,
      deniedCount,
      bufferedCount,
      tap,
      syncNow,
      resetDemo,
      setScenario,
      selectEmployee,
      toggleSound: () => dispatch({ type: "toggle-sound" }),
      toggleRotation: () => dispatch({ type: "toggle-rotation" }),
    }),
    [
      state,
      leds,
      pendingCount,
      recordedCount,
      deniedCount,
      bufferedCount,
      tap,
      syncNow,
      resetDemo,
      setScenario,
      selectEmployee,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
