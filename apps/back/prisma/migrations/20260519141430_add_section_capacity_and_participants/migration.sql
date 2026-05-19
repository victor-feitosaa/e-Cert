-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "capacity" INTEGER;

-- CreateTable
CREATE TABLE "SectionParticipant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "SectionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SectionParticipant_sectionId_idx" ON "SectionParticipant"("sectionId");

-- CreateIndex
CREATE INDEX "SectionParticipant_userId_idx" ON "SectionParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionParticipant_userId_sectionId_key" ON "SectionParticipant"("userId", "sectionId");

-- AddForeignKey
ALTER TABLE "SectionParticipant" ADD CONSTRAINT "SectionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionParticipant" ADD CONSTRAINT "SectionParticipant_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
