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
import { count } from "console";
import { TacticRepository } from "../db/repository/TacticRepository";
import { TacticsHistoryMapper } from "./mapper/TacticsHistoryMapper";

export class MatchService {
  private playerService: PlayerService;
  private teamService: TeamService;
  private matchEventService: MatchEventService;
  private calendarService: CalendarService;
  private verseRepository: VerseRepository;
  private matchRepository: MatchRepository;
  private matchHistoryRepository: MatchHistoryRepository;
  private leagueService: LeagueService;
  private tacticsRepository: TacticRepository;


  constructor(
    playerService: PlayerService,
    teamService: TeamService,
    matchEventService: MatchEventService,
    calendarService: CalendarService,
    verseRepository: VerseRepository,
    matchRepository: MatchRepository,
    matchHistoryRepository: MatchHistoryRepository,
    leagueService: LeagueService,
    tacticsRepository: TacticRepository,
  ) {
    this.playerService = playerService;
    this.teamService = teamService;
    this.matchEventService = matchEventService;
    this.calendarService = calendarService;
    this.verseRepository = verseRepository;
    this.matchRepository = matchRepository;
    this.leagueService = leagueService;
    this.matchHistoryRepository = matchHistoryRepository;
    this.tacticsRepository = tacticsRepository;
  }

  async playMatches(): Promise<any> {
    const info = await this.calendarService.getCalendarInfo();

    // // Check if timestamp to play is in the future
    if (this.checkTimestampInFuture(info.timestamp!)) {      
      return {
        verseNumber: info.verseNumber,
        timezoneIdx: info.timezone,
        matchDay: info.matchDay,
        halfTime: info.half,
        verseTimestamp: info.timestamp,
        message: "Timestamp to play is in the future, skipping",
      };
    }
    
    // reshuffle leagues that will start 4 verses ahead
    const verse4Ahead = await this.calendarService.getCalendarInfoAtVerse(info.verseNumber! + 4);    
    if(verse4Ahead.matchDay === 0 && verse4Ahead.half === 0){
      // reset this timezone
      const nextTimezone = verse4Ahead.timezone;
      console.log("Rescheduling the leagues playing in timezone: ", nextTimezone); 
      const schedule = await this.leagueService.generateCalendarForTimezone(nextTimezone); // reschedule leagues on timezone +1 (4 verses ahead)
      if (schedule && schedule.length > 0) { 
        console.log("Call teamService.resetTeams in next timezone: ", nextTimezone);       
        await this.teamService.resetTeams(nextTimezone); // reset teams for timezone +1 (4 verses ahead)
      }else{
        console.warn("No schedule found for next timezone:", nextTimezone);
      }      
    }

    // Use repository to fetch matches
    const matches = await this.matchRepository.getAllMatches(info.timezone, info.matchDay!);
    const seed = crypto.randomBytes(32).toString('hex');
    if (matches.length == 0) {
      await this.verseRepository.saveVerse({
        verseNumber: info.verseNumber!,
        timezoneIdx: info.timezone,
        verseTimestamp: info.timestamp ?? 0,
      }, AppDataSource.manager);
      
      //continue playing matches
      return this.playMatches();
    }

    // Process matches in batches of 8
    await this.processInBatches(matches, 16, seed, info.verseNumber!, (match, seed, verseNumber) => this.playMatch(match, seed, verseNumber));

    // compute league leaderboard
    if (info.half == 1) {
      await this.updateLeagueData(matches);
    }
   

    let message = "OK";
    // if last match of the league has been played
    if (info.matchDay == MATCHDAYS_PER_ROUND - 1 && info.half == 1) {
      await this.leagueService.computeTeamRankingPointsForTimezone(info.timezone);
      message = "Last match of the league has been played";
    }

    // Update the verse timestamp using verseService
    await this.verseRepository.saveVerse({
      verseNumber: info.verseNumber!,
      timezoneIdx: info.timezone,
      verseTimestamp: info.timestamp ?? 0,
    }, AppDataSource.manager);


    return {
      verseNumber: info.verseNumber!,
      timezoneIdx: info.timezone,
      matchDay: info.matchDay,
      halfTime: info.half,
      verseTimestamp: info.timestamp,
      message: message,
    };
  }

