/*
  Warnings:

  - You are about to drop the column `email` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `SubeventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `SubeventParticipant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,eventId]` on the table `EventParticipant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,subEventId]` on the table `SubeventParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `EventParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SubeventParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EventParticipant" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubeventParticipant" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "EventParticipant_userId_idx" ON "EventParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_userId_eventId_key" ON "EventParticipant"("userId", "eventId");

-- CreateIndex
CREATE INDEX "SubeventParticipant_userId_idx" ON "SubeventParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SubeventParticipant_userId_subEventId_key" ON "SubeventParticipant"("userId", "subEventId");

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubeventParticipant" ADD CONSTRAINT "SubeventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
