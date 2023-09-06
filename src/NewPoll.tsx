import { useReducer, useState } from "react";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import {
  rem,
  TextInput,
  Text,
  NativeSelect,
  Stack,
  Container,
  Space,
  Title,
  Button,
  Group,
  CloseButton,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { NewPollResponse, ResponseError } from "./models";

type DurationUnit = "minute" | "hour";

var units: {
  [key in DurationUnit]: {
    label: string;
    toMinutes: (v: number) => number;
  };
} = {
  minute: { label: "Minutes", toMinutes: (v: number) => v },
  hour: { label: "Hours", toMinutes: (v: number) => v * 60 },
};

const data = Object.keys(units).map((unit) => ({
  value: unit,
  label: units[unit as DurationUnit].label,
}));

type DurationInputProps = {
  defaultUnit?: DurationUnit;
  defaultValue?: number;
  onChange: (valueMinutes: number) => void;
};

export function DurationInput({
  defaultUnit = "minute",
  defaultValue = 60,
  onChange,
}: DurationInputProps) {
  const [unit, setUnit] = useState(defaultUnit);
  const [value, setValue] = useState(defaultValue);

  const select = (
    <NativeSelect
      styles={{
        input: {
          fontWeight: 500,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          width: rem(110),
        },
      }}
      data={data}
      value={unit}
      onChange={(event) => {
        const durationUnit = event.currentTarget.value as DurationUnit;
        setUnit(durationUnit);
        onChange(units[durationUnit].toMinutes(value));
      }}
    />
  );

  return (
    <TextInput
      type="number"
      placeholder="60"
      label="Activity duration"
      rightSection={select}
      rightSectionWidth={110}
      value={value}
      onChange={(event) => {
        const durationValue = parseInt(event.currentTarget.value, 10);
        setValue(durationValue);
        onChange(units[unit].toMinutes(durationValue));
      }}
    />
  );
}

enum PollActionKind {
  SET_DURATION = "SET_DURATION",
  SET_TIMESTAMP = "SET_TIMESTAMP",
  ADD_TIMESTAMP = "ADD_TIMESTAMP",
  DEL_TIMESTAMP = "DEL_TIMESTAMP",
}

interface PollAction {
  type: PollActionKind;
  durationMin?: number;
  timestamp?: Date;
}

interface PollState {
  durationMin: number;
  selectedTimestamp: Date;
  timestamps: Set<Date>;
}

function reducer(state: PollState, action: PollAction) {
  const { type, durationMin, timestamp } = action;
  switch (type) {
    case PollActionKind.SET_DURATION:
      return {
        ...state,
        durationMin: durationMin ?? state.durationMin,
      };
    case PollActionKind.SET_TIMESTAMP:
      return {
        ...state,
        selectedTimestamp: timestamp ?? state.selectedTimestamp,
      };
    case PollActionKind.ADD_TIMESTAMP:
      return {
        ...state,
        timestamps: state.timestamps.add(state.selectedTimestamp),
      };
    case PollActionKind.DEL_TIMESTAMP:
      if (timestamp != null) {
        state.timestamps.delete(timestamp);
      }
      return {
        ...state,
        timestamps: state.timestamps,
      };
    default:
      return state;
  }
}

function NewPoll() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [state, dispatch] = useReducer(reducer, {
    durationMin: 60,
    selectedTimestamp: new Date(),
    timestamps: new Set<Date>(),
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  return (
    <Container size="xs" px="xs" mt="md">
      <Stack>
        <Title order={1} size="h1" weight={900} align="center">
          New Poll
        </Title>
        <TextInput
          label="Title"
          placeholder="What is the title?"
          onChange={(event) => setTitle(event.currentTarget.value)}
        />
        <TextInput
          label="Description"
          placeholder="What is the description?"
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
        <TextInput
          label="Location"
          placeholder="Where will the activity happen?"
          onChange={(event) => setLocation(event.currentTarget.value)}
        />
        <DurationInput
          onChange={(valueMinutes) =>
            dispatch({
              type: PollActionKind.SET_DURATION,
              durationMin: valueMinutes,
            })
          }
        />
        <Space h="md" />
        <DateTimePicker
          valueFormat="ddd, MMM D, YYYY h:mm A"
          label="Add option time"
          placeholder="Pick date and time"
          onChange={(date) => {
            if (date != null) {
              dispatch({
                type: PollActionKind.SET_TIMESTAMP,
                timestamp: date,
              });
            }
          }}
          value={state.selectedTimestamp}
          submitButtonProps={{
            "aria-label": "Add",
            onClick: () => dispatch({ type: PollActionKind.ADD_TIMESTAMP }),
          }}
        />
      </Stack>
      <Space h="xl" />
      <Title size="h2">Options</Title>
      <Space h="md" />
      <Stack>
        {state.timestamps.size > 0 ? (
          Array.from(state.timestamps).map((timestamp) => (
            <Group key={timestamp.toISOString()}>
              <Text>{dayjs(timestamp).format("ddd, MMM D, YYYY h:mm A")}</Text>
              <CloseButton
                aria-label="Remove option"
                onClick={() =>
                  dispatch({
                    type: PollActionKind.DEL_TIMESTAMP,
                    timestamp,
                  })
                }
              />
            </Group>
          ))
        ) : (
          <Text italic>No options</Text>
        )}
      </Stack>
      <Space h="lg" />
      <Group>
        <Button
          onClick={async () => {
            if (state.timestamps.size === 0) {
              setError("Please add at least one time option");
              return;
            }

            setError("");
            try {
              const response = await createPoll(
                title,
                description,
                location,
                state
              );

              if ("error" in response) {
                setError(response.error);
                return;
              }

              if ("id" in response?.data) {
                navigate(`/poll/${response.data.id}`);
                return;
              }
            } catch (e) {
              setError("Something went wrong. Please try again.");
              return;
            }
          }}
        >
          Create
        </Button>
        {error ? <Text color="red">{error}</Text> : null}
      </Group>
    </Container>
  );
}

async function createPoll(
  title: string,
  description: string,
  location: string,
  state: PollState
): Promise<NewPollResponse | ResponseError> {
  const options = Array.from(state.timestamps).map((timestamp) => ({
    start: timestamp.toISOString(),
    end: new Date(
      timestamp.getTime() + state.durationMin * 60 * 1000
    ).toISOString(),
  }));

  var response = await fetch("/api/v1/poll", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      location,
      options: options,
    }),
  });

  const obj = await response.json();

  if (!response.ok) {
    return obj as ResponseError;
  }

  return obj as NewPollResponse;
}

export default NewPoll;
