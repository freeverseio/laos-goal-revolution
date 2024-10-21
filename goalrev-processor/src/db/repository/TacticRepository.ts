import { EntityManager } from "typeorm";
import { Tactics } from "../entity/";
import { Team } from "../entity/Team";

export class TacticCustomRepository {


  // Get tactics by timezone
  async tacticsByTimezone(timezoneIdx: number, entityManager: EntityManager): Promise<Tactics[]> {
    const tactics = await entityManager
      .createQueryBuilder(Tactics, "tactics")
      .leftJoinAndSelect(Team, "team", "team.team_id = tactics.team_id")
      .where("team.timezone_idx = :timezoneIdx", { timezoneIdx })
      .getMany();

    if (!tactics.length) {
      throw new Error(`No tactics found for teams in timezone ${timezoneIdx}`);
    }

    return tactics;
  }

  // Count the number of tactics based on the verse field
  async tacticCountByVerse(verse: number, entityManager: EntityManager): Promise<number> {
    const count = await entityManager
      .createQueryBuilder(Tactics, "tactics")
      .where("tactics.verse = :verse", { verse })
      .getCount();

    return count;
  }

  // Count the number of tactics
  async tacticCount(entityManager: EntityManager): Promise<number> {
    const count = await entityManager
      .createQueryBuilder(Tactics, "tactics")
      .getCount();

    return count;
  }

  // Insert a tactic record
  async insertTactic(tactic: Tactics, entityManager: EntityManager): Promise<void> {
    try {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(Tactics)
        .values(tactic)
        .execute();
    } catch (error) {
      console.error("Error inserting tactic:", error);
      throw new Error("Insert failed");
    }
  }
}