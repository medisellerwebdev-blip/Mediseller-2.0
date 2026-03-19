import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress "Failed to fetch" errors caused by browser extensions (e.g. frame_ant)
// These are NOT app errors - they come from extensions intercepting window.fetch
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof TypeError && event.reason.message === 'Failed to fetch') {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (event.message?.includes('Failed to fetch') || 
      event.message?.includes('chrome-extension://')) {
    event.preventDefault();
    return true;
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
