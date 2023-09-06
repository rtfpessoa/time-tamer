import {
  createStyles,
  Header as MHeader,
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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./use-auth";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: rem(42),
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
}));

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { classes, theme } = useStyles();
  const { account, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      <MHeader height={60} px="md">
        <Group position="apart" sx={{ height: "100%" }}>
          <Button variant="white" onClick={() => navigate("/")}>
            <Text size="xl" color="#619e95">
              Roodle
            </Text>
          </Button>

          <Group
            sx={{ height: "100%" }}
            spacing={0}
            className={classes.hiddenMobile}
          >
            <Link to={`/`} className={classes.link}>
              Home
            </Link>
            <Link to={`/poll`} className={classes.link}>
              Polls
            </Link>
          </Group>

          <Group className={classes.hiddenMobile}>
            {loading ? (
              <Text size="md" color="#000">
                Loading...
              </Text>
            ) : account ? (
              <Box>
                <Button
                  variant="white"
                  onClick={() => (window.location.href = "/logout")}
                >
                  <Text size="md" color="#000">
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
            className={classes.hiddenDesktop}
          />
        </Group>
      </MHeader>

      <Drawer
        onClick={closeDrawer}
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Link to={`/`} className={classes.link}>
            Home
          </Link>
          <Link to={`/poll`} className={classes.link}>
            Polls
          </Link>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Group grow pb="xl" px="md">
            {loading ? (
              <Text size="md" color="#000">
                Loading...
              </Text>
            ) : account ? (
              <Stack>
                <Button
                  variant="white"
                  onClick={() => (window.location.href = "/logout")}
                >
                  <Text size="md" color="#000">
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
