import { EntityManager, In, IsNull, Not } from "typeorm";
import { Player, PlayerPartialUpdate, PlayerHistory, BroadcastStatus, EvolveStatus } from "../entity";
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

  async updatePartial(player_id: string, player: PlayerPartialUpdate, entityManager: EntityManager): Promise<void> {
    const playerRepository = entityManager.getRepository(Player);
    await playerRepository.update(player_id, player);
  }

  async updatePartialPlayersBulk(tokenIds: string[], player: PlayerPartialUpdate, entityManager: EntityManager): Promise<void> {
    const playerRepository = entityManager.getRepository(Player);
    await playerRepository.update(
      { player_id: In(tokenIds) },
      player
    );
  }

  async savePlayerHistory(playerHistory: PlayerHistory, entityManager: EntityManager): Promise<void> {
    const playerHistoryRepository = entityManager.getRepository(PlayerHistory);
    await playerHistoryRepository.save(playerHistory);
  }

  async updateBroadcastStatus(tokenIds: string[], broadcastStatus: BroadcastStatus, entityManager: EntityManager): Promise<void> {
    const playerRepository = entityManager.getRepository(Player); 
    await playerRepository.update(
      { token_id: In(tokenIds) },
      { broadcast_status: broadcastStatus }
    );
  }

  async findPlayersPending(): Promise<Player[]> {
    const playerRepository = AppDataSource.getRepository(Player);
    return await playerRepository.find({
      where: { broadcast_status: In([BroadcastStatus.PENDING, BroadcastStatus.FAILED]) },
      order: { broadcast_status: 'DESC' }
    });
  }

  async findPlayersPendingToEvolve(limit: number = 500): Promise<Player[]> {
    const playerRepository = AppDataSource.getRepository(Player);
    return await playerRepository.find({
      where: {
        evolve_status: In([EvolveStatus.PENDING, EvolveStatus.FAILED]),
        token_id: Not(IsNull())
       },
      order: { evolve_status: 'DESC' },
      take: limit
    });
  }

}
