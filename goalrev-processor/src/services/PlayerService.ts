import { EntityManager } from "typeorm";
import { Player, Tactics } from "../db/entity";
import { PlayerHistoryMapper } from "./mapper/PlayerHistoryMapper";

export interface PlayerSkill {
  defence: number;
  speed: number;
  pass: number;
  shoot: number;
  endurance: number;
  encodedSkills: string;
}

export class PlayerService {
  /**
   * Updates the skills of players based on the given player skills array.
   * @param tactics - The team tactics containing the player IDs.
   * @param playerSkills - An array of player skills, where each element corresponds to a shirt number in tactics.
   * @param verseNumber - The verse number.
   * @param entityManager - The transaction-scoped EntityManager instance.
   */
  async updateSkills(tactics: Tactics, playerSkills: PlayerSkill[], verseNumber: number, entityManager: EntityManager): Promise<void> {
   
    // The players in tactics are referenced by shirt_0 to shirt_10
    const shirtNumbers = [
      tactics.shirt_0,
      tactics.shirt_1,
      tactics.shirt_2,
      tactics.shirt_3,
      tactics.shirt_4,
      tactics.shirt_5,
      tactics.shirt_6,
      tactics.shirt_7,
      tactics.shirt_8,
      tactics.shirt_9,
      tactics.shirt_10,
    ];

    // remove duplicates
    const uniqueShirtNumbers = [...new Set(shirtNumbers)];

    // Update each player based on their player ID and corresponding PlayerSkill
    for (let i = 0; i < playerSkills.length; i++) {
      const shirtNumber = uniqueShirtNumbers[i];
      const playerSkill = playerSkills[i];
      if (!shirtNumber) {
        return;
      }

      // Find the player by their ID (from the shirt number in tactics)
      const [player] = await entityManager.find(Player, {
        where: { 
          team_id: tactics.team_id,
          shirt_number: shirtNumber 
        },
        take: 1
      });
      if (!player) {
        return;
      }
      if (player) {
        // save player history
        const playerHistory = PlayerHistoryMapper.mapToPlayerHistory(player, verseNumber);
        await entityManager.save(playerHistory);
        // Update the player's skills
        player.defence = playerSkill.defence;
        player.speed = playerSkill.speed;
        player.pass = playerSkill.pass;
        player.shoot = playerSkill.shoot;
        player.endurance = playerSkill.endurance;
        player.encoded_skills = playerSkill.encodedSkills;

        // Save the updated player
        await entityManager.save(player);
      }
    }
  }
}
