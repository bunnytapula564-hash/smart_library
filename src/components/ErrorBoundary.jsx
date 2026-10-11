import { Component } from "react";

// Shows a readable message instead of a blank page if something crashes.
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Smart Library crashed:", error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="crash">
        <h1>Something went wrong</h1>
        <pre>{String(this.state.error?.message || this.state.error)}</pre>
        <button className="btn primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </main>
    );
  }
}
