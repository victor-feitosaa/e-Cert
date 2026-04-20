-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "banner" TEXT,
ADD COLUMN     "capacity" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "date_end" TIMESTAMP(3),
ADD COLUMN     "date_start" TIMESTAMP(3);
