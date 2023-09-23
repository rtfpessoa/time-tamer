import { useEffect, useState } from "react";
import {
  NewPollResponse,
  Poll,
  PollGetResponse,
  PollWithAvailabilities,
  ResponseError,
} from "./models";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import {
  Button,
  Group,
  Stack,
  Title,
  Text,
  CopyButton,
  Box,
  Card,
  Modal,
  Menu,
} from "@mantine/core";
import { ClipboardIcon } from "./PollList";
import dayjs from "dayjs";

import Avatar from "react-avatar";
import { capitalize } from "./utils";
import { useDisclosure } from "@mantine/hooks";
import ICalLink from "./calendar/ICalendarLink";
import { GoogleCalendarLink } from "./calendar/GoogleCalendar";

const MAX_AVATARS = 3;

export function DescriptionIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { width, height, style, ...others } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ width, height, ...style }}
      {...others}
    >
      <path
        fill="currentColor"
        d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"
      ></path>
    </svg>
  );
}

export function LocationIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { width, height, style, ...others } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ width, height, ...style }}
      {...others}
    >
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"
      ></path>
    </svg>
  );
}

export function ICSIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { width, height, style, ...others } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="80 80 290 320"
      transform="rotate(0)matrix(1, 0, 0, 1, 0, 0)"
      style={{ width, height, ...style }}
      {...others}
    >
      <g stroke-width="0"></g>
      <g stroke-linecap="round" stroke-linejoin="round"></g>
      <g>
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="15"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M144.392,93.788c-8.819,0-15.981,7.154-15.981,15.981v255.759c0,8.827,7.162,15.981,15.981,15.981 h183.83c8.827,0,15.981-7.154,15.981-15.981V167.812l-77.047-74.024H144.392z"
        />
        <g>
          <path
            fill="currentColor"
            d="M344.207,167.812h-61.066c-8.827,0-15.981-7.154-15.981-15.981V93.788L344.207,167.812z"
          />
          <path
            fill="currentColor"
            d="M263.968,271.77c0,10.189-8.258,18.447-18.447,18.447H110.877c-10.189,0-18.447-8.258-18.447-18.447 v-56.351c0-10.189,8.258-18.44,18.447-18.44h134.645c10.189,0,18.447,8.251,18.447,18.44V271.77z"
          />
        </g>
        <g>
          <path
            fill="#FFFFFF"
            d="M136.601,260.283v-29.545c0-1.534,0.352-2.687,1.048-3.454c0.696-0.767,1.605-1.152,2.713-1.152 c1.145,0,2.069,0.382,2.776,1.138c0.703,0.76,1.059,1.916,1.059,3.465v29.545c0,1.553-0.355,2.713-1.059,3.48 c-0.707,0.767-1.635,1.152-2.776,1.152c-1.093,0-1.991-0.389-2.698-1.164C136.953,262.973,136.601,261.817,136.601,260.283z"
          />
          <path
            fill="#FFFFFF"
            d="M184.639,252.428c0,1.19-0.296,2.485-0.879,3.873c-0.591,1.392-1.515,2.754-2.776,4.094 s-2.874,2.425-4.834,3.263c-1.961,0.838-4.247,1.254-6.855,1.254c-1.976,0-3.779-0.191-5.396-0.561 c-1.616-0.37-3.091-0.958-4.415-1.755c-1.321-0.789-2.537-1.833-3.645-3.132c-0.992-1.175-1.833-2.496-2.533-3.951 c-0.7-1.463-1.224-3.02-1.572-4.67c-0.352-1.65-0.528-3.413-0.528-5.268c0-3.02,0.438-5.721,1.317-8.108s2.137-4.43,3.775-6.125 c1.639-1.695,3.555-2.99,5.755-3.877c2.2-0.887,4.546-1.328,7.035-1.328c3.038,0,5.736,0.606,8.108,1.815s4.187,2.709,5.448,4.49 s1.893,3.465,1.893,5.051c0,0.868-0.307,1.639-0.92,2.301c-0.614,0.662-1.355,0.999-2.226,0.999c-0.973,0-1.703-0.232-2.185-0.692 c-0.49-0.46-1.029-1.253-1.628-2.38c-0.992-1.86-2.152-3.248-3.491-4.168s-2.99-1.381-4.95-1.381c-3.121,0-5.605,1.186-7.457,3.555 c-1.848,2.369-2.773,5.74-2.773,10.103c0,2.915,0.408,5.343,1.227,7.278c0.819,1.934,1.976,3.375,3.48,4.333 c1.504,0.958,3.255,1.433,5.268,1.433c2.181,0,4.03-0.543,5.534-1.624c1.512-1.085,2.649-2.675,3.416-4.771 c0.326-0.988,0.722-1.792,1.201-2.417c0.479-0.621,1.246-0.932,2.301-0.932c0.902,0,1.68,0.318,2.327,0.947 C184.309,250.703,184.639,251.493,184.639,252.428z"
          />
          <path
            fill="#FFFFFF"
            d="M219.961,253.016c0,2.268-0.584,4.307-1.755,6.114c-1.167,1.804-2.877,3.222-5.126,4.247 s-4.917,1.534-8.007,1.534c-3.701,0-6.754-0.703-9.156-2.099c-1.706-1.01-3.091-2.35-4.157-4.026 c-1.063-1.68-1.598-3.315-1.598-4.902c0-0.92,0.318-1.71,0.962-2.365c0.636-0.659,1.452-0.988,2.44-0.988 c0.801,0,1.482,0.254,2.032,0.767c0.554,0.513,1.029,1.272,1.422,2.275c0.479,1.194,0.995,2.189,1.545,2.993 c0.554,0.804,1.336,1.463,2.342,1.979c1.007,0.524,2.327,0.782,3.966,0.782c2.253,0,4.079-0.528,5.489-1.572 c1.403-1.051,2.107-2.361,2.107-3.929c0-1.246-0.382-2.256-1.137-3.031c-0.76-0.778-1.74-1.369-2.945-1.781 c-1.197-0.408-2.806-0.846-4.819-1.306c-2.694-0.629-4.95-1.366-6.765-2.215c-1.819-0.842-3.259-1.994-4.326-3.45 c-1.063-1.463-1.598-3.274-1.598-5.437c0-2.062,0.561-3.899,1.688-5.5c1.126-1.602,2.754-2.836,4.887-3.697 s4.636-1.291,7.521-1.291c2.301,0,4.292,0.284,5.972,0.857s3.076,1.328,4.183,2.275s1.92,1.942,2.428,2.978 c0.509,1.036,0.767,2.054,0.767,3.042c0,0.906-0.322,1.717-0.958,2.443c-0.644,0.726-1.441,1.089-2.395,1.089 c-0.868,0-1.53-0.217-1.983-0.651c-0.449-0.434-0.939-1.149-1.471-2.137c-0.685-1.414-1.5-2.518-2.455-3.311 c-0.954-0.793-2.488-1.19-4.602-1.19c-1.961,0-3.543,0.43-4.745,1.291c-1.205,0.861-1.804,1.897-1.804,3.109 c0,0.752,0.206,1.399,0.614,1.946c0.408,0.546,0.973,1.014,1.688,1.407c0.715,0.393,1.441,0.7,2.174,0.921 c0.733,0.221,1.946,0.546,3.633,0.973c2.114,0.498,4.03,1.036,5.74,1.639c1.717,0.599,3.173,1.325,4.378,2.174 c1.197,0.853,2.137,1.934,2.814,3.233C219.624,249.529,219.961,251.126,219.961,253.016z"
          />
        </g>
      </g>
    </svg>
  );
}