  private async processInBatches(matches: Match[], batchSize: number, seed: string, verseNumber: number, fn: (match: Match, seed: string, verseNumber: number) => Promise<any>) {
    const results = [];
    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);
      // Await all promises in the current batch
      console.time(` processInBatches ${i}`);
      const batchResults = await Promise.all(batch.map(item => fn(item, seed, verseNumber)));
      results.push(...batchResults);
      console.timeEnd(` processInBatches ${i}`);
    }
    return results;
  }

  private async updateLeagueData(matches: Match[]) {
    const result = matches.reduce((acc: { set: Set<string>; result: { timezone_idx: number; country_idx: number; league_idx: number; match_day_idx: number; }[]; }, match: Match) => {
      const obj = { timezone_idx: match.timezone_idx, country_idx: match.country_idx, league_idx: match.league_idx, match_day_idx: match.match_day_idx };
      const key = JSON.stringify(obj);
      if (!acc.set.has(key)) {
        acc.set.add(key);
        acc.result.push(obj);
      }
      return acc;
    }, { set: new Set<string>(), result: [] });

    // update each league leaderboard by timezone_idx, country_idx, league_idx & reset trainings
    for (const obj of result.result) {
      await this.leagueService.resetTrainings(obj.timezone_idx, obj.country_idx, obj.league_idx);
      await this.leagueService.updateLeaderboard(obj.timezone_idx, obj.country_idx, obj.league_idx);
    }
  }

  async playMatch(match: Match, seed: string, verseNumber: number) {
    const seedMatch = crypto.createHash('sha256').update(`${seed}${match.homeTeam!.team_id}${match.visitorTeam!.team_id}`).digest('hex');
    const entityManager = AppDataSource.manager; // Use EntityManager for transactions
    
    try {
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        const is1stHalf = match.state === MatchState.BEGIN;
        const is2ndHalf = match.state === MatchState.HALF;
        const { isHomeTeamBot, isAwayTeamBot } = await this.teamService.getTeamBotStatuses(match.homeTeam!.team_id, match.visitorTeam!.team_id);
        const requestBody = this.buildRequestBody(match, seedMatch, is1stHalf, isHomeTeamBot, isAwayTeamBot);

        if (!is1stHalf && !is2ndHalf) {
          console.warn(`Match with [matchIdx, matchDayIdx, timezoneIdx, leagueIdx] [${match.match_idx}, ${match.match_day_idx}, ${match.timezone_idx}, ${match.league_idx}] is not in the BEGIN or HALF state, skipping`);
          return;
        }

        const endpoint = is1stHalf ? "play1stHalf" : "play2ndHalf";
        const response = await axios.post(`${process.env.CORE_API_URL}/match/${endpoint}`, requestBody);
        const playOutput = response.data as PlayOutput;
        await this.matchEventService.saveMatchEvents(playOutput.matchEvents, match, transactionManager);

        match.home_goals = playOutput.matchLogs[0].numberOfGoals;
        match.visitor_goals = playOutput.matchLogs[1].numberOfGoals;

        if (is1stHalf) {
          match.seed = seedMatch;
        }
        match.state = is1stHalf ? MatchState.HALF : MatchState.END;
        match.homeTeam!.tactic = playOutput.encodedTactics ? playOutput.encodedTactics[0] : "";
        match.visitorTeam!.tactic = playOutput.encodedTactics ? playOutput.encodedTactics[1] : "";

        await this.teamService.updateTeamData(playOutput.matchLogs[0], playOutput.matchLogs[1], match.homeTeam!, verseNumber, is1stHalf, true, transactionManager);
        await this.teamService.updateTeamData(playOutput.matchLogs[1], playOutput.matchLogs[0], match.visitorTeam!, verseNumber, is1stHalf, false, transactionManager);
        //  // Update skills, teams, and events within the transaction
        await this.playerService.updateSkills(match.homeTeam!, playOutput.updatedSkills[0], verseNumber, isHomeTeamBot, transactionManager);
        await this.playerService.updateSkills(match.visitorTeam!, playOutput.updatedSkills[1], verseNumber, isAwayTeamBot, transactionManager);

         // update tactics history
        await this.tacticsRepository.insertTacticHistory(TacticsHistoryMapper.mapToTacticsHistory(match.homeTeam!.tactics, verseNumber), transactionManager);
        await this.tacticsRepository.insertTacticHistory(TacticsHistoryMapper.mapToTacticsHistory(match.visitorTeam!.tactics, verseNumber), transactionManager);
        
        if (is2ndHalf) {
          match.home_teamsumskills = playOutput.matchLogs[0].teamSumSkills;
          match.visitor_teamsumskills = playOutput.matchLogs[1].teamSumSkills;
        }
        const matchHistory = MatchHistoryMapper.mapMatchHistory(match, verseNumber, seedMatch);
        // // Save the match using the repository
        await this.matchRepository.saveMatch(match, transactionManager);
        await this.matchHistoryRepository.insertMatchHistory(matchHistory, transactionManager);
      });
    } catch (error) {
      console.error("Error playing match:", {
        timezone_idx: match.timezone_idx,
        country_idx: match.country_idx,
        league_idx: match.league_idx,
        match_day_idx: match.match_day_idx,
        match_idx: match.match_idx,
        hometeam_id: match.homeTeam?.team_id,
        visitorTeam_id: match.visitorTeam?.team_id 
        }, error);
      return "error";
    }
    return "ok";
  }

  buildRequestBody(match: Match, seed: string, is1stHalf: boolean, isBotHome: boolean, isBotAway: boolean): PlayMatchRequest {
    return {
      verseSeed: seed,
      matchStartTime: Number(match.start_epoch),
      skills: [
        MatchMapper.calculateTeamSkills(match.homeTeam!.players), // Team 1 skills
        MatchMapper.calculateTeamSkills(match.visitorTeam!.players) // Team 2 skills
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
      matchBools: [match.state === MatchState.HALF, true, false, isBotHome, isBotAway],
      trainings: [
        MatchMapper.mapTrainingToRequest(match.homeTeam!.trainings, match.homeTeam!.training_points),  // Home team training
        MatchMapper.mapTrainingToRequest(match.visitorTeam!.trainings, match.visitorTeam!.training_points) // Visitor team training
      ]
    };
  }

  private checkTimestampInFuture(timestamp: number): boolean {
    const currentTimestamp = Date.now();    // Get the current timestamp in milliseconds
    return (timestamp * 1000) > currentTimestamp;
  }
}
