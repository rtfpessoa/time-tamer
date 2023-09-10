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
  go build -o ./bin/app && \
  chmod +x ./bin/app

FROM scratch

WORKDIR /app

COPY --from=build /app/resources /app/resources
COPY --from=build --chmod=0777 /app/bin/app /app/bin/app

ENTRYPOINT [ "/app/bin/app" ]
