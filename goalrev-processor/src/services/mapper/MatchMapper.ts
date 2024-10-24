import { MatchEvent, Tactics, Training, Player } from "../../db/entity";
import { MatchEventRequest, TacticRequest, TrainingRequest } from "../../types";
import { PLAYERS_PER_TEAM_MAX } from "../../utils/constants";

export class MatchMapper {
  
  static mapMatchEventToRequest(matchEvent: MatchEvent): MatchEventRequest {
    return {
      minute: matchEvent.minute,
      type: matchEvent.type,
      team_id: matchEvent.team_id,
      primary_player_id: matchEvent.primary_player_id,
      secondary_player_id: matchEvent.secondary_player_id,
      manage_to_shoot: matchEvent.manage_to_shoot,
      is_goal: matchEvent.is_goal
    };
  }

  static mapTacticToRequest(tactic: Tactics): TacticRequest {
    return {
      tacticsId: tactic.tactic_id,
      lineup: [
        tactic.shirt_0, tactic.shirt_1, tactic.shirt_2, tactic.shirt_3, tactic.shirt_4,
        tactic.shirt_5, tactic.shirt_6, tactic.shirt_7, tactic.shirt_8, tactic.shirt_9, 
        tactic.shirt_10, tactic.substitution_0_shirt, tactic.substitution_1_shirt, tactic.substitution_2_shirt,
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

  static mapTrainingToRequest(training: Training, trainingPoints: number): TrainingRequest {
    return {
      trainingPoints: trainingPoints,
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

  static calculateTeamSkills(players: Player[]): string[] {
    // Sort players by shirt_number
    const sortedPlayers = [...players].sort((a, b) => a.shirt_number - b.shirt_number);

    // Get the skills of the sorted players
    const skills = sortedPlayers.map(player => player.encoded_skills);
    while (skills.length < PLAYERS_PER_TEAM_MAX) {
      skills.push("0");
    }
    return skills;
  }
}
