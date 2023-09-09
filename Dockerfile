FROM debian:stable as build

ENV PATH=$PATH:/usr/local/go/bin

WORKDIR /app

RUN apt-get -y update && \
  apt-get -y install ca-certificates curl gnupg && \
  mkdir -p /etc/apt/keyrings && \
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
  echo 'deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main' | tee /etc/apt/sources.list.d/nodesource.list && \
  apt-get -y update && \
  apt-get -y install nodejs && \
  npm install -g yarn

RUN rm -rf /usr/local/go && \
  curl -fsSL https://go.dev/dl/go1.21.1.linux-amd64.tar.gz -o go1.21.1.linux-amd64.tar.gz && \
  tar -C /usr/local -xzf go1.21.1.linux-amd64.tar.gz && \
  rm -f go1.21.1.linux-amd64.tar.gz

COPY . /app

RUN yarn && yarn build

RUN go mod tidy && \
  # go build -tags appsec -o ./bin/app && \
  go build -o ./bin/app && \
  chmod +x ./bin/app

FROM debian:stable

ENV DD_SITE "datadoghq.eu"
ENV DD_APPSEC_ENABLED true
ENV DD_HOSTNAME roodle
ENV DD_HOSTNAME_TRUST_UTS_NAMESPACE true

WORKDIR /app

COPY --from=build /app/resources /app/resources
COPY --from=build --chmod=0777 /app/bin/app /app/bin/app

RUN apt-get -y update && \
  apt-get -y install curl && \
  export DD_API_KEY=fake-api-key && \
  export DD_SITE="datadoghq.eu" && \
  bash -c "$(curl -fsSL https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

COPY --chmod=0777 ./conf.d/go.d /etc/datadog-agent/conf.d/go.d

COPY --chmod=0777 entrypoint.sh /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
