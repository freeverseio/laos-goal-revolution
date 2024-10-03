import { AppDataSource } from "../db/AppDataSource";
import { Match, MatchState } from "../db/entity/Match";
import axios from "axios";
import { MatchMapper } from "./mapper/MatchMapper";
import { PlayMatchRequest, PlayOutput } from "../types";
import crypto from 'crypto';
import { PlayerService } from "./PlayerService";

export class MatchService {
  private playerService: PlayerService;

  // Inject PlayerService in the constructor
  constructor(playerService: PlayerService) {
    this.playerService = playerService;
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
    try {
      const requestBody = this.buildRequestBody(match, seed); // Use the new method
      // determine if 1st or 2nd half
      const is1stHalf = match.state === MatchState.BEGIN;
      const is2ndHalf = match.state === MatchState.HALF;
      if (!is1stHalf && !is2ndHalf) {
        console.error(`Match ${match.match_idx} is not in the BEGIN or HALF state, skipping`);
        return;
      }
      const endpoint = is1stHalf ? "play1stHalf" : "play2ndHalf";

      // Make the POST request to the API
      const response = await axios.post(`${process.env.CORE_API_URL}/match/${endpoint}`, requestBody);
      
      // Parse response to PlayOutput
      const playOutput = response.data as PlayOutput;
      
      // Update skills for home and visitor teams using the injected PlayerService
      await this.playerService.updateSkills(match.homeTeam!.tactics, playOutput.updatedSkills[0]);
      await this.playerService.updateSkills(match.visitorTeam!.tactics, playOutput.updatedSkills[1]);

    } catch (error) {
      console.error(`Error playing match:`, error);
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
