CREATE OR REPLACE FUNCTION recalculate_leaderboard_position(timezone_idx INT, country_idx INT, league_idx INT) RETURNS VOID AS $$
DECLARE
    current_team RECORD;
    next_team RECORD;
    current_rank INT;
BEGIN
    -- Set initial ranking to the number of teams in the league
    current_rank := 0;

    -- Iterate over teams ordered by their points (descending)
    FOR current_team IN
        SELECT team_id, points, goals_forward, goals_against
        FROM public.teams
        WHERE public.teams.timezone_idx = $1 AND public.teams.country_idx = $2 AND public.teams.league_idx = $3
        ORDER BY points DESC, goals_forward - goals_against DESC, goals_forward DESC
    LOOP
        -- Check if there is a tie with the next team
        SELECT * INTO next_team
        FROM public.teams
        WHERE public.teams.timezone_idx = $1 AND public.teams.country_idx = $2 AND public.teams.league_idx = $3
          AND points = current_team.points
          AND team_id <> current_team.team_id
          AND team_id > current_team.team_id
        ORDER BY team_id
        LIMIT 1;

        IF FOUND THEN
            -- Calculate head-to-head result
            DECLARE
                head_to_head_result INT;
            BEGIN
                SELECT COUNT(*) INTO head_to_head_result
                FROM public.matches
                WHERE (home_team_id = current_team.team_id AND visitor_team_id = next_team.team_id AND home_goals > visitor_goals)
                   OR (home_team_id = next_team.team_id AND visitor_team_id = current_team.team_id AND visitor_goals > home_goals);

                -- If next team won head-to-head, increment the rank
                IF head_to_head_result > 0 THEN
                    UPDATE public.teams
                    SET leaderboard_position = current_rank + 1
                    WHERE team_id = next_team.team_id;
                END IF;
            END;
        END IF;

        -- Update the leaderboard_position for the current team based on its current rank
        UPDATE public.teams
        SET leaderboard_position = current_rank
        WHERE team_id = current_team.team_id;

        -- Increment rank for the next team
        current_rank := current_rank + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
