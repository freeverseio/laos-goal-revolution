import { AppDataSource } from "../AppDataSource";
import { EntityManager, In, Repository } from "typeorm";
import { Team, TeamPartialUpdate } from "../entity/Team";
import { TeamId } from "../../types/leaguegroup";

export class TeamRepository  {

  async bulkUpdate(teams: TeamPartialUpdate[], transactionalEntityManager: EntityManager): Promise<void> {
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
      .orderBy("team.ranking_points", "DESC")
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

  async updateLeaderboard(teamId: string, points: number, leaderboardPosition: number, transactionalEntityManager: EntityManager): Promise<void> {
    console.log("updateLeaderboard.teamId:", teamId, "points:", points, "leaderboardPosition:", leaderboardPosition);
    const teamRepository = transactionalEntityManager.getRepository(Team);
    await teamRepository.update(teamId, { points: points, leaderboard_position: leaderboardPosition });
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