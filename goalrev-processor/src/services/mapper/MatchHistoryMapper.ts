import { Match, MatchHistory } from "../../db/entity";

export class MatchHistoryMapper {
  static mapMatchHistory(match: Match, blockNumber: number, seed: string): MatchHistory {
    const matchHistory = new MatchHistory();
    
    // Set the values from Match to MatchHistory
    matchHistory.block_number = blockNumber;
    matchHistory.match_idx = match.match_idx;
    matchHistory.match_day_idx = match.match_day_idx;
    matchHistory.timezone_idx = match.timezone_idx;
    matchHistory.country_idx = match.country_idx;
    matchHistory.league_idx = match.league_idx;
    matchHistory.home_team_id = match.home_team_id;
    matchHistory.visitor_team_id = match.visitor_team_id;
    matchHistory.seed = seed;
    matchHistory.home_goals = match.home_goals;
    matchHistory.visitor_goals = match.visitor_goals;
    matchHistory.home_teamsumskills = match.home_teamsumskills;
    matchHistory.visitor_teamsumskills = match.visitor_teamsumskills;
    matchHistory.state = match.state;
    matchHistory.state_extra = match.state_extra;
    matchHistory.start_epoch = match.start_epoch;

    return matchHistory;
  }
}
