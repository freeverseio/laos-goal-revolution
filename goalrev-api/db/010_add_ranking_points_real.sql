ALTER TABLE teams
ADD COLUMN ranking_points_real text NOT NULL DEFAULT '0'::text;

ALTER TABLE teams_histories
ADD COLUMN ranking_points_real text NOT NULL DEFAULT '0'::text;