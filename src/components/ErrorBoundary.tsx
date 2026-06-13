import { Component, ReactNode } from "react";
interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string; }
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: "" };
  static getDerivedStateFromError(e: any): State { return { hasError: true, error: e?.message || "Unknown error" }; }
  componentDidCatch(e: any, i: any) { console.error("[ErrorBoundary]", e, i?.componentStack); }
  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0f1117", color: "#fff", flexDirection: "column", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>{this.state.error}</p>
        <button onClick={() => this.setState({ hasError: false, error: "" })} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 700, cursor: "pointer" }}>Try Again</button>
      </div>
    );
    return this.props.children;
  }
}
