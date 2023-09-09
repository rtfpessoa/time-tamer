#!/usr/bin/env bash

set -e

sed -i 's/api_key: fake-api-key/api_key: '"$DD_API_KEY"'/g' /etc/datadog-agent/datadog.yaml
sed -i 's/# logs_enabled: false/logs_enabled: true/g' /etc/datadog-agent/datadog.yaml
sed -i 's/# env: <environment name>/env: prod/g' /etc/datadog-agent/datadog.yaml

mkdir -p /var/log/roodle

service datadog-agent start

/app/bin/app
