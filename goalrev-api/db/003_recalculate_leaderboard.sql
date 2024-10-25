CREATE OR REPLACE FUNCTION recalculate_leaderboard_position(
    p_timezone_idx INT,
    p_country_idx INT,
    p_league_idx INT
) RETURNS VOID AS $$
DECLARE
    next_position INT := 0;
    rank_record RECORD;
    team_record RECORD;
BEGIN
    -- Create a temporary table to hold the initial rankings
    CREATE TEMP TABLE tmp_initial_ranking AS
    SELECT
        t.team_id,
        t.points,
        t.goals_forward,
        t.goals_against,
        (t.goals_forward - t.goals_against) AS goal_difference,
        RANK() OVER (
            ORDER BY t.points DESC, (t.goals_forward - t.goals_against) DESC, t.goals_forward DESC
        ) AS initial_rank
    FROM
        public.teams t
    WHERE
        t.timezone_idx = p_timezone_idx AND
        t.country_idx = p_country_idx AND
        t.league_idx = p_league_idx;

    -- Create a temporary table to hold the final rankings
    CREATE TEMP TABLE tmp_final_ranking (
        team_id TEXT,
        final_rank INT
    );

    -- Process each group of teams with the same initial_rank
    FOR rank_record IN
        SELECT initial_rank
        FROM tmp_initial_ranking
        GROUP BY initial_rank
        ORDER BY initial_rank
    LOOP
        -- Get the teams with this initial_rank
        CREATE TEMP TABLE tmp_tied_teams AS
        SELECT *
        FROM tmp_initial_ranking
        WHERE initial_rank = rank_record.initial_rank;

        -- Check if there is more than one team tied
        IF (SELECT COUNT(*) FROM tmp_tied_teams) > 1 THEN
            -- Calculate head-to-head points among tied teams
            CREATE TEMP TABLE tmp_head_to_head AS
            SELECT
                t.team_id,
                COALESCE(SUM(
                    CASE
                        WHEN (m.home_team_id = t.team_id AND m.home_goals > m.visitor_goals) THEN 3
                        WHEN (m.home_team_id = t.team_id AND m.home_goals = m.visitor_goals) THEN 1
                        WHEN (m.visitor_team_id = t.team_id AND m.visitor_goals > m.home_goals) THEN 3
                        WHEN (m.visitor_team_id = t.team_id AND m.visitor_goals = m.home_goals) THEN 1
                        ELSE 0
                    END
                ), 0) AS head_to_head_points
            FROM
                tmp_tied_teams t
                LEFT JOIN public.matches m ON (
                    (
                        (m.home_team_id = t.team_id AND m.visitor_team_id IN (SELECT team_id FROM tmp_tied_teams WHERE team_id <> t.team_id))
                        OR
                        (m.visitor_team_id = t.team_id AND m.home_team_id IN (SELECT team_id FROM tmp_tied_teams WHERE team_id <> t.team_id))
                    )
                    AND m.timezone_idx = p_timezone_idx
                    AND m.country_idx = p_country_idx
                    AND m.league_idx = p_league_idx
                )
            GROUP BY
                t.team_id;

            -- Now order the tied teams by head_to_head_points DESC
            FOR team_record IN
                SELECT t.team_id
                FROM tmp_head_to_head t
                ORDER BY t.head_to_head_points DESC, t.team_id
            LOOP
                INSERT INTO tmp_final_ranking (team_id, final_rank)
                VALUES (team_record.team_id, next_position);
                next_position := next_position + 1;
            END LOOP;

            DROP TABLE tmp_head_to_head;

        ELSE
            -- Only one team at this rank, assign the next_position
            INSERT INTO tmp_final_ranking (team_id, final_rank)
            SELECT team_id, next_position
            FROM tmp_tied_teams;
            next_position := next_position + 1;
        END IF;

        DROP TABLE tmp_tied_teams;
    END LOOP;

    -- Update the leaderboard_position in the teams table
    UPDATE public.teams t
    SET leaderboard_position = f.final_rank
    FROM tmp_final_ranking f
    WHERE t.team_id = f.team_id
      AND t.timezone_idx = p_timezone_idx
      AND t.country_idx = p_country_idx
      AND t.league_idx = p_league_idx;

    -- Clean up temporary tables
    DROP TABLE tmp_initial_ranking;
    DROP TABLE tmp_final_ranking;
END;
$$ LANGUAGE plpgsql;
