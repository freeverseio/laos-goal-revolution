import { PlayerService, PlayerSkill } from './PlayerService';
import { AppDataSource } from '../db/AppDataSource';
import { Player, Tactics } from '../db/entity';

// Mock the repositories
jest.mock('../db/AppDataSource');

const mockPlayerRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockPlayerRepository);

describe('PlayerService', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    playerService = new PlayerService();
    jest.clearAllMocks(); // Reset mocks before each test
  });

  describe('updateSkills', () => {
    it('should update the skills of players based on their shirt numbers', async () => {
      // Mock player data
      const mockPlayer = {
        player_id: '1',
        defence: 50,
        speed: 50,
        pass: 50,
        shoot: 50,
        endurance: 50,
        encoded_skills: 'old_skills',
      };

      const mockPlayerSkill: PlayerSkill = {
        defence: 80,
        speed: 90,
        pass: 85,
        shoot: 88,
        endurance: 95,
        encodedSkills: 'new_skills',
      };

      // Mock the Tactics entity
      const tactics: Tactics = {
        team_id: 'team_1',
        tactic_id: 1,
        shirt_0: 1,
        shirt_1: 2,
        shirt_2: 3,
        shirt_3: 4,
        shirt_4: 5,
        shirt_5: 6,
        shirt_6: 7,
        shirt_7: 8,
        shirt_8: 9,
        shirt_9: 10,
        shirt_10: 11,
        substitution_0_shirt: 0,
        substitution_0_target: 0,
        substitution_0_minute: 0,
        substitution_1_shirt: 0,
        substitution_1_target: 0,
        substitution_1_minute: 0,
        substitution_2_shirt: 0,
        substitution_2_target: 0,
        substitution_2_minute: 0,
        extra_attack_1: false,
        extra_attack_2: false,
        extra_attack_3: false,
        extra_attack_4: false,
        extra_attack_5: false,
        extra_attack_6: false,
        extra_attack_7: false,
        extra_attack_8: false,
        extra_attack_9: false,
        extra_attack_10: false,
        team: { team_id: 'team_1' } as any,
      };

      // Mock database return values
      mockPlayerRepository.findOne.mockResolvedValueOnce(mockPlayer);

      // Call updateSkills
      await playerService.updateSkills(tactics, [mockPlayerSkill]);

      // Expect the player to be found with player_id from tactics
      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({
        where: { player_id: '1' }, // Expecting player_id to be called
      });

      // Expect the player to be updated with new skills
      expect(mockPlayer.defence).toBe(mockPlayerSkill.defence);
      expect(mockPlayer.speed).toBe(mockPlayerSkill.speed);
      expect(mockPlayer.pass).toBe(mockPlayerSkill.pass);
      expect(mockPlayer.shoot).toBe(mockPlayerSkill.shoot);
      expect(mockPlayer.endurance).toBe(mockPlayerSkill.endurance);
      expect(mockPlayer.encoded_skills).toBe(mockPlayerSkill.encodedSkills);

      // Expect the player to be saved
      expect(mockPlayerRepository.save).toHaveBeenCalledWith(mockPlayer);
    });

    it('should not save if player is not found', async () => {

      //spy for console error
      const spy = jest.spyOn(console, 'error');

      // Mock that no player is found
      mockPlayerRepository.findOne.mockResolvedValueOnce(null);

      const mockPlayerSkill: PlayerSkill = {
        defence: 80,
        speed: 90,
        pass: 85,
        shoot: 88,
        endurance: 95,
        encodedSkills: 'new_skills',
      };

      // Mock the Tactics entity
      const tactics: Tactics = {
        team_id: 'team_1',
        tactic_id: 1,
        shirt_0: 1,
        shirt_1: 2,
        shirt_2: 3,
        shirt_3: 4,
        shirt_4: 5,
        shirt_5: 6,
        shirt_6: 7,
        shirt_7: 8,
        shirt_8: 9,
        shirt_9: 10,
        shirt_10: 11,
        substitution_0_shirt: 0,
        substitution_0_target: 0,
        substitution_0_minute: 0,
        substitution_1_shirt: 0,
        substitution_1_target: 0,
        substitution_1_minute: 0,
        substitution_2_shirt: 0,
        substitution_2_target: 0,
        substitution_2_minute: 0,
        extra_attack_1: false,
        extra_attack_2: false,
        extra_attack_3: false,
        extra_attack_4: false,
        extra_attack_5: false,
        extra_attack_6: false,
        extra_attack_7: false,
        extra_attack_8: false,
        extra_attack_9: false,
        extra_attack_10: false,
        team: { team_id: 'team_1' } as any,
      };

      // Call updateSkills
      await playerService.updateSkills(tactics, [mockPlayerSkill]);

      // Expect the repository findOne method to have been called
      expect(mockPlayerRepository.findOne).toHaveBeenCalled();

      // Expect the repository save method not to have been called
      expect(mockPlayerRepository.save).not.toHaveBeenCalled();
    });
  });
});
