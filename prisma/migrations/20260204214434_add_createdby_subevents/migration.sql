/*
  Warnings:

  - Added the required column `createdBy` to the `SubEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubEvent" ADD COLUMN     "createdBy" TEXT NOT NULL;
