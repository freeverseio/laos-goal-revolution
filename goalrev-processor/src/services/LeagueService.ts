import { AppDataSource } from "../db/AppDataSource";
import axios from "axios";
import { TimeZoneData } from "../types";
import { VerseService } from "./VerseService";
import { calendarInfo } from "../utils/calendarUtils";
import { MatchService } from "./MatchService";

export class LeagueService {
  private verseService: VerseService;
  private matchService: MatchService;
 
  constructor(matchService: MatchService, verseService: VerseService) {    
    this.verseService = verseService;
    this.matchService = matchService;
  }

  async getCalendarInfo(): Promise<TimeZoneData> {
    const entityManager = AppDataSource.manager;
    const lastVerse = await this.verseService.getLastVerse(entityManager);
    const firstVerse = await this.verseService.getInitialVerse(entityManager);
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


  async updateLeaderboard(timezoneIdx: number, countryIdx: number, leagueIdx: number) {

    // getMatchDay
    let info = await this.getCalendarInfo();
    // check if timestamp to play is in the future
    if (info.timestamp! > Date.now() / 1000) {
      console.error("Timestamp to play is in the future, skipping");
      return {
        err: 1,
      };
    }
    const matchDay = info.matchDay;

    // getMatches
    const leagueMatches = await this.matchService.getLeagueMatches(timezoneIdx, countryIdx, leagueIdx);
    console.log('leagueMatches:', leagueMatches);


    // getTeams

        

    // TODO call core method
    // teams, matchDay, matches
    // const response = await axios.post(`${process.env.CORE_API_URL}/league/${endpoint}`, requestBody);
    // const leagueLeaderboardOutput = response.data as PlayOutput;
    // return leagueLeaderboardOutput.teams;

    // Mock return
    const teams = [];
    const team = {
      teamId: 1,
      leaderboardPosition: 1,
      teamPoints: 1,
    }
    teams.push(team);

    return {
      teams,      
    };
  }

}
