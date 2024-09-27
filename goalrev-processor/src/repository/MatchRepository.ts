import { AppDataSource } from "../db/AppDataSource";
import { Match, MatchState } from "../entity/Match";

export class MatchRepository {
  
  // Reset a match
  async resetMatch(timezoneIdx: number, countryIdx: number, leagueIdx: number, matchDayIdx: number, matchIdx: number): Promise<void> {
    const repository = AppDataSource.getRepository(Match);
    try {
      await repository.update(
        { timezone_idx: timezoneIdx, country_idx: countryIdx, league_idx: leagueIdx, match_day_idx: matchDayIdx, match_idx: matchIdx },
        {
          homeTeam: undefined,
          visitorTeam: undefined,
          home_goals: 0,
          visitor_goals: 0,
          home_teamsumskills: 0,
          visitor_teamsumskills: 0,
          state: MatchState.BEGIN,
          state_extra: '',
          start_epoch: 0,
        }
      );
    } catch (error) {
      console.error("Error resetting match:", error);
      throw new Error("Reset failed");
    }
  }

  // Set the teams and start time for a match
  async setTeams(timezoneIdx: number, countryIdx: number, leagueIdx: number, matchDayIdx: number, matchIdx: number, homeTeamID: string, visitorTeamID: string, startTime: number): Promise<void> {
    const repository = AppDataSource.getRepository(Match);
    try {
      await repository.update(
        { timezone_idx: timezoneIdx, country_idx: countryIdx, league_idx: leagueIdx, match_day_idx: matchDayIdx, match_idx: matchIdx },
        {
          homeTeam: { id: homeTeamID }, // Assuming the `Team` entity has an `id` field
          visitorTeam: { id: visitorTeamID },
          start_epoch: startTime,
        }
      );
    } catch (error) {
      console.error("Error setting teams:", error);
      throw new Error("Set teams failed");
    }
  }

  // Set match result
  async setMatchResult(timezoneIdx: number, countryIdx: number, leagueIdx: number, matchDayIdx: number, matchIdx: number, homeGoals: number, visitorGoals: number): Promise<void> {
    const repository = AppDataSource.getRepository(Match);
    try {
      await repository.update(
        { timezone_idx: timezoneIdx, country_idx: countryIdx, league_idx: leagueIdx, match_day_idx: matchDayIdx, match_idx: matchIdx },
        {
          home_goals: homeGoals,
          visitor_goals: visitorGoals,
        }
      );
    } catch (error) {
      console.error("Error setting match result:", error);
      throw new Error("Set result failed");
    }
  }

  
}
