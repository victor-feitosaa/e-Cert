/*
  Warnings:

  - You are about to drop the `EventTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubEventTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventTeam" DROP CONSTRAINT "EventTeam_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventTeam" DROP CONSTRAINT "EventTeam_userId_fkey";

-- DropForeignKey
ALTER TABLE "SubEventTeam" DROP CONSTRAINT "SubEventTeam_subEventId_fkey";

-- DropForeignKey
ALTER TABLE "SubEventTeam" DROP CONSTRAINT "SubEventTeam_userId_fkey";

-- AlterTable
ALTER TABLE "SubEvent" ALTER COLUMN "date" DROP NOT NULL;

-- DropTable
DROP TABLE "EventTeam";

-- DropTable
DROP TABLE "SubEventTeam";

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "date_start" TIMESTAMP(3) NOT NULL,
    "date_end" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "subEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "role" "SystemRole",
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_event_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "role" "SystemRole",
    "userId" TEXT NOT NULL,
    "subEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_event_teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Section_subEventId_idx" ON "Section"("subEventId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_subEventId_fkey" FOREIGN KEY ("subEventId") REFERENCES "SubEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_teams" ADD CONSTRAINT "event_teams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_teams" ADD CONSTRAINT "event_teams_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_event_teams" ADD CONSTRAINT "sub_event_teams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_event_teams" ADD CONSTRAINT "sub_event_teams_subEventId_fkey" FOREIGN KEY ("subEventId") REFERENCES "SubEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
