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
    const maxRetries = 3;
    let broadcastedPlayers: number = 0;
    const entityManager = AppDataSource.manager;
  
    for (let index = 0; index < tokenIds.length; index++) {
      const tokenId = tokenIds[index];
      console.log(`Broadcasting Player Minted ${index + 1}/${tokenIds.length}: ${tokenId}`);
      const success = await this.attemptBroadcast(tokenId, maxRetries);
      await this.playerRepository.updateBroadcastStatus([tokenId], BroadcastStatus.SUCCESS, entityManager);
      if (success) {
        broadcastedPlayers++;
      } else {
        await this.playerRepository.updateBroadcastStatus([tokenId], BroadcastStatus.FAILED, entityManager);
        // if it fails, break the loop because otherwise we will get a nounce error
        break;
      }
    }
    
    if (broadcastedPlayers !== tokenIds.length) {
      console.error(`Minted but failed to broadcast some players minted. Broadcasted ${broadcastedPlayers}/${tokenIds.length}`);
    }
  
    return broadcastedPlayers;
  }
  
  private async attemptBroadcast(tokenId: string, maxRetries: number, attempts: number = 0): Promise<boolean> {
    const broadcastMutationInput = {
      chainId: process.env.CHAIN_ID!,
      ownershipContractAddress: process.env.CONTRACT_ADDRESS!,
      tokenId: tokenId,
    };
  
    try {
      const result = await this.executeBroadcastMutation(broadcastMutationInput);
  
      if (!result.errors && (result.data && result.data.broadcast && result.data.broadcast.success)) {
        console.log(`Broadcast success: ${broadcastMutationInput.tokenId}`);
        return true;
      } else {
        // concat error messages result.errors
        let errorMessage = result.errors?.map((error: any) => error.message).join(', ');
        throw new Error(`Broadcast failed for tokenId ${tokenId}. Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  private async executeBroadcastMutation(broadcastMutationInput: { chainId: string; ownershipContractAddress: string; tokenId: string; }): Promise<any> {
    return gqlClient.mutate({
      mutation: gql`
        mutation BroadcastPlayersMinted($input: BroadcastInput!) {
          broadcast(input: $input) {
            tokenId
            success
          }
        }
      `,
      variables: {
        input: broadcastMutationInput,
      },
    });
  }
}
