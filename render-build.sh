#!/bin/bash
set -e
npm install --include=dev
npx drizzle-kit push
npx tsx script/build.ts
