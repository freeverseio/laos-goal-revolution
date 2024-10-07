import { EntityManager } from "typeorm";
import { Verse } from "../db/entity/Verse";

export class VerseService {
  /**
   * Retrieves the most recent verse from the database.
   * 
   * @param entityManager - The transaction-scoped EntityManager instance.
   * @returns The most recent Verse.
   */
  async getLastVerse(entityManager: EntityManager): Promise<Verse | null> {
    return await entityManager.findOne(Verse, {
      order: {
        verseTimestamp: "DESC",
      },
    });
  }

  /**
   * Retrieves the first verse (initial verse) from the database.
   * 
   * @param entityManager - The transaction-scoped EntityManager instance.
   * @returns The first Verse.
   */
  async getInitialVerse(entityManager: EntityManager): Promise<Verse | null> {
    return await entityManager.findOne(Verse, {
      order: {
        verseTimestamp: "ASC",
      },
    });
  }

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
}
