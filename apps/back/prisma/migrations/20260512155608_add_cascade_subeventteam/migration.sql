-- DropForeignKey
ALTER TABLE "sub_event_teams" DROP CONSTRAINT "sub_event_teams_subEventId_fkey";

-- AddForeignKey
ALTER TABLE "sub_event_teams" ADD CONSTRAINT "sub_event_teams_subEventId_fkey" FOREIGN KEY ("subEventId") REFERENCES "SubEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
