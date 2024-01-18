FROM golang:1.21-alpine as build-go

ARG SERVICE_VERSION
ENV DD_VERSION=$SERVICE_VERSION

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY server server
RUN mkdir -p ./bin && \
  go generate -v ./... && \
  go build -v -o ./bin --tags "appsec" -ldflags="-s -w" ./...

RUN chmod +x ./bin/server

FROM node:20-alpine as build-js

ARG SERVICE_VERSION
ENV DD_VERSION=$SERVICE_VERSION

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

FROM alpine:3 as libs

ARG SERVICE_VERSION

RUN apk update && \
  apk add --no-cache ca-certificates libc6-compat && \
  rm -rf /var/cache/apk/*

# FROM scratch

LABEL org.opencontainers.image.source=https://github.com/rtfpessoa/roodle
LABEL org.opencontainers.image.description="Roodle is a simple application that allows you to schedule group event with other people."
LABEL org.opencontainers.image.licenses=MIT
LABEL com.datadoghq.ad.logs='[{"service": "roodle-api"}]'
LABEL com.datadoghq.tags.service="roodle-api"
LABEL com.datadoghq.tags.version="$SERVICE_VERSION"
LABEL com.datadoghq.tags.env="prod"

WORKDIR /app

COPY --from=build-go --chmod=0777 /app/bin/server /app/bin/server
COPY --from=build-go /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build-js /app/resources /app/resources

# Datadog Tracer Setup
COPY --from=datadog/serverless-init:1 --chmod=0777  /datadog-init /app/datadog-init
# COPY --from=libs  /lib/ld-linux-*.so.1 /lib/
# COPY --from=libs  /lib/ld-musl-*.so.1 /lib/
# COPY --from=libs  /lib/libresolv.so.2 /lib/
# COPY --from=libs  /lib/libucontext.so.1 /lib/
# COPY --from=libs  /usr/lib/libobstack.so.1 /usr/lib/
ENV DD_SERVICE=roodle-api
ENV DD_ENV=prod
ENV DD_SITE=datadoghq.eu
ENV DD_TRACE_ENABLED=true
ENV DD_TRACE_PROPAGATION_STYLE=tracecontext,Datadog
ENV DD_TRACE_SAMPLE_RATE=1.0
ENV DD_APPSEC_ENABLED=1
ENV DD_LOGS_ENABLED=true
ENV DD_LOGS_INJECTION=true
ENV DD_CUSTOM_METRICS_ENABLED=true
ENV DD_TRACE_STARTUP_LOGS=true
ENV DD_TRACE_CLIENT_IP_ENABLED=true
ENV DD_PROFILING_WAIT_PROFILE=true
ENV DD_PROFILING_EXECUTION_TRACE_ENABLED=true
ENV DD_PROFILING_EXECUTION_TRACE_PERIOD=15m
ENV DD_TRACE_GIN_ANALYTICS_ENABLED=true
ENV DD_VERSION=$SERVICE_VERSION
# ENV DD_API_KEY= # Set in the render.com environment

CMD [ "/app/datadog-init", "/app/bin/server" ]
