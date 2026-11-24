import { useProgress } from "@react-three/drei";
import { AlertCircle, RotateCw } from "lucide-react";

export type ModelLoadStatus = "loading" | "ready" | "error";

interface ModelLoadingOverlayProps {
  status: Exclude<ModelLoadStatus, "ready">;
  onRetry: () => void;
}

const MODEL_FILE = /\.glb(?:[?#]|$)/i;

export function ModelLoadingOverlay({ status, onRetry }: ModelLoadingOverlayProps) {
  const { progress, item, active } = useProgress();

  // Drei's progress store tracks every item in Three's loading manager. Only
  // report a number while the GLB is the item actually being transferred.
  const isModelItem = MODEL_FILE.test(item);
  const percent =
    isModelItem && Number.isFinite(progress)
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : null;
  const hasProgress = percent !== null && (active || percent === 100);

  return (
    <div className="model-load-layer">
      <div className={`model-load-card${status === "error" ? " is-error" : ""}`}>
        {status === "loading" ? (
          <>
            <div className="model-load-head">
              <span className="model-load-title">Loading RFID Reader</span>
              {hasProgress ? (
                <span className="model-load-percent">{percent}%</span>
              ) : null}
            </div>
            <div
              className={`model-load-track ${hasProgress ? "is-determinate" : "is-indeterminate"}`}
              role="progressbar"
              aria-label="RFID reader model loading progress"
              aria-valuemin={0}
              aria-valuemax={100}
              {...(hasProgress ? { "aria-valuenow": percent } : {})}
            >
              <span
                className="model-load-fill"
                style={hasProgress ? { transform: `scaleX(${percent / 100})` } : undefined}
              />
            </div>
            <span className="model-load-note">Preparing the 3D reader model</span>
          </>
        ) : (
          <>
            <AlertCircle size={20} strokeWidth={1.7} className="model-load-error-icon" aria-hidden="true" />
            <strong className="model-load-title">Couldn’t load the RFID reader</strong>
            <span className="model-load-note">The 3D model didn’t finish downloading.</span>
            <button
              type="button"
              className="button button-secondary model-load-retry"
              onClick={onRetry}
            >
              <RotateCw size={14} strokeWidth={1.8} aria-hidden="true" />
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
}
