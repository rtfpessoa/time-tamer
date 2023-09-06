import { useCallback, useEffect, useState } from "react";
import { Poll, PollGetResponse, PollWithAvailabilities } from "./models";
import { LoaderFunction, useLoaderData } from "react-router-dom";
import {
  Container,
  Stack,
  Group,
  Title,
  Card,
  Box,
  Text,
  Button,
  Space,
} from "@mantine/core";
import dayjs from "dayjs";
import { LocationIcon, DescriptionIcon } from "./PollGet";

export function AvailableIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { color = "#00802b", width, height, style, ...others } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={{ width, height, ...style }}
      {...others}
    >
      <g stroke-width="0"></g>
      <g stroke-linecap="round" stroke-linejoin="round"></g>
      <g>
        <path
          d="M4 12.6111L8.92308 17.5L20 6.5"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </g>
    </svg>
  );
}

export function MaybeIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { color = "#c89646", width, height, style, ...others } = props;
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
          d="M12 17V16.9929M12 14.8571C12 11.6429 15 12.3571 15 9.85714C15 8.27919 13.6568 7 12 7C10.6567 7 9.51961 7.84083 9.13733 9"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </g>
    </svg>
  );
}

export function UnavailableIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { color = "#aeaeae", width, height, style, ...others } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={{ width, height, ...style }}
      {...others}
    >
      <g stroke-width="0"></g>
      <g stroke-linecap="round" stroke-linejoin="round"></g>
      <g>
        <path
          d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z"
          fill={color}
        ></path>
      </g>
    </svg>
  );
}

export const newVoteLoader: LoaderFunction = async ({ params }) => {
  return params;
};

function NewVote() {
  const { pollId } = useLoaderData() as { pollId: string };
  const [poll, setPoll] = useState<PollWithAvailabilities | null>(null);
  const [answers, setAnswers] = useState<Map<string, string>>(
    new Map<string, string>()
  );

  useEffect(() => {
    getPoll(pollId).then((poll) => setPoll(poll));
    // const date1S = new Date();
    // date1S.setHours(6, 0, 0, 0);
    // const date1E = new Date();
    // date1E.setHours(8, 0, 0, 0);
    // const date2S = new Date();
    // date2S.setHours(2, 0, 0, 0);
    // const date2E = new Date();
    // date2E.setHours(4, 0, 0, 0);
    // setPoll({
    //   poll: {
    //     id: "asasasa",
    //     title: "My nice title",
    //     description: "Such a great and nice description for my amazing event",
    //     location: "Machado's house",
    //     options: [
    //       {
    //         id: "bhjgh675",
    //         start: date1S,
    //         end: date1E,
    //       },
    //       {
    //         id: "assass06",
    //         start: date2S,
    //         end: date2E,
    //       },
    //     ],
    //   },
    //   availabilities: [
    //     {
    //       poll_id: "asasasa",
    //       account_id: 1,
    //       account_email: "rtfrodrigo@gmail.com",
    //       availabilities: [
    //         {
    //           option_id: "bhjgh675",
    //           answer: "available",
    //         },
    //         {
    //           option_id: "assass06",
    //           answer: "available",
    //         },
    //       ],
    //     },
    //     {
    //       poll_id: "asasasa",
    //       account_id: 2,
    //       account_email: "daniel.reigada@gmail.com",
    //       availabilities: [
    //         {
    //           option_id: "bhjgh675",
    //           answer: "maybe",
    //         },
    //         {
    //           option_id: "assass06",
    //           answer: "available",
    //         },
    //       ],
    //     },
    //     {
    //       poll_id: "asasasa",
    //       account_id: 3,
    //       account_email: "rvcortes92@gmail.com",
    //       availabilities: [
    //         {
    //           option_id: "bhjgh675",
    //           answer: "available",
    //         },
    //         {
    //           option_id: "assass06",
    //           answer: "available",
    //         },
    //       ],
    //     },
    //     {
    //       poll_id: "asasasa",
    //       account_id: 4,
    //       account_email: "ines.bpinto@gmail.com",
    //       availabilities: [
    //         {
    //           option_id: "bhjgh675",
    //           answer: "unavailable",
    //         },
    //         {
    //           option_id: "assass06",
    //           answer: "maybe",
    //         },
    //       ],
    //     },
    //   ],
    // });
  }, [pollId]);

  const setAnswer = useCallback(
    (optionId: string, answer: string) => {
      setAnswers((map) => new Map([...Array.from(map), [optionId, answer]]));
    },
    [setAnswers]
  );

  if (poll == null) {
    return null;
  }

  return (
    <Container size="xs" px="xs" mt="md">
      <Stack>
        <Group
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <Title>{poll.poll.title || poll.poll.id}</Title>
        </Group>
        <Stack spacing={"4px"} mb="lg">
          {poll.poll.location !== undefined ? (
            <Group spacing={"4px"}>
              <LocationIcon width={"1rem"} />
              <Text size="lg">{poll.poll.location}</Text>
            </Group>
          ) : null}
          {poll.poll.description !== undefined ? (
            <Group spacing={"4px"}>
              <DescriptionIcon width={"1rem"} />
              <Text size="lg">{poll.poll.description}</Text>
            </Group>
          ) : null}
        </Stack>
        {poll.poll.options.map((option) => (
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
                <Space h="md" />
                <Group
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                  }}
                >
                  <Button
                    variant="subtle"
                    disabled={answers.get(option.id) === "available"}
                    onClick={() => setAnswer(option.id, "available")}
                  >
                    <AvailableIcon width={"20px"}></AvailableIcon>
                    <Text>Available</Text>
                  </Button>
                  <Button
                    variant="subtle"
                    disabled={answers.get(option.id) === "maybe"}
                    onClick={() => setAnswer(option.id, "maybe")}
                  >
                    <MaybeIcon width={"20px"}></MaybeIcon>
                    <Text>Maybe</Text>
                  </Button>
                  <Button
                    variant="subtle"
                    disabled={answers.get(option.id) === "unavailable"}
                    onClick={() => setAnswer(option.id, "unavailable")}
                  >
                    <UnavailableIcon width={"20px"}></UnavailableIcon>
                    <Text>Unavailable</Text>
                  </Button>
                </Group>
              </Card>
            </Stack>
          </Stack>
        ))}
        <Box>
          <Button
            style={{ display: "flex", flexGrow: 0 }}
            size="md"
            onClick={() => createVote(poll.poll, answers)}
          >
            Submit
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}

async function createVote(poll: Poll, answers: Map<string, string>) {
  const payload = Array.from(answers).map(([optionId, answer]) => {
    return { option_id: optionId, answer: answer };
  });

  var response = await fetch(`/api/v1/poll/${poll.id}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    alert("Error creating vote");
    return;
  }

  alert("Vote created successfully");
}

async function getPoll(id: string): Promise<PollWithAvailabilities | null> {
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

export default NewVote;
