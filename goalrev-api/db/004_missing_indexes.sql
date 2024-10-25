CREATE INDEX idx_teams_league ON public.teams (league_idx);
CREATE INDEX idx_teams_country ON public.teams (country_idx);
CREATE INDEX idx_teams_timezone_country ON public.teams (timezone_idx, country_idx);
CREATE INDEX idx_teams_points ON public.teams (points);
CREATE INDEX idx_teams_leaderboard_position ON public.teams (leaderboard_position);


CREATE INDEX idx_matches_league ON public.matches (league_idx);
CREATE INDEX idx_matches_country ON public.matches (country_idx);
CREATE INDEX idx_matches_home_team ON public.matches (home_team_id);
CREATE INDEX idx_matches_visitor_team ON public.matches (visitor_team_id);
CREATE INDEX idx_matches_start_epoch ON public.matches (start_epoch);