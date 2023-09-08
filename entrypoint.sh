#!/usr/bin/env bash

set -e

sed -i 's/api_key: fake-api-key/api_key: '"$DD_API_KEY"'/g' /etc/datadog-agent/datadog.yaml

service datadog-agent start

/app/bin/app
