import { Player, PlayerHistory } from "../../db/entity";

export class PlayerHistoryMapper {
  static mapToPlayerHistory(player: Player, blockNumber: number): PlayerHistory {
    const playerHistory = new PlayerHistory();

    playerHistory.player_id = player.player_id;
    playerHistory.block_number = blockNumber;
    playerHistory.team_id = player.team_id;
    playerHistory.defence = player.defence;
    playerHistory.speed = player.speed;
    playerHistory.pass = player.pass;
    playerHistory.shoot = player.shoot;
    playerHistory.endurance = player.endurance;
    playerHistory.shirt_number = player.shirt_number;
    playerHistory.preferred_position = player.preferred_position;
    playerHistory.potential = player.potential;
    playerHistory.day_of_birth = player.day_of_birth;
    playerHistory.encoded_skills = player.encoded_skills;
    playerHistory.encoded_state = player.encoded_state;
    playerHistory.red_card = player.red_card;
    playerHistory.injury_matches_left = player.injury_matches_left;
    playerHistory.tiredness = player.tiredness;
    playerHistory.country_of_birth = player.country_of_birth;
    playerHistory.race = player.race;
    playerHistory.yellow_card_1st_half = player.yellow_card_1st_half;

    return playerHistory;
  }
}
