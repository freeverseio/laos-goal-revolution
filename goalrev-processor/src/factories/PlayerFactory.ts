import { PlayerRepository } from "../db/repository/PlayerRepository";
import { PlayerService } from "../services/PlayerService";

export class PlayerFactory {

  static createPlayerService(): PlayerService {
    const playerRepository = new PlayerRepository();
    return new PlayerService(playerRepository);
  }
}
