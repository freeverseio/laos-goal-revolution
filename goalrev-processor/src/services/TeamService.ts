import { AppDataSource } from "../db/AppDataSource";
import { Team } from "../db/entity/Team";
import { MatchEventOutput } from "../types"; // Assuming you have a MatchEvent type defined like the one you provided

export class TeamService {
  private teamRepository = AppDataSource.getRepository(Team);

  /**
   * Updates team data based on match events and training points.
   * 
   * @param matchEvents - Array of match events affecting the team.
   * @param trainingPoints - The number of training points to add to the team.
   * @param teamId - The ID of the team to update.
   */
  async updateTeamData(matchEvents: MatchEventOutput[], trainingPoints: number, teamId: string): Promise<void> {
    // Find the team by its ID
    const team = await this.teamRepository.findOne({ where: { team_id: teamId } });
    
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    // Iterate over match events and update goals
    matchEvents.forEach((event) => {
      if (event.is_goal) {
        // If the event's team ID matches the team's ID, it's a goal for the team
        if (event.team_id === Number(teamId)) {
          team.goals_forward += 1;
        } else {
          // Otherwise, it's a goal against the team
          team.goals_against += 1;
        }
      }
    });

    // Update training points
    team.training_points = trainingPoints;

    // Update points 
    if (team.goals_forward > team.goals_against) {
      team.points += 3;
    } else if (team.goals_forward === team.goals_against) {
      team.points += 1;
    }

    // Save the updated team back to the database
    await this.teamRepository.save(team);
  }
}
