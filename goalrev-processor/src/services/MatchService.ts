import { AppDataSource } from "../db/AppDataSource";
import { Match, MatchState } from "../db/entity/Match";
import axios from "axios";
import { MatchMapper } from "./mapper/MatchMapper";
import { PlayMatchRequest, PlayOutput } from "../types";
import crypto from 'crypto';
import { PlayerService } from "./PlayerService";
import { TeamService } from "./TeamService";
import { MatchEventService } from "./MatchEventService";
import { EntityManager } from "typeorm";

export class MatchService {
  private playerService: PlayerService;
  private teamService: TeamService;
  private matchEventService: MatchEventService;

  // Inject PlayerService in the constructor
  constructor(playerService: PlayerService, teamService: TeamService, matchEventService: MatchEventService) {
    this.playerService = playerService;
    this.teamService = teamService;
    this.matchEventService = matchEventService;
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

        const requestBody = this.buildRequestBody(match, seed);
        const is1stHalf = match.state === MatchState.BEGIN;
        const is2ndHalf = match.state === MatchState.HALF;

        if (!is1stHalf && !is2ndHalf) {
          console.error(`Match ${match.match_idx} is not in the BEGIN or HALF state, skipping`);
          return;
        }
        const endpoint = is1stHalf ? "play1stHalf" : "play2ndHalf";

        const response = await axios.post(`${process.env.CORE_API_URL}/match/${endpoint}`, requestBody);
        const playOutput = response.data as PlayOutput;
        
        // Update skills, teams, and events within the transaction
        await this.playerService.updateSkills(match.homeTeam!.tactics, playOutput.updatedSkills[0], transactionManager);
        await this.playerService.updateSkills(match.visitorTeam!.tactics, playOutput.updatedSkills[1], transactionManager);

        await this.teamService.updateTeamData(playOutput.matchLogsAndEvents, playOutput.earnedTrainingPoints, match.homeTeam!.team_id, transactionManager);
        await this.teamService.updateTeamData(playOutput.matchLogsAndEvents, playOutput.earnedTrainingPoints, match.visitorTeam!.team_id, transactionManager);

        await this.matchEventService.saveMatchEvents(playOutput.matchLogsAndEvents, match, transactionManager);
      });

    } catch (error) {
      console.error(`Error playing match:`, error);
      throw error; // Rollback will occur automatically if an error is thrown
    }

    return "ok";
  }

  async updateMatch(match: Match) {
    const matchRepository = AppDataSource.getRepository(Match);
    return await matchRepository.save(match);
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
        "matchEvents",
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

  buildRequestBody(match: Match, seed: string): PlayMatchRequest {
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
      matchEvents: match.matchEvents.map(MatchMapper.mapMatchEventToRequest),
      matchBools: [match.state === MatchState.HALF, true, false, false, false], 
      trainings: [
        MatchMapper.mapTrainingToRequest(match.homeTeam!.trainings),  // Home team training
        MatchMapper.mapTrainingToRequest(match.visitorTeam!.trainings) // Visitor team training
      ]
    };
  }
}
