#!/usr/bin/env bash

set -e

mkdir -p /var/log/roodle

# Clean previous setup logs
rm -f /var/log/datadog/agent.log
touch /var/log/datadog/agent.log
# Fix API key
sed -i "/fake-api-key/capi_key: $DD_API_KEY" /etc/datadog-agent/datadog.yaml
service datadog-agent start || (cat /var/log/datadog/agent.log && exit 1)

# Wait for agent to start and dump first logs
sleep 10s
cat /var/log/datadog/agent.log

/app/bin/app
