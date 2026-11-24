import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError: () => void;
}

interface State {
  failed: boolean;
}

/**
 * Catches GLB loading failures from inside the Canvas. Keeping this boundary
 * around the model alone lets the scene, camera and card stay mounted.
 */
export class ModelLoadBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error): void {
    console.error("RFID reader model failed to load", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
