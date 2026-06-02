import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[GlobalErrorBoundary]", error, info.componentStack);

    try {
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "exception", {
          description: error.message,
          fatal: true,
        });
      }
    } catch {
      /* analytics silently fail */
    }

    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <main className="page" style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}>
          <div className="glass" style={{ maxWidth: 560, width: "100%", padding: 36, textAlign: "center" }}>
            <p className="eyebrow" style={{ color: "var(--gold)" }}>নবME</p>
            <h1 className="heading" style={{ marginTop: 8 }}>Something went wrong</h1>
            <p className="lede" style={{ margin: "16px auto 0", fontSize: 14, color: "var(--text-secondary)" }}>
              {this.state.error?.message || "An unexpected error occurred. Our team has been notified."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
              <button
                className="premium-button"
                onClick={this.handleReset}
                style={{ padding: "0 26px" }}
              >
                Try Again
              </button>
              <button
                className="premium-button outlined"
                onClick={() => window.location.assign("/")}
                style={{ padding: "0 26px" }}
              >
                Go Home
              </button>
            </div>
            <details style={{ marginTop: 24, textAlign: "left" }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}>
                Technical details
              </summary>
              <pre style={{ marginTop: 8, padding: 12, fontSize: 12, background: "rgba(0,0,0,0.3)", borderRadius: 8, overflow: "auto", maxHeight: 200 }}>
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
