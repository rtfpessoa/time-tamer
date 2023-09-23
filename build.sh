#!/usr/bin/env bash

set -e

yarn
yarn build

mkdir -p ./bin
go mod tidy
go build -o ./bin -v ./...
