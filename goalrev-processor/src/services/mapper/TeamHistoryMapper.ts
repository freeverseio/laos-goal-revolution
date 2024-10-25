import { Team, TeamHistory } from "../../db/entity";

export class TeamHistoryMapper {
  static mapToTeamHistory(team: Team, blockNumber: number): TeamHistory {
    const teamHistory = new TeamHistory();

    teamHistory.block_number = blockNumber;
    teamHistory.team_id = team.team_id;
    teamHistory.name = team.name;
    teamHistory.timezone_idx = team.timezone_idx;
    teamHistory.country_idx = team.country_idx;
    teamHistory.owner = team.owner;
    teamHistory.league_idx = team.league_idx;
    teamHistory.team_idx_in_league = team.team_idx_in_league;
    teamHistory.leaderboard_position = team.leaderboard_position;
    teamHistory.points = team.points;
    teamHistory.w = team.w;
    teamHistory.d = team.d;
    teamHistory.l = team.l;
    teamHistory.goals_forward = team.goals_forward;
    teamHistory.goals_against = team.goals_against;
    teamHistory.prev_perf_points = team.prev_perf_points;
    teamHistory.ranking_points = team.ranking_points;
    teamHistory.training_points = team.training_points;
    teamHistory.tactic = team.tactic;
    teamHistory.match_log = team.match_log;
    teamHistory.is_zombie = team.is_zombie;

    return teamHistory;
  }
}