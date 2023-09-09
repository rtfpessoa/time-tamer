import { rest } from "msw";

export const handlers = [
  rest.get("/api/v1/me", async (req, res, ctx) => {
    return res(
      ctx.json({
        id: "8572323423",
        email: "my-email@roodle.com",
      })
    );
  }),
  rest.post("/api/v1/poll", async (req, res, ctx) => {
    const date1S = new Date();
    date1S.setHours(6, 0, 0, 0);
    const date1E = new Date();
    date1E.setHours(8, 0, 0, 0);
    const date2S = new Date();
    date2S.setHours(2, 0, 0, 0);
    const date2E = new Date();
    date2E.setHours(4, 0, 0, 0);
    return res(
      ctx.json({
        data: {
          poll: {
            id: "asasasa",
            title: "My nice title",
            description:
              "Such a great and nice description for my amazing event",
            location: "Machado's house",
            options: [
              {
                id: "bhjgh675",
                start: date1S,
                end: date1E,
              },
              {
                id: "assass06",
                start: date2S,
                end: date2E,
              },
            ],
          },
          availabilities: [
            {
              poll_id: "asasasa",
              account_id: 1,
              account_email: "rtfrodrigo@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "available",
                },
                {
                  option_id: "assass06",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asasasa",
              account_id: 2,
              account_email: "daniel.reigada@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "maybe",
                },
                {
                  option_id: "assass06",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asasasa",
              account_id: 3,
              account_email: "rvcortes92@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "available",
                },
                {
                  option_id: "assass06",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asasasa",
              account_id: 4,
              account_email: "ines.bpinto@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "unavailable",
                },
                {
                  option_id: "assass06",
                  answer: "maybe",
                },
              ],
            },
          ],
        },
      })
    );
  }),
  rest.get("/api/v1/poll/asasasa", async (req, res, ctx) => {
    const date1S = new Date();
    date1S.setHours(6, 0, 0, 0);
    const date1E = new Date();
    date1E.setHours(8, 0, 0, 0);
    const date2S = new Date();
    date2S.setHours(2, 0, 0, 0);
    const date2E = new Date();
    date2E.setHours(4, 0, 0, 0);
    return res(
      ctx.json({
        data: {
          poll: {
            id: "asasasa",
            title: "My nice title",
            description:
              "Such a great and nice description for my amazing event",
            location: "Machado's house",
            options: [
              {
                id: "bhjgh675",
                start: date1S,
                end: date1E,
              },
              {
                id: "assass06",
                start: date2S,
                end: date2E,
              },
            ],
          },
          availabilities: [
            {
              poll_id: "asasasa",
              account_id: 1,
              account_email: "rtfrodrigo@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "available",
                },
                {
                  option_id: "assass06",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asasasa",
              account_id: 2,
              account_email: "daniel.reigada@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "maybe",
                },
                {
                  option_id: "assass06",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asasasa",
              account_id: 3,
              account_email: "rvcortes92@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "available",
                },
                {
                  option_id: "assass06",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asasasa",
              account_id: 4,
              account_email: "ines.bpinto@gmail.com",
              availabilities: [
                {
                  option_id: "bhjgh675",
                  answer: "unavailable",
                },
                {
                  option_id: "assass06",
                  answer: "maybe",
                },
              ],
            },
          ],
        },
      })
    );
  }),
  rest.get("/api/v1/poll/asdas8d7asn", async (req, res, ctx) => {
    const date1S = new Date();
    date1S.setHours(6, 0, 0, 0);
    const date1E = new Date();
    date1E.setHours(8, 0, 0, 0);
    const date2S = new Date();
    date2S.setHours(2, 0, 0, 0);
    const date2E = new Date();
    date2E.setHours(4, 0, 0, 0);
    return res(
      ctx.json({
        data: {
          poll: {
            id: "asdas8d7asn",
            options: [
              {
                id: "ojhbgd6d98",
                start: date1S,
                end: date1E,
              },
            ],
          },
          availabilities: [
            {
              poll_id: "asdas8d7asn",
              account_id: 1,
              account_email: "rtfrodrigo@gmail.com",
              availabilities: [
                {
                  option_id: "ojhbgd6d98",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asdas8d7asn",
              account_id: 2,
              account_email: "daniel.reigada@gmail.com",
              availabilities: [
                {
                  option_id: "ojhbgd6d98",
                  answer: "maybe",
                },
              ],
            },
            {
              poll_id: "asdas8d7asn",
              account_id: 3,
              account_email: "rvcortes92@gmail.com",
              availabilities: [
                {
                  option_id: "ojhbgd6d98",
                  answer: "available",
                },
              ],
            },
            {
              poll_id: "asdas8d7asn",
              account_id: 4,
              account_email: "ines.bpinto@gmail.com",
              availabilities: [
                {
                  option_id: "ojhbgd6d98",
                  answer: "unavailable",
                },
              ],
            },
          ],
        },
      })
    );
  }),
  rest.get("/api/v1/poll", async (req, res, ctx) => {
    const date1S = new Date();
    date1S.setHours(6, 0, 0, 0);
    const date1E = new Date();
    date1E.setHours(8, 0, 0, 0);
    const date2S = new Date();
    date2S.setHours(2, 0, 0, 0);
    const date2E = new Date();
    date2E.setHours(4, 0, 0, 0);
    return res(
      ctx.json({
        data: [
          {
            id: "asdas8d7asn",
            options: [
              {
                id: "ojhbgd6d98",
                start: date1S,
                end: date1E,
              },
            ],
          },
          {
            id: "asasasa",
            title: "My nice title",
            description:
              "Such a great and nice description for my amazing event",
            location: "Machado's house",
            options: [
              {
                id: "bhjgh675",
                start: date1S,
                end: date1E,
              },
              {
                id: "assass06",
                start: date2S,
                end: date2E,
              },
            ],
          },
        ],
      })
    );
  }),
];
