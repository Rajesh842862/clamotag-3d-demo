import { Radio, RotateCcw, RotateCw, ScanLine, Volume2, VolumeX } from "lucide-react";
import { EMPLOYEES, SCENARIOS } from "../lib/data";
import type { LedState, Scenario } from "../lib/types";
import { useDemo } from "../state/useDemo";
import { SelectField, type SelectOption } from "./ui/Select";

const scenarioOptions: readonly SelectOption[] = SCENARIOS.map((scenario) => ({
  value: scenario.id,
  label: scenario.label,
}));

const employeeOptions: readonly SelectOption[] = EMPLOYEES.map((employee) => ({
  value: employee.id,
  label: employee.name,
  hint: employee.id,
}));

const LED_LABELS: Record<keyof LedState, string> = {
  wifi: "Wi-Fi Connected",
  ap: "AP Mode",
  sync: "Data Sync",
  card: "Card Accessed",
};

const LED_TONES: Record<keyof LedState, string> = {
  wifi: "cyan",
  ap: "violet",
  sync: "amber",
  card: "green",
};

export function DeviceConsole() {
  const {
    state,
    leds,
    pendingCount,
    tap,
    syncNow,
    resetDemo,
    setScenario,
    selectEmployee,
    toggleSound,
    toggleRotation,
  } = useDemo();

  return (
    <section className="console" aria-labelledby="console-heading">
      <div className="console-head">
        <div>
          <h2 id="console-heading" className="console-title">
            Device console
          </h2>
          <p className="console-subtitle">CLAMOTAG Reader R1 · S/N R1-0042</p>
        </div>
        <span className={`console-link link-${state.connection}`} role="status">
          <Radio size={14} strokeWidth={1.8} aria-hidden="true" />
          {state.connection === "offline"
            ? "Offline"
            : state.connection === "provisioning"
              ? "AP Mode Active"
              : "Connected"}
        </span>
      </div>

      <div className="console-fields">
        <SelectField
          id="scenario-select"
          label="Scenario"
          value={state.scenario}
          onValueChange={(value) => setScenario(value as Scenario)}
          options={scenarioOptions}
        />
        <SelectField
          id="employee-select"
          label="Employee card"
          value={state.selectedEmployeeId}
          onValueChange={selectEmployee}
          options={employeeOptions}
        />
      </div>

      <p className="scenario-note">
        {SCENARIOS.find((scenario) => scenario.id === state.scenario)?.description}
      </p>

      {state.connection === "provisioning" ? (
        <div className="ap-active-status" role="status">
          <span className="ap-active-dot" aria-hidden="true" />
          AP Mode Active
        </div>
      ) : null}

      <button
        type="button"
        className="button button-primary tap-button"
        onClick={tap}
        disabled={state.scanning || state.syncing}
      >
        <ScanLine size={18} strokeWidth={1.9} aria-hidden="true" />
        {state.scanning ? "Reading card…" : "Tap RFID card"}
      </button>

      <div className="led-section">
        <div className="led-section-head">
          <span>Device LEDs</span>
          <span className="led-section-hint">Live state</span>
        </div>
        <div className="led-grid">
          {(Object.keys(LED_LABELS) as (keyof LedState)[]).map((key) => {
            const blinking = key === "wifi" && state.wifiBlinking;
            return (
              <div key={key} className={`led-item ${leds[key] ? "is-on" : ""}`}>
                <span
                  className={`led-lamp led-${LED_TONES[key]} ${blinking ? "led-blink" : ""}`}
                  aria-hidden="true"
                />
                <span className="led-label">{LED_LABELS[key]}</span>
                <span className="led-state">{blinking ? "Blinking" : leds[key] ? "On" : "Off"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="console-secondary">
        <button type="button" className="button button-secondary" onClick={syncNow}>
          {state.syncing ? "Syncing…" : "Sync Now"}
          {pendingCount > 0 ? <span className="button-badge">{pendingCount}</span> : null}
        </button>
        <button type="button" className="button button-secondary" onClick={resetDemo}>
          <RotateCcw size={15} strokeWidth={1.8} aria-hidden="true" />
          Reset Demo
        </button>
        <button
          type="button"
          className={`button button-icon ${state.soundEnabled ? "is-on" : ""}`}
          aria-pressed={state.soundEnabled}
          onClick={toggleSound}
        >
          {state.soundEnabled ? (
            <Volume2 size={16} strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <VolumeX size={16} strokeWidth={1.8} aria-hidden="true" />
          )}
          Sound
        </button>
        <button
          type="button"
          className={`button button-icon ${state.rotationEnabled ? "is-on" : ""}`}
          aria-pressed={state.rotationEnabled}
          onClick={toggleRotation}
        >
          <RotateCw size={16} strokeWidth={1.8} aria-hidden="true" />
          Rotation
        </button>
      </div>
    </section>
  );
}
