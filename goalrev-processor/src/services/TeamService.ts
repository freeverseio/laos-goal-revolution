import { EntityManager } from "typeorm";
import { Team } from "../db/entity/Team";
import { MatchEventOutput, MatchLog, MatchHalf } from "../types";
import { TeamHistoryMapper } from "./mapper/TeamHistoryMapper";
import { MatchState } from "../db/entity/Match";
import { AppDataSource } from "../db/AppDataSource";

export class TeamService {

  async updateTeamData(
    matchLog: MatchLog, 
    matchLogOpponent: MatchLog,
    team: Team,
    verseNumber: number,
    is1stHalf: boolean,
    isHome: boolean,
    entityManager: EntityManager
  ): Promise<void> {
   
    team.goals_forward = matchLog.numberOfGoals;
    team.goals_against = matchLogOpponent.numberOfGoals;
    team.match_log = matchLog.encodedMatchLog;
    if (!is1stHalf) {
      const teamHistory = TeamHistoryMapper.mapToTeamHistory(team!, verseNumber);
      // Save the updated team back to the database
      await entityManager.save(teamHistory);
      
      // Update training points
      team.training_points = matchLog.trainingPoints;
      // Update points 
      team.w += isHome ? (matchLog.winner === 0 ? 1 : 0) : (matchLog.winner===1 ? 1 : 0);
      team.d += matchLog.winner===2 ? 1 : 0;
      team.l += isHome ? (matchLog.winner===1 ? 1 : 0) : (matchLog.winner===0 ? 1 : 0);
      //team.points += matchLog.gamePoints;
    } 
    await entityManager.save(team);
  }

  


  async updateTeamMatchLog(entityManager: EntityManager, encodedMatchLog: string, team: Team): Promise<void> {
    team.match_log = encodedMatchLog;
    await entityManager.save(team);
  }

  async resetTeams(): Promise<void> {
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
      .execute();
  }
  
}