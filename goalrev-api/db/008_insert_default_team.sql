
INSERT INTO public.timezones (timezone_idx) VALUES
	 (999);

INSERT INTO public.countries (timezone_idx,country_idx) VALUES
	 (999,999);

INSERT INTO public.leagues (timezone_idx,country_idx,league_idx) VALUES
	 (999,999,99999999);

INSERT INTO public.teams (team_id,"name",manager_name,timezone_idx,country_idx,"owner",league_idx,team_idx_in_league,leaderboard_position,points,w,d,l,goals_forward,goals_against,prev_perf_points,ranking_points,training_points,tactic,match_log,is_zombie,promo_timeout,mint_status,mint_updated_at) VALUES
	 ('999','Default Team','',999,999,'0x0000000000000000000000000000000000000000',99999999,0,0,0,0,0,0,0,0,'0','0',0,'0','0',true,0,'not_minted'::public."mint_status_type",NULL);