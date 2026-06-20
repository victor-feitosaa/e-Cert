/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `job` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Certificate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hash]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,eventId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,subEventId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workload` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Certificate_eventId_idx";

-- DropIndex
DROP INDEX "Certificate_subEventId_idx";

-- DropIndex
DROP INDEX "Certificate_userId_idx";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "createdAt",
DROP COLUMN "job",
DROP COLUMN "name",
DROP COLUMN "template",
DROP COLUMN "updatedAt",
ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "issued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "participantId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Participante',
ADD COLUMN     "workload" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_hash_key" ON "Certificate"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_eventId_key" ON "Certificate"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_subEventId_key" ON "Certificate"("userId", "subEventId");
