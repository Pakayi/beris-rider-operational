import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find root element");
const root = createRoot(container);

// Error boundary sederhana untuk mencegah blank screen total
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-2xl font-black mb-2">Waduh, Ada Gangguan! 🛠️</h1>
          <p className="text-slate-500 mb-6">Coba refresh halaman atau cek koneksi internet bro.</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
            Refresh Sekarang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
