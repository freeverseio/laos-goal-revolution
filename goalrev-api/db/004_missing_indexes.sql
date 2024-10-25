CREATE INDEX idx_teams_timezone_country_league ON public.teams (timezone_idx, country_idx, league_idx);

CREATE INDEX idx_matches_timezone_country_league ON public.matches (timezone_idx,country_idx,league_idx);