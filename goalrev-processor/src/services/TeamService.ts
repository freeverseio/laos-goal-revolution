import { EntityManager } from "typeorm";
import { MintStatus, Team } from "../db/entity/Team";
import { MatchLog, MintTeamInput } from "../types";
import { TeamHistoryMapper } from "./mapper/TeamHistoryMapper";
import { AppDataSource } from "../db/AppDataSource";
import { TeamRepository } from "../db/repository/TeamRepository";
import { TeamMapper } from "./mapper/TeamMapper";
import { gql } from "@apollo/client";
import { gqlClient } from "./graphql/GqlClient";
import { MintedPlayer, MintTeamResponse } from "../types/rest/output/team";

export class TeamService {
  private teamRepository: TeamRepository;

  constructor(teamRepository: TeamRepository) {
    this.teamRepository = teamRepository;
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

  async mintTeam(mintTeamInput: MintTeamInput): Promise<MintedPlayer[]> {
    this.teamRepository.setMintStatus(mintTeamInput.teamId, MintStatus.PENDING);
    const team = await this.teamRepository.findCompleteTeamByTeamId(mintTeamInput.teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    const mintTeamMutation = TeamMapper.mapTeamPlayersToMintMutation(team!, mintTeamInput.address);
    // console.log(JSON.stringify(mintTeamMutation));
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
        this.teamRepository.setMintStatus(mintTeamInput.teamId, MintStatus.FAILED);
        throw new Error(`Failed to mint team: ${result.errors[0].message}`);
      }

      const updatedTeam = TeamMapper.mapMintedPlayersToTeamPlayers(team, result.data.mint.tokenIds);
      await this.teamRepository.save(updatedTeam);
      this.teamRepository.setMintStatus(mintTeamInput.teamId, MintStatus.SUCCESS);
      return team.players.map((player) => ({
        id: player.player_id,
        tokenId: player.token_id!,
        teamId: team.team_id
      }));
    } catch (error) {
      this.teamRepository.setMintStatus(mintTeamInput.teamId, MintStatus.FAILED);
      throw new Error(`Failed to mint team: ${error}`);
    }

  }
}