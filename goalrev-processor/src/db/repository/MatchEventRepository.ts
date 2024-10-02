import { MatchEvent } from "../entity/MatchEvent";
import { AppDataSource } from "../AppDataSource";

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
  async deleteAllMatchEvents(
    timezone: number, 
    countryIdx: number, 
    leagueIdx: number
  ): Promise<void> {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(MatchEvent, {
        timezone_idx: timezone,
        country_idx: countryIdx,
        league_idx: leagueIdx,
      });
    });
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

}
