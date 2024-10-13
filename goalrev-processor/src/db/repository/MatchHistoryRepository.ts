import { EntityManager } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { MatchHistory } from "../entity/MatchHistory";

export class MatchHistoryRepository {
  
  // Insert a single match history record
  async insertMatchHistory(matchHistory: MatchHistory, entityManager: EntityManager): Promise<void> {
    const repository = entityManager.getRepository(MatchHistory);
    try {
      await repository.insert(matchHistory);
    } catch (error) {
      console.error("Error inserting match history:", error);
      throw new Error("Insert failed");
    }
  }

  // Bulk insert match history records
  async bulkInsertMatchHistories(matchHistories: MatchHistory[], entityManager: EntityManager): Promise<void> {
    const repository = entityManager.getRepository(MatchHistory);
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      for (const matchHistory of matchHistories) {
        await repository.save(matchHistory);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error bulk inserting match histories:", error);
      throw new Error("Bulk insert failed");
    } finally {
      await queryRunner.release();
    }
  }
}
