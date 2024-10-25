import { AppDataSource } from "../AppDataSource";
import { EntityManager, Repository } from "typeorm";
import { League } from "../entity/League";

export class LeagueRepository {

  async countLeaguesByTimezoneAndCountry(timezoneIdx: number, countryIdx: number, transactionalEntityManager: EntityManager): Promise<number> {
    const leagueRepository = transactionalEntityManager.getRepository(League);
    return await leagueRepository.count({ where: { timezone_idx: timezoneIdx, country_idx: countryIdx } });
  }

  
}