FROM golang:1.21-alpine as build-go

WORKDIR /modules/api

COPY modules/api/go.mod .
COPY modules/api/go.sum .
RUN go mod download

COPY modules/api/api-specification.yml .
RUN go generate -v ./...

COPY modules/api/src src
RUN mkdir -p ./bin && \
  go build -v -o ./bin -ldflags="-s -w" ./...

RUN chmod +x ./bin/src

FROM node:20-alpine as build-js

WORKDIR /modules/frontend

COPY modules/frontend/package.json .
COPY modules/frontend/yarn.lock .
RUN yarn

COPY modules/frontend/.env .
COPY modules/frontend/tsconfig.json .
COPY modules/frontend/public public

COPY modules/api/api-specification.yml /modules/api/api-specification.yml
RUN mkdir -p src && \
  yarn generate

COPY modules/frontend/src src
RUN yarn build

FROM scratch

LABEL org.opencontainers.image.source=https://github.com/rtfpessoa/roodle
LABEL org.opencontainers.image.description="Roodle is a simple application that allows you to schedule group event with other people."
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

COPY --from=build-go --chmod=0777 /modules/api/bin/src /app/bin/server
COPY --from=build-go /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build-js /modules/frontend/resources /app/resources

ENTRYPOINT [ "/app/bin/server" ]
