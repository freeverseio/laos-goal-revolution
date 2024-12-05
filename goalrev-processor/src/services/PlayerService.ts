import { EntityManager } from "typeorm";
import { BroadcastStatus, Player, Team } from "../db/entity";
import { PlayerSkill } from "../types/rest/output/team";
import { PlayerHistoryMapper } from "./mapper/PlayerHistoryMapper";
import { PlayerRepository } from "../db/repository/PlayerRepository";
import { gql } from "@apollo/client/core";
import { gqlClient } from "./graphql/GqlClient";
import { AppDataSource } from "../db/AppDataSource";

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
        await this.playerRepository.savePlayerHistory(playerHistory, entityManager);
        await this.playerRepository.updatePartial(playerSkills[i].playerId, {
          defence: playerSkills[i].defence,
          speed: playerSkills[i].speed,
          pass: playerSkills[i].pass,
          shoot: playerSkills[i].shoot,
          endurance: playerSkills[i].endurance,
          encoded_skills: playerSkills[i].encodedSkills,
        }, entityManager);
      }
    }
  }

  async broadcastPlayersPending(): Promise<number> {
    const playersPending = await this.playerRepository.findPlayersPending();
    const tokenIds = playersPending.map(player => player.token_id).filter(tokenId => tokenId !== undefined) as string[];
    let broadcastedPlayers: number = 0;
    const entityManager = AppDataSource.manager;
  
    // Batch processing 18 tokenIds at a time
    for (let i = 0; i < tokenIds.length; i += 18) {
      const batchTokenIds = tokenIds.slice(i, i + 18);
      console.log(`Broadcasting ${batchTokenIds.length} Players Minted ${i + batchTokenIds.length}/${tokenIds.length}: ${batchTokenIds}`);      
      const success = await this.attemptBroadcast(batchTokenIds);
      if (success) {
        await this.playerRepository.updateBroadcastStatus(batchTokenIds, BroadcastStatus.SUCCESS, entityManager);
        broadcastedPlayers += batchTokenIds.length;
      } else {
        await this.playerRepository.updateBroadcastStatus(batchTokenIds, BroadcastStatus.FAILED, entityManager);
        // if it fails, break the loop because otherwise we may get a nonce error
        break;
      }
    }
    
    if (broadcastedPlayers !== tokenIds.length) {
      console.error(`Minted but failed to broadcast some players minted. Broadcasted ${broadcastedPlayers}/${tokenIds.length}`);
    }
  
    return broadcastedPlayers;
  }
  
  private async attemptBroadcast(tokenIds: string[]): Promise<boolean> {
    const broadcastBatchMutationInput = {
      chainId: process.env.CHAIN_ID!,
      ownershipContractAddress: process.env.CONTRACT_ADDRESS!,
      tokenIds: tokenIds,
      type: "MINT",
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
    });
  }
}
