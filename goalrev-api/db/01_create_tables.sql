
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

-- DROP TYPE public."_auction_state";

CREATE TYPE public."_auction_state" (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public."auction_state",
	DELIMITER = ',');

-- DROP TYPE public."_bid_state";

CREATE TYPE public."_bid_state" (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public."bid_state",
	DELIMITER = ',');

-- DROP TYPE public."_match_event_type";

CREATE TYPE public."_match_event_type" (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public."match_event_type",
	DELIMITER = ',');

-- DROP TYPE public."_match_state";

CREATE TYPE public."_match_state" (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public."match_state",
	DELIMITER = ',');

-- DROP TYPE public."_offer_state";

CREATE TYPE public."_offer_state" (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public."offer_state",
	DELIMITER = ',');

-- DROP TYPE public."_playstore_order_state";

CREATE TYPE public."_playstore_order_state" (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public."playstore_order_state",
	DELIMITER = ',');
-- public.params definition

-- Drop table

-- DROP TABLE public.params;

CREATE TABLE public.params (
	"name" text NOT NULL,
	value text NOT NULL,
	CONSTRAINT params_pkey PRIMARY KEY (name)
);


-- public.playstore_orders definition

-- Drop table

-- DROP TABLE public.playstore_orders;

CREATE TABLE public.playstore_orders (
	order_id text NOT NULL,
	package_name text NOT NULL,
	product_id text NOT NULL,
	purchase_token text NOT NULL,
	player_id text NOT NULL,
	team_id text NOT NULL,
	signature text NOT NULL,
	state public."playstore_order_state" NOT NULL,
	state_extra text NOT NULL,
	CONSTRAINT playstore_orders_pkey PRIMARY KEY (purchase_token)
);


-- public.shop_items definition

-- Drop table

-- DROP TABLE public.shop_items;

CREATE TABLE public.shop_items (
	"uuid" uuid NOT NULL,
	"name" text NOT NULL,
	url text NOT NULL,
	"type" int4 NOT NULL,
	quantity int4 NOT NULL,
	price int4 NOT NULL,
	CONSTRAINT shop_items_pkey PRIMARY KEY (uuid)
);


-- public.timezones definition

-- Drop table

-- DROP TABLE public.timezones;

CREATE TABLE public.timezones (
	timezone_idx int4 NOT NULL,
	CONSTRAINT timezones_pkey PRIMARY KEY (timezone_idx)
);


-- public.verses definition

-- Drop table

-- DROP TABLE public.verses;

CREATE TABLE public.verses (
	verse_number int8 NOT NULL,
	root text NOT NULL,
	CONSTRAINT verses_pkey PRIMARY KEY (verse_number)
);


-- public.countries definition

-- Drop table

-- DROP TABLE public.countries;

CREATE TABLE public.countries (
	timezone_idx int4 NOT NULL,
	country_idx int4 NOT NULL,
	CONSTRAINT countries_pkey PRIMARY KEY (timezone_idx, country_idx),
	CONSTRAINT countries_timezone_idx_fkey FOREIGN KEY (timezone_idx) REFERENCES public.timezones(timezone_idx)
);


-- public.leagues definition

-- Drop table

-- DROP TABLE public.leagues;

CREATE TABLE public.leagues (
	timezone_idx int4 NOT NULL,
	country_idx int4 NOT NULL,
	league_idx int4 NOT NULL,
	CONSTRAINT leagues_pkey PRIMARY KEY (timezone_idx, country_idx, league_idx),
	CONSTRAINT leagues_timezone_idx_country_idx_fkey FOREIGN KEY (timezone_idx,country_idx) REFERENCES public.countries(timezone_idx,country_idx)
);


-- public.playstore_orders_histories definition

-- Drop table

-- DROP TABLE public.playstore_orders_histories;

CREATE TABLE public.playstore_orders_histories (
	inserted_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	order_id text NOT NULL,
	package_name text NOT NULL,
	product_id text NOT NULL,
	purchase_token text NOT NULL,
	player_id text NOT NULL,
	team_id text NOT NULL,
	signature text NOT NULL,
	state public."playstore_order_state" NOT NULL,
	state_extra text NOT NULL,
	CONSTRAINT playstore_orders_histories_purchase_token_fkey FOREIGN KEY (purchase_token) REFERENCES public.playstore_orders(purchase_token)
);


-- public.teams definition

-- Drop table

-- DROP TABLE public.teams;

