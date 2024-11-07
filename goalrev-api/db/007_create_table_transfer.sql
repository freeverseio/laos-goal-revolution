CREATE TABLE public.last_transfer (
  id SERIAL PRIMARY KEY,
	block_number int8 NOT NULL,
	tx_hash varchar(255) NOT NULL,
	timestamp timestamp NOT NULL
);
-- index for block_number
CREATE INDEX idx_last_transfer_block_number ON public.last_transfer (block_number);
