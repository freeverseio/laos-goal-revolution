import { AppDataSource } from "../db/AppDataSource";
import { Matchday, TimeZoneData } from "../types";
import { calendarInfo, getCurrentRound, getMatch1stHalfUTC, hasMatchBeenPlayedForTZ } from "../utils/calendarUtils";
import { VerseRepository } from "../db/repository/VerseRepository";
import { Verse } from "../db/entity/Verse";
import { EntityManager } from "typeorm";


export class CalendarService {

  private verseRepository: VerseRepository;

  constructor(verseRepository: VerseRepository) {
    this.verseRepository = verseRepository;
  }

  async getCalendarInfo(): Promise<TimeZoneData> {
    const entityManager = AppDataSource.manager;
    const lastVerse = await this.verseRepository.getLastVerse(entityManager);
    const firstVerse = await this.verseRepository.getInitialVerse(entityManager);
    if (!lastVerse || !firstVerse) {
      throw new Error("No verses found");
    }
    //  Unix Epoch timestamp in milliseconds
    const firstVerseTimestamp = Number(firstVerse!.verseTimestamp);
    const nextVerseNumber = lastVerse!.verseNumber + 1;
    const info = calendarInfo(nextVerseNumber, Number(firstVerse!.timezoneIdx), firstVerseTimestamp); // Convert timezone to number
    return {
      ...info,
      verseNumber: nextVerseNumber
    };
  }

  async getVerses(entityManager: EntityManager): Promise<{firstVerse: Verse, lastVerse: Verse}> {
    const firstVerse = await this.verseRepository.getInitialVerse(entityManager);
    const lastVerse = await this.verseRepository.getLastVerse(entityManager);
    return {firstVerse, lastVerse};
  }


  getMatchStartTimeUTC(timezone: number,  matchday_idx: number, firstVerse: Verse, lastVerse: Verse): number {
    const hasPlayed = hasMatchBeenPlayedForTZ(timezone, Number(firstVerse!.timezoneIdx), Number(lastVerse!.verseNumber));
    const currentRound = getCurrentRound(timezone, Number(firstVerse!.timezoneIdx), Number(lastVerse!.verseNumber));
    // if no matches have been played for this timezone, 
    // the current round is 0 but also the next round (the round to play) is 0. 
    // this only happens after a wipeout
    const nextRound = hasPlayed ? currentRound + 1 : currentRound;
    return getMatch1stHalfUTC(timezone, nextRound, matchday_idx, firstVerse.timezoneIdx, Number(firstVerse.verseTimestamp) );
  }

  async getCalendarInfoAtVerse(verse: number): Promise<TimeZoneData> {
    const entityManager = AppDataSource.manager;
    const lastVerse = await this.verseRepository.getLastVerse(entityManager);
    const firstVerse = await this.verseRepository.getInitialVerse(entityManager);
    if (!lastVerse || !firstVerse) {
      throw new Error("No verses found");
    }
    //  Unix Epoch timestamp in milliseconds
    const firstVerseTimestamp = Number(firstVerse!.verseTimestamp);
    const info = calendarInfo(verse, Number(firstVerse!.timezoneIdx), firstVerseTimestamp); // Convert timezone to number
    return {
      ...info,
      verseNumber: verse
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





}