export function CalendarIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { width, height, style, ...others } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width, height, ...style }}
      {...others}
    >
      <g stroke-width="0"></g>
      <g stroke-linecap="round" stroke-linejoin="round"></g>
      <g>
        <path
          d="M17 14C17.5523 14 18 13.5523 18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13C16 13.5523 16.4477 14 17 14Z"
          fill="currentColor"
        ></path>
        <path
          d="M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z"
          fill="currentColor"
        ></path>
        <path
          d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z"
          fill="currentColor"
        ></path>
        <path
          d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z"
          fill="currentColor"
        ></path>
        <path
          d="M7 14C7.55229 14 8 13.5523 8 13C8 12.4477 7.55229 12 7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14Z"
          fill="currentColor"
        ></path>
        <path
          d="M7 18C7.55229 18 8 17.5523 8 17C8 16.4477 7.55229 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z"
          fill="currentColor"
        ></path>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7 1.75C7.41421 1.75 7.75 2.08579 7.75 2.5V3.26272C8.412 3.24999 9.14133 3.24999 9.94346 3.25H14.0564C14.8586 3.24999 15.588 3.24999 16.25 3.26272V2.5C16.25 2.08579 16.5858 1.75 17 1.75C17.4142 1.75 17.75 2.08579 17.75 2.5V3.32709C18.0099 3.34691 18.2561 3.37182 18.489 3.40313C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33855 22.5969 7.51098C22.75 8.65018 22.75 10.1058 22.75 11.9435V14.0564C22.75 15.8941 22.75 17.3498 22.5969 18.489C22.4392 19.6614 22.1071 20.6104 21.3588 21.3588C20.6104 22.1071 19.6614 22.4392 18.489 22.5969C17.3498 22.75 15.8942 22.75 14.0565 22.75H9.94359C8.10585 22.75 6.65018 22.75 5.51098 22.5969C4.33856 22.4392 3.38961 22.1071 2.64124 21.3588C1.89288 20.6104 1.56076 19.6614 1.40314 18.489C1.24997 17.3498 1.24998 15.8942 1.25 14.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33855 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40313C5.7439 3.37182 5.99006 3.34691 6.25 3.32709V2.5C6.25 2.08579 6.58579 1.75 7 1.75ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.86685 7.88123 2.8477 8.06061 2.83168 8.25H21.1683C21.1523 8.06061 21.1331 7.88124 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C17.2615 4.75159 15.9068 4.75 14 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976ZM2.75 12C2.75 11.146 2.75032 10.4027 2.76309 9.75H21.2369C21.2497 10.4027 21.25 11.146 21.25 12V14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25H10C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14V12Z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  );
}

