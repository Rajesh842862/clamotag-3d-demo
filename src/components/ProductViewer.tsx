import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useGLTF } from "@react-three/drei";
import { Focus, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import ReaderScene, { type ViewerApi } from "./ReaderScene";
import { ModelLoadingOverlay, type ModelLoadStatus } from "./ModelLoadingOverlay";
import { Tip } from "./ui/Tooltip";
import { useDemo } from "../state/useDemo";
import { getEmployee, MODEL_URL } from "../lib/data";
import type { Theme } from "../lib/types";

interface ProductViewerProps {
  theme: Theme;
}

export function ProductViewer({ theme }: ProductViewerProps) {
  const { state, leds, toggleRotation } = useDemo();
  const apiRef = useRef<ViewerApi | null>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const employee = getEmployee(state.selectedEmployeeId);
  const [modelStatus, setModelStatus] = useState<ModelLoadStatus>("loading");
  const [modelAttempt, setModelAttempt] = useState(0);

  const handleModelReady = useCallback(() => setModelStatus("ready"), []);
  const handleModelError = useCallback(() => setModelStatus("error"), []);
  // The existing whole-viewer fallback handles WebGL failures; don't stack the loader on it.
  const handleSceneUnavailable = useCallback(() => setModelStatus("ready"), []);
  const handleRetry = useCallback(() => {
    // Drop only the GLB from the suspense cache; the Canvas and its camera survive.
    useGLTF.clear(MODEL_URL);
    setModelStatus("loading");
    setModelAttempt((attempt) => attempt + 1);
  }, []);

  return (
    <div className="viewer">
      <div className="viewer-topbar">
        <span className="viewer-tag">
          <span className="viewer-tag-dot" aria-hidden="true" />
          Interactive product view
        </span>
        <span className="viewer-tag viewer-tag-quiet">GLB · live render</span>
      </div>

      <div className="viewer-stage">
        <SceneErrorBoundary onError={handleSceneUnavailable}>
          <ReaderScene
            employee={employee}
            leds={leds}
            scan={state.scan}
            theme={theme}
            rotationEnabled={state.rotationEnabled}
            reducedMotion={reducedMotion}
            apiRef={apiRef}
            modelAttempt={modelAttempt}
            onModelReady={handleModelReady}
            onModelError={handleModelError}
          />
        </SceneErrorBoundary>
        {modelStatus !== "ready" ? (
          <ModelLoadingOverlay
            key={modelAttempt}
            status={modelStatus}
            onRetry={handleRetry}
          />
        ) : null}
        <span className="sr-only" role="status" aria-live="polite">
          {modelStatus === "loading" ? "Loading RFID Reader" : ""}
        </span>
        <span className="sr-only" role="alert">
          {modelStatus === "error" ? "The RFID reader model could not be loaded." : ""}
        </span>
      </div>

      <div className="viewer-footer">
        <div className="viewer-hint">
          <Focus size={14} strokeWidth={1.7} aria-hidden="true" />
          <span>Drag to rotate · Scroll to zoom</span>
        </div>
        <div className="viewer-controls">
          <Tip label="Zoom out">
            <button
              type="button"
              className="icon-button"
              aria-label="Zoom out"
              onClick={() => apiRef.current?.zoom(0.45)}
            >
              <ZoomOut size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </Tip>
          <Tip label="Zoom in">
            <button
              type="button"
              className="icon-button"
              aria-label="Zoom in"
              onClick={() => apiRef.current?.zoom(-0.45)}
            >
              <ZoomIn size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </Tip>
          <Tip label="Reset camera">
            <button
              type="button"
              className="icon-button"
              aria-label="Reset camera"
              onClick={() => apiRef.current?.reset()}
            >
              <RotateCcw size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </Tip>
          <Tip label={state.rotationEnabled ? "Stop rotation" : "Auto-rotate"}>
            <button
              type="button"
              className={`icon-button ${state.rotationEnabled ? "is-active" : ""}`}
              aria-label={state.rotationEnabled ? "Stop auto-rotation" : "Start auto-rotation"}
              aria-pressed={state.rotationEnabled}
              onClick={toggleRotation}
            >
              <RotateCw size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </Tip>
        </div>
      </div>
    </div>
  );
}
