// Sourced from https://github.com/josephj/react-icalendar-link to fix types

import { Anchor, Box, Group, Text } from "@mantine/core";
import * as React from "react";
import { ICSIcon } from "../PollGet";

interface Props {
  className: string;
  href: string;
  event: ICalEvent;
  filename: string;
  rawContent: string;
  isCrappyIE: boolean;
  isSupported: () => boolean;
}

export default class ICalLink extends React.Component<Props> {
  isCrappyIE: boolean;
  // FIXME - iOS Chrome doesn't support adding to iCal at the moment.
  // https://bugs.chromium.org/p/chromium/issues/detail?id=666211
  public static isSupported = () => !isIOSChrome();
  public static defaultProps: Partial<Props> = {
    filename: "download.ics",
    href: "#add-to-calendar",
    rawContent: "",
  };
  constructor(props: Props) {
    super(props);

    this.isCrappyIE = !!(
      typeof window !== "undefined" &&
      (window.navigator as any).msSaveOrOpenBlob &&
      window.Blob
    );
  }
  handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    const { event, filename, rawContent } = this.props;
    const url: string = buildUrl(event, isIOSSafari(), rawContent);
    const blob: Blob = new Blob([url], {
      type: "text/calendar;charset=utf-8",
    });

    // IE
    if (this.isCrappyIE) {
      (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      return;
    }

    // Safari
    if (isIOSSafari()) {
      window.open(url, "_blank");
      return;
    }

    // Desktop
    downloadBlob(blob, filename);
  };
  render() {
    const { href, className } = this.props;

    return (
      <Anchor onClick={this.handleClick} {...{ href, className }}>
        <Box p="xs">
          <Group spacing={"4px"}>
            <ICSIcon width={"16px"} />
            <Text size="md">Download ics</Text>
          </Group>
        </Box>
      </Anchor>
    );
  }
}

export interface ICalEvent {
  title: string;
  startTime: string;
  description?: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  url?: string;
}

function pad(num: number): string {
  if (num < 10) {
    return `0${num}`;
  }
  return `${num}`;
}

export function formatDate(dateString: string): string {
  const dateTime = new Date(dateString);
  return [
    dateTime.getUTCFullYear(),
    pad(dateTime.getUTCMonth() + 1),
    pad(dateTime.getUTCDate()),
    "T",
    pad(dateTime.getUTCHours()),
    pad(dateTime.getUTCMinutes()) + "00Z",
  ].join("");
}

export function buildUrl(
  event: ICalEvent,
  useDataURL: boolean = false,
  rawContent: string = ""
): string {
  const body: string[] = [];

  if (!event || !event.startTime || !event.title)
    throw Error("Both startTime and title fields are mandatory");

  body.push(`DTSTART:${formatDate(event.startTime)}`);
  body.push(`SUMMARY:${event.title}`);

  event.url && body.push(`URL:${event.url}`);
  event.attendees &&
    event.attendees.forEach((attendee) => {
      const regExp = /^([^<]+)\s*<(.+)>/;
      const matches = attendee.match(regExp);
      if (matches) {
        const name = matches[1];
        const email = matches[2];
        body.push(
          [
            "ATTENDEE",
            `CN=${name}`,
            "CUTYPE=INDIVIDUAL",
            "PARTSTAT=NEEDS-ACTION",
            "ROLE=REQ-PARTICIPANT",
            `RSVP=TRUE:mailto:${email}`,
          ].join(";")
        );
      }
    });
  event.endTime && body.push(`DTEND:${formatDate(event.endTime)}`);
  event.description && body.push(`DESCRIPTION:${event.description}`);
  event.location && body.push(`LOCATION:${event.location}`);
  rawContent && body.push(rawContent);

  const url = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    body.join("\n"),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  if (useDataURL) {
    return encodeURI(`data:text/calendar;charset=utf8,${url}`);
  } else {
    return url;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const linkEl = document.createElement("a");
  linkEl.href = window.URL.createObjectURL(blob);
  linkEl.setAttribute("download", filename);
  document.body.appendChild(linkEl);
  linkEl.click();
  document.body.removeChild(linkEl);
}

export function isCrappyIE(): boolean {
  return !!(
    typeof window !== "undefined" &&
    (window.navigator as any).msSaveOrOpenBlob &&
    window.Blob
  );
}

export function isIOSSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);

  return iOS && webkit && !ua.match(/CriOS/i);
}

export function isIOSChrome(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);

  return iOS && !!ua.match(/CriOS/i);
}
