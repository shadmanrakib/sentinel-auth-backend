#!/bin/sh
# docker-entrypoint.sh

# Create a runtime .env.local file with the current environment variables
echo "NEXT_PUBLIC_SENTINEL_API_URL=$NEXT_PUBLIC_SENTINEL_API_URL" > .env
echo "NEXT_PUBLIC_SENTINEL_UI_URL=$NEXT_PUBLIC_SENTINEL_UI_URL" >> .env
echo "NEXT_PUBLIC_SENTINEL_CLIENT_ID=$NEXT_PUBLIC_SENTINEL_CLIENT_ID" >> .env
echo "NEXT_PUBLIC_SENTINEL_REDIRECT_URI=$NEXT_PUBLIC_SENTINEL_REDIRECT_URI" >> .env

# Execute the provided command
exec "$@"