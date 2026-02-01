/*
  Warnings:

  - You are about to drop the column `userId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `subEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "subEvent" DROP CONSTRAINT "subEvent_userId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "userId",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "subEvent";

-- CreateTable
CREATE TABLE "SubEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "SubEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubEvent" ADD CONSTRAINT "SubEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubEvent" ADD CONSTRAINT "SubEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
