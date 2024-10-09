import { EntityManager } from "typeorm";
import { Team } from "../db/entity/Team";
import { LeagueGroup, MatchEventOutput, MatchLog, TeamId } from "../types";
import { Country } from "../db/entity/Country";
import { AppDataSource } from "../db/AppDataSource";

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

  async updateTeamMatchLog(entityManager: EntityManager, encodedMatchLog: string, team: Team): Promise<void> {
    team.match_log = encodedMatchLog;
    await entityManager.save(team);
  }

  async getNewLeagues(): Promise<LeagueGroup[]> {
    const entityManager = AppDataSource.manager;
    // Step 1: Fetch all countries (grouping will be done by country and timezone)
    const countries = await entityManager.find(Country);
  
    const leagueGroups: LeagueGroup[] = [];
  
    // Step 2: For each country, fetch distinct timezones and then fetch teams for each country and timezone
    for (const country of countries) {

        const teams = await entityManager
          .createQueryBuilder(Team, "team")
          .leftJoinAndSelect("team.country", "country")
          .where("country.country_idx = :countryIdx AND team.timezone_idx = :timezoneIdx", {
            countryIdx: country.country_idx,
            timezoneIdx: country.timezone_idx,
          })
          .orderBy("team.ranking_points", "DESC")
          .getMany();
        if (teams.length <= 0) {
          continue;
        }
        // Step 4: Group the teams into leagues of 8 and add them to structured response
        const leagues: TeamId[][] = [];
        for (let i = 0; i < teams.length; i += 8) {
          leagues.push(teams.slice(i, i + 8).map(team => team.team_id as TeamId));
        }
  
        // Step 5: Add the grouped leagues for the country and timezone to the result
        leagueGroups.push({
          country,
          timezone: country.timezone_idx,
          leagues,
        });
      
    }
  
    return leagueGroups;
  }
}