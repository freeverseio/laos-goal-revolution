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

  static calculateTeamSkills(players: Player[], tactics: Tactics): string[] {
    let lineup = [];
    lineup[0] = tactics.shirt_0;
    lineup[1] = tactics.shirt_1;
    lineup[2] = tactics.shirt_2;
    lineup[3] = tactics.shirt_3;
    lineup[4] = tactics.shirt_4;
    lineup[5] = tactics.shirt_5;
    lineup[6] = tactics.shirt_6;
    lineup[7] = tactics.shirt_7;
    lineup[8] = tactics.shirt_8;
    lineup[9] = tactics.shirt_9;
    lineup[10] = tactics.shirt_10;
    lineup[11] = tactics.substitution_0_shirt;
    lineup[12] = tactics.substitution_1_shirt;
    lineup[13] = tactics.substitution_2_shirt;

    // Order players based on the lineup array, players not in lineup go to the end
    const playerMap = new Map(players.map(player => [player.shirt_number, player]));
    const orderedPlayers = lineup
      .map(shirtNumber => playerMap.get(shirtNumber))
      .filter(player => player !== undefined) as Player[];
    const remainingPlayers = players.filter(player => !lineup.includes(player.shirt_number));
    const finalOrder = [...orderedPlayers, ...remainingPlayers];

    // Get the skills of the ordered players
    const skills = finalOrder.map(player => player.encoded_skills);
    while (skills.length < PLAYERS_PER_TEAM_MAX) {
      skills.push("0");
    }
    return skills;
  }
}
