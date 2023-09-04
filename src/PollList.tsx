import { useEffect, useState } from "react";
import { Poll, PollListResponse } from "./models";
import { Link } from "react-router-dom";

function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    listPolls().then((polls) => setPolls(polls));
  }, []);

  return (
    <div>
      <h1>Polls</h1>
      <Link to={`/poll/new`}>New Poll</Link>
      <ul>
        {polls.map((poll) => (
          <li key={poll.id}>
            <div>
              <span>{poll.id}</span>
              <span> | </span>
              <Link to={`/poll/${poll.id}`}>Go</Link>
              <span> | </span>
              <Link to={`/poll/${poll.id}/vote`}>Vote</Link>
            </div>
            <div>
              <ul>
                {poll.options.map((option) => (
                  <li key={option.id}>
                    {option.start.toISOString()} - {option.end.toISOString()}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
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
