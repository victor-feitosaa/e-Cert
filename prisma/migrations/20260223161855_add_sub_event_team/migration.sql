-- CreateTable
CREATE TABLE "SubEventTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "role" "Role",
    "userId" TEXT NOT NULL,
    "subEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubEventTeam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubEventTeam" ADD CONSTRAINT "SubEventTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubEventTeam" ADD CONSTRAINT "SubEventTeam_subEventId_fkey" FOREIGN KEY ("subEventId") REFERENCES "SubEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
