#!/bin/bash
npx prisma generate
next dev -p 3000 -H 0.0.0.0
