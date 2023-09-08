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
import { AuthProvider, RequireAuth } from "./use-auth";
import { Box, MantineProvider } from "@mantine/core";
import { Header } from "./header";

import { datadogRum } from "@datadog/browser-rum";

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

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Box>
        <Header />
        <App />
      </Box>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll",
    element: (
      <Box pb={"xl"}>
        <Header />
        <RequireAuth>
          <PollList />
        </RequireAuth>
      </Box>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll/new",
    element: (
      <Box pb={"xl"}>
        <Header />
        <RequireAuth>
          <NewPoll />
        </RequireAuth>
      </Box>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll/:pollId",
    element: (
      <Box pb={"xl"}>
        <Header />
        <RequireAuth>
          <PollGet />
        </RequireAuth>
      </Box>
    ),
    errorElement: <ErrorPage />,
    loader: pollGetLoader,
  },
  {
    path: "/poll/:pollId/vote",
    element: (
      <Box pb={"xl"}>
        <Header />
        <RequireAuth>
          <NewVote />
        </RequireAuth>
      </Box>
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
