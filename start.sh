#!/bin/sh
set -e

# Ensure DATABASE_URL is available to Prisma CLI
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL=\"$DATABASE_URL\"" > .env
fi

echo "Running migrations..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "Starting server..."
exec node server.js
