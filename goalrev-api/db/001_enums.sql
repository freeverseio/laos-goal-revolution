CREATE TYPE public."auction_state" AS ENUM (
	'started',
	'failed',
	'cancelled',
	'ended',
	'asset_frozen',
	'paying',
	'withadrable_by_seller',
	'withadrable_by_buyer',
	'validation');

-- DROP TYPE public."bid_state";

CREATE TYPE public."bid_state" AS ENUM (
	'accepted',
	'paying',
	'paid',
	'failed');

-- DROP TYPE public."match_event_type";

CREATE TYPE public."match_event_type" AS ENUM (
	'attack',
	'yellow_card',
	'red_card',
	'injury_soft',
	'injury_hard',
	'substitution');

-- DROP TYPE public."match_state";

CREATE TYPE public."match_state" AS ENUM (
	'begin',
	'half',
	'end',
	'cancelled');

-- DROP TYPE public."offer_state";

CREATE TYPE public."offer_state" AS ENUM (
	'started',
	'failed',
	'cancelled',
	'ended',
	'accepted');

-- DROP TYPE public."playstore_order_state";

CREATE TYPE public."playstore_order_state" AS ENUM (
	'open',
	'acknowledged',
	'complete',
	'refunding',
	'refunded',
	'failed');


CREATE TYPE inbox_category AS ENUM ('offer', 'auction', 'promo', 'news', 'incident', 'welcome');
