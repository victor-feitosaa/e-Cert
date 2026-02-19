/*
  Warnings:

  - You are about to drop the column `function` on the `EventTeam` table. All the data in the column will be lost.
  - Added the required column `job` to the `EventTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventTeam" DROP COLUMN "function",
ADD COLUMN     "job" TEXT NOT NULL;
