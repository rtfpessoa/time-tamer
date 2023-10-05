FROM golang:1.21-alpine as build-go

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY server server
RUN mkdir -p ./bin && \
  go generate -v ./... && \
  go build -v -o ./bin -ldflags="-s -w" ./...

RUN chmod +x ./bin/server

FROM node:20-alpine as build-js

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY .env .
COPY tsconfig.json .
COPY public public

COPY server/api/api-specification.yml server/api/api-specification.yml
RUN mkdir -p src && \
  yarn generate

COPY src src
RUN yarn build

FROM scratch

LABEL org.opencontainers.image.source=https://github.com/rtfpessoa/roodle
LABEL org.opencontainers.image.description="Roodle is a simple application that allows you to schedule group event with other people."
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

COPY --from=build-go --chmod=0777 /app/bin/server /app/bin/server
COPY --from=build-go /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build-js /app/resources /app/resources

ENTRYPOINT [ "/app/bin/server" ]
