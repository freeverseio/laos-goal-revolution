import { AppDataSource } from "../db/AppDataSource";
import { Match, MatchState } from "../db/entity/Match";
import axios from "axios";
import { MatchMapper } from "./mapper/MatchMapper";
import { PlayMatchRequest } from "../types";

export class MatchService {

  async playMatches(timezone: number, league: number, matchDay: number) {
    // get matches for timezone and epoch
    const matches = await this.getMatches(timezone, league, matchDay);
    
    // Process matches 
    await Promise.all(matches.map(match => this.playMatch(match)));
    return "ok"
  }

   // Update the playMatch method to use the new buildRequestBody method
   async playMatch(match: Match) {
    try {
      const requestBody = this.buildRequestBody(match); // Use the new method
      console.log(JSON.stringify(requestBody));
      // Make the POST request to the API
      const response = await axios.post(`${process.env.CORE_API_URL}/match/play1stHalf`, requestBody);

      // Handle response (if needed)
     // console.log(`Response from play1stHalf:`, response.data);
    } catch (error) {
      console.error(`Error playing match:`, error);
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

  buildRequestBody(match: Match): PlayMatchRequest {
    return {
      verseSeed: match.seed,
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
