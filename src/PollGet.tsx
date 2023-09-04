import { useEffect, useState } from "react";
import { PollGetResponse, PollWithAvailabilities } from "./models";
import { Link, LoaderFunction, useLoaderData } from "react-router-dom";

export const pollGetLoader: LoaderFunction = async ({ params }) => {
  return params;
};

function PollGet() {
  const { pollId } = useLoaderData() as { pollId: string };
  const [poll, setPoll] = useState<PollWithAvailabilities | null>(null);

  useEffect(() => {
    getPoll(pollId).then((poll) => setPoll(poll));
  }, [pollId]);

  if (poll == null) {
    return null;
  }

  const answers = new Map<string, string[]>();
  poll.availabilities.forEach((pollAccountAvailability) => {
    pollAccountAvailability.availabilities.forEach((availability) => {
      answers.set(availability.option_id, [
        ...(answers.get(availability.option_id) ?? []),
        availability.answer,
      ]);
    });
  });

  return (
    <div>
      <h1>Poll</h1>
      <div>
        <span>{pollId}</span>
        <span> | </span>
        <Link to={`/poll/${pollId}/vote`}>Vote</Link>
        <span> | </span>
        <Link to={`/poll`}>Back</Link>
      </div>
      <ul>
        {poll.poll.options.map((option) => (
          <li key={option.id}>
            {option.start.toISOString()} - {option.end.toISOString()}
            {Array.from(
              (answers.get(option.id) ?? []).reduce((group, answer) => {
                return group.set(answer, (group.get(answer) ?? 0) + 1);
              }, new Map<string, number>())
            ).map(([key, value]) => (
              <div>
                {key}: {value}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
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

export default PollGet;
