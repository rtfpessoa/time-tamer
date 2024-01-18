#!/usr/bin/env bash

set -e

yarn
yarn generate
yarn build

rm -rf ./bin
mkdir -p ./bin
go mod tidy
go generate -v ./...
go build -v -o ./bin --tags "appsec" -ldflags="-s -w" ./...
