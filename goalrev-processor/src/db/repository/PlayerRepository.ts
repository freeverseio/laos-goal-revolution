import { EntityManager } from "typeorm";
import { Player } from "../entity";

export class PlayerRepository {
  async bulkUpdate(players: Player[], transactionalEntityManager: EntityManager): Promise<void> {
    const playerRepository = transactionalEntityManager.getRepository(Player);
    await playerRepository.save(players);
  }
}

