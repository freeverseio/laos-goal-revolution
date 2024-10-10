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
    await teamRepository.update({ team_id: In(teams) }, { league_idx: leagueIdx });
  }

}