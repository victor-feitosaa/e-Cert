/*
  Warnings:

  - You are about to drop the column `permissions` on the `event_permissions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INATIVE', 'PARCIAL');

-- AlterEnum
ALTER TYPE "EventRole" ADD VALUE 'ATTENDEE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "event_permissions" DROP COLUMN "permissions",
ALTER COLUMN "role" DROP DEFAULT;

-- DropEnum
DROP TYPE "EventPermissionType";
