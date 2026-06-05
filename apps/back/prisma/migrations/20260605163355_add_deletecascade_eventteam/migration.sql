-- DropForeignKey
ALTER TABLE "event_teams" DROP CONSTRAINT "event_teams_eventId_fkey";

-- AddForeignKey
ALTER TABLE "event_teams" ADD CONSTRAINT "event_teams_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
