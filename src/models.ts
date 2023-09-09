export type PollListResponse = {
  data: Poll[];
};

export type Poll = {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  options: Option[];
};

export type Option = {
  id: string;
  start: Date;
  end: Date;
};

export type NewPollResponse = {
  data: Poll;
};

export type NewVoteResponse = {
  data: PollAccountAvailability;
};

export type PollGetResponse = {
  data: PollWithAvailabilities;
};

export type PollWithAvailabilities = {
  poll: Poll;
  availabilities: PollAccountAvailability[];
};

export type PollAccountAvailability = {
  poll_id: string;
  account_id: number;
  account_email: string;
  availabilities: Answer[];
};

export type Answer = {
  option_id: string;
  answer: string;
};

export type ResponseError = {
  error: string;
};
