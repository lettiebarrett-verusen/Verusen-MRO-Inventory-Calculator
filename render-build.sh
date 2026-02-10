#!/bin/bash
set -e
npm install
npx drizzle-kit push
npx tsx script/build.ts
