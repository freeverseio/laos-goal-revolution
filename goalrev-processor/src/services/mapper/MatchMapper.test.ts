import { Player } from "../../db/entity/Player";
import { PLAYERS_PER_TEAM_MAX } from "../../utils/constants/constants";
import { MatchMapper } from "./MatchMapper";

describe('MatchMapper', () => {

  beforeEach(() => {
    // spy for console.log
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  describe('calculateTeamSkills', () => {
    it('should return the skills of the players in the correct order', () => {
      const players: Player[] = [
        { player_id: '1', team: {} as any, name: 'Player 1', team_id: 'team1', shirt_number: 1, encoded_skills: "11111111111", defence: 0, speed: 0, pass: 0, shoot: 0, endurance: 0, preferred_position: '', potential: 0, day_of_birth: 0, encoded_state: '', red_card: false, injury_matches_left: 0, tiredness: 0, country_of_birth: '', race: '', yellow_card_1st_half: false, voided: false },
        { player_id: '2', team: {} as any, name: 'Player 2', team_id: 'team1', shirt_number: 2, encoded_skills: "22222222222", defence: 0, speed: 0, pass: 0, shoot: 0, endurance: 0, preferred_position: '', potential: 0, day_of_birth: 0, encoded_state: '', red_card: false, injury_matches_left: 0, tiredness: 0, country_of_birth: '', race: '', yellow_card_1st_half: false, voided: false },
        { player_id: '3', team: {} as any, name: 'Player 3', team_id: 'team1', shirt_number: 3, encoded_skills: "33333333333", defence: 0, speed: 0, pass: 0, shoot: 0, endurance: 0, preferred_position: '', potential: 0, day_of_birth: 0, encoded_state: '', red_card: false, injury_matches_left: 0, tiredness: 0, country_of_birth: '', race: '', yellow_card_1st_half: false, voided: false }
      ];
      const skills = MatchMapper.calculateTeamSkills(players);
      expect(skills.length).toBe(PLAYERS_PER_TEAM_MAX);
      expect(skills[0]).toBe("11111111111");
      expect(skills[1]).toBe("22222222222");
      expect(skills[2]).toBe("33333333333");
      for (let i = 3; i < PLAYERS_PER_TEAM_MAX; i++) {
        expect(skills[i]).toBe("0");
      }
    });

    it('should correctly handle non-sequential shirt numbers', () => {
      const players: Player[] = [
        { player_id: '1', team: {} as any, name: 'Player 1', team_id: 'team1', shirt_number: 1, encoded_skills: "11111111111", defence: 0, speed: 0, pass: 0, shoot: 0, endurance: 0, preferred_position: '', potential: 0, day_of_birth: 0, encoded_state: '', red_card: false, injury_matches_left: 0, tiredness: 0, country_of_birth: '', race: '', yellow_card_1st_half: false, voided: false },
        { player_id: '2', team: {} as any, name: 'Player 2', team_id: 'team1', shirt_number: 2, encoded_skills: "22222222222", defence: 0, speed: 0, pass: 0, shoot: 0, endurance: 0, preferred_position: '', potential: 0, day_of_birth: 0, encoded_state: '', red_card: false, injury_matches_left: 0, tiredness: 0, country_of_birth: '', race: '', yellow_card_1st_half: false, voided: false },
        { player_id: '3', team: {} as any, name: 'Player 3', team_id: 'team1', shirt_number: 4, encoded_skills: "33333333333", defence: 0, speed: 0, pass: 0, shoot: 0, endurance: 0, preferred_position: '', potential: 0, day_of_birth: 0, encoded_state: '', red_card: false, injury_matches_left: 0, tiredness: 0, country_of_birth: '', race: '', yellow_card_1st_half: false, voided: false }
      ];
      const skills = MatchMapper.calculateTeamSkills(players);
      expect(skills.length).toBe(PLAYERS_PER_TEAM_MAX);
      expect(skills[0]).toBe("11111111111");
      expect(skills[1]).toBe("22222222222");
      expect(skills[2]).toBe("0");
      expect(skills[3]).toBe("33333333333");
      for (let i = 4; i < PLAYERS_PER_TEAM_MAX; i++) {
        expect(skills[i]).toBe("0");
      }
    });
  });
});