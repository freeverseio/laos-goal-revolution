import { AppDataSource } from "../db/AppDataSource";
import { BroadcastStatus, PlayerPartialUpdate, Team } from ";
import { PlayerRepository } from "../db/repository/PlayerRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { TransferRepository } from "../db/repository/TransferRepository";
import { Transfer } from "../types/graphql/transfer";
import { IN_TRANSIT_SHIRTNUM, PLAYERS_PER_TEAM_MAX } from "../utils/constants/constants";
import { RpcUtils } from "./blockchain/RpcUtils";
import { TransferQuery } from "./graphql/TransferQuery";

export class TransferService {
  private transferQuery: TransferQuery;
  private transferRepository: TransferRepository;
  private playerRepository: PlayerRepository;
  private teamRepository: TeamRepository;

  constructor(transferQuery: TransferQuery, transferRepository: TransferRepository, playerRepository: PlayerRepository, teamRepository: TeamRepository) {
    this.transferQuery = transferQuery;
    this.transferRepository = transferRepository;
    this.playerRepository = playerRepository;
    this.teamRepository = teamRepository;
  }

  async syncTransfers() {
    const targetBlockNumber = await this.transferRepository.getLatestBlockNumber();
    const transfers = await this.transferQuery.fetchTransfers(targetBlockNumber, 0, 20);
    if (transfers.length === 0) {
      console.log(`No transfers found for block ${targetBlockNumber}`);
      return true;
    }
    await this.processTransfers(transfers);
    return true;
  }

  private isMintEvent(transfer: Transfer): boolean {
    return transfer.from === transfer.to || transfer.from === "0x0000000000000000000000000000000000000000";
  }
  
  private async setBroadcastStatusToSuccess(transfers: Transfer[]) {
    try {
      const entityManager = AppDataSource.manager;
      const tokenIdArray = transfers.map(transfer => transfer.tokenId);
      const batchSize = process.env.BROADCAST_BATCH_SIZE_DB ? parseInt(process.env.BROADCAST_BATCH_SIZE_DB) : 200;
      for (let i = 0; i < tokenIdArray.length; i += batchSize) {
        const batch = tokenIdArray.slice(i, i + batchSize);
        await this.playerRepository.updateBroadcastStatus(batch, BroadcastStatus.SUCCESS, entityManager);
      }
    } catch (error) {
      console.error(`Error in Sync transfers updating broadcast status to success`, error);
    }
  }

  async processTransfers(transfers: Transfer[]): Promise<void> {
    try {
      let lastTransfer: Transfer | null = null;

      const latestBlockNumber = await RpcUtils.getLatestBlockNumber();
      const blockMargin = process.env.BLOCK_MARGIN ? parseInt(process.env.BLOCK_MARGIN) : 100;
      console.log('RPC latest block number', latestBlockNumber);

      await this.setBroadcastStatusToSuccess(transfers);

      const realPlayerTransfers = transfers.filter(transfer => !this.isMintEvent(transfer));
      const tokenIds = realPlayerTransfers.map(transfer => transfer.tokenId);
      const players = await this.playerRepository.findPlayersByTokenIds(tokenIds);
      
      if (realPlayerTransfers.length > 0 && !players || players.length === 0) {
        console.log('Players not found for tokenIds: ' + tokenIds.join(', '));
        lastTransfer = realPlayerTransfers[realPlayerTransfers.length - 1];
        if (lastTransfer && lastTransfer.blockNumber < latestBlockNumber - blockMargin) {
          await this.transferRepository.updateLatestBlockNumber(lastTransfer!.blockNumber, lastTransfer!.txHash, new Date(lastTransfer!.timestamp), AppDataSource.manager);
        }
        return;
      }
      
      if (tokenIds.length > players.length) {
        // TODO: handle this case
        // get asset from indexer by tokenId
        // get db with asset id
        // update player tokenId
      }

      const uniqueToAddresses = [...new Set(transfers.map(transfer => transfer.to))];
      uniqueToAddresses.push(...new Set(transfers.map(transfer => transfer.from)));
      const uniqueToAddressesArray = uniqueToAddresses as string[];
      const teams = await this.getTeamsByOwners(uniqueToAddressesArray);
      const teamMap = new Map(teams.map(team => [team.owner.toLowerCase(), team]));
      // Update the players based on the transfer
      for (const transfer of transfers) {
        const player = players.find(p => p.token_id === transfer.tokenId);
        const playerId = player?.player_id;
        let playerPartialUpdate: PlayerPartialUpdate = {};
        if (player) {
          // leave some buffer for reorgs
          if (transfer.blockNumber < latestBlockNumber - blockMargin) {
            const team = teamMap.get(transfer.to.toLowerCase());
            if (team) {
              if (team.owner !== transfer.to) {                
                playerPartialUpdate = {
                  team_id: team.team_id,                
                  shirt_number: await this.getFreeShirtNumber(team.team_id)
                };              
              }
              lastTransfer = transfer;
            } else {
              console.log(`Team for ${transfer.to} not found. Assigning to default team`);
              // assign to default team
              const defaultTeam = await this.teamRepository.findById(process.env.DEFAULT_TEAM_ID!);
              if (defaultTeam) {
                playerPartialUpdate = {
                  team_id: defaultTeam.team_id,                
                  shirt_number: await this.getFreeShirtNumber(defaultTeam.team_id)
                };
                lastTransfer = transfer;
              }
            }
          } else {
            console.log(`Skipping transfer ${transfer.tokenId} to ${transfer.to} at block ${transfer.blockNumber} as it is too recent`);
          }
        } else {
          console.log(`Player ${transfer.tokenId} not found: `);
          lastTransfer = transfer;
          await this.transferRepository.updateLatestBlockNumber(lastTransfer!.blockNumber, lastTransfer!.txHash, new Date(lastTransfer!.timestamp), AppDataSource.manager);
          return;
        }
        if (lastTransfer && playerId) {
          const queryRunner = AppDataSource.createQueryRunner();
          await queryRunner.startTransaction();
          try {
            console.log(`[syncTransfers] Updating player ${playerId} with ${JSON.stringify(playerPartialUpdate)}`);
            const transactionalEntityManager = queryRunner.manager;
            await this.playerRepository.updatePartial(playerId, playerPartialUpdate, transactionalEntityManager);
            await this.transferRepository.updateLatestBlockNumber(
                lastTransfer!.blockNumber,
                lastTransfer!.txHash,
                new Date(lastTransfer!.timestamp),
                transactionalEntityManager
            );
            await queryRunner.commitTransaction();
          } catch (error) {
              console.error('Error caught during transaction:', error);
              await queryRunner.rollbackTransaction();

          } finally {
              if (!queryRunner.isReleased) {
                  await queryRunner.release();
              } else {
                  console.warn('QueryRunner already released before explicit release.');
              }
          }
        }
      }
    } catch (error) {
      console.error('Error processing transfers:', error);
      throw error;
    }
    
  }

  private async getTeamsByOwners(owners: string[]): Promise<Team[]> {
    const teams = await this.teamRepository.findByOwners(owners);
    return teams;
  }

  private async getFreeShirtNumber(teamId: string): Promise<number> {
    const shirtNumbers = await this.teamRepository.getShirtNumbers(teamId);
    for (let i = PLAYERS_PER_TEAM_MAX-1; i >= 0; i--) {
      if (!shirtNumbers.includes(i)) {
        return i;
      }
    }
    return IN_TRANSIT_SHIRTNUM;
  }
}