CREATE TABLE public.teams (
	team_id text NOT NULL,
	"name" text NOT NULL,
	manager_name text DEFAULT ''::text NOT NULL,
	timezone_idx int4 NOT NULL,
	country_idx int4 NOT NULL,
	"owner" text NOT NULL,
	league_idx int4 NOT NULL,
	team_idx_in_league int4 NOT NULL,
	leaderboard_position int4 DEFAULT 0 NOT NULL,
	points int4 DEFAULT 0 NOT NULL,
	w int4 DEFAULT 0 NOT NULL,
	d int4 DEFAULT 0 NOT NULL,
	l int4 DEFAULT 0 NOT NULL,
	goals_forward int4 DEFAULT 0 NOT NULL,
	goals_against int4 DEFAULT 0 NOT NULL,
	prev_perf_points text DEFAULT '0'::text NOT NULL,
	ranking_points text DEFAULT '0'::text NOT NULL,
	training_points int4 DEFAULT 0 NOT NULL,
	tactic text DEFAULT ''::text NOT NULL,
	match_log text NOT NULL,
	is_zombie bool DEFAULT false NOT NULL,
	promo_timeout int4 DEFAULT 0 NOT NULL,
	CONSTRAINT teams_pkey PRIMARY KEY (team_id),
	CONSTRAINT teams_timezone_idx_country_idx_fkey FOREIGN KEY (timezone_idx,country_idx) REFERENCES public.countries(timezone_idx,country_idx),
	CONSTRAINT teams_timezone_idx_country_idx_league_idx_fkey FOREIGN KEY (timezone_idx,country_idx,league_idx) REFERENCES public.leagues(timezone_idx,country_idx,league_idx)
);


-- public.teams_histories definition

-- Drop table

-- DROP TABLE public.teams_histories;

CREATE TABLE public.teams_histories (
	block_number int8 NOT NULL,
	team_id text NOT NULL,
	"name" text NOT NULL,
	timezone_idx int4 NOT NULL,
	country_idx int4 NOT NULL,
	"owner" text NOT NULL,
	league_idx int4 NOT NULL,
	team_idx_in_league int4 NOT NULL,
	points int4 DEFAULT 0 NOT NULL,
	w int4 DEFAULT 0 NOT NULL,
	d int4 DEFAULT 0 NOT NULL,
	l int4 DEFAULT 0 NOT NULL,
	goals_forward int4 DEFAULT 0 NOT NULL,
	goals_against int4 DEFAULT 0 NOT NULL,
	prev_perf_points text DEFAULT '0'::text NOT NULL,
	ranking_points text DEFAULT '0'::text NOT NULL,
	training_points int4 DEFAULT 0 NOT NULL,
	tactic text DEFAULT ''::text NOT NULL,
	match_log text NOT NULL,
	is_zombie bool DEFAULT false NOT NULL,
	CONSTRAINT teams_histories_pkey PRIMARY KEY (block_number, team_id),
	CONSTRAINT teams_histories_timezone_idx_country_idx_fkey FOREIGN KEY (timezone_idx,country_idx) REFERENCES public.countries(timezone_idx,country_idx),
	CONSTRAINT teams_histories_timezone_idx_country_idx_league_idx_fkey FOREIGN KEY (timezone_idx,country_idx,league_idx) REFERENCES public.leagues(timezone_idx,country_idx,league_idx)
);


-- public.teams_props definition

-- Drop table

-- DROP TABLE public.teams_props;

