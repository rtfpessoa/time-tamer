FROM golang:1.21-alpine as build-go

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY server .
RUN go build -o bin/app -ldflags="-s -w"

RUN chmod +x ./bin/app

FROM node:20-alpine as build-js

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY .env .
COPY tsconfig.json .
COPY public public
COPY src src
RUN yarn build

FROM scratch

WORKDIR /app

COPY --from=build-go --chmod=0777 /app/bin/app /app/bin/app
COPY --from=build-js /app/resources /app/resources

ENTRYPOINT [ "/app/bin/app" ]
