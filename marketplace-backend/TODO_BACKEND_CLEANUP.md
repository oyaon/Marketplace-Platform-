# Backend Cleanup Tasks

## Task 1: Remove MongoDB Leftovers
- [x] Delete src/config/db.js (MongoDB connection file)

## Task 2: Fix Request Status Enum
- [x] Update schema.prisma with RequestStatus enum
- [x] Update Request model to use enum
- [x] Run npx prisma db push --accept-data-loss (schema updated)
- [x] Run npx prisma generate (Prisma Client generated to ./node_modules/@prisma/client)

## Task 3: Enforce Project State Transition
- [x] Update request.controller.js to properly handle state transitions
  - Project status set to ASSIGNED
  - Non-selected requests rejected with proper condition using solverId: { not: solverId }



