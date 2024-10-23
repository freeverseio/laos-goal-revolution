import { EntityManager } from "typeorm";
import { Player, Tactics } from "../db/entity";
import { PlayerHistoryMapper } from "./mapper/PlayerHistoryMapper";
import { AppDataSource } from "../db/AppDataSource";
import { PlayerSkill } from "../types/rest/output/team";

export class PlayerService {
  /**
   * Updates the skills of players based on the given player skills array.
   * @param tactics - The team tactics containing the player IDs.
   * @param playerSkills - An array of player skills, where each element corresponds to a shirt number in tactics.
   * @param verseNumber - The verse number.
   * @param entityManager - The transaction-scoped EntityManager instance.
   */
  async updateSkills(tactics: Tactics, playerSkills: PlayerSkill[], verseNumber: number, entityManager: EntityManager): Promise<void> {
   

    // Update each player based on their player ID and corresponding PlayerSkill
    for (let i = 0; i < playerSkills.length; i++) {
      // Find the player by their ID (from the shirt number in tactics)
      // do not use transaction for this
      // TODO pass players to the function 
      const repository = AppDataSource.getRepository(Player);
      const [player] = await repository.find({
        where: { 
          team_id: tactics.team_id,
          player_id: playerSkills[i].playerId
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
        player.defence = playerSkills[i].defence;
        player.speed = playerSkills[i].speed;
        player.pass = playerSkills[i].pass;
        player.shoot = playerSkills[i].shoot;
        player.endurance = playerSkills[i].endurance;
        player.encoded_skills = playerSkills[i].encodedSkills;

        // Save the updated player
        await entityManager.save(player);
      }
    }
  }
}
