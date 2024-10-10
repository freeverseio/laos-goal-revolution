import { EntityManager } from "typeorm";
import { Team } from "../db/entity/Team";
import { LeagueGroup,  TeamId } from "../types";
import { Country } from "../db/entity/Country";
import { AppDataSource } from "../db/AppDataSource";
import { TeamRepository } from "../db/repository/TeamRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { MATCHDAYS_PER_ROUND } from "../utils/constants/constants";
import { VerseRepository } from "../db/repository/VerseRepository";

export class LeagueService {

  private teamRepository: TeamRepository;
  private matchRepository: MatchRepository;
  private verseRepository: VerseRepository;

  constructor(teamRepository: TeamRepository, matchRepository: MatchRepository, verseRepository: VerseRepository) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
    this.verseRepository = verseRepository;
  }

  async getNewLeaguesForTimezone(timezoneIdx: number): Promise<LeagueGroup[]> {
    const entityManager = AppDataSource.manager;
    // Fetch all countries (grouping will be done by country and timezone)
    const countries = await entityManager.find(Country, { where: { timezone_idx: timezoneIdx } });
    const leagueGroups: LeagueGroup[] = [];
  
    //  Process each country and group teams into leagues
    for (const country of countries) {
      const leaguesForCountry = await this.getLeagueGroupsByCountry( country);
      
      if (leaguesForCountry) {
        leagueGroups.push(leaguesForCountry);
      }
    }
    return leagueGroups;
  }

  async getNewLeaguesByCountry(countryIdx: number, timezoneIdx: number): Promise<LeagueGroup | null> {
    const entityManager = AppDataSource.manager;
    const country = await entityManager.findOne(Country, { where: { country_idx: countryIdx } });
    if (!country) {
      return null;
    }
    return this.getLeagueGroupsByCountry(country);
  }

  private async getLeagueGroupsByCountry(country: Country): Promise<LeagueGroup | null> {
    // Fetch teams for the current country and timezone
    const teams = await this.teamRepository.findTeamsByCountryAndTimezone(country.country_idx, country.timezone_idx);
    
    if (teams.length <= 0) {
      return null; // No teams, skip this country
    }
  
    //  Group the teams into leagues of 8
    const leagues: TeamId[][] = [];
    for (let i = 0; i < teams.length; i += 8) {
      leagues.push(teams.slice(i, i + 8).map(team => team.team_id as TeamId));
    }
  
    // Return the grouped leagues for the country and timezone
    return {
      country,
      timezone: country.timezone_idx,
      leagues,
    };
  }

  async haveTimezoneLeaguesFinished(timezoneIdx: number): Promise<boolean> {
    const pendingMatches = await this.matchRepository.countPendingMatchesByTimezone(timezoneIdx);
    return pendingMatches <= 0;
  }

  async getActualRoundOfLeague(timezoneIdx: number): Promise<number> {
    const verses = await this.verseRepository.countVersesByTimezone(timezoneIdx);
    return Math.max(Math.ceil(verses / MATCHDAYS_PER_ROUND) - 1, 0);
  }
}
