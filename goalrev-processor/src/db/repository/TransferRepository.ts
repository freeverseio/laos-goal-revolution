import { EntityManager } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { LastTransfer } from "../entity/LastTransfer";

export class TransferRepository {

  async getLatestBlockNumber(): Promise<number> {
    const repository = AppDataSource.getRepository(LastTransfer);
    const [lastTransfer] = await repository.find({
      order: { block_number: "DESC" },
      take: 1,
    });
    
    return lastTransfer?.block_number || 0;
  }
  

  async updateLatestBlockNumber(blockNumber: number, txHash: string, timestamp: Date, entityManager: EntityManager): Promise<void> {
    const repository = entityManager.getRepository(LastTransfer);
    await repository.upsert(
      { id: 1, block_number: blockNumber, tx_hash: txHash, timestamp: timestamp },
      { conflictPaths: ["id"] }
    );
  }
}
