import { EntityManager } from "typeorm";
import { Team } from "../db/entity/Team";
import { MatchEventOutput, MatchLog } from "../types";
import { TeamHistoryMapper } from "./mapper/TeamHistoryMapper";

export class TeamService {
  /**
   * Updates team data based on match events and training points.
   * 
   * @param matchEvents - Array of match events affecting the team.
   * @param trainingPoints - The number of training points to add to the team.
   * @param teamId - The ID of the team to update.
   * @param entityManager - The transaction-scoped EntityManager instance.
   */
  async updateTeamData(matchLog: MatchLog, matchEvents: MatchEventOutput[], teamId: string, verseNumber: number, entityManager: EntityManager): Promise<void> {
    // Find the team by its ID
    const team = await entityManager.findOne(Team, { where: { team_id: teamId } });
    const teamHistory = TeamHistoryMapper.mapToTeamHistory(team!, verseNumber);

    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    // Iterate over match events and update goals
    matchEvents.forEach((event) => {
      if (event.is_goal) {
        if (event.team_id === Number(teamId)) {
          team.goals_forward += 1;
        } else {
          team.goals_against += 1;
        }
      }
    });

    // Update training points
    team.training_points = matchLog.trainingPoints;
    // Update points 
    team.points += matchLog.gamePoints;

    team.w += matchLog.gamePoints > 1 ? 1 : 0;
    team.d += matchLog.gamePoints === 1 ? 1 : 0;
    team.l += matchLog.gamePoints === 0 ? 1 : 0;

    // Save the updated team back to the database
    await entityManager.save(team);
    await entityManager.save(teamHistory);
  }

  async updateTeamMatchLog(entityManager: EntityManager, encodedMatchLog: string, team: Team): Promise<void> {
    team.match_log = encodedMatchLog;
    await entityManager.save(team);
  }

  
  
}