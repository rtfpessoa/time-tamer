import { createStyles, Anchor, Group, rem, Text } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  footer: {
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${theme.spacing.md} ${theme.spacing.md}`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
  },
}));

export function Footer() {
  const { classes } = useStyles();
  const items = [
    {
      label: "Privacy Policy",
      link: "/privacy",
    },
  ].map((link) => (
    <Anchor<"a">
      color="dimmed"
      key={link.label}
      href={link.link}
      sx={{ lineHeight: 1 }}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        <Text color="dimmed">
          Built with ❤ by{" "}
          <Anchor
            href="https://github.com/rtfpessoa"
            target="_blank"
            rel="noopener noreferrer"
          >
            @rtfpessoa
          </Anchor>
        </Text>
        <Group className={classes.links}>{items}</Group>
      </div>
    </div>
  );
}
