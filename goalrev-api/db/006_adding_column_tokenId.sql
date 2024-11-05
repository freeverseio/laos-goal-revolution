ALTER TABLE players 
ADD COLUMN token_id TEXT DEFAULT NULL;

CREATE TYPE public."mint_status_type" AS ENUM (
	'not_minted',
	'pending',
	'success',
	'failed'
);

ALTER TABLE teams 
ADD COLUMN mint_status public."mint_status_type" DEFAULT 'not_minted';
