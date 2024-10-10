import { AppDataSource } from "../AppDataSource";
import { EntityManager, In, Repository } from "typeorm";
import { Team } from "../entity/Team";
import { TeamId } from "../../types/leaguegroup";

export class TeamRepository  {
  
  async findTeamsByCountryAndTimezone(countryIdx: number, timezoneIdx: number): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository
      .createQueryBuilder("team")
      .leftJoinAndSelect("team.country", "country")
      .where("country.country_idx = :countryIdx AND team.timezone_idx = :timezoneIdx", {
        countryIdx: countryIdx,
        timezoneIdx: timezoneIdx,
      })
      .orderBy("team.ranking_points", "DESC")
      .getMany();
    return teams;
  }

  async updateLeagueIdx(teamId: string, leagueIdx: number, transactionalEntityManager: EntityManager): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    await teamRepository.update(teamId, { league_idx: leagueIdx });
  }

  async updateLeagueIdxInBulk(teams: TeamId[], leagueIdx: number, transactionalEntityManager: EntityManager): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
  
    const updatePromises = teams.map((teamId, index) => {
      const teamIdxInLeague = index % 8; // Index between 0 and 7
      return teamRepository.createQueryBuilder()
        .update(Team)
        .set({ league_idx: leagueIdx, team_idx_in_league: teamIdxInLeague })
        .where("team_id = :teamId", { teamId })
        .execute();
    });
  
    await Promise.all(updatePromises);
  }

}