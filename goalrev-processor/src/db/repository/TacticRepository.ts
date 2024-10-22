import { EntityManager } from "typeorm";
import { Tactics } from "../entity/";
import { Team } from "../entity/Team";

export class TacticRepository {


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

   // Create initial tactics for a specific team 
   async createInitialTactics(
    teamID: string,
    entityManager: EntityManager
  ): Promise<void> {
    const tacticId = 1;

    // Create a new tactic object with default values as per the Golang code
    const newTactic = new Tactics();
    newTactic.team_id = teamID;
    newTactic.tactic_id = tacticId;

    // Set initial shirt values
    newTactic.shirt_0 = 0;
    newTactic.shirt_1 = 3;
    newTactic.shirt_2 = 4;
    newTactic.shirt_3 = 5;
    newTactic.shirt_4 = 6;
    newTactic.shirt_5 = 7;
    newTactic.shirt_6 = 8;
    newTactic.shirt_7 = 9;
    newTactic.shirt_8 = 10;
    newTactic.shirt_9 = 11;
    newTactic.shirt_10 = 12;

    // Set initial substitution values
    newTactic.substitution_0_shirt = 25;
    newTactic.substitution_0_target = 11;
    newTactic.substitution_0_minute = 0;
    newTactic.substitution_1_shirt = 25;
    newTactic.substitution_1_target = 11;
    newTactic.substitution_1_minute = 0;
    newTactic.substitution_2_shirt = 25;
    newTactic.substitution_2_target = 11;
    newTactic.substitution_2_minute = 0;

    // Set initial extra attack values
    newTactic.extra_attack_1 = false;
    newTactic.extra_attack_2 = false;
    newTactic.extra_attack_3 = false;
    newTactic.extra_attack_4 = false;
    newTactic.extra_attack_5 = false;
    newTactic.extra_attack_6 = false;
    newTactic.extra_attack_7 = false;
    newTactic.extra_attack_8 = false;
    newTactic.extra_attack_9 = false;
    newTactic.extra_attack_10 = false;

    // Insert the tactic using the provided entity manager
    try {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(Tactics)
        .values(newTactic)
        .execute();
    } catch (error) {
      console.error("Error creating initial tactics:", error);
      throw new Error("Initial tactics creation failed");
    }
  }

}