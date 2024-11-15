import { EntityManager } from "typeorm";
import { Player, Team } from "../db/entity";
import { PlayerSkill } from "../types/rest/output/team";
import { PlayerHistoryMapper } from "./mapper/PlayerHistoryMapper";
import { PlayerRepository } from "../db/repository/PlayerRepository";

export class PlayerService {

  private playerRepository: PlayerRepository;

  constructor(playerRepository: PlayerRepository) {
    this.playerRepository = playerRepository;
  }

  /**
   * Updates the skills of players based on the given player skills array.
   * @param tactics - The team tactics containing the player IDs.
   * @param playerSkills - An array of player skills, where each element corresponds to a shirt number in tactics.
   * @param verseNumber - The verse number.
   * @param entityManager - The transaction-scoped EntityManager instance.
   */
  async updateSkills(team: Team, playerSkills: PlayerSkill[], verseNumber: number, entityManager: EntityManager): Promise<void> {
   
    // Update each player based on their player ID and corresponding PlayerSkill
    for (let i = 0; i < playerSkills.length; i++) {
      // Find the player by their ID 
      // do not use transaction for this
      const player = team.players.find(p => p.player_id === playerSkills[i].playerId);
     
      if (player) {
        // Update the player's skills
        player.defence = playerSkills[i].defence;
        player.speed = playerSkills[i].speed;
        player.pass = playerSkills[i].pass;
        player.shoot = playerSkills[i].shoot;
        player.endurance = playerSkills[i].endurance;
        player.encoded_skills = playerSkills[i].encodedSkills;

        // save player history
        const playerHistory = PlayerHistoryMapper.mapToPlayerHistory(player, verseNumber);
        await this.playerRepository.savePlayerHistory(playerHistory);
        await this.playerRepository.updatePartial(playerSkills[i].playerId, {
          defence: playerSkills[i].defence,
          speed: playerSkills[i].speed,
          pass: playerSkills[i].pass,
          shoot: playerSkills[i].shoot,
          endurance: playerSkills[i].endurance,
          encoded_skills: playerSkills[i].encodedSkills,
        });
      }
    }
  }
}
