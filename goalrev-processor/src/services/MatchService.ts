import { AppDataSource } from "../db/AppDataSource";
import { Match, MatchState } from "../db/entity/Match";
import axios from "axios";
import { Player } from "../db/entity/Player";
import { PlayMatchRequest, TacticRequest, TrainingRequest } from "../types";
import { Tactics, Training } from "../db/entity";

export class MatchService {

  async playMatches(timezone: number, league: number, matchDay: number) {
    // get matches for timezone and epoch
    const matches = await this.getMatches(timezone, league, matchDay);
    
    // Process matches 
    await Promise.all(matches.map(match => this.playMatch(match)));
    return "ok"
  }

   // Update the playMatch method to use the new buildRequestBody method
   private async playMatch(match: Match) {
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

  private buildRequestBody(match: Match): PlayMatchRequest {
    return {
      verseSeed: match.seed,
      matchStartTime: Number(match.start_epoch),
      skills: [
        this.calculateTeamSkills(match.homeTeam!.players), // Team 1 skills
        this.calculateTeamSkills(match.visitorTeam!.players) // Team 2 skills
      ],
      teamIds: [
        Number(match.homeTeam!.team_id),
        Number(match.visitorTeam!.team_id)
      ],
      // Use tactics for both teams
      tactics: [
        this.mapTacticToRequest(match.homeTeam!.tactics),  // Home team tactics
        this.mapTacticToRequest(match.visitorTeam!.tactics) // Visitor team tactics
      ],
      matchLogs: ["", ""],
      matchBools: [match.state === MatchState.HALF, true, false, false, false], 
      trainings: [
        this.mapTrainingToRequest(match.homeTeam!.trainings),  // Home team training
        this.mapTrainingToRequest(match.visitorTeam!.trainings) // Visitor team training
      ]
    };
  }
  

  private mapTacticToRequest(tactic: Tactics): TacticRequest {
    return {
      lineup: [
        tactic.shirt_0, tactic.shirt_1, tactic.shirt_2, tactic.shirt_3, tactic.shirt_4,
        tactic.shirt_5, tactic.shirt_6, tactic.shirt_7, tactic.shirt_8, tactic.shirt_9, 
        tactic.shirt_10
      ],
      substitutions: [
        {
          shirt: tactic.substitution_0_shirt,
          target: tactic.substitution_0_target,
          minute: tactic.substitution_0_minute
        },
        {
          shirt: tactic.substitution_1_shirt,
          target: tactic.substitution_1_target,
          minute: tactic.substitution_1_minute
        },
        {
          shirt: tactic.substitution_2_shirt,
          target: tactic.substitution_2_target,
          minute: tactic.substitution_2_minute
        }
      ],
      extraAttack: [
        tactic.extra_attack_1, tactic.extra_attack_2, tactic.extra_attack_3, tactic.extra_attack_4,
        tactic.extra_attack_5, tactic.extra_attack_6, tactic.extra_attack_7, tactic.extra_attack_8,
        tactic.extra_attack_9, tactic.extra_attack_10
      ]
    };

  }

  private mapTrainingToRequest(training: Training): TrainingRequest {
    return {
      specialPlayerShirt: training.special_player_shirt,
      goalkeepers: {
        defence: training.goalkeepers_defence,
        speed: training.goalkeepers_speed,
        pass: training.goalkeepers_pass,
        shoot: training.goalkeepers_shoot,
        endurance: training.goalkeepers_endurance
      },
      defenders: {
        defence: training.defenders_defence,
        speed: training.defenders_speed,
        pass: training.defenders_pass,
        shoot: training.defenders_shoot,
        endurance: training.defenders_endurance
      },
      midfielders: {
        defence: training.midfielders_defence,
        speed: training.midfielders_speed,
        pass: training.midfielders_pass,
        shoot: training.midfielders_shoot,
        endurance: training.midfielders_endurance
      },
      attackers: {
        defence: training.attackers_defence,
        speed: training.attackers_speed,
        pass: training.attackers_pass,
        shoot: training.attackers_shoot,
        endurance: training.attackers_endurance
      },
      specialPlayer: {
        defence: training.special_player_defence,
        speed: training.special_player_speed,
        pass: training.special_player_pass,
        shoot: training.special_player_shoot,
        endurance: training.special_player_endurance
      }
    };
  }

  private calculateTeamSkills(players: Player[]): string[] {
    return players.map(player => player.encoded_skills);
  }
}
