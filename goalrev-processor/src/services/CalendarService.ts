import { AppDataSource } from "../db/AppDataSource";
import { Country, Verse } from "../db/entity/";
import { MatchRepository } from "../db/repository/MatchRepository";
import { Calendar, LeagueGroup, Matchday, TimeZoneData } from "../types";
import { TeamService } from "./TeamService";
import { calendarInfo, getMatch1stHalfUTC } from "../utils/calendarUtils";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { LeagueService } from "./LeagueService";

export class CalendarService {

  private matchRepository: MatchRepository;
  private matchEventRepository: MatchEventRepository;
  private verseRepository: VerseRepository;
  private leagueService: LeagueService;

  constructor(matchRepository: MatchRepository, verseRepository: VerseRepository, matchEventRepository: MatchEventRepository, leagueService: LeagueService) {
    this.matchRepository = matchRepository;
    this.matchEventRepository = matchEventRepository;
    this.verseRepository = verseRepository;
    this.leagueService = leagueService;
  }

  async generateAllLeagues(): Promise<LeagueGroup[]> {
    const firstVerse = await this.verseRepository.getInitialVerse(AppDataSource.manager);

    const leagueGroups = await this.leagueService.getNewLeagues();

    for (const leagueGroup of leagueGroups) {
      for (let i = 0; i < leagueGroup.leagues.length; i++) {
        const league = leagueGroup.leagues[i];
        const schedule = CalendarService.generateLeagueSchedule(league);
        const league_idx = i;
        await this.saveLeagueSchedule(league_idx, leagueGroup.timezone, leagueGroup.country, schedule, firstVerse!);
      }
    }

    return leagueGroups;
  }


  async getCalendarInfo(): Promise<TimeZoneData> {
    const entityManager = AppDataSource.manager;
    const lastVerse = await this.verseRepository.getLastVerse(entityManager);
    const firstVerse = await this.verseRepository.getInitialVerse(entityManager);
    if (!lastVerse || !firstVerse) {
      throw new Error("No verses found");
    }
    //  Unix Epoch timestamp in milliseconds
    const firstVerseTimestamp = firstVerse!.verseTimestamp.getTime() / 1000;
    const nextVerseNumber = lastVerse!.verseNumber + 1;
    const info = calendarInfo(nextVerseNumber, Number(firstVerse!.timezoneIdx), firstVerseTimestamp); // Convert timezone to number
    return {
      ...info,
      verseNumber: nextVerseNumber
    };
  }

  static generateLeagueSchedule(teams: string[]): Matchday[] {
    const nTeams = teams.length;

    if (nTeams % 2 !== 0) {
      throw new Error("The number of teams must be even.");
    }

    const matchdays: Matchday[] = [];
    const halfSize = nTeams / 2;
    const fixedTeam = teams[0]; // First team is fixed
    let rotatingTeams = teams.slice(1);

    let reverseAlternation = false;

    // Generate matchdays for the first half of the season
    for (let round = 0; round < nTeams - 1; round++) {
      const matches: Matchday = [];

      // Pair up teams for the round, ensuring alternating home/away pattern
      if (reverseAlternation) {
        matches.push({ home: rotatingTeams[0], away: fixedTeam });
      } else {
        matches.push({ home: fixedTeam, away: rotatingTeams[0] });
      }

      for (let i = 1; i < halfSize; i++) {
        if (reverseAlternation) {
          const home = rotatingTeams[rotatingTeams.length - i];
          const away = rotatingTeams[i];
          matches.push({ home, away });
        } else {
          const home = rotatingTeams[i];
          const away = rotatingTeams[rotatingTeams.length - i];
          matches.push({ home, away });
        }
      }

      matchdays.push(matches);

      // Rotate teams, except the first one
      rotatingTeams = [
        rotatingTeams[rotatingTeams.length - 1],
        ...rotatingTeams.slice(0, rotatingTeams.length - 1),
      ];

      // Alternate home/away for the next round
      reverseAlternation = !reverseAlternation;
    }

    // Generate second half (reversed home/away)
    const secondHalf = matchdays.map((matchday) =>
      matchday.map(({ home, away }) => ({ home: away, away: home }))
    );

    // Return full schedule
    return [...matchdays, ...secondHalf];
  }

  async saveLeagueSchedule(league_idx: number, timezone: number, country: Country, leagueSchedule: Matchday[], firstVerse: Verse) {
    const entityManager = AppDataSource.manager;
    entityManager.transaction(async (transactionalEntityManager) => {
      leagueSchedule.forEach((matchday, matchday_idx) => {
        matchday.forEach((match, match_idx) => {
          this.matchEventRepository.deleteAllMatchEvents(timezone, country.country_idx, league_idx, matchday_idx, match_idx, transactionalEntityManager);
          const matchStartUTC = getMatch1stHalfUTC(timezone, 0, matchday_idx, firstVerse.timezoneIdx, firstVerse.verseTimestamp.getTime() / 1000);
          this.matchRepository.resetMatch(timezone, country.country_idx, league_idx, matchday_idx, match_idx, match.home, match.away, matchStartUTC, transactionalEntityManager);
        });
      });
    });
  }



}
