#!/bin/bash
set -e

# Install JS dependencies (idempotent)
npm install

# Sync the Drizzle schema to the database (no-op when already in sync)
npm run db:push
