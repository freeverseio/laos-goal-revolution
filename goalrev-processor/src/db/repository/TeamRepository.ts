import { AppDataSource } from "../AppDataSource";
import { EntityManager, In, Repository } from "typeorm";
import { MintStatus, Team, TeamPartialUpdate } from "../entity";
import { TeamId } from "../../types/leaguegroup";

export class TeamRepository  {

  async save(team: Team): Promise<Team> {
    const entityManager = AppDataSource.manager;
    const teamRepository = entityManager.getRepository(Team);
    return teamRepository.save(team);
  }

  async setMintStatus(teamId: string, mintStatus: MintStatus): Promise<void> {
    const entityManager = AppDataSource.manager;
    const teamRepository = entityManager.getRepository(Team);
    await teamRepository.update(teamId, { mint_status: mintStatus });
  }

  async bulkUpdate(teams: TeamPartialUpdate[], transactionalEntityManager: EntityManager): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    await teamRepository.save(teams);
  }

  async bulkCreate(teams: Team[], transactionalEntityManager: EntityManager): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    await teamRepository.save(teams);
  }

  async findTeamsWithPlayersByTimezone(timezoneIdx: number): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository.find({ 
      where: { timezone_idx: timezoneIdx },
      relations: ["players"] 
    });
    return teams;
  }
  
  async findTeamsByCountryAndTimezone(countryIdx: number, timezoneIdx: number): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository
      .createQueryBuilder("team")
      .leftJoinAndSelect("team.country", "country")
      .where("country.country_idx = :countryIdx AND team.timezone_idx = :timezoneIdx", {
        countryIdx: countryIdx,
        timezoneIdx: timezoneIdx,
      })
      .orderBy("CAST(team.ranking_points AS INTEGER)", "DESC")
      .getMany();
    return teams;
  }

  async findTeamsByTimezoneCountryAndLeague(timezoneIdx: number, countryIdx: number, leagueIdx: number): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository
      .createQueryBuilder("team")
      .where("team.timezone_idx = :timezoneIdx AND team.country_idx = :countryIdx AND team.league_idx = :leagueIdx", {
        timezoneIdx: timezoneIdx,
        countryIdx: countryIdx,
        leagueIdx: leagueIdx,
      })
      .orderBy("team.team_idx_in_league", "ASC")
      .getMany();
    return teams;
  }

  async findCompleteTeamByTeamId(teamId: string): Promise<Team | null> {
    const teamRepository = AppDataSource.getRepository(Team);
    // find with players
    return await teamRepository.findOne({ where: { team_id: teamId }, relations: ["players"] });
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

  async createTeam(team: Team, transactionalEntityManager: EntityManager): Promise<Team> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    return teamRepository.save(team);
  }

  async countTeamsByTimezone(timezoneIdx: number, transactionalEntityManager: EntityManager): Promise<number> {
    const repository = transactionalEntityManager.getRepository(Team);
    return await repository.count({ where: { timezone_idx: timezoneIdx } });
  }
  
}

