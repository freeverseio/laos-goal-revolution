import { AppDataSource } from "../AppDataSource";
import { EntityManager, Repository } from "typeorm";
import { Team } from "../entity/Team";

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

}