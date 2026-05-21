#!/bin/sh
set -e
pnpm --filter @repo/web build
cp -r apps/web/dist dist
ls dist | head -5
