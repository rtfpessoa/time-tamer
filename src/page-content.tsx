import { Box } from "@mantine/core";
import { Header } from "./header";
import { RequireAuth } from "./use-auth";
import { Footer } from "./footer";
import { PropsWithChildren } from "react";

type PageContentProps = {
  requiresAuth: boolean;
};

export function PageContent({
  requiresAuth = true,
  children,
}: PropsWithChildren<PageContentProps>) {
  return (
    <Box>
      <Header />
      <Box style={{ minHeight: "calc(100vh - 60px - 1rem)" }}>
        {requiresAuth ? <RequireAuth children={children} /> : children}
      </Box>
      <Footer />
    </Box>
  );
}