CREATE TABLE public.teams_props (
	team_id text NOT NULL,
	"name" text NULL,
	last_time_logged_in timestamptz NULL,
	CONSTRAINT teams_props_pkey PRIMARY KEY (team_id),
	CONSTRAINT teams_props_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.teams_props_histories definition

-- Drop table

-- DROP TABLE public.teams_props_histories;

CREATE TABLE public.teams_props_histories (
	block_number int8 NOT NULL,
	team_id text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT teams_props_histories_pkey PRIMARY KEY (block_number, team_id),
	CONSTRAINT teams_props_histories_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.trainings definition

-- Drop table

-- DROP TABLE public.trainings;

CREATE TABLE public.trainings (
	team_id text NOT NULL,
	special_player_shirt int4 NOT NULL,
	goalkeepers_defence int4 DEFAULT 0 NOT NULL,
	goalkeepers_speed int4 DEFAULT 0 NOT NULL,
	goalkeepers_pass int4 DEFAULT 0 NOT NULL,
	goalkeepers_shoot int4 DEFAULT 0 NOT NULL,
	goalkeepers_endurance int4 DEFAULT 0 NOT NULL,
	defenders_defence int4 DEFAULT 0 NOT NULL,
	defenders_speed int4 DEFAULT 0 NOT NULL,
	defenders_pass int4 DEFAULT 0 NOT NULL,
	defenders_shoot int4 DEFAULT 0 NOT NULL,
	defenders_endurance int4 DEFAULT 0 NOT NULL,
	midfielders_defence int4 DEFAULT 0 NOT NULL,
	midfielders_speed int4 DEFAULT 0 NOT NULL,
	midfielders_pass int4 DEFAULT 0 NOT NULL,
	midfielders_shoot int4 DEFAULT 0 NOT NULL,
	midfielders_endurance int4 DEFAULT 0 NOT NULL,
	attackers_defence int4 DEFAULT 0 NOT NULL,
	attackers_speed int4 DEFAULT 0 NOT NULL,
	attackers_pass int4 DEFAULT 0 NOT NULL,
	attackers_shoot int4 DEFAULT 0 NOT NULL,
	attackers_endurance int4 DEFAULT 0 NOT NULL,
	special_player_defence int4 DEFAULT 0 NOT NULL,
	special_player_speed int4 DEFAULT 0 NOT NULL,
	special_player_pass int4 DEFAULT 0 NOT NULL,
	special_player_shoot int4 DEFAULT 0 NOT NULL,
	special_player_endurance int4 DEFAULT 0 NOT NULL,
	CONSTRAINT trainings_attackers_defence_check CHECK ((attackers_defence >= 0)),
	CONSTRAINT trainings_attackers_endurance_check CHECK ((attackers_endurance >= 0)),
	CONSTRAINT trainings_attackers_pass_check CHECK ((attackers_pass >= 0)),
	CONSTRAINT trainings_attackers_shoot_check CHECK ((attackers_shoot >= 0)),
	CONSTRAINT trainings_attackers_speed_check CHECK ((attackers_speed >= 0)),
	CONSTRAINT trainings_defenders_defence_check CHECK ((defenders_defence >= 0)),
	CONSTRAINT trainings_defenders_endurance_check CHECK ((defenders_endurance >= 0)),
	CONSTRAINT trainings_defenders_pass_check CHECK ((defenders_pass >= 0)),
	CONSTRAINT trainings_defenders_shoot_check CHECK ((defenders_shoot >= 0)),
	CONSTRAINT trainings_defenders_speed_check CHECK ((defenders_speed >= 0)),
	CONSTRAINT trainings_goalkeepers_defence_check CHECK ((goalkeepers_defence >= 0)),
	CONSTRAINT trainings_goalkeepers_endurance_check CHECK ((goalkeepers_endurance >= 0)),
	CONSTRAINT trainings_goalkeepers_pass_check CHECK ((goalkeepers_pass >= 0)),
	CONSTRAINT trainings_goalkeepers_shoot_check CHECK ((goalkeepers_shoot >= 0)),
	CONSTRAINT trainings_goalkeepers_speed_check CHECK ((goalkeepers_speed >= 0)),
	CONSTRAINT trainings_midfielders_defence_check CHECK ((midfielders_defence >= 0)),
	CONSTRAINT trainings_midfielders_endurance_check CHECK ((midfielders_endurance >= 0)),
	CONSTRAINT trainings_midfielders_pass_check CHECK ((midfielders_pass >= 0)),
	CONSTRAINT trainings_midfielders_shoot_check CHECK ((midfielders_shoot >= 0)),
	CONSTRAINT trainings_midfielders_speed_check CHECK ((midfielders_speed >= 0)),
	CONSTRAINT trainings_pkey PRIMARY KEY (team_id),
	CONSTRAINT trainings_special_player_defence_check CHECK ((special_player_defence >= 0)),
	CONSTRAINT trainings_special_player_endurance_check CHECK ((special_player_endurance >= 0)),
	CONSTRAINT trainings_special_player_pass_check CHECK ((special_player_pass >= 0)),
	CONSTRAINT trainings_special_player_shirt_check CHECK (((special_player_shirt >= '-1'::integer) AND (special_player_shirt <= 24))),
	CONSTRAINT trainings_special_player_shoot_check CHECK ((special_player_shoot >= 0)),
	CONSTRAINT trainings_special_player_speed_check CHECK ((special_player_speed >= 0)),
	CONSTRAINT trainings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.trainings_histories definition

-- Drop table

-- DROP TABLE public.trainings_histories;

CREATE TABLE public.trainings_histories (
	block_number int8 NOT NULL,
	team_id text NOT NULL,
	special_player_shirt int4 NOT NULL,
	goalkeepers_defence int4 DEFAULT 0 NOT NULL,
	goalkeepers_speed int4 DEFAULT 0 NOT NULL,
	goalkeepers_pass int4 DEFAULT 0 NOT NULL,
	goalkeepers_shoot int4 DEFAULT 0 NOT NULL,
	goalkeepers_endurance int4 DEFAULT 0 NOT NULL,
	defenders_defence int4 DEFAULT 0 NOT NULL,
	defenders_speed int4 DEFAULT 0 NOT NULL,
	defenders_pass int4 DEFAULT 0 NOT NULL,
	defenders_shoot int4 DEFAULT 0 NOT NULL,
	defenders_endurance int4 DEFAULT 0 NOT NULL,
	midfielders_defence int4 DEFAULT 0 NOT NULL,
	midfielders_speed int4 DEFAULT 0 NOT NULL,
	midfielders_pass int4 DEFAULT 0 NOT NULL,
	midfielders_shoot int4 DEFAULT 0 NOT NULL,
	midfielders_endurance int4 DEFAULT 0 NOT NULL,
	attackers_defence int4 DEFAULT 0 NOT NULL,
	attackers_speed int4 DEFAULT 0 NOT NULL,
	attackers_pass int4 DEFAULT 0 NOT NULL,
	attackers_shoot int4 DEFAULT 0 NOT NULL,
	attackers_endurance int4 DEFAULT 0 NOT NULL,
	special_player_defence int4 DEFAULT 0 NOT NULL,
	special_player_speed int4 DEFAULT 0 NOT NULL,
	special_player_pass int4 DEFAULT 0 NOT NULL,
	special_player_shoot int4 DEFAULT 0 NOT NULL,
	special_player_endurance int4 DEFAULT 0 NOT NULL,
	CONSTRAINT trainings_histories_attackers_defence_check CHECK ((attackers_defence >= 0)),
	CONSTRAINT trainings_histories_attackers_endurance_check CHECK ((attackers_endurance >= 0)),
	CONSTRAINT trainings_histories_attackers_pass_check CHECK ((attackers_pass >= 0)),
	CONSTRAINT trainings_histories_attackers_shoot_check CHECK ((attackers_shoot >= 0)),
	CONSTRAINT trainings_histories_attackers_speed_check CHECK ((attackers_speed >= 0)),
	CONSTRAINT trainings_histories_defenders_defence_check CHECK ((defenders_defence >= 0)),
	CONSTRAINT trainings_histories_defenders_endurance_check CHECK ((defenders_endurance >= 0)),
	CONSTRAINT trainings_histories_defenders_pass_check CHECK ((defenders_pass >= 0)),
	CONSTRAINT trainings_histories_defenders_shoot_check CHECK ((defenders_shoot >= 0)),
	CONSTRAINT trainings_histories_defenders_speed_check CHECK ((defenders_speed >= 0)),
	CONSTRAINT trainings_histories_goalkeepers_defence_check CHECK ((goalkeepers_defence >= 0)),
	CONSTRAINT trainings_histories_goalkeepers_endurance_check CHECK ((goalkeepers_endurance >= 0)),
	CONSTRAINT trainings_histories_goalkeepers_pass_check CHECK ((goalkeepers_pass >= 0)),
	CONSTRAINT trainings_histories_goalkeepers_shoot_check CHECK ((goalkeepers_shoot >= 0)),
	CONSTRAINT trainings_histories_goalkeepers_speed_check CHECK ((goalkeepers_speed >= 0)),
	CONSTRAINT trainings_histories_midfielders_defence_check CHECK ((midfielders_defence >= 0)),
	CONSTRAINT trainings_histories_midfielders_endurance_check CHECK ((midfielders_endurance >= 0)),
	CONSTRAINT trainings_histories_midfielders_pass_check CHECK ((midfielders_pass >= 0)),
	CONSTRAINT trainings_histories_midfielders_shoot_check CHECK ((midfielders_shoot >= 0)),
	CONSTRAINT trainings_histories_midfielders_speed_check CHECK ((midfielders_speed >= 0)),
	CONSTRAINT trainings_histories_pkey PRIMARY KEY (block_number, team_id),
	CONSTRAINT trainings_histories_special_player_defence_check CHECK ((special_player_defence >= 0)),
	CONSTRAINT trainings_histories_special_player_endurance_check CHECK ((special_player_endurance >= 0)),
	CONSTRAINT trainings_histories_special_player_pass_check CHECK ((special_player_pass >= 0)),
	CONSTRAINT trainings_histories_special_player_shirt_check CHECK (((special_player_shirt >= '-1'::integer) AND (special_player_shirt <= 24))),
	CONSTRAINT trainings_histories_special_player_shoot_check CHECK ((special_player_shoot >= 0)),
	CONSTRAINT trainings_histories_special_player_speed_check CHECK ((special_player_speed >= 0)),
	CONSTRAINT trainings_histories_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.matches definition

-- Drop table

-- DROP TABLE public.matches;

CREATE TABLE public.matches (
	timezone_idx int4 NOT NULL,
	country_idx int4 NOT NULL,
	league_idx int4 NOT NULL,
	match_day_idx int4 NOT NULL,
	match_idx int4 NOT NULL,
	home_team_id text NULL,
	visitor_team_id text NULL,
	seed text DEFAULT ''::text NOT NULL,
	home_goals int4 DEFAULT 0 NOT NULL,
	visitor_goals int4 DEFAULT 0 NOT NULL,
	home_teamsumskills int4 DEFAULT 0 NOT NULL,
	visitor_teamsumskills int4 DEFAULT 0 NOT NULL,
	state public."match_state" NOT NULL,
	state_extra text DEFAULT ''::text NOT NULL,
	start_epoch int8 NOT NULL,
	CONSTRAINT matches_pkey PRIMARY KEY (timezone_idx, country_idx, league_idx, match_day_idx, match_idx),
	CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(team_id),
	CONSTRAINT matches_timezone_idx_country_idx_league_idx_fkey FOREIGN KEY (timezone_idx,country_idx,league_idx) REFERENCES public.leagues(timezone_idx,country_idx,league_idx),
	CONSTRAINT matches_visitor_team_id_fkey FOREIGN KEY (visitor_team_id) REFERENCES public.teams(team_id)
);


-- public.matches_histories definition

-- Drop table

-- DROP TABLE public.matches_histories;

CREATE TABLE public.matches_histories (
	block_number int4 NOT NULL,
	timezone_idx int4 NOT NULL,
	country_idx int4 NOT NULL,
	league_idx int4 NOT NULL,
	match_day_idx int4 NOT NULL,
	match_idx int4 NOT NULL,
	home_team_id text NULL,
	visitor_team_id text NULL,
	seed text NOT NULL,
	home_goals int4 NOT NULL,
	visitor_goals int4 NOT NULL,
	home_teamsumskills int4 NOT NULL,
	visitor_teamsumskills int4 NOT NULL,
	state public."match_state" NOT NULL,
	state_extra text NOT NULL,
	start_epoch int8 NOT NULL,
	CONSTRAINT matches_histories_pkey PRIMARY KEY (block_number, timezone_idx, country_idx, league_idx, match_day_idx, match_idx),
	CONSTRAINT matches_histories_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(team_id),
	CONSTRAINT matches_histories_timezone_idx_country_idx_league_idx_fkey FOREIGN KEY (timezone_idx,country_idx,league_idx) REFERENCES public.leagues(timezone_idx,country_idx,league_idx),
	CONSTRAINT matches_histories_visitor_team_id_fkey FOREIGN KEY (visitor_team_id) REFERENCES public.teams(team_id)
);


-- public.players definition

-- Drop table

-- DROP TABLE public.players;

CREATE TABLE public.players (
	"name" text NOT NULL,
	player_id text NOT NULL,
	team_id text NOT NULL,
	defence int4 NOT NULL,
	speed int4 NOT NULL,
	pass int4 NOT NULL,
	shoot int4 NOT NULL,
	endurance int4 NOT NULL,
	shirt_number int4 NOT NULL,
	preferred_position text NOT NULL,
	potential int4 NOT NULL,
	day_of_birth int4 NOT NULL,
	encoded_skills text NOT NULL,
	encoded_state text NOT NULL,
	red_card bool DEFAULT false NOT NULL,
	injury_matches_left int4 DEFAULT 0 NOT NULL,
	tiredness int4 NOT NULL,
	country_of_birth text NOT NULL,
	race text NOT NULL,
	yellow_card_1st_half bool DEFAULT false NOT NULL,
	voided bool DEFAULT false NOT NULL,
	CONSTRAINT players_pkey PRIMARY KEY (player_id),
	CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);
CREATE INDEX index_players_voided ON public.players USING btree (voided);


-- public.players_histories definition

-- Drop table

-- DROP TABLE public.players_histories;

CREATE TABLE public.players_histories (
	player_id text NOT NULL,
	block_number int8 NOT NULL,
	team_id text NOT NULL,
	defence int4 NOT NULL,
	speed int4 NOT NULL,
	pass int4 NOT NULL,
	shoot int4 NOT NULL,
	endurance int4 NOT NULL,
	shirt_number int4 NOT NULL,
	preferred_position text NOT NULL,
	potential int4 NOT NULL,
	day_of_birth int4 NOT NULL,
	encoded_skills text NOT NULL,
	encoded_state text NOT NULL,
	red_card bool DEFAULT false NOT NULL,
	injury_matches_left int4 DEFAULT 0 NOT NULL,
	tiredness int4 NOT NULL,
	country_of_birth text NOT NULL,
	race text NOT NULL,
	yellow_card_1st_half bool DEFAULT false NOT NULL,
	CONSTRAINT players_histories_pkey PRIMARY KEY (block_number, player_id),
	CONSTRAINT players_histories_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(player_id),
	CONSTRAINT players_histories_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.tactics definition

-- Drop table

-- DROP TABLE public.tactics;

CREATE TABLE public.tactics (
	team_id text NOT NULL,
	tactic_id int4 NOT NULL,
	shirt_0 int4 NOT NULL,
	shirt_1 int4 NOT NULL,
	shirt_2 int4 NOT NULL,
	shirt_3 int4 NOT NULL,
	shirt_4 int4 NOT NULL,
	shirt_5 int4 NOT NULL,
	shirt_6 int4 NOT NULL,
	shirt_7 int4 NOT NULL,
	shirt_8 int4 NOT NULL,
	shirt_9 int4 NOT NULL,
	shirt_10 int4 NOT NULL,
	substitution_0_shirt int4 NOT NULL,
	substitution_0_target int4 NOT NULL,
	substitution_0_minute int4 NOT NULL,
	substitution_1_shirt int4 NOT NULL,
	substitution_1_target int4 NOT NULL,
	substitution_1_minute int4 NOT NULL,
	substitution_2_shirt int4 NOT NULL,
	substitution_2_target int4 NOT NULL,
	substitution_2_minute int4 NOT NULL,
	extra_attack_1 bool NOT NULL,
	extra_attack_2 bool NOT NULL,
	extra_attack_3 bool NOT NULL,
	extra_attack_4 bool NOT NULL,
	extra_attack_5 bool NOT NULL,
	extra_attack_6 bool NOT NULL,
	extra_attack_7 bool NOT NULL,
	extra_attack_8 bool NOT NULL,
	extra_attack_9 bool NOT NULL,
	extra_attack_10 bool NOT NULL,
	CONSTRAINT tactics_pkey PRIMARY KEY (team_id),
	CONSTRAINT tactics_shirt_0_check CHECK ((shirt_0 >= 0)),
	CONSTRAINT tactics_shirt_10_check CHECK ((shirt_10 >= 0)),
	CONSTRAINT tactics_shirt_1_check CHECK ((shirt_1 >= 0)),
	CONSTRAINT tactics_shirt_2_check CHECK ((shirt_2 >= 0)),
	CONSTRAINT tactics_shirt_3_check CHECK ((shirt_3 >= 0)),
	CONSTRAINT tactics_shirt_4_check CHECK ((shirt_4 >= 0)),
	CONSTRAINT tactics_shirt_5_check CHECK ((shirt_5 >= 0)),
	CONSTRAINT tactics_shirt_6_check CHECK ((shirt_6 >= 0)),
	CONSTRAINT tactics_shirt_7_check CHECK ((shirt_7 >= 0)),
	CONSTRAINT tactics_shirt_8_check CHECK ((shirt_8 >= 0)),
	CONSTRAINT tactics_shirt_9_check CHECK ((shirt_9 >= 0)),
	CONSTRAINT tactics_substitution_0_minute_check CHECK (((substitution_0_minute >= 0) AND (substitution_0_minute <= 90))),
	CONSTRAINT tactics_substitution_0_shirt_check CHECK (((substitution_0_shirt >= 0) AND (substitution_0_shirt <= 25))),
	CONSTRAINT tactics_substitution_0_target_check CHECK (((substitution_0_target >= 0) AND (substitution_0_target <= 11))),
	CONSTRAINT tactics_substitution_1_minute_check CHECK (((substitution_1_minute >= 0) AND (substitution_1_minute <= 90))),
	CONSTRAINT tactics_substitution_1_shirt_check CHECK (((substitution_1_shirt >= 0) AND (substitution_1_shirt <= 25))),
	CONSTRAINT tactics_substitution_1_target_check CHECK (((substitution_1_target >= 0) AND (substitution_1_target <= 11))),
	CONSTRAINT tactics_substitution_2_minute_check CHECK (((substitution_2_minute >= 0) AND (substitution_2_minute <= 90))),
	CONSTRAINT tactics_substitution_2_shirt_check CHECK (((substitution_2_shirt >= 0) AND (substitution_2_shirt <= 25))),
	CONSTRAINT tactics_substitution_2_target_check CHECK (((substitution_2_target >= 0) AND (substitution_2_target <= 11))),
	CONSTRAINT tactics_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.tactics_histories definition

-- Drop table

-- DROP TABLE public.tactics_histories;

CREATE TABLE public.tactics_histories (
	block_number int8 NOT NULL,
	team_id text NOT NULL,
	tactic_id int4 NOT NULL,
	shirt_0 int4 NOT NULL,
	shirt_1 int4 NOT NULL,
	shirt_2 int4 NOT NULL,
	shirt_3 int4 NOT NULL,
	shirt_4 int4 NOT NULL,
	shirt_5 int4 NOT NULL,
	shirt_6 int4 NOT NULL,
	shirt_7 int4 NOT NULL,
	shirt_8 int4 NOT NULL,
	shirt_9 int4 NOT NULL,
	shirt_10 int4 NOT NULL,
	substitution_0_shirt int4 NOT NULL,
	substitution_0_target int4 NOT NULL,
	substitution_0_minute int4 NOT NULL,
	substitution_1_shirt int4 NOT NULL,
	substitution_1_target int4 NOT NULL,
	substitution_1_minute int4 NOT NULL,
	substitution_2_shirt int4 NOT NULL,
	substitution_2_target int4 NOT NULL,
	substitution_2_minute int4 NOT NULL,
	extra_attack_1 bool NOT NULL,
	extra_attack_2 bool NOT NULL,
	extra_attack_3 bool NOT NULL,
	extra_attack_4 bool NOT NULL,
	extra_attack_5 bool NOT NULL,
	extra_attack_6 bool NOT NULL,
	extra_attack_7 bool NOT NULL,
	extra_attack_8 bool NOT NULL,
	extra_attack_9 bool NOT NULL,
	extra_attack_10 bool NOT NULL,
	CONSTRAINT tactics_histories_pkey PRIMARY KEY (block_number, team_id),
	CONSTRAINT tactics_histories_shirt_0_check CHECK ((shirt_0 >= 0)),
	CONSTRAINT tactics_histories_shirt_10_check CHECK ((shirt_10 >= 0)),
	CONSTRAINT tactics_histories_shirt_1_check CHECK ((shirt_1 >= 0)),
	CONSTRAINT tactics_histories_shirt_2_check CHECK ((shirt_2 >= 0)),
	CONSTRAINT tactics_histories_shirt_3_check CHECK ((shirt_3 >= 0)),
	CONSTRAINT tactics_histories_shirt_4_check CHECK ((shirt_4 >= 0)),
	CONSTRAINT tactics_histories_shirt_5_check CHECK ((shirt_5 >= 0)),
	CONSTRAINT tactics_histories_shirt_6_check CHECK ((shirt_6 >= 0)),
	CONSTRAINT tactics_histories_shirt_7_check CHECK ((shirt_7 >= 0)),
	CONSTRAINT tactics_histories_shirt_8_check CHECK ((shirt_8 >= 0)),
	CONSTRAINT tactics_histories_shirt_9_check CHECK ((shirt_9 >= 0)),
	CONSTRAINT tactics_histories_substitution_0_minute_check CHECK (((substitution_0_minute >= 0) AND (substitution_0_minute <= 90))),
	CONSTRAINT tactics_histories_substitution_0_shirt_check CHECK (((substitution_0_shirt >= 0) AND (substitution_0_shirt <= 25))),
	CONSTRAINT tactics_histories_substitution_0_target_check CHECK (((substitution_0_target >= 0) AND (substitution_0_target <= 11))),
	CONSTRAINT tactics_histories_substitution_1_minute_check CHECK (((substitution_1_minute >= 0) AND (substitution_1_minute <= 90))),
	CONSTRAINT tactics_histories_substitution_1_shirt_check CHECK (((substitution_1_shirt >= 0) AND (substitution_1_shirt <= 25))),
	CONSTRAINT tactics_histories_substitution_1_target_check CHECK (((substitution_1_target >= 0) AND (substitution_1_target <= 11))),
	CONSTRAINT tactics_histories_substitution_2_minute_check CHECK (((substitution_2_minute >= 0) AND (substitution_2_minute <= 90))),
	CONSTRAINT tactics_histories_substitution_2_shirt_check CHECK (((substitution_2_shirt >= 0) AND (substitution_2_shirt <= 25))),
	CONSTRAINT tactics_histories_substitution_2_target_check CHECK (((substitution_2_target >= 0) AND (substitution_2_target <= 11))),
	CONSTRAINT tactics_histories_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.auctions definition

-- Drop table

-- DROP TABLE public.auctions;

CREATE TABLE public.auctions (
	id text NOT NULL,
	player_id text NOT NULL,
	currency_id int4 NOT NULL,
	price int8 NOT NULL,
	rnd int8 NOT NULL,
	valid_until int8 NOT NULL,
	signature text NOT NULL,
	state public."auction_state" NOT NULL,
	state_extra text NOT NULL,
	payment_url text NOT NULL,
	seller text NOT NULL,
	offer_valid_until int8 NOT NULL,
	CONSTRAINT auctions_pkey PRIMARY KEY (id),
	CONSTRAINT auctions_players_fk FOREIGN KEY (player_id) REFERENCES public.players(player_id)
);
CREATE INDEX idx_auctions_player_id ON public.auctions USING btree (player_id);


-- public.auctions_histories definition

-- Drop table

-- DROP TABLE public.auctions_histories;

CREATE TABLE public.auctions_histories (
	inserted_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	id text NOT NULL,
	player_id text NOT NULL,
	currency_id int4 NOT NULL,
	price int8 NOT NULL,
	rnd int8 NOT NULL,
	valid_until int8 NOT NULL,
	signature text NOT NULL,
	state public."auction_state" NOT NULL,
	state_extra text NOT NULL,
	payment_url text NOT NULL,
	seller text NOT NULL,
	CONSTRAINT auctions_histories_id_fkey FOREIGN KEY (id) REFERENCES public.auctions(id)
);


-- public.bids definition

-- Drop table

-- DROP TABLE public.bids;

CREATE TABLE public.bids (
	auction_id text NOT NULL,
	extra_price int4 NOT NULL,
	rnd int4 NOT NULL,
	team_id text NOT NULL,
	signature text NOT NULL,
	state public."bid_state" NOT NULL,
	state_extra text NOT NULL,
	payment_id text NOT NULL,
	payment_url text NOT NULL,
	payment_deadline text NOT NULL,
	CONSTRAINT bids_pkey PRIMARY KEY (auction_id, extra_price),
	CONSTRAINT bids_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id),
	CONSTRAINT bids_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id)
);


-- public.bids_histories definition

-- Drop table

-- DROP TABLE public.bids_histories;

CREATE TABLE public.bids_histories (
	inserted_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	auction_id text NOT NULL,
	extra_price int4 NOT NULL,
	rnd int4 NOT NULL,
	team_id text NOT NULL,
	signature text NOT NULL,
	state public."bid_state" NOT NULL,
	state_extra text NOT NULL,
	payment_id text NOT NULL,
	payment_url text NOT NULL,
	payment_deadline text NOT NULL,
	CONSTRAINT bids_histories_auction_id_extra_price_fkey FOREIGN KEY (auction_id,extra_price) REFERENCES public.bids(auction_id,extra_price)
);


-- public.match_events definition

-- Drop table

-- DROP TABLE public.match_events;

CREATE TABLE public.match_events (
	timezone_idx int4 NOT NULL,
	country_idx int4 NOT NULL,
	league_idx int4 NOT NULL,
	match_day_idx int4 NOT NULL,
	match_idx int4 NOT NULL,
	"minute" int4 NOT NULL,
	"type" public."match_event_type" NOT NULL,
	team_id text NOT NULL,
	manage_to_shoot bool DEFAULT false NOT NULL,
	is_goal bool DEFAULT false NOT NULL,
	primary_player_id text NULL,
	secondary_player_id text NULL,
	CONSTRAINT match_events_primary_player_id_fkey FOREIGN KEY (primary_player_id) REFERENCES public.players(player_id),
	CONSTRAINT match_events_secondary_player_id_fkey FOREIGN KEY (secondary_player_id) REFERENCES public.players(player_id),
	CONSTRAINT match_events_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id),
	CONSTRAINT match_events_timezone_idx_country_idx_league_idx_match_day_fkey FOREIGN KEY (timezone_idx,country_idx,league_idx,match_day_idx,match_idx) REFERENCES public.matches(timezone_idx,country_idx,league_idx,match_day_idx,match_idx)
);


-- public.offers definition

-- Drop table

-- DROP TABLE public.offers;

CREATE TABLE public.offers (
	id text NOT NULL,
	player_id text NOT NULL,
	currency_id int4 NOT NULL,
	price int8 NOT NULL,
	rnd int8 NOT NULL,
	valid_until int8 NOT NULL,
	signature text NOT NULL,
	state public."offer_state" NOT NULL,
	state_extra text NOT NULL,
	seller text NOT NULL,
	buyer text NOT NULL,
	auction_id text NULL,
	buyer_team_id text NOT NULL,
	CONSTRAINT offers_pkey PRIMARY KEY (id),
	CONSTRAINT offers_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id),
	CONSTRAINT offers_buyer_team_id_fkey FOREIGN KEY (buyer_team_id) REFERENCES public.teams(team_id),
	CONSTRAINT offers_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(player_id)
);
CREATE INDEX idx_offers_auction_id ON public.offers USING btree (auction_id);
CREATE INDEX idx_offers_player_id ON public.offers USING btree (player_id);


-- public.offers_histories definition

-- Drop table

-- DROP TABLE public.offers_histories;

CREATE TABLE public.offers_histories (
	inserted_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	id text NOT NULL,
	player_id text NOT NULL,
	currency_id int4 NOT NULL,
	price int8 NOT NULL,
	rnd int8 NOT NULL,
	valid_until int8 NOT NULL,
	signature text NOT NULL,
	state public."offer_state" NOT NULL,
	state_extra text NOT NULL,
	seller text NOT NULL,
	buyer text NOT NULL,
	auction_id text NULL,
	buyer_team_id text NOT NULL,
	CONSTRAINT offers_histories_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id),
	CONSTRAINT offers_histories_id_fkey FOREIGN KEY (id) REFERENCES public.offers(id)
);