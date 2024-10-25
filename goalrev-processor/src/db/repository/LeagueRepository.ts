import { AppDataSource } from "../AppDataSource";
import { EntityManager, Repository } from "typeorm";
import { League } from "../entity/League";

export class LeagueRepository {

  async countLeaguesByTimezoneAndCountry(timezoneIdx: number, countryIdx: number, transactionalEntityManager: EntityManager): Promise<number> {
    const leagueRepository = transactionalEntityManager.getRepository(League);
    return await leagueRepository.count({ where: { timezone_idx: timezoneIdx, country_idx: countryIdx } });
  }

  async recalculateLeaderboardPosition(timezoneIdx: number, countryIdx: number, leagueIdx: number, entityManager: EntityManager) {
    try {
      // Execute the raw SQL to call the function
      await entityManager.query('SELECT recalculate_leaderboard_position($1, $2, $3)', [timezoneIdx, countryIdx, leagueIdx]);
      console.log(`Leaderboard recalculated successfully for league : ${leagueIdx} timezone: ${timezoneIdx} country: ${countryIdx}`);
    } catch (error) {
      console.error('Error executing recalculate leaderboard position function:', error);
    }
  }
  
}