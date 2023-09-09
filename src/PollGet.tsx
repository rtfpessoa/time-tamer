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
  Container,
  Group,
  Stack,
  Title,
  Text,
  CopyButton,
  Box,
  Card,
  Modal,
} from "@mantine/core";
import { ClipboardIcon } from "./PollList";
import dayjs from "dayjs";

import Avatar from "react-avatar";
import { capitalize } from "./utils";
import { useDisclosure } from "@mantine/hooks";

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
    <Container size="xs" px="xs" mt="md">
      <Stack>
        <Group
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <Title>{poll.poll.title || poll.poll.id}</Title>

          <Group spacing={"4px"}>
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
                  <Group spacing={"4px"}>
                    <ClipboardIcon
                      width={"12px"}
                      color={copied ? "teal" : "#228be6"}
                    />
                    <Text size="md">
                      {copied ? "Copied link" : "Copy link"}
                    </Text>
                  </Group>
                </Button>
              )}
            </CopyButton>
          </Group>
        </Group>
        <Stack spacing={"4px"} mb="lg">
          {poll.poll.description ? (
            <Group spacing={"4px"}>
              <DescriptionIcon width={"1rem"} />
              <Text size="lg">{poll.poll.description}</Text>
            </Group>
          ) : null}
          {poll.poll.location ? (
            <Group spacing={"4px"}>
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
                <Card withBorder radius="md" p={"sm"}>
                  <Group spacing={"xs"}>
                    <Text size="xl">
                      {dayjs(option.start).format("ddd D MMM")}
                    </Text>
                    <Text>
                      {dayjs(option.start).format("h:mm A")}
                      {" - "}
                      {dayjs(option.end).format("h:mm A")}
                    </Text>
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
                            spacing="0px"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                              overflow: "hidden",
                            }}
                          >
                            {values.slice(0, 4).map((email, idx) => (
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
                            {values.length > 4 ? (
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
                              >
                                <Text size="xs" color="#1d2f2c">
                                  +{values.length - 4}
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
                  <Text span weight={900}>
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
    </Container>
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
