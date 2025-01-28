ALTER TABLE "players" DROP COLUMN "evolve_status";
DROP TYPE public."evolve_status_type";

ALTER TABLE "players" ADD COLUMN "updated_at" TIMESTAMP;