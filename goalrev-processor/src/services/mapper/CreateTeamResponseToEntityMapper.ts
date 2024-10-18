import { BirthTraits, CreateTeamResponse, Player as PlayerResponse } from "../../types/rest/output/team";
import { Team, Player, Country, League, Tactics, Training } from "../../db/entity";
import { PreferredPositionMapper } from "./PreferredPositionMapper";

export class CreateTeamResponseToEntityMapper {
  static map(response: CreateTeamResponse, timezoneIdx: number, countryIdx: number, lastLeagueIdx: number, i: number, j: number): Team {
    return  {
      team_id: response.teamId,
      name: 'Mock Team',
      manager_name: 'Mock Manager',
      country: {
        timezone_idx: timezoneIdx,
        country_idx: countryIdx,
      } as Country,
      league: {
        timezone_idx: timezoneIdx,
        country_idx: countryIdx,
        league_idx: lastLeagueIdx + 1 + i,
      } as League,
      players: CreateTeamResponseToEntityMapper.mapPlayers(response.players, response.teamId),
      tactics: {} as Tactics,
      trainings: {} as Training,
      timezone_idx: timezoneIdx,
      country_idx: countryIdx,
      owner: '0x0000000000000000000000000000000000000000',
      league_idx: lastLeagueIdx + 1 + i,
      team_idx_in_league: j,
      leaderboard_position: j,
      points: 0,
      w: 0,
      d: 0,
      l: 0,
      goals_forward: 0,
      goals_against: 0,
      prev_perf_points: '0',
      ranking_points: '0',
      training_points: 0,
      tactic: '',
      match_log: '',
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
      playerEntity.country_of_birth = ""; // Set default or provide input
      playerEntity.race = ""; // Set default or provide input
      playerEntity.yellow_card_1st_half = false; // Set default
      playerEntity.voided = false // Set default
      playerEntity.potential = player.birthTraits.potential;
      playerEntity.preferred_position = preferredPosition;
      return playerEntity;
    });
  }

  
}