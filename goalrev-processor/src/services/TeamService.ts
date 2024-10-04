import { EntityManager } from "typeorm";
import { Team } from "../db/entity/Team";
import { MatchEventOutput, MatchLog } from "../types";

export class TeamService {
  /**
   * Updates team data based on match events and training points.
   * 
   * @param matchEvents - Array of match events affecting the team.
   * @param trainingPoints - The number of training points to add to the team.
   * @param teamId - The ID of the team to update.
   * @param entityManager - The transaction-scoped EntityManager instance.
   */
  async updateTeamData(matchLog: MatchLog, matchEvents: MatchEventOutput[], teamId: string, entityManager: EntityManager): Promise<void> {
    // Find the team by its ID
    const team = await entityManager.findOne(Team, { where: { team_id: teamId } });
    
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

    // Save the updated team back to the database
    await entityManager.save(team);
  }
}
