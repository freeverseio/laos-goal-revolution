import { AppDataSource } from "../db/AppDataSource";
import { Match, MatchState } from "../db/entity/Match";
import axios from "axios";
import { MatchMapper } from "./mapper/MatchMapper";
import { PlayMatchRequest, PlayOutput, TimeZoneData } from "../types";
import crypto from 'crypto';
import { PlayerService } from "./PlayerService";
import { TeamService } from "./TeamService";
import { MatchEventService } from "./MatchEventService";
import { EntityManager } from "typeorm";
import { VerseService } from "./VerseService";
import { calendarInfo } from "../utils/calendarUtils";

export class MatchService {
  private playerService: PlayerService;
  private teamService: TeamService;
  private matchEventService: MatchEventService;
  private verseService: VerseService;

  // Inject PlayerService in the constructor
  constructor(playerService: PlayerService, teamService: TeamService, matchEventService: MatchEventService, verseService: VerseService) {
    this.playerService = playerService;
    this.teamService = teamService;
    this.matchEventService = matchEventService;
    this.verseService = verseService;
  }

  async getCalendarInfo(): Promise<TimeZoneData> {
    const entityManager = AppDataSource.manager; 
    const lastVerse = await this.verseService.getLastVerse(entityManager);
    const firstVerse = await this.verseService.getInitialVerse(entityManager);
    if (!lastVerse || !firstVerse) {
      throw new Error("No verses found");
    }
    const info = calendarInfo(lastVerse!.verseId, Number(firstVerse!.timezone), firstVerse!.verseTimestamp.getTime()); // Convert timezone to number
    return info; // Return the correct variable
  }

  async playMatches(timezone: number, league: number, matchDay: number) {
    // get matches for timezone and epoch
    const matches = await this.getMatches(timezone, league, matchDay);

    const seed = crypto.randomBytes(32).toString('hex');
    // Process matches 
    await Promise.all(matches.map(match => this.playMatch(match, seed)));
    return "ok";
  }

  // Update the playMatch method to use the new buildRequestBody method
  async playMatch(match: Match, seed: string) {
    const entityManager = AppDataSource.manager; // Use the EntityManager to handle transactions
    
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

        await transactionManager.save(match);

      });

    } catch (error) {
      console.error(`Error playing match:`, error);
      throw error; // Rollback will occur automatically if an error is thrown
    }

    return "ok";
  }



  private async getMatches(timezone: number, league: number, matchDay: number) {
    const matchRepository = AppDataSource.getRepository(Match);
    return await matchRepository.find({
      where: {
        timezone_idx: timezone,
        league_idx: league,
        match_day_idx: matchDay
      },
      relations: [
        "homeTeam", 
        "visitorTeam", 
        "homeTeam.players", 
        "visitorTeam.players", 
        "homeTeam.tactics", 
        "visitorTeam.tactics",
        "homeTeam.trainings",
        "visitorTeam.trainings"
      ]  
    });
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
      // Use tactics for both teams
      tactics: [
        MatchMapper.mapTacticToRequest(match.homeTeam!.tactics),  // Home team tactics
        MatchMapper.mapTacticToRequest(match.visitorTeam!.tactics) // Visitor team tactics
      ],
      matchLogs: is1stHalf ? [{}, {}] : [
        {
          encodedMatchLog: match.homeTeam!.match_log
        },
        {
          encodedMatchLog: match.visitorTeam!.match_log
        }
      ],
      matchBools: [match.state === MatchState.HALF, true, false, false, false], 
      trainings: [
        MatchMapper.mapTrainingToRequest(match.homeTeam!.trainings),  // Home team training
        MatchMapper.mapTrainingToRequest(match.visitorTeam!.trainings) // Visitor team training
      ]
    };
  }
}
