#!/usr/bin/env bash

set -e

yarn
yarn generate
yarn build

mkdir -p ./bin
go mod tidy
go generate -v ./...
go build -o ./bin -v ./...
