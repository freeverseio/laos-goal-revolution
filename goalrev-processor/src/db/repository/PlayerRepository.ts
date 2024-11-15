import { EntityManager, In } from "typeorm";
import { Player, PlayerPartialUpdate, PlayerHistory } from "../entity";
import { AppDataSource } from "../AppDataSource";

export class PlayerRepository {
  async bulkUpdate(players: Player[], transactionalEntityManager: EntityManager): Promise<void> {
    const playerRepository = transactionalEntityManager.getRepository(Player);
    await playerRepository.save(players);
  }

  async findByTokenId(tokenId: string): Promise<Player | null> {
    const playerRepository = AppDataSource.getRepository(Player);
    return await playerRepository.findOneBy({ token_id: tokenId });
  }

  async findPlayersByTokenIds(tokenIds: string[]): Promise<Player[]> {
    const playerRepository = AppDataSource.getRepository(Player);
    return await playerRepository.findBy({ token_id: In(tokenIds) });
  }

  async updatePartial(player_id: string, player: PlayerPartialUpdate): Promise<void> {
    const playerRepository = AppDataSource.getRepository(Player);
    await playerRepository.update(player_id, player);
  }

  async savePlayerHistory(playerHistory: PlayerHistory): Promise<void> {
    const playerHistoryRepository = AppDataSource.getRepository(PlayerHistory);
    await playerHistoryRepository.save(playerHistory);
  }
}

