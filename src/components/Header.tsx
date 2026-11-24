import { Info, Maximize2, Minimize2, Moon, Sun } from "lucide-react";
import { useFullscreen } from "../hooks/useFullscreen";
import { LOGO_DARK, LOGO_LIGHT } from "../lib/data";
import type { ConnectionStatus, Theme } from "../lib/types";
import { useDemo } from "../state/useDemo";
import { InfoDialog } from "./ui/Dialog";
import { Tip } from "./ui/Tooltip";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  online: "Device online",
  offline: "Link offline",
  provisioning: "AP Mode Active",
};

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const { state, pendingCount } = useDemo();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-brand">
          <img
            className="brand-logo"
            src={theme === "dark" ? LOGO_DARK : LOGO_LIGHT}
            alt="CLAMOTAG"
            width={74}
            height={35}
          />
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-context">RFID product experience</span>
        </div>

        <div className="header-actions">
          <InfoDialog
            title="About this simulation"
            trigger={
              <button type="button" className="simulation-chip">
                <Info size={14} strokeWidth={1.8} aria-hidden="true" />
                Simulation
              </button>
            }
          >
            <div className="dialog-body">
              <p>
                This page is a software simulation of a CLAMOTAG RFID reader. No physical device is
                connected and no network request is made to a reader.
              </p>
              <p>
                Card taps, LED states, buffering and provisioning are reproduced in the browser so
                each scenario can be explored without hardware. Activity is kept in this browser's
                local storage only.
              </p>
            </div>
          </InfoDialog>

          <div className={`device-status status-${state.connection}`}>
            <span className="status-dot" aria-hidden="true" />
            <span>{STATUS_LABEL[state.connection]}</span>
            {pendingCount > 0 ? <span className="status-count">{pendingCount}</span> : null}
          </div>

          <Tip label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
            <button
              type="button"
              className="icon-button"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={onToggleTheme}
            >
              {theme === "dark" ? (
                <Sun size={17} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Moon size={17} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          </Tip>

          <Tip label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            <button
              type="button"
              className="icon-button"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={() => void toggleFullscreen()}
            >
              {isFullscreen ? (
                <Minimize2 size={17} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Maximize2 size={17} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          </Tip>
        </div>
      </div>
    </header>
  );
}
