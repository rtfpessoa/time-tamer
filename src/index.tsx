import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ErrorPage from "./error-page";
import PollGet, { pollGetLoader } from "./PollGet";
import PollList from "./PollList";
import NewVote, { newVoteLoader } from "./NewVote";
import NewPoll from "./NewPoll";
import { AuthProvider } from "./use-auth";
import { MantineProvider } from "@mantine/core";

import { datadogRum } from "@datadog/browser-rum";
import { PrivacyPolicy } from "./privacy-policy";
import { PageContent } from "./page-content";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PageContent requiresAuth={false}>
        <App />
      </PageContent>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/privacy",
    element: (
      <PageContent requiresAuth={false}>
        <PrivacyPolicy />
      </PageContent>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll",
    element: (
      <PageContent requiresAuth={true}>
        <PollList />
      </PageContent>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll/new",
    element: (
      <PageContent requiresAuth={true}>
        <NewPoll />
      </PageContent>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll/:pollId",
    element: (
      <PageContent requiresAuth={true}>
        <PollGet />
      </PageContent>
    ),
    errorElement: <ErrorPage />,
    loader: pollGetLoader,
  },
  {
    path: "/poll/:pollId/vote",
    element: (
      <PageContent requiresAuth={true}>
        <NewVote />
      </PageContent>
    ),
    errorElement: <ErrorPage />,
    loader: newVoteLoader,
  },
]);

root.render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
