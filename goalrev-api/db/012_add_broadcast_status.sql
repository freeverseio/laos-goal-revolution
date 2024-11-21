

--ALTER TABLE teams DROP COLUMN broadcast_status;

CREATE TYPE public."broadcast_status_type" AS ENUM (
	'pending',
	'success',
	'failed'
);

ALTER TABLE players ADD COLUMN broadcast_status public."broadcast_status_type" DEFAULT NULL;