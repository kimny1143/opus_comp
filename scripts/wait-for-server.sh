#!/bin/bash

MAX_RETRIES=30
RETRY_INTERVAL=2
HEALTH_URL="http://localhost:3000/api/health"

echo "Waiting for server to be ready..."
for i in $(seq 1 $MAX_RETRIES); do
  response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
  if [ "$response" = "200" ]; then
    echo "Server is ready!"
    exit 0
  fi
  echo "Attempt $i of $MAX_RETRIES: Server not ready yet (status: $response)"
  sleep $RETRY_INTERVAL
done

echo "Server failed to start within the timeout period"
exit 1 