import { useCallback, useEffect, useState } from "react";
import { Poll, PollGetResponse } from "./models";
import { Link, LoaderFunction, useLoaderData } from "react-router-dom";

export const newVoteLoader: LoaderFunction = async ({ params }) => {
  return params;
};

function NewVote() {
  const { pollId } = useLoaderData() as { pollId: string };
  const [poll, setPoll] = useState<Poll | null>(null);
  const [answers, setAnswers] = useState<Map<string, string>>(
    new Map<string, string>()
  );

  useEffect(() => {
    getPoll(pollId).then((poll) => setPoll(poll));
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

  console.log(answers);

  return (
    <div>
      <h1>New Vote</h1>
      <Link to={`/poll/${poll.id}`}>Back</Link>
      <ul>
        {poll.options.map((option) => (
          <li key={option.id}>
            {option.start.toISOString()} - {option.end.toISOString()}
            <button
              disabled={answers.get(option.id) === "unavailable"}
              onClick={() => setAnswer(option.id, "unavailable")}
            >
              Unavailable
            </button>
            <button
              disabled={answers.get(option.id) === "maybe"}
              onClick={() => setAnswer(option.id, "maybe")}
            >
              Maybe
            </button>
            <button
              disabled={answers.get(option.id) === "available"}
              onClick={() => setAnswer(option.id, "available")}
            >
              Available
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => createVote(poll, answers)}>Create</button>
    </div>
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

async function getPoll(id: string): Promise<Poll | null> {
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

  return poll.data.poll;
}

export default NewVote;
