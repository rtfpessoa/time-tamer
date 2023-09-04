export type PollListResponse = {
  data: Poll[];
};

export type Poll = {
  id: string;
  options: Option[];
};

export type Option = {
  id: string;
  start: Date;
  end: Date;
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
  availabilities: Answer[];
};

export type Answer = {
  option_id: string;
  answer: string;
};
