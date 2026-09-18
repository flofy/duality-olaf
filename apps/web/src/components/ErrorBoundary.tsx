import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

/**
 * Top-level render guard: catches any error thrown while rendering the
 * component tree and shows a themed fallback instead of a blank page.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep a trace in the console; no external reporting for now.
    console.error("[duality] render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="error-boundary" role="alert">
        <h1 className="title">💥 OUPS</h1>
        <p className="subtitle">UNE ERREUR INATTENDUE EST SURVENUE</p>
        <pre className="error-detail">{error.message}</pre>
        <div className="error-actions">
          <button
            type="button"
            className="menu-item"
            onClick={() => window.location.assign("/")}
          >
            ← MENU
          </button>
          <button
            type="button"
            className="menu-item"
            onClick={() => window.location.reload()}
          >
            ↻ RECHARGER
          </button>
        </div>
      </div>
    );
  }
}