export const pollGetLoader: LoaderFunction = async ({ params }) => {
  return params;
};

type EmailAnswer = {
  answer: string;
  email: string;
};

function PollGet() {
  const { pollId } = useLoaderData() as { pollId: string };
  const [poll, setPoll] = useState<PollWithAvailabilities | null>(null);
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPoll(pollId).then((poll) => setPoll(poll));
  }, [pollId]);

  if (poll == null) {
    return null;
  }

  const answers = new Map<string, EmailAnswer[]>();
  poll.availabilities.forEach((pollAccountAvailability) => {
    pollAccountAvailability.availabilities.forEach((availability) => {
      answers.set(availability.option_id, [
        ...(answers.get(availability.option_id) ?? []),
        {
          answer: availability.answer,
          email: pollAccountAvailability.account_email,
        },
      ]);
    });
  });

  return (
    <Stack>
      <Group style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Title>{poll.poll.title || poll.poll.id}</Title>

        <Group gap={"4px"}>
          <Button
            variant="subtle"
            color={"#228be6"}
            onClick={() => navigate(`/poll/${poll.poll.id}/vote`)}
            p={"4px"}
            size="xs"
          >
            <Text size="md">Vote</Text>
          </Button>
          <Text size="xs" color="dimmed">
            •
          </Text>
          <CopyButton
            value={`https://roodle.onrender.com/poll/${poll.poll.id}/vote`}
          >
            {({ copied, copy }) => (
              <Button
                variant="subtle"
                color={copied ? "teal" : "#228be6"}
                onClick={copy}
                p={"4px"}
                size="xs"
              >
                <Group gap={"4px"}>
                  <ClipboardIcon
                    width={"12px"}
                    color={copied ? "teal" : "#228be6"}
                  />
                  <Text size="md">{copied ? "Copied link" : "Copy link"}</Text>
                </Group>
              </Button>
            )}
          </CopyButton>
        </Group>
      </Group>
      <Stack gap={"4px"} mb="lg">
        {poll.poll.description ? (
          <Group gap={"4px"}>
            <DescriptionIcon width={"1rem"} />
            <Text size="lg">{poll.poll.description}</Text>
          </Group>
        ) : null}
        {poll.poll.location ? (
          <Group gap={"4px"}>
            <LocationIcon width={"1rem"} />
            <Text size="lg">{poll.poll.location}</Text>
          </Group>
        ) : null}
      </Stack>
      {poll.poll.options
        .sort((option1, option2) => {
          const option1Score = scoreAnswers(answers.get(option1.id) ?? []);
          const option2Score = scoreAnswers(answers.get(option2.id) ?? []);

          if (option1Score !== option2Score) {
            return option1Score - option2Score;
          }

          return option2.start.getTime() - option1.start.getTime();
        })
        .reverse()
        .map((option) => (
          <Stack>
            <Stack>
              <Card
                withBorder
                radius="md"
                p={"lg"}
                style={{ overflow: "initial" }}
              >
                <Group
                  gap={"xs"}
                  mb="md"
                  style={{ justifyContent: "space-between" }}
                >
                  <Group>
                    <Text size="xl">
                      {dayjs(option.start).format("ddd D MMM")}
                    </Text>
                    <Text>
                      {dayjs(option.start).format("h:mm A")}
                      {" - "}
                      {dayjs(option.end).format("h:mm A")}
                    </Text>
                  </Group>
                  <Menu withArrow>
                    <Menu.Target>
                      <Button variant="subtle">More</Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <GoogleCalendarLink
                        Title={poll.poll.title || poll.poll.id}
                        Start={option.start}
                        End={option.end}
                        Description={poll.poll.description}
                        Location={poll.poll.location}
                        Guests={Array.from(
                          (answers.get(option.id) ?? []).map(
                            ({ email }) => email
                          )
                        )}
                      />

                      <ICalLink
                        event={{
                          title: poll.poll.title || poll.poll.id,
                          description: poll.poll.description,
                          startTime: option.start.toISOString(),
                          endTime: option.end.toISOString(),
                          location: poll.poll.location,
                          attendees: Array.from(
                            (answers.get(option.id) ?? []).map(
                              ({ email }) => `${email} <${email}>`
                            )
                          ),
                        }}
                      />
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Group
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                  }}
                >
                  {Array.from(
                    (answers.get(option.id) ?? []).reduce(
                      (group, { answer, email }) => {
                        return group.set(
                          answer,
                          (group.get(answer) ?? []).concat(email)
                        );
                      },
                      new Map<string, string[]>()
                    )
                  )
                    .sort(([answer1], [answer2]) =>
                      answer1.localeCompare(answer2)
                    )
                    .map(([answer, values]) => (
                      <Box
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        <Text>
                          {capitalize(answer)}: {values.length}
                        </Text>
                        <Group
                          gap="0px"
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          {values.slice(0, MAX_AVATARS).map((email, idx) => (
                            <Avatar
                              email={email}
                              name={email}
                              alt={email}
                              round
                              size="40px"
                              style={{
                                flexShrink: 0,
                                border: "2px solid #fff",
                                boxSizing: "content-box",
                                marginLeft: `-${idx === 0 ? 0 : 20}px`,
                              }}
                            />
                          ))}
                          {values.length > MAX_AVATARS ? (
                            <Box
                              style={{
                                display: "flex",
                                flexShrink: 0,
                                alignContent: "center",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px",
                                height: "40px",
                                borderRadius: "100%",
                                marginLeft: "-20px",
                                backgroundColor: "#94bdb7",
                                border: "2px solid #fff",
                                boxSizing: "content-box",
                              }}
                              title={values
                                .slice(MAX_AVATARS)
                                .map((email) => email)
                                .join(", ")}
                            >
                              <Text size="xs" color="#1d2f2c">
                                +{values.length - MAX_AVATARS}
                              </Text>
                            </Box>
                          ) : null}
                        </Group>
                      </Box>
                    ))}
                </Group>
              </Card>
            </Stack>
          </Stack>
        ))}
      <Box>
        <Button
          style={{ display: "flex", flexGrow: 0 }}
          size="md"
          onClick={open}
        >
          Delete
        </Button>
        <Modal
          opened={opened}
          onClose={close}
          title="Deletion confirmation"
          size="lg"
        >
          <Stack>
            <Group>
              <Text>
                Are you sure you want to delete{" "}
                <Text span fw={900}>
                  {poll.poll.title || poll.poll.id}
                </Text>{" "}
                poll?
              </Text>
            </Group>
            <Group>
              <Button
                type="submit"
                color="red"
                onClick={async () => {
                  setError("");
                  try {
                    const response = await deletePoll(poll.poll.id);

                    if ("error" in response) {
                      setError(response.error);
                      return;
                    }

                    if ("id" in response) {
                      navigate(`/poll`);
                      return;
                    }
                  } catch (e) {
                    setError("Something went wrong. Please try again.");
                    return;
                  }
                }}
              >
                Yes
              </Button>
              <Button variant="default" onClick={close} type="reset">
                Cancel
              </Button>
              {error ? <Text color="red">{error}</Text> : null}
            </Group>
          </Stack>
        </Modal>
      </Box>
    </Stack>
  );
}

export async function getPoll(
  id: string
): Promise<PollWithAvailabilities | null> {
  var response = await fetch(`/api/v1/poll/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const poll: PollGetResponse = await response.json();

  const options = poll.data.poll.options.map((option) => {
    return {
      id: option.id,
      start: new Date(option.start),
      end: new Date(option.end),
    };
  });

  poll.data.poll.options = options;

  return poll.data;
}

export async function deletePoll(id: string): Promise<Poll | ResponseError> {
  var response = await fetch(`/api/v1/poll/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const obj = await response.json();

  if (!response.ok) {
    return obj as ResponseError;
  }

  const newPollResponse = obj as NewPollResponse;

  const options = newPollResponse.data.options.map((option) => {
    return {
      id: option.id,
      start: new Date(option.start),
      end: new Date(option.end),
    };
  });

  newPollResponse.data.options = options;

  return newPollResponse.data;
}

export default PollGet;

function scoreAnswers(answers: EmailAnswer[]): number {
  return answers.reduce((score, { answer }) => {
    switch (answer) {
      case "available":
        return score + 3;
      case "maybe":
        return score + 1;
      case "unavailable":
        return score - 3;
      default:
        return score;
    }
  }, 0);
}
