import {
  Group,
  Button,
  Text,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./header.module.css";
import { useAuth } from "./use-auth";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { account, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      <header className={classes.header}>
        <Group justify="space-between" style={{ height: "100%" }}>
          <Button variant="white" onClick={() => navigate("/")}>
            <Text size="xl" c="#619e95" fw="bold">
              Roodle
            </Text>
          </Button>

          <Group style={{ height: "100%" }} gap={0} visibleFrom="sm">
            <Link to={`/`} className={classes.link}>
              Home
            </Link>
            <Link to={`/poll`} className={classes.link}>
              Polls
            </Link>
          </Group>

          <Group visibleFrom="sm">
            {loading ? (
              <Text size="md" c="#000">
                Loading...
              </Text>
            ) : account ? (
              <Box>
                <Button
                  variant="white"
                  onClick={() => (window.location.href = "/logout")}
                >
                  <Text size="md" c="#000">
                    👋 {account?.email}
                  </Text>
                </Button>
              </Box>
            ) : (
              <Button
                variant="white"
                onClick={() => (window.location.href = "/login")}
              >
                Log in
              </Button>
            )}
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Link to={`/`} className={classes.link}>
            <Box m="md">Home</Box>
          </Link>
          <Link to={`/poll`} className={classes.link}>
            <Box m="md">Polls</Box>
          </Link>

          <Divider my="sm" color="dark.5" />

          <Group grow pb="xl" px="md">
            {loading ? (
              <Text size="md" c="#000">
                Loading...
              </Text>
            ) : account ? (
              <Stack>
                <Button
                  variant="white"
                  onClick={() => (window.location.href = "/logout")}
                >
                  <Text size="md" c="#000">
                    👋 {account?.email}
                  </Text>
                </Button>
                <Button
                  variant="white"
                  onClick={() => (window.location.href = "/logout")}
                >
                  Log out
                </Button>
              </Stack>
            ) : (
              <Button
                variant="white"
                onClick={() => (window.location.href = "/login")}
              >
                Log in
              </Button>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
