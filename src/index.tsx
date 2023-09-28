import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { datadogRum } from "@datadog/browser-rum";

import "./index.css";
import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';
import '@mantine/ds/styles.css';
import '@mantine/code-highlight/styles.css';

datadogRum.init({
  applicationId: "3946deb5-0bfd-4d76-af57-3c04904340f4",
  clientToken: "pub6b8c573520c7b6b090e1b91d4e9ca41c",
  site: "datadoghq.eu",
  service: "roodle-ui",
  env: "prod",
  // Specify a version number to identify the deployed version of your application in Datadog
  // version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input",
});

datadogRum.startSessionReplayRecording();

// Start the mocking conditionally.
if (process.env.NODE_ENV === "development") {
  const { worker } = require("./mocks/browser");
  worker.start();
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
