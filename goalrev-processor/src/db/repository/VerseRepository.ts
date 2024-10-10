import { EntityManager } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { Verse } from "../entity/Verse";

export class VerseRepository {
  /**
   * Saves a new verse to the database.
   * 
   * @param verseData - Data for the new verse.
   * @param entityManager - The transaction-scoped EntityManager instance.
   * @returns The saved Verse entity.
   */
  async saveVerse(verseData: Partial<Verse>, entityManager: EntityManager): Promise<Verse> {
    const newVerse = entityManager.create(Verse, verseData);
    return await entityManager.save(newVerse);
  }

  /**
   * Retrieves the last verse from the database.
   * 
   * @param entityManager - The transaction-scoped EntityManager instance.
   * @returns The last Verse entity or null if no verses are found.
   */
  async getLastVerse(entityManager: EntityManager): Promise<Verse> {
    const [lastVerse] = await entityManager.find(Verse, {
      order: {
        verseNumber: "DESC",
      },
      take: 1, // This limits the result to 1 row
    });
    return lastVerse;
  }

  /**
   * Retrieves the first verse from the database.
   * 
   * @param entityManager - The transaction-scoped EntityManager instance.
   * @returns The first Verse entity or null if no verses are found.
   */
  async getInitialVerse(entityManager: EntityManager): Promise<Verse> {
    const [firstVerse] = await entityManager.find(Verse, {
      order: {
        verseNumber: "ASC",
      },
      take: 1, // This limits the result to 1 row
    });
    return firstVerse;
  }

  async countVersesByTimezone(timezoneIdx: number): Promise<number> {
    const repository = AppDataSource.getRepository(Verse);
    return await repository.count({ where: { timezoneIdx: timezoneIdx } });
  }
}
