import { EntityManager } from "typeorm";
import { Team } from "../db/entity/Team";
import { LeagueGroup,  Matchday,  Schedule,  TeamId } from "../types";
import { Country } from "../db/entity/Country";
import { AppDataSource } from "../db/AppDataSource";
import { TeamRepository } from "../db/repository/TeamRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { MATCHDAYS_PER_ROUND } from "../utils/constants/constants";
import { VerseRepository } from "../db/repository/VerseRepository";
import { Verse } from "../db/entity/Verse";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { getMatch1stHalfUTC } from "../utils/calendarUtils";
import { CalendarService } from "./CalendarService";

export class LeagueService {

  private teamRepository: TeamRepository;
  private matchRepository: MatchRepository;
  private verseRepository: VerseRepository;
  private matchEventRepository: MatchEventRepository;

  constructor(teamRepository: TeamRepository, matchRepository: MatchRepository, verseRepository: VerseRepository, matchEventRepository: MatchEventRepository) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
    this.verseRepository = verseRepository;
    this.matchEventRepository = matchEventRepository;
  }

  async generateCalendarForTimezone(timezoneIdx: number): Promise<Schedule[]> {
    const finished = await this.haveTimezoneLeaguesFinished(timezoneIdx);
    if (!finished) {
      return [];
    }
    const firstVerse = await this.verseRepository.getInitialVerse(AppDataSource.manager);
    const leagueGroups = await this.getNewLeaguesForTimezone(timezoneIdx);
    const schedules: Schedule[] = [];
    for (const leagueGroup of leagueGroups) {
      // Call the new private method
      const leagueSchedules = await this.saveLeagueSchedules(leagueGroup, firstVerse!);
      schedules.push(...leagueSchedules);
    }
    return schedules;
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

  async saveLeagueSchedule(league_idx: number, timezone: number, country: Country, leagueSchedule: Matchday[], firstVerse: Verse) {
    const entityManager = AppDataSource.manager;
    const actualRound = await this.getActualRoundOfLeague(timezone);
    entityManager.transaction(async (transactionalEntityManager) => {
      leagueSchedule.forEach((matchday, matchday_idx) => {
        matchday.forEach((match, match_idx) => {
          this.matchEventRepository.deleteAllMatchEvents(timezone, country.country_idx, league_idx, matchday_idx, match_idx, transactionalEntityManager);
          const matchStartUTC = getMatch1stHalfUTC(timezone, actualRound, matchday_idx, firstVerse.timezoneIdx, firstVerse.verseTimestamp.getTime() / 1000);
          this.matchRepository.resetMatch(timezone, country.country_idx, league_idx, matchday_idx, match_idx, match.home, match.away, matchStartUTC * 1000, transactionalEntityManager);
        });
      });
    });
  }

  private async saveLeagueSchedules(leagueGroup: LeagueGroup, firstVerse: Verse): Promise<Schedule[]> {
    const schedules: Schedule[] = [];
    for (let i = 0; i < leagueGroup.leagues.length; i++) {
      const league = leagueGroup.leagues[i];
      const schedule = CalendarService.generateLeagueSchedule(league);
      const league_idx = i;
      try {
        await this.saveLeagueSchedule(league_idx, leagueGroup.timezone, leagueGroup.country, schedule, firstVerse!);
      } catch (error) {
        console.error("Error saving league schedule:", error);
        throw error;
      }
      schedules.push(schedule);
    }
    return schedules;
  }

}
