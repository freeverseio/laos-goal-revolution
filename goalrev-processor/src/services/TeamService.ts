import { gql } from "@apollo/client/core";
import { EntityManager } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { MintStatus, Team } from "../db/entity/Team";
import { TeamRepository } from "../db/repository/TeamRepository";
import { MatchLog } from "../types";
import { gqlClient } from "./graphql/GqlClient";
import { TokenQuery } from "./graphql/TokenQuery";
import { TeamHistoryMapper } from "./mapper/TeamHistoryMapper";
import { TeamMapper } from "./mapper/TeamMapper";

export class TeamService {
  private teamRepository: TeamRepository;
  private tokenQuery: TokenQuery;

  constructor(teamRepository: TeamRepository, tokenQuery: TokenQuery) {
    this.teamRepository = teamRepository;
    this.tokenQuery = tokenQuery;
  }

  async updateTeamData(
    matchLog: MatchLog,
    matchLogOpponent: MatchLog,
    team: Team,
    verseNumber: number,
    is1stHalf: boolean,
    isHome: boolean,
    entityManager: EntityManager
  ): Promise<void> {

    team.match_log = matchLog.encodedMatchLog;
    if (!is1stHalf) {
      team.goals_forward += matchLog.numberOfGoals;
      team.goals_against += matchLogOpponent.numberOfGoals;
      const teamHistory = TeamHistoryMapper.mapToTeamHistory(team!, verseNumber);
      // Save the updated team back to the database
      await entityManager.save(teamHistory);

      // Update training points
      team.training_points = matchLog.trainingPoints;
      switch (matchLog.winner) {
        case 0: // Home team wins
          if (isHome) {
            team.w += 1;
            team.points += 3;
          } else {
            team.l += 1;
          }
          break;
        case 1: // Away team wins
          if (!isHome) {
            team.w += 1;
            team.points += 3;
          } else {
            team.l += 1;
          }
          break;

        case 2: // Draw
          team.d += 1;
          team.points += 1;
          break;
      }
    }
    //update rellevant columns in DB
    await entityManager.update(Team, team.team_id, {
      match_log: team.match_log,
      goals_forward: team.goals_forward,
      goals_against: team.goals_against,
      training_points: team.training_points,
      w: team.w,
      d: team.d,
      l: team.l,
      points: team.points
    });
  }

  async updateTeamMatchLog(entityManager: EntityManager, encodedMatchLog: string, team: Team): Promise<void> {
    team.match_log = encodedMatchLog;
    await entityManager.save(team);
  }

  async resetTeams(timezoneIdx: number): Promise<void> {
    const teamRepository = AppDataSource.getRepository(Team);
    // reset all teams using QueryBuilder for clarity
    await teamRepository
      .createQueryBuilder()
      .update(Team)
      .set({
        w: 0,
        d: 0,
        l: 0,
        points: 0,
        goals_forward: 0,
        goals_against: 0
      })
      .where('timezone_idx = :timezoneIdx ', { timezoneIdx: timezoneIdx })
      .execute();
  }

  async mintFailedTeams(): Promise<boolean> {
    const teams = await this.teamRepository.findFailedTeams(1);
    if (teams.length === 0) {
      return true;
    }
    console.log(`Minting failed teams: ${teams.map(team => team.team_id)}`);
    const tokens = await this.tokenQuery.fetchTokensByOwner(process.env.CONTRACT_ADDRESS!, teams[0].owner!);
    if (!tokens || tokens.length === 0 || tokens.length < 5) {
      this.mintTeams(teams);
    } else {
      console.log(`Tokens found for team ${teams[0].team_id}: ${tokens.map(token => token.tokenId)}`);
      const updatedTeam = TeamMapper.mapTokenIndexerToTeamPlayers(teams[0], tokens);
      await this.teamRepository.save(updatedTeam);
    }
    return true;
  }

  async mintPendingTeams(): Promise<boolean> {
    const limit = process.env.MINT_PENDING_TEAMS_LIMIT ? parseInt(process.env.MINT_PENDING_TEAMS_LIMIT!) : 5;
    const teams = await this.teamRepository.findPendingTeams(limit);
    if (teams.length === 0) {
      return true;
    }
    return this.mintTeams(teams);
  }

  async mintTeams(teams: Team[]): Promise<boolean> {
    const mintTeamMutation = TeamMapper.mapTeamPlayersToMintMutation(teams);
    // console.log('Minting teams:', JSON.stringify(mintTeamMutation));
    try {
      const result = await gqlClient.mutate({
        mutation: gql`
          mutation MintTeam($input: MintInput!) {
            mint(input: $input) {
              tokenIds
            }
          }
        `,
        variables: {
          input: mintTeamMutation.input
        }
      });
      if (result.errors) {
        this.teamRepository.setMintStatus(teams.map(team => team.team_id), MintStatus.FAILED);
        throw new Error(`Failed to mint team: ${result.errors[0].message}`);
      }
      const updatedTeams = TeamMapper.mapMintedPlayersToTeamPlayers(teams, result.data.mint.tokenIds);
      const entityManager = AppDataSource.manager;
      await this.teamRepository.bulkUpdate(updatedTeams, entityManager);

      // broadcast players minted
      let assetsBroadcasted = 0;
      try {
        assetsBroadcasted = await this.broadcastPlayersMinted(result.data.mint.tokenIds);
        if (assetsBroadcasted !== result.data.mint.tokenIds.length) {
          console.error(`Minted but failed to broadcast some players minted. Brodcasted ${assetsBroadcasted}/${result.data.mint.tokenIds.length}` );
        }
      } catch (error) {
        console.error(`Minted but failed to broadcast some players. Brodcasted ${assetsBroadcasted}/${result.data.mint.tokenIds.length}. Error: ${error}`);
      }

      return true;
    } catch (error) {
      this.teamRepository.setMintStatus(teams.map(team => team.team_id), MintStatus.FAILED);
      throw new Error(`Failed to mint team: ${error}`);
    }
  }

  async broadcastPlayersMinted(tokenIds: string[]): Promise<number> {
    let broadcastedPlayers: number = 0;
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      
      const broadcastMutationInput = {
        chainId: process.env.CHAIN_ID!,
        ownershipContractAddress: process.env.CONTRACT_ADDRESS!,
        tokenId: tokenId,      
      };
      console.log(`Broadcasting Player Minted ${i+1}/${tokenIds.length}: ${broadcastMutationInput.tokenId}`);
      const result = await gqlClient.mutate({
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
        }
      });
      broadcastedPlayers++;
      console.log(`broadcasted Player Minted: ${broadcastMutationInput.tokenId} success: ${result.data.broadcast.success}`);
    }

    return broadcastedPlayers;

  }
}