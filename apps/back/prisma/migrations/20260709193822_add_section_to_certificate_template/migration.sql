-- DropForeignKey
ALTER TABLE "CertificateTemplate" DROP CONSTRAINT "CertificateTemplate_eventId_fkey";

-- DropForeignKey
ALTER TABLE "CertificateTemplate" DROP CONSTRAINT "CertificateTemplate_subEventId_fkey";

-- AlterTable
ALTER TABLE "CertificateTemplate" ADD COLUMN     "sectionId" TEXT;

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_subEventId_fkey" FOREIGN KEY ("subEventId") REFERENCES "SubEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
