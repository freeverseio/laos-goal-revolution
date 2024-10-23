import { Match, MatchState } from "../db/entity/Match";
import { MatchRepository } from "../db/repository/MatchRepository";
import axios from "axios";
import { MatchMapper } from "./mapper/MatchMapper";
import { PlayMatchRequest, PlayOutput } from "../types";
import crypto from 'crypto';
import { PlayerService } from "./PlayerService";
import { TeamService } from "./TeamService";
import { MatchEventService } from "./MatchEventService";
import { EntityManager } from "typeorm";
import { CalendarService } from "./CalendarService";
import { AppDataSource } from "../db/AppDataSource";
import { VerseRepository } from "../db/repository/VerseRepository";
import { MATCHDAYS_PER_ROUND } from "../utils/constants";
import { LeagueService } from "./LeagueService";
import { MatchHistoryRepository } from "../db/repository/MatchHistoryRepository";
import { MatchHistoryMapper } from "./mapper/MatchHistoryMapper";

export class MatchService {
  private playerService: PlayerService;
  private teamService: TeamService;
  private matchEventService: MatchEventService;
  private calendarService: CalendarService;
  private verseRepository: VerseRepository;
  private matchRepository: MatchRepository;  
  private matchHistoryRepository: MatchHistoryRepository;
  private leagueService: LeagueService;
  constructor(
    playerService: PlayerService,
    teamService: TeamService,
    matchEventService: MatchEventService,
    calendarService: CalendarService,
    verseRepository: VerseRepository,
    matchRepository: MatchRepository,
    matchHistoryRepository: MatchHistoryRepository,
    leagueService: LeagueService
  ) {
    this.playerService = playerService;
    this.teamService = teamService;
    this.matchEventService = matchEventService;
    this.calendarService = calendarService;
    this.verseRepository = verseRepository;
    this.matchRepository = matchRepository; // Initialize it
    this.leagueService = leagueService;
    this.matchHistoryRepository = matchHistoryRepository;
  }

  async playMatches(): Promise<any> {
    const info = await this.calendarService.getCalendarInfo();

    // Check if timestamp to play is in the future
    if (this.checkTimestampInFuture(info.timestamp!, info.timezone)) {
      console.log("Timestamp to play is in the future, waiting...");
      return {
        verseNumber: 0,
        timezoneIdx: 0,
        matchDay: info.matchDay,
        halfTime: info.half,
        verseTimestamp: info.timestamp,
        message: "Timestamp to play is in the future, skipping",
      };
    }
    
    // Use repository to fetch matches
    const matches = await this.matchRepository.getAllMatches(info.timezone, info.matchDay!);
    const seed = crypto.randomBytes(32).toString('hex');
    
    // Process matches
    await Promise.all(matches.map(match => this.playMatch(match, seed, info.verseNumber!)));

    // Update the verse timestamp using verseService
    await this.verseRepository.saveVerse({
      verseNumber: info.verseNumber!,
      timezoneIdx: info.timezone ,
      verseTimestamp: info.timestamp ?? 0,
    }, AppDataSource.manager);

    // for now we only play matches in timezone 10
    if (info.timezone!=10) {
      //continue playing matches
      return this.playMatches();
    } else {
      // compute league leaderboard
      if(info.half == 1){
        await this.updateLeagueLederbord(matches);
      }

      // if last match of the league has been played
      if (info.matchDay == MATCHDAYS_PER_ROUND - 1 && info.half == 1) {
        await this.leagueService.computeTeamRankingPointsForTimezone(info.timezone);
        await this.leagueService.generateCalendarForTimezone(info.timezone);
        await this.teamService.resetTeams();
        return {
          verseNumber: info.verseNumber!,
          timezoneIdx: info.timezone,
          matchDay: info.matchDay,
          halfTime: info.half,
          verseTimestamp: info.timestamp,
          message: "Last match of the league has been played",
        };
      }
    }

    return {
      verseNumber: info.verseNumber!,
      timezoneIdx: info.timezone,
      matchDay: info.matchDay,
      halfTime: info.half,
      verseTimestamp: info.timestamp,
      message: "OK",
    };
  }

  private async updateLeagueLederbord(matches: Match[]) {
    // get distinct (timezone_idx, country_idx, league_idx)
    const result = matches.reduce((acc: { set: Set<string>; result: { timezone_idx: number; country_idx: number; league_idx: number; match_day_idx: number; }[]; }, match: Match) => {
      const obj = { timezone_idx: match.timezone_idx, country_idx: match.country_idx, league_idx: match.league_idx, match_day_idx: match.match_day_idx };
      const key = JSON.stringify(obj);
      if (!acc.set.has(key)) {
        acc.set.add(key);
        acc.result.push(obj);
      }
      return acc;
    }, { set: new Set<string>(), result: [] });

    // update each league leaderboard by timezone_idx, country_idx, league_idx
    for (const obj of result.result) {
      await this.leagueService.updateLeaderboard(obj.timezone_idx, obj.country_idx, obj.league_idx, obj.match_day_idx);
    }
  }

  async playMatch(match: Match, seed: string,verseNumber: number) {
    const seedMatch = crypto.createHash('sha256').update(`${seed}${match.homeTeam!.team_id}${match.visitorTeam!.team_id}`).digest('hex');
    const entityManager = AppDataSource.manager; // Use EntityManager for transactions
    const mapHistory = MatchHistoryMapper.mapMatchHistory(match, verseNumber, seedMatch);
    try {
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        const is1stHalf = match.state === MatchState.BEGIN;
        const is2ndHalf = match.state === MatchState.HALF;
        const requestBody = this.buildRequestBody(match, seedMatch, is1stHalf);

        if (!is1stHalf && !is2ndHalf) {
          console.warn(`Match ${match.match_idx} ${match.match_day_idx} ${match.timezone_idx} ${match.league_idx} is not in the BEGIN or HALF state, skipping`);
          return;
        }

        const endpoint = is1stHalf ? "play1stHalf" : "play2ndHalf";
        const response = await axios.post(`${process.env.CORE_API_URL}/match/${endpoint}`, requestBody);
        const playOutput = response.data as PlayOutput;

        await this.matchEventService.saveMatchEvents(playOutput.matchEvents, match, transactionManager);
        // TODO unify goals logic (team & match)
        const goals = this.matchEventService.getGoals(playOutput.matchEvents, match);

        match.home_goals += goals[0];
        match.visitor_goals += goals[1];

        if (is1stHalf) {
          match.seed = seedMatch;
        }
        match.state = is1stHalf ? MatchState.HALF : MatchState.END;

        await this.teamService.updateTeamData(playOutput.matchLogs[0], playOutput.matchEvents, match.homeTeam!, verseNumber, is1stHalf, transactionManager);
        await this.teamService.updateTeamData(playOutput.matchLogs[1], playOutput.matchEvents, match.visitorTeam!, verseNumber, is1stHalf, transactionManager);
        //  // Update skills, teams, and events within the transaction
        await this.playerService.updateSkills(match.homeTeam!, playOutput.updatedSkills[0], verseNumber, transactionManager);
        await this.playerService.updateSkills(match.visitorTeam!, playOutput.updatedSkills[1], verseNumber, transactionManager);
        
        if (is2ndHalf) { 
          match.home_teamsumskills = playOutput.matchLogs[0].teamSumSkills;
          match.visitor_teamsumskills = playOutput.matchLogs[1].teamSumSkills;
        }

        // // Save the match using the repository
        await this.matchRepository.saveMatch(match, transactionManager);
        await this.matchHistoryRepository.insertMatchHistory(mapHistory, transactionManager);
      });
    } catch (error) {
      console.error("Error playing match:", error);
      throw error; // Rollback will occur automatically if an error is thrown
    }

    return "ok";
  }

  buildRequestBody(match: Match, seed: string, is1stHalf: boolean): PlayMatchRequest {
    return {
      verseSeed: seed,
      matchStartTime: Number(match.start_epoch),
      skills: [
        MatchMapper.calculateTeamSkills(match.homeTeam!.players, match.homeTeam!.tactics), // Team 1 skills
        MatchMapper.calculateTeamSkills(match.visitorTeam!.players, match.visitorTeam!.tactics) // Team 2 skills
      ],
      teamIds: [
        Number(match.homeTeam!.team_id),
        Number(match.visitorTeam!.team_id)
      ],
      tactics: [
        MatchMapper.mapTacticToRequest(match.homeTeam!.tactics),  // Home team tactics
        MatchMapper.mapTacticToRequest(match.visitorTeam!.tactics) // Visitor team tactics
      ],
      matchLogs: [
        { encodedMatchLog: match.homeTeam!.match_log },
        { encodedMatchLog: match.visitorTeam!.match_log }
      ],
      matchBools: [match.state === MatchState.HALF, true, false, false, false],
      trainings: [
        MatchMapper.mapTrainingToRequest(match.homeTeam!.trainings, match.homeTeam!.training_points),  // Home team training
        MatchMapper.mapTrainingToRequest(match.visitorTeam!.trainings, match.visitorTeam!.training_points) // Visitor team training
      ]
    };
  }

  private checkTimestampInFuture(timestampUTC: number, timezone: number): boolean {
    // Create a Date object from the given timestamp in UTC
    const currentTime = new Date().getTime() * 1000;
    const timestampInLocalTime = timestampUTC;
    
    // Check if the provided timestamp is in the future compared to the current time
    return timestampInLocalTime > currentTime;
  }
}
