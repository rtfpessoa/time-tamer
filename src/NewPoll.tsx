import DateTimePicker from "react-datetime-picker";
import { useReducer } from "react";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { Link } from "react-router-dom";

enum PollActionKind {
  SET_DURATION = "SET_DURATION",
  SET_TIMESTAMP = "SET_TIMESTAMP",
  ADD_TIMESTAMP = "ADD_TIMESTAMP",
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
    default:
      return state;
  }
}

function NewPoll() {
  const [state, dispatch] = useReducer(reducer, {
    durationMin: 60,
    selectedTimestamp: new Date(),
    timestamps: new Set<Date>(),
  });

  return (
    <div>
      <h1>New Poll</h1>
      <Link to={`/poll`}>Back</Link>
      <div>
        <span>Duration (minutes):</span>
        <input
          type="number"
          value={state.durationMin}
          onChange={(e) =>
            dispatch({
              type: PollActionKind.SET_DURATION,
              durationMin: parseInt(e.target.value),
            })
          }
        />
      </div>
      <div>
        <span>Timestamps:</span>
        <ul>
          {Array.from(state.timestamps).map((timestamp) => (
            <li key={timestamp.toISOString()}>{timestamp.toLocaleString()}</li>
          ))}
        </ul>
      </div>
      <div>
        <span>New Timestamp (start):</span>
        <DateTimePicker
          disableClock
          format="dd-MM-yy hh:mm"
          onChange={(date) => {
            if (date != null) {
              dispatch({
                type: PollActionKind.SET_TIMESTAMP,
                timestamp: date,
              });
            }
          }}
          value={state.selectedTimestamp}
        />
        <button
          onClick={() => dispatch({ type: PollActionKind.ADD_TIMESTAMP })}
        >
          Add
        </button>
      </div>
      <div>
        <button onClick={async () => await createPoll(state)}>
          Create Poll
        </button>
      </div>
    </div>
  );
}

async function createPoll(state: PollState) {
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
      options: options,
    }),
  });

  if (!response.ok) {
    alert("Error creating poll");
    return;
  }

  alert("Poll created successfully");
}

export default NewPoll;
