/*
  Warnings:

  - A unique constraint covering the columns `[userId,eventId,subEventId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Certificate_userId_eventId_key";

-- DropIndex
DROP INDEX "Certificate_userId_subEventId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_eventId_subEventId_key" ON "Certificate"("userId", "eventId", "subEventId");
