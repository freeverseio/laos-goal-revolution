CREATE TYPE public."evolve_status_type" AS ENUM (
	'pending',
	'success',
	'failed'
);

ALTER TABLE "players" ADD COLUMN "evolve_status" public."evolve_status_type" DEFAULT NULL;

ALTER TABLE "players" ADD COLUMN "evolved_at" TIMESTAMP;