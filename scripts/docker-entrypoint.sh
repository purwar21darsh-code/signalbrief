#!/bin/sh
set -eu
npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
exec node_modules/.bin/next start
