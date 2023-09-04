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

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll",
    element: (
      <RequireAuth>
        <PollList />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll/new",
    element: (
      <RequireAuth>
        <NewPoll />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/poll/:pollId",
    element: (
      <RequireAuth>
        <PollGet />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    loader: pollGetLoader,
  },
  {
    path: "/poll/:pollId/vote",
    element: (
      <RequireAuth>
        <NewVote />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    loader: newVoteLoader,
  },
]);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
