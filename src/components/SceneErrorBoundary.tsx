import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  onError?: () => void;
}

interface State {
  failed: boolean;
}

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("3D viewer failed to render", error, info.componentStack);
    // Let the model loader yield to this existing fallback instead of hanging.
    this.props.onError?.();
  }

  private retry = () => this.setState({ failed: false });

  render() {
    if (this.state.failed) {
      return (
        <div className="scene-fallback" role="alert">
          <AlertTriangle size={22} strokeWidth={1.7} aria-hidden="true" />
          <strong>The 3D viewer could not start.</strong>
          <span>WebGL may be unavailable in this browser. The rest of the simulation still works.</span>
          <button type="button" className="button button-secondary" onClick={this.retry}>
            <RefreshCw size={15} strokeWidth={1.8} aria-hidden="true" />
            Retry viewer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
