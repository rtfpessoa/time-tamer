import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import ErrorPage from "./error-page";
import PollGet, { pollGetLoader } from "./PollGet";
import PollList from "./PollList";
import NewVote, { newVoteLoader } from "./NewVote";
import NewPoll from "./NewPoll";
import { AuthProvider } from "./use-auth";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import { PrivacyPolicy } from "./privacy-policy";
import { PageContent } from "./page-content";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
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

  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider withCssVariables>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MantineProvider>
    </>
  );
}

export default App;
