import { Anchor, Group, Text } from "@mantine/core";

import classes from "./footer.module.css";

export function Footer() {
  const items = [
    {
      label: "Privacy Policy",
      link: "/privacy",
    },
  ].map((link) => (
    <Anchor<"a">
      c="dimmed"
      key={link.label}
      href={link.link}
      style={{ lineHeight: 1 }}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        <Text c="dimmed">
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
