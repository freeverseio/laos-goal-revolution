import { Country, League, Player, Tactics, Team, Training } from "../../db/entity";
import { CreateTeamResponse, Player as PlayerResponse } from "../../types/rest/output/team";
import { DEFAULT_ENCODED_TACTIC } from "../../utils/constants";
import { PreferredPositionMapper } from "./PreferredPositionMapper";

export class CreateTeamResponseToEntityMapper {
  static map({response, timezoneIdx, countryIdx, league_idx, team_idx_in_league, leaderboard_position}:
    {response: CreateTeamResponse, timezoneIdx: number, countryIdx: number, league_idx: number, team_idx_in_league: number, leaderboard_position: number}): Team {
    return  {
      team_id: response.id,
      name: response.id + 'Mock Team ',
      manager_name: 'Mock Manager ' + response.id,
      tactic: DEFAULT_ENCODED_TACTIC,
      country: {
        timezone_idx: timezoneIdx,
        country_idx: countryIdx,
      } as Country,
      league: {
        timezone_idx: timezoneIdx,
        country_idx: countryIdx,
        league_idx: league_idx,
      } as League,
      players: CreateTeamResponseToEntityMapper.mapPlayers(response.players, response.id),
      tactics: CreateTeamResponseToEntityMapper.createDefaultTactics(response.id),
      trainings: CreateTeamResponseToEntityMapper.createDefaultTraining(response.id),
      timezone_idx: timezoneIdx,
      country_idx: countryIdx,
      owner: '0x0000000000000000000000000000000000000000',
      league_idx: league_idx,
      team_idx_in_league: team_idx_in_league,
      leaderboard_position: leaderboard_position,
      points: 0,
      w: 0,
      d: 0,
      l: 0,
      goals_forward: 0,
      goals_against: 0,
      prev_perf_points: '0',
      ranking_points: '0',
      training_points: 0,
      match_log: '0',
      is_zombie: false,
      promo_timeout: 0,
    };
  }

  static mapPlayers(players: PlayerResponse[], teamId: string): Player[] {
    return players.map((player, index) => {
      const playerEntity = new Player();
      const preferredPosition = PreferredPositionMapper.getPreferredPosition(player.birthTraits);
      if (preferredPosition instanceof Error) {
        throw new Error(`Failed to get preferred position for player ${player.id}: ${preferredPosition.message}`);
      }
      playerEntity.name = "name " + player.id;
      playerEntity.player_id = player.id;
      playerEntity.team_id = teamId;
      playerEntity.defence = player.skills.defence;
      playerEntity.speed = player.skills.speed;
      playerEntity.pass = player.skills.pass;
      playerEntity.shoot = player.skills.shoot;
      playerEntity.endurance = player.skills.endurance;
      playerEntity.shirt_number = index;
      playerEntity.day_of_birth = player.dayOfBirth;
      playerEntity.encoded_skills = player.skills.encodedSkills;
      playerEntity.encoded_state = ""; 
      playerEntity.red_card = false; // Set default
      playerEntity.injury_matches_left = 0; // Set default
      playerEntity.tiredness = 0; // Set default or provide input
      playerEntity.country_of_birth = "ES";
      playerEntity.race = "Spanish";
      playerEntity.yellow_card_1st_half = false; // Set default
      playerEntity.voided = false // Set default
      playerEntity.potential = player.birthTraits.potential;
      playerEntity.preferred_position = preferredPosition;
      return playerEntity;
    });
  }

  static createDefaultTraining(teamId: string): Training {
    const training = new Training();
    training.team_id = teamId;
    training.special_player_shirt = -1;
    training.goalkeepers_shoot = 0;
    training.goalkeepers_speed = 0;
    training.goalkeepers_pass = 0;
    training.goalkeepers_defence = 0;
    training.goalkeepers_endurance = 0;
    training.defenders_shoot = 0;
    training.defenders_speed = 0;
    training.defenders_pass = 0;
    training.defenders_defence = 0;
    training.defenders_endurance = 0;
    training.midfielders_shoot = 0;
    training.midfielders_speed = 0;
    training.midfielders_pass = 0;
    training.midfielders_defence = 0;
    training.midfielders_endurance = 0;
    training.attackers_shoot = 0;
    training.attackers_speed = 0;
    training.attackers_pass = 0;
    training.attackers_defence = 0;
    training.attackers_endurance = 0;
    training.special_player_shoot = 0;
    training.special_player_speed = 0;
    training.special_player_pass = 0;
    training.special_player_defence = 0;
    training.special_player_endurance = 0;
    return training;
  }

  static createDefaultTactics(teamId: string): Tactics {
    const newTactic = new Tactics();
    newTactic.team_id = teamId;
    newTactic.tactic_id = 1;

    // Set initial shirt values
    newTactic.shirt_0 = 0;
    newTactic.shirt_1 = 3;
    newTactic.shirt_2 = 4;
    newTactic.shirt_3 = 5;
    newTactic.shirt_4 = 6;
    newTactic.shirt_5 = 7;
    newTactic.shirt_6 = 8;
    newTactic.shirt_7 = 9;
    newTactic.shirt_8 = 10;
    newTactic.shirt_9 = 11;
    newTactic.shirt_10 = 12;

    // Set initial substitution values
    newTactic.substitution_0_shirt = 25;
    newTactic.substitution_0_target = 11;
    newTactic.substitution_0_minute = 0;
    newTactic.substitution_1_shirt = 25;
    newTactic.substitution_1_target = 11;
    newTactic.substitution_1_minute = 0;
    newTactic.substitution_2_shirt = 25;
    newTactic.substitution_2_target = 11;
    newTactic.substitution_2_minute = 0;

    // Set initial extra attack values
    newTactic.extra_attack_1 = false;
    newTactic.extra_attack_2 = false;
    newTactic.extra_attack_3 = false;
    newTactic.extra_attack_4 = false;
    newTactic.extra_attack_5 = false;
    newTactic.extra_attack_6 = false;
    newTactic.extra_attack_7 = false;
    newTactic.extra_attack_8 = false;
    newTactic.extra_attack_9 = false;
    newTactic.extra_attack_10 = false;
    return newTactic;
  }
}