ALTER TABLE players 
ADD COLUMN token_id TEXT DEFAULT NULL;

--ALTER TABLE teams DROP COLUMN mint_status;

CREATE TYPE public."mint_status_type" AS ENUM (
	'not_minted',
	'pending',
	'minting',
	'success',
	'failed'
);

ALTER TABLE teams 
ADD COLUMN mint_status public."mint_status_type" DEFAULT 'not_minted';

ALTER TABLE teams 
ADD COLUMN mint_updated_at TIMESTAMP DEFAULT NULL;