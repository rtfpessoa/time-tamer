import { useEffect, useState } from "react";
import { Poll, PollListResponse } from "./models";
import { useNavigate } from "react-router-dom";
import {
  Group,
  Stack,
  Title,
  Text,
  Container,
  Button,
  Card,
  Box,
  CopyButton,
} from "@mantine/core";

export function AddIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { width, height, style, ...others } = props;
  return (
    <svg
      fill="#fff"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45.402 45.402"
      style={{ width, height, ...style }}
      {...others}
    >
      <g stroke-width="0"></g>
      <g stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"></path>
        </g>
      </g>
    </svg>
  );
}

export function ClipboardIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  const { color = "#000", width, height, style, ...others } = props;
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
          d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005M15 12H12M15 16H12M9 12H9.01M9 16H9.01"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </g>
    </svg>
  );
}

function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    listPolls().then((polls) => setPolls(polls));
  }, []);

  return (
    <Container size="xs" px="xs" mt="md">
      <Stack>
        <Group
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          <Title>Polls</Title>

          <Button onClick={() => navigate("/poll/new")}>
            <Group spacing={"5px"}>
              <AddIcon width={"12px"} />
              <Text>New</Text>
            </Group>
          </Button>
        </Group>

        <Stack>
          {polls.map((poll) => (
            <Card withBorder radius="md" p={"sm"}>
              <Group noWrap spacing={0}>
                <Box>
                  <Text
                    transform="uppercase"
                    color="dimmed"
                    weight={700}
                    size="xs"
                  >
                    {poll.title || poll.id}
                  </Text>
                  <Text mt="xs" mb="md">
                    {poll.options.length} options
                  </Text>
                  <Group noWrap spacing="0px">
                    <Button
                      variant="subtle"
                      color={"#228be6"}
                      onClick={() => navigate(`/poll/${poll.id}`)}
                      p={"4px"}
                      size="xs"
                    >
                      <Text size="sm">View</Text>
                    </Button>
                    <Text size="xs" color="dimmed">
                      •
                    </Text>
                    <CopyButton
                      value={`https://roodle.onrender.com/poll/${poll.id}/vote`}
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
                            <Text size="sm">
                              {copied ? "Copied link" : "Copy link"}
                            </Text>
                          </Group>
                        </Button>
                      )}
                    </CopyButton>
                  </Group>
                </Box>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

async function listPolls(): Promise<Poll[]> {
  var response = await fetch("/api/v1/poll", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return [];
  }

  const polls: PollListResponse = await response.json();
  return polls.data.map((poll) => {
    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      location: poll.location,
      options: poll.options.map((option) => {
        return {
          id: option.id,
          start: new Date(option.start),
          end: new Date(option.end),
        };
      }),
    };
  });
}

export default PollList;
