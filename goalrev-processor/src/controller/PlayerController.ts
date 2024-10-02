import { LessThan } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { Player } from "../db/entity/Player";

export class PlayerController {

  // Insert a new player
  async createPlayer(playerData: Partial<Player>, blockNumber: number): Promise<Player> {
    const playerRepository = AppDataSource.getRepository(Player); // Get repository from AppDataSource
    const newPlayer = new Player();
    Object.assign(newPlayer, playerData);
    await playerRepository.save(newPlayer); // Use save instead of insertPlayer
    return newPlayer;
  }

  // Update a player
  async updatePlayer(playerData: Partial<Player>, blockNumber: number): Promise<void> {
    const playerRepository = AppDataSource.getRepository(Player); // Get repository from AppDataSource
    const player = await playerRepository.findOneBy({ player_id: playerData.player_id! });
    if (player) {
      Object.assign(player, playerData);
      await playerRepository.save(player); 
    }
  }

  // Get player by player_id
  async getPlayerById(player_id: string): Promise<Player | null> {
    const playerRepository = AppDataSource.getRepository(Player); // Get repository from AppDataSource
    return await playerRepository.findOneBy({ player_id });
  }

  // Get active players by team_id
  async getActivePlayersByTeamId(team_id: string): Promise<Player[]> {
    const playerRepository = AppDataSource.getRepository(Player); // Get repository from AppDataSource
    return await playerRepository.find({
      where: { team: { id: team_id }, shirt_number: LessThan(25) }, 
    });
  }

  // Bulk insert or update players
  async bulkInsertPlayers(players: Player[]): Promise<void> {
    const playerRepository = AppDataSource.getRepository(Player); // Get repository from AppDataSource
    await playerRepository.save(players); // Use save for bulk insert/update
  }
}
