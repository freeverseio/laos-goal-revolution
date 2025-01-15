import { EntityManager } from "typeorm";
import { BroadcastStatus, EvolveStatus, Player, PlayerPartialUpdate, Team } from "../db/entity";
import { PlayerSkill } from "../types/rest/output/team";
import { PlayerHistoryMapper } from "./mapper/PlayerHistoryMapper";
import { PlayerRepository } from "../db/repository/PlayerRepository";
import { gql } from "@apollo/client/core";
import { gqlClient } from "./graphql/GqlClient";
import { AppDataSource } from "../db/AppDataSource";
import { PlayerMapper } from "./mapper/PlayerMapper";

export class PlayerService {

  private playerRepository: PlayerRepository;

  constructor(playerRepository: PlayerRepository) {
    this.playerRepository = playerRepository;
  }

  async updateSkills(team: Team, playerSkills: PlayerSkill[], verseNumber: number, isBot: boolean, entityManager: EntityManager): Promise<void> {

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
        if (!isBot && player.token_id !== null) {
          player.evolve_status = EvolveStatus.PENDING;
        }

        // save player history
        const playerHistory = PlayerHistoryMapper.mapToPlayerHistory(player, verseNumber);
        await this.playerRepository.savePlayerHistory(playerHistory, entityManager);
        let playerPartialUpdate: PlayerPartialUpdate = {
          defence: playerSkills[i].defence,
          speed: playerSkills[i].speed,
          pass: playerSkills[i].pass,
          shoot: playerSkills[i].shoot,
          endurance: playerSkills[i].endurance,
          encoded_skills: playerSkills[i].encodedSkills
        }
        if (!isBot && player.token_id !== null) {
          playerPartialUpdate.evolve_status = player.evolve_status;
        }

        await this.playerRepository.updatePartial(playerSkills[i].playerId, playerPartialUpdate, entityManager);
      }
    }
  }

  async broadcastPlayersPending(): Promise<number> {
    const BROADCAST_BATCH_SIZE_ON_CHAIN = process.env.BROADCAST_BATCH_SIZE_ON_CHAIN ? Number(process.env.BROADCAST_BATCH_SIZE_ON_CHAIN) : 1000;
    const BROADCAST_BATCH_SIZE_DB = process.env.BROADCAST_BATCH_SIZE_DB ? Number(process.env.BROADCAST_BATCH_SIZE_DB) : 200;

    const playersPending = await this.playerRepository.findPlayersPending();
    const tokenIds = playersPending.map(player => player.token_id).filter(tokenId => tokenId !== undefined) as string[];
    let broadcastedPlayers: number = 0;
    let errorUpdatingDB = false;

    // Batch processing this.BROADCAST_BATCH_SIZE_ON_CHAIN tokenIds at a time
    for (let i = 0; i < tokenIds.length; i += BROADCAST_BATCH_SIZE_ON_CHAIN) {
      const entityManager = AppDataSource.manager;
      const batchTokenIds = tokenIds.slice(i, i + BROADCAST_BATCH_SIZE_ON_CHAIN);
      console.log(`Broadcasting ${batchTokenIds.length} Players Minted ${i + batchTokenIds.length}/${tokenIds.length}: ${batchTokenIds}`);
      const success = await this.broadcastBatch(batchTokenIds);
      if (success) {
        for (let j = 0; j < batchTokenIds.length; j += BROADCAST_BATCH_SIZE_DB) {
          const statusUpdateBatch = batchTokenIds.slice(j, j + BROADCAST_BATCH_SIZE_DB);
          try {
            await this.playerRepository.updateBroadcastStatus(statusUpdateBatch, BroadcastStatus.SUCCESS, entityManager);
            broadcastedPlayers += statusUpdateBatch.length;

          } catch (error) {
            console.error(`Error updating broadcast status for batch starting at index ${j}:`, error);
            console.error(`First tokenId of this DB batch: ${statusUpdateBatch[0]}`);
            errorUpdatingDB = true;
            break;
          }
        }

      } else {
        for (let j = 0; j < batchTokenIds.length; j += BROADCAST_BATCH_SIZE_DB) {
          const statusUpdateBatch = batchTokenIds.slice(j, j + BROADCAST_BATCH_SIZE_DB);
          try {
            await this.playerRepository.updateBroadcastStatus(statusUpdateBatch, BroadcastStatus.FAILED, entityManager);
            broadcastedPlayers += statusUpdateBatch.length;

          } catch (error) {
            console.error(`Error updating broadcast status in batch starting at index ${j}:`, error);
            console.error(`First tokenId of this DB batch: ${statusUpdateBatch[0]}`);
            errorUpdatingDB = true;
            break;
          }
        }

        // since it failed, break the loop because otherwise we may get a nonce error
        break;
      }

      if (errorUpdatingDB) {
        break;
      }
    }

    if (broadcastedPlayers !== tokenIds.length) {
      console.error(`Minted but failed to broadcast some players minted. Broadcasted ${broadcastedPlayers}/${tokenIds.length}`);
    }

    return broadcastedPlayers;
  }

  private async broadcastBatch(tokenIds: string[]): Promise<boolean> {
    const broadcastBatchMutationInput = {
      chainId: process.env.CHAIN_ID!,
      ownershipContractAddress: process.env.CONTRACT_ADDRESS!,
      tokenIds: tokenIds,
      type: "SELF",
    };

    try {
      const result = await this.executeBroadcastBatchMutation(broadcastBatchMutationInput);

      if (!result.errors && (result.data && result.data.broadcastBatch && result.data.broadcastBatch.success)) {
        console.log(`Broadcast success: ${broadcastBatchMutationInput.tokenIds}`);
        return true;
      } else {
        // concat error messages result.errors
        let errorMessage = result.errors?.map((error: any) => error.message).join(', ');
        throw new Error(`Broadcast failed for tokenIds ${tokenIds}. Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private async executeBroadcastBatchMutation(broadcastBatchMutationInput: { chainId: string; ownershipContractAddress: string; tokenIds: string[]; type: string; }): Promise<any> {
    return gqlClient.mutate({
      mutation: gql`
        mutation BroadcastBatchPlayersMinted($input: BroadcastBatchInput!) {
          broadcastBatch(input: $input) {
            tokenIds
            success
          }
        }
      `,
      variables: {
        input: broadcastBatchMutationInput,
      },
      fetchPolicy: 'no-cache',
    });
  }

  async evolvePlayersPending(): Promise<number> {
    const EVOLVE_BATCH_SIZE_ON_CHAIN = process.env.EVOLVE_BATCH_SIZE_ON_CHAIN ? Number(process.env.EVOLVE_BATCH_SIZE_ON_CHAIN) : 500;
    const EVOLVE_BATCH_SIZE_DB = process.env.EVOLVE_BATCH_SIZE_DB ? Number(process.env.EVOLVE_BATCH_SIZE_DB) : 200;

    // Find players Pending or Failed
    const playersPendingToEvolve = await this.playerRepository.findPlayersPendingToEvolve(EVOLVE_BATCH_SIZE_ON_CHAIN);
    if (playersPendingToEvolve.length === 0) {     
      return 0; // No players to evolve
    }

    let evolvedPlayers: number = 0;
    // Batch processing this.EVOLVE_BATCH_SIZE_ON_CHAIN tokenIds at a time
    console.log(`[evolvePlayersPending] Evolving ${playersPendingToEvolve.length} Players ${playersPendingToEvolve.length}/${playersPendingToEvolve.length}.`);
    const success = await this.evolveBatchPlayers(playersPendingToEvolve);
    const entityManager = AppDataSource.manager;
    if (success) {
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        for (let j = 0; j < playersPendingToEvolve.length; j += EVOLVE_BATCH_SIZE_DB) {
          const statusUpdateBatch = playersPendingToEvolve.slice(j, j + EVOLVE_BATCH_SIZE_DB);
          try {
            const playerPartialUpdate: PlayerPartialUpdate = {
              evolve_status: EvolveStatus.SUCCESS,
              evolved_at: new Date()
            };
            const playerIds = statusUpdateBatch.map(player => player.player_id);             
            if (playerIds.length > 0) {
              await this.playerRepository.updatePartialPlayersBulk(playerIds, playerPartialUpdate, transactionManager);
              evolvedPlayers += statusUpdateBatch.length;
            }

          } catch (error) {
            console.error(`[evolvePlayersPending] Error updating evolved_status in DB in batch starting at index ${j}:`, error);
            console.error(`[evolvePlayersPending] First tokenId of this DB batch: ${statusUpdateBatch[0]}`);
            break;
          }
        }
      });

    } else {
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        for (let j = 0; j < playersPendingToEvolve.length; j += EVOLVE_BATCH_SIZE_DB) {
          const statusUpdateBatch = playersPendingToEvolve.slice(j, j + EVOLVE_BATCH_SIZE_DB);
          try {
            const playerPartialUpdate: PlayerPartialUpdate = {
              evolve_status: EvolveStatus.FAILED
            };
            const playerIds = statusUpdateBatch.map(player => player.player_id);
            if (playerIds.length > 0) {
              await this.playerRepository.updatePartialPlayersBulk(playerIds, playerPartialUpdate, transactionManager);
              evolvedPlayers += statusUpdateBatch.length;              
            }

          } catch (error) {
            console.error(`[evolvePlayersPending] Error updating evolved_status in DB in batch starting at index ${j}:`, error);
            console.error(`[evolvePlayersPending] First tokenId of this DB batch: ${statusUpdateBatch[0]}`);
            break;
          }
        }
      });
    }

    if (evolvedPlayers !== playersPendingToEvolve.length) {
      console.error(`[evolvePlayersPending] Fail to evolve all Players. Evolving ${evolvedPlayers}/${playersPendingToEvolve.length}`);
    }

    return evolvedPlayers;
  }

  async evolveBatchPlayers(players: Player[]): Promise<boolean> {
    const evolveplayersMutation = PlayerMapper.mapPlayersToEvolveMutation(players);
    try {
      const result = await gqlClient.mutate({
        mutation: gql`
          mutation EvolveBatchPlayers($input: EvolveBatchInput!) {
            evolveBatch(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: evolveplayersMutation.input
        },
        fetchPolicy: 'no-cache',
      });
      if (result?.errors) {
        throw new Error(`[evolvePlayersPending] Failed to EvolveBatchPlayers: ${result.errors[0].message}`);
      }
      if (result?.data?.evolveBatch?.success === true) {
        return true;
      }
      throw new Error(`[evolvePlayersPending] Failed to evolve Players: success !== true`);

    } catch (error) {
      console.error(error);
      return false;
    }
  }

}
