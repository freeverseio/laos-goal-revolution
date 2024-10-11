import { EntityManager } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { Match, MatchState } from "../entity/Match";

export class MatchRepository {

  async saveMatch(match: Match, transactionManager: EntityManager): Promise<void> {
    const repository = transactionManager.getRepository(Match);
    try {
      await repository.save(match);
    } catch (error) {
      console.error("Error saving match:", error);
      throw new Error("Save match failed");
    }
  }

  async getAllMatches(timezone: number, matchDay: number) {
    const matchRepository = AppDataSource.getRepository(Match);

    return await matchRepository.find({
      where: {
        timezone_idx: timezone,
        match_day_idx: matchDay
      },
      relations: [
        "homeTeam",
        "visitorTeam",
        "homeTeam.players",
        "visitorTeam.players",
        "homeTeam.tactics",
        "visitorTeam.tactics",
        "homeTeam.trainings",
        "visitorTeam.trainings"
      ]
    });
  }
  
    // Set the teams and start time for a match
  async resetMatch(timezoneIdx: number, countryIdx: number, leagueIdx: number, matchDayIdx: number, matchIdx: number, homeTeamID: string, visitorTeamID: string, startTime: number, transactionManager: EntityManager): Promise<void> {
    const repository = transactionManager.getRepository(Match);
    try {
      await repository.update(
        { timezone_idx: timezoneIdx, country_idx: countryIdx, league_idx: leagueIdx, match_day_idx: matchDayIdx, match_idx: matchIdx },
        {
          home_team_id: homeTeamID,
          visitor_team_id: visitorTeamID,
          home_goals: 0,
          visitor_goals: 0,
          home_teamsumskills: 0,
          visitor_teamsumskills: 0,
          start_epoch: startTime,
          state: MatchState.BEGIN,
          seed: '',
          state_extra: '',
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

  async getMatch(timezoneIdx: number, leagueIdx: number, matchDayIdx: number, matchIdx: number): Promise<Match | null> {
    const repository = AppDataSource.getRepository(Match);
    try {
      return await repository.findOne({
        where: { timezone_idx: timezoneIdx, league_idx: leagueIdx, match_day_idx: matchDayIdx, match_idx: matchIdx },
        relations: ["homeTeam", "visitorTeam"]
      });
    } catch (error) {
      console.error("Error getting match:", error);
      throw new Error("Get match failed");
    }
  }

  async countPendingMatchesByTimezone(timezoneIdx: number): Promise<number> {
    const repository = AppDataSource.getRepository(Match);
    return await repository.count({
      where: { timezone_idx: timezoneIdx, state: MatchState.BEGIN },
    });
  }


  async getLeagueMatches(timezoneIdx: number, countryIdx: number, leagueIdx: number): Promise<Match[]>{
    const repository = AppDataSource.getRepository(Match);
    try {
      return await repository.find({
        where: {
          timezone_idx: timezoneIdx,
          country_idx: countryIdx,
          league_idx: leagueIdx
        },        
      });      
      
    } catch (error) {
      console.error("Error getting LeagueMatches:", error);
      throw new Error("Get LeagueMatches failed");
    }
  }


  

  
}
