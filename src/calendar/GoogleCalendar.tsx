import { Anchor, Box, Group, Text } from "@mantine/core";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { CalendarIcon } from "../PollGet";

dayjs.extend(utc);

// Source: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
type GoogleCalendarLinkProps = {
  Title: string;
  Start: Date;
  End: Date;
  Description?: string;
  Location?: string;
  Guests?: string[];
  Source?: string;
};

export const GoogleCalendarLink = ({
  Title,
  Start,
  End,
  Description,
  Location,
  Guests,
}: GoogleCalendarLinkProps) => {
  var queryParams = [];
  queryParams.push(["action", "TEMPLATE"]);
  queryParams.push(["text", Title]);
  if (Description) {
    queryParams.push(["details", Description]);
  }
  if (Location) {
    queryParams.push(["location", Location]);
  }
  queryParams.push([
    "dates",
    `${dayjs(Start).utc().format("YYYYMMDD[T]HHmmss[Z]")}/${dayjs(End)
      .utc()
      .format("YYYYMMDD[T]HHmmss[Z]")}`,
  ]);
  queryParams.push(["crm", "BUSY"]);
  queryParams.push(["trp", "false"]);
  queryParams.push(["sprop", "website:roodle.onrender.com"]);
  queryParams.push(["sprop", "name:Roodle"]);
  if (Guests) {
    queryParams.push(["add", Guests.join(",")]);
  }

  var queryString = queryParams
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("&");

  return (
    <Anchor
      href={`https://calendar.google.com/calendar/render?${queryString}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Box p="xs">
        <Group spacing={"4px"}>
          <CalendarIcon width={"16px"} />
          <Text size="md">Add to Google Calendar</Text>
        </Group>
      </Box>
    </Anchor>
  );
};
