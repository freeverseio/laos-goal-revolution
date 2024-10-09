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

export class MatchService {
  private playerService: PlayerService;
  private teamService: TeamService;
  private matchEventService: MatchEventService;
  private calendarService: CalendarService;
  private verseRepository: VerseRepository;
  private matchRepository: MatchRepository;  // Inject the repository

  constructor(
    playerService: PlayerService,
    teamService: TeamService,
    matchEventService: MatchEventService,
    calendarService: CalendarService,
    verseRepository: VerseRepository,
    matchRepository: MatchRepository // Add repository as a dependency
  ) {
    this.playerService = playerService;
    this.teamService = teamService;
    this.matchEventService = matchEventService;
    this.calendarService = calendarService;
    this.verseRepository = verseRepository;
    this.matchRepository = matchRepository; // Initialize it
  }

  async playMatches(timezone: number | null, matchDay: number | null) {
    const info = await this.calendarService.getCalendarInfo();

    // Check if timestamp to play is in the future
    if (info.timestamp! > Date.now() / 1000) {
      console.log("Timestamp to play is in the future, skipping");
      return {
        verseNumber: info.verseNumber!,
        timezoneIdx: timezone ?? info.timezone,
        matchDay: info.matchDay,
        halfTime: info.half,
        verseTimestamp: new Date(info.timestamp! * 1000),
      };
    }

    // Use repository to fetch matches
    const matches = await this.matchRepository.getAllMatches(timezone ?? info.timezone, matchDay ?? info.matchDay!);
    const seed = crypto.randomBytes(32).toString('hex');

    // Process matches
    await Promise.all(matches.map(match => this.playMatch(match, seed)));

    // Update the verse timestamp using verseService
    await this.verseRepository.saveVerse({
      verseNumber: info.verseNumber!,
      timezoneIdx: timezone ?? info.timezone,
      verseTimestamp: new Date(info.timestamp! * 1000),
    }, AppDataSource.manager);

    return {
      verseNumber: info.verseNumber!,
      timezoneIdx: timezone ?? info.timezone,
      matchDay: info.matchDay,
      halfTime: info.half,
      verseTimestamp: new Date(info.timestamp! * 1000),
    };
  }

  async playMatch(match: Match, seed: string) {
    const entityManager = AppDataSource.manager; // Use EntityManager for transactions
    try {
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        const is1stHalf = match.state === MatchState.BEGIN;
        const is2ndHalf = match.state === MatchState.HALF;
        const requestBody = this.buildRequestBody(match, seed, is1stHalf);

        if (!is1stHalf && !is2ndHalf) {
          console.warn(`Match ${match.match_idx} is not in the BEGIN or HALF state, skipping`);
          return;
        }

        const endpoint = is1stHalf ? "play1stHalf" : "play2ndHalf";
        const response = await axios.post(`${process.env.CORE_API_URL}/match/${endpoint}`, requestBody);
        const playOutput = response.data as PlayOutput;

        await this.matchEventService.saveMatchEvents(playOutput.matchEvents, match, transactionManager);
        const goals = this.matchEventService.getGoals(playOutput.matchEvents, match);

        match.home_goals += goals[0];
        match.visitor_goals += goals[1];

        if (is1stHalf) {
          match.seed = seed;
        }
        match.state = is1stHalf ? MatchState.HALF : MatchState.END;

        await this.teamService.updateTeamMatchLog(transactionManager, playOutput.matchLogs[0].encodedMatchLog, match.homeTeam!);
        await this.teamService.updateTeamMatchLog(transactionManager, playOutput.matchLogs[1].encodedMatchLog, match.visitorTeam!);

        if (is2ndHalf) {
          // Update skills, teams, and events within the transaction
          await this.playerService.updateSkills(match.homeTeam!.tactics, playOutput.updatedSkills[0], transactionManager);
          await this.playerService.updateSkills(match.visitorTeam!.tactics, playOutput.updatedSkills[1], transactionManager);

          await this.teamService.updateTeamData(playOutput.matchLogs[0], playOutput.matchEvents, match.homeTeam!.team_id, transactionManager);
          await this.teamService.updateTeamData(playOutput.matchLogs[1], playOutput.matchEvents, match.visitorTeam!.team_id, transactionManager);

          match.home_teamsumskills = playOutput.matchLogs[0].teamSumSkills;
          match.visitor_teamsumskills = playOutput.matchLogs[1].teamSumSkills;
        }

        // Save the match using the repository
        await this.matchRepository.saveMatch(match, transactionManager);
      });
    } catch (error) {
      console.log("match", match);
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
      matchLogs: is1stHalf ? [{}, {}] : [
        { encodedMatchLog: match.homeTeam!.match_log },
        { encodedMatchLog: match.visitorTeam!.match_log }
      ],
      matchBools: [match.state === MatchState.HALF, true, false, false, false],
      trainings: [
        MatchMapper.mapTrainingToRequest(match.homeTeam!.trainings),  // Home team training
        MatchMapper.mapTrainingToRequest(match.visitorTeam!.trainings) // Visitor team training
      ]
    };
  }
}
