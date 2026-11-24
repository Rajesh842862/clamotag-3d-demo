import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { Header } from "./components/Header";
import { ProductViewer } from "./components/ProductViewer";
import { DeviceConsole } from "./components/DeviceConsole";
import { CardPicker } from "./components/CardPicker";
import { ActivityPanel } from "./components/ActivityPanel";
import { TooltipProvider } from "./components/ui/Tooltip";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <div className="app-shell">
          <Header theme={theme} onToggleTheme={toggleTheme} />

          <main id="main" tabIndex={-1}>
            <section className="intro section-frame" aria-labelledby="page-title">
              <h1 id="page-title">CLAMOTAG RFID Reader</h1>
            </section>

            <section className="workspace section-frame" aria-label="Interactive reader and console">
              <ProductViewer theme={theme} />
              <DeviceConsole />
            </section>

            <section className="cards-section section-frame" aria-labelledby="cards-heading">
              <div className="section-head">
                <div>
                  <h2 id="cards-heading">Choose a test card</h2>
                  <p>
                    Six credentials are available. Selecting one updates the reader state and the
                    card presented in the viewer.
                  </p>
                </div>
                <span className="section-aside">6 credentials</span>
              </div>
              <CardPicker />
            </section>

            <section className="activity-section section-frame" aria-labelledby="activity-heading">
              <div className="section-head">
                <div>
                  <h2 id="activity-heading">Punch activity</h2>
                  <p>
                    Every tap appears here as it happens. Buffered punches stay pending until Sync
                    Now clears the queue.
                  </p>
                </div>
                <span className="section-aside">Local session</span>
              </div>
              <ActivityPanel />
            </section>
          </main>

          <footer className="site-footer section-frame">
            <span className="footer-brand">CLAMOTAG</span>
            <span>Software simulation. No physical reader is connected.</span>
            <span className="footer-meta">RFID product experience · R1</span>
          </footer>
        </div>

        <Toaster
          position="bottom-right"
          theme={theme}
          duration={4200}
          closeButton
          toastOptions={{ className: "app-toast" }}
        />
      </TooltipProvider>
    </MotionConfig>
  );
}
