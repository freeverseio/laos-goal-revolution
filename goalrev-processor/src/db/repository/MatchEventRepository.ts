import { MatchEvent } from "../entity/MatchEvent";
import { AppDataSource } from "../AppDataSource";
import { EntityManager } from "typeorm";

// Define the custom repository class
export class MatchEventRepository {
  
  // Count all match events
  async getMatchEventCount(): Promise<number> {
    const repository = AppDataSource.getRepository(MatchEvent);
    return await repository.count();
  }

  // Count match events filtered by timezone, country, and league
  async getMatchEventCountByTimezoneCountryLeague(
    timezone: number,
    countryIdx: number,
    leagueIdx: number
  ): Promise<number> {
    const repository = AppDataSource.getRepository(MatchEvent);
    return await repository.count({
      where: {
        timezone_idx: timezone,
        country_idx: countryIdx,
        league_idx: leagueIdx,
      },
    });
  }

  // Delete all match events filtered by timezone, country, and league
  async deleteAllMatchEvents(timezoneIdx: number, countryIdx: number, leagueIdx: number, matchDayIdx: number, matchIdx: number, transactionManager: EntityManager): Promise<void> {
    const repository = transactionManager.getRepository(MatchEvent);
    await repository.delete({ timezone_idx: timezoneIdx, country_idx: countryIdx, league_idx: leagueIdx, match_day_idx: matchDayIdx, match_idx: matchIdx });
  }

  // Bulk insert match events in batches
  async bulkInsertMatchEvents(rowsToBeInserted: MatchEvent[]): Promise<void> {
    const batchSize = 500;

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      for (let i = 0; i < rowsToBeInserted.length; i += batchSize) {
        const batch = rowsToBeInserted.slice(i, i + batchSize);

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(MatchEvent)
          .values(batch)
          .execute()
          .catch((error) => {
            console.error("Error inserting batch: ", error);
            throw new Error("Bulk insert failed");
          });
      }
    });
  }

  async createMatchEvent(matchEvent: MatchEvent): Promise<MatchEvent> {
    const repository = AppDataSource.getRepository(MatchEvent);
    return await repository.save(matchEvent);
  }

  async saveMatchEvents(matchEvents: MatchEvent[], transactionManager: EntityManager): Promise<void> {
    const repository = transactionManager.getRepository(MatchEvent);
    await repository.save(matchEvents);
  }

  async saveMatchEvent(matchEvent: MatchEvent, transactionManager: EntityManager): Promise<MatchEvent> {
    const repository = transactionManager.getRepository(MatchEvent);
    return await repository.save(matchEvent);
  }


}