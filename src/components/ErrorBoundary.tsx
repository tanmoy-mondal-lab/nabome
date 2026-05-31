import { Component, type ErrorInfo, type ReactNode } from "react";

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("NABOME render failure", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page" style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}>
          <div className="glass" style={{ maxWidth: 560, padding: 36, textAlign: "center" }}>
            <p className="eyebrow">NABOME</p>
            <h1 className="heading">Something needs a refresh</h1>
            <p className="lede" style={{ margin: "18px auto 0" }}>
              The storefront hit an unexpected state. Refresh the page or return to the collection.
            </p>
            <button className="premium-button" onClick={() => window.location.assign("/category")} style={{ marginTop: 28, padding: "0 26px" }}>
              Shop Collection
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
