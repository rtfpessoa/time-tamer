#!/usr/bin/env bash

set -e

yarn
yarn build

go build -o ./bin/app
