/*
  Warnings:

  - You are about to drop the column `createdBy` on the `SubEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "SubEvent" DROP COLUMN "createdBy";
