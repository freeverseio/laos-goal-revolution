import { MatchService } from './MatchService';
import { AppDataSource } from '../db/AppDataSource';
import { Match, MatchState } from '../db/entity/Match';
import axios from 'axios';
import { PlayerService } from "./PlayerService";
import { MatchEvent, Tactics, Training } from '../db/entity';
import { TeamService } from './TeamService';

// Mock axios and the repository
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../db/AppDataSource');
const mockRepository = {
  find: jest.fn(),
};
(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);


jest.mock('./PlayerService');
const mockPlayerService = {
  updateSkills: jest.fn(),
} as unknown as PlayerService;

jest.mock('./TeamService');
const mockTeamService = {
  updateTeamData: jest.fn(),
} as unknown as TeamService;

const mockMatch: Match = {
  timezone_idx: 1,
  country_idx: 1,
  league_idx: 1,
  match_day_idx: 1,
  match_idx: 1,
  seed: 'test-seed',
  start_epoch: 1620000000,
  homeTeam: {
    team_id: '1',
    players: [],
    tactics: {
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
      substitution_0_shirt: 12,
      substitution_0_target: 13,
      substitution_0_minute: 45,
      extra_attack_1: true,
      extra_attack_2: false,
      extra_attack_3: true,
      extra_attack_4: false,
      extra_attack_5: true,
      extra_attack_6: false,
      extra_attack_7: true,
      extra_attack_8: false,
      extra_attack_9: true,
      extra_attack_10: false,
    } as Tactics,
    trainings: {
      special_player_shirt: 10,
      goalkeepers_defence: 5,
      goalkeepers_speed: 5,
      goalkeepers_pass: 5,
      goalkeepers_shoot: 5,
      goalkeepers_endurance: 5,
      defenders_defence: 10,
      defenders_speed: 8,
      defenders_pass: 7,
      defenders_shoot: 6,
      defenders_endurance: 9,
    } as Training,
  },
  visitorTeam: {
    team_id: '2',
    players: [],
    tactics: {} as Tactics,
    trainings: {} as Training,
  },
  matchEvents: [],
  state: MatchState.BEGIN,
  home_goals: 0,
  visitor_goals: 0,
  home_teamsumskills: 100,
  visitor_teamsumskills: 90,
  state_extra: '',
} as unknown as Match;

describe('MatchService', () => {
  let matchService: MatchService;

  beforeEach(() => {
    // spy on console error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    matchService = new MatchService(mockPlayerService, mockTeamService);
  });

  describe('playMatches', () => {
    it('should retrieve matches and call playMatch for each match', async () => {
      const mockMatches = [
        { seed: 'test-seed', start_epoch: 1620000000, homeTeam: {}, visitorTeam: {} } as Match,
        { seed: 'test-seed-2', start_epoch: 1620000001, homeTeam: {}, visitorTeam: {} } as Match,
      ];

      mockRepository.find.mockResolvedValue(mockMatches);

      const playMatchSpy = jest.spyOn(matchService, 'playMatch').mockResolvedValue('ok');

      await matchService.playMatches(1, 1, 1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          timezone_idx: 1,
          league_idx: 1,
          match_day_idx: 1,
        },
        relations: [
          'matchEvents',
          'homeTeam',
          'visitorTeam',
          'homeTeam.players',
          'visitorTeam.players',
          'homeTeam.tactics',
          'visitorTeam.tactics',
          'homeTeam.trainings',
          'visitorTeam.trainings',
        ],
      });
      expect(playMatchSpy).toHaveBeenCalledTimes(2); // Called for each match
    });
  });

  describe('playMatch', () => {
    it('should build request body and send a request to the external API', async () => {
     

      mockedAxios.post.mockResolvedValue({ data: 'ok' });

      const buildRequestBodySpy = jest.spyOn(matchService, 'buildRequestBody');
      const response = await matchService['playMatch'](mockMatch, "test-seed");

      expect(buildRequestBodySpy).toHaveBeenCalledWith(mockMatch, "test-seed");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.CORE_API_URL}/match/play1stHalf`,
        expect.any(Object)
      );
      expect(response).toBe('ok');
    });
    it('should build request body and send a request to the external API for 2nd half', async () => {

      mockedAxios.post.mockResolvedValue({ data: 'ok' });

      const buildRequestBodySpy = jest.spyOn(matchService, 'buildRequestBody');
      mockMatch.state = MatchState.HALF;
      const response = await matchService['playMatch'](mockMatch, "test-seed");

      expect(buildRequestBodySpy).toHaveBeenCalledWith(mockMatch, "test-seed");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.CORE_API_URL}/match/play2ndHalf`,
        expect.any(Object)
      );
      expect(response).toBe('ok');
    });
    

  describe('buildRequestBody', () => {
    it('should correctly build the PlayMatchRequest body', () => {
      const mockMatch: Match = {
        timezone_idx: 1,
        country_idx: 1,
        league_idx: 1,
        match_day_idx: 1,
        match_idx: 1,
        seed: 'test-seed',
        start_epoch: 1620000000,
        homeTeam: {
          team_id: '1',
          players: [],
          tactics: {
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
            substitution_0_shirt: 12,
            substitution_0_target: 13,
            substitution_0_minute: 45,
            extra_attack_1: true,
            extra_attack_2: false,
            extra_attack_3: true,
            extra_attack_4: false,
            extra_attack_5: true,
            extra_attack_6: false,
            extra_attack_7: true,
            extra_attack_8: false,
            extra_attack_9: true,
            extra_attack_10: false,
          } as Tactics,
          trainings: {
            special_player_shirt: 10,
            goalkeepers_defence: 5,
            goalkeepers_speed: 5,
            goalkeepers_pass: 5,
            goalkeepers_shoot: 5,
            goalkeepers_endurance: 5,
            defenders_defence: 10,
            defenders_speed: 8,
            defenders_pass: 7,
            defenders_shoot: 6,
            defenders_endurance: 9,
          } as Training,
        },
        visitorTeam: {
          team_id: '2',
          players: [],
          tactics: {} as Tactics,
          trainings: {} as Training,
        },
        matchEvents: [],
        state: MatchState.BEGIN,
        home_goals: 0,
        visitor_goals: 0,
        home_teamsumskills: 100,
        visitor_teamsumskills: 90,
        state_extra: '',
      } as unknown as Match;

      const result = matchService['buildRequestBody'](mockMatch, "test-seed");

      expect(result.verseSeed).toBe("test-seed");
      expect(result.matchStartTime).toBe(Number(mockMatch.start_epoch));
      expect(result.teamIds).toEqual([1, 2]);
    });
  });
});
});
