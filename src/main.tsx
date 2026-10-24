import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/base.css";
import "./app/layout/DesktopShell.css";
import "./features/overview/ui/OverviewScreen.css";
import "./shared/styles/feedback.css";
import "./features/supervision/ui/SupervisionScreen.css";
import "./features/settings/ui/SettingsScreen.css";
import "./features/updates/ui/UpdatesPanel.css";

const root = document.getElementById("root");
if (!root) throw new Error("Optic root element missing");
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
