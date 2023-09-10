import { Box, Container } from "@mantine/core";
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
      <Box style={{ minHeight: "calc(100vh - 3.75rem - 1rem)" }}>
        <Container size="xs" px="xs" my="md">
          {requiresAuth ? <RequireAuth children={children} /> : children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
