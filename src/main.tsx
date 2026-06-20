import React from "react";
import { createRoot } from "react-dom/client";
import OwnerConsole from "./OwnerConsole";
import { HttpApi, apiEnabled } from "./http";
import { MockApi } from "./data";
import "./styles.css";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("OwnerConsole crashed:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F1E6", color: "#1A312B", fontFamily: "Tahoma, sans-serif", padding: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 380 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>یک خطای غیرمنتظره رخ داد</h1>
            <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 16px", opacity: 0.72 }}>Something went wrong. Reloading the page usually fixes it.</p>
            <button onClick={() => location.reload()} style={{ background: "#67E18D", color: "#1A312B", border: 0, borderRadius: 12, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>بارگذاریِ دوباره · Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <OwnerConsole api={apiEnabled() ? HttpApi : MockApi} />
    </ErrorBoundary>
  </React.StrictMode>
);
