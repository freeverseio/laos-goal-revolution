import { MatchService } from './MatchService';
import { AppDataSource } from '../db/AppDataSource';
import { Match, MatchState } from '../db/entity/Match';
import axios from 'axios';
import { PlayerService } from "./PlayerService";
import { TeamService } from './TeamService';
import { MatchEventService } from './MatchEventService';
import { EntityManager } from "typeorm";
import { Tactics } from '../db/entity/Tactic';
import { Training } from '../db/entity/Training';

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

jest.mock('./MatchEventService');
const mockMatchEventService = {
  saveMatchEvents: jest.fn(),
} as unknown as MatchEventService;

// Mock for EntityManager
const mockEntityManager = {
  transaction: jest.fn((callback) => callback(mockEntityManager)),
  save: jest.fn(),
  findOne: jest.fn(),
  get: jest.fn(),
} as unknown as jest.Mocked<EntityManager>;

// Mock AppDataSource.manager
Object.defineProperty(AppDataSource, 'manager', {
  value: mockEntityManager,
});

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
    } as Tactics,
    trainings: {} as Training,
  },
  visitorTeam: {
    team_id: '2',
    players: [],
    tactics: {} as Tactics,
    trainings: {} as Training,
  },
  matchEvents: [],
  state: MatchState.BEGIN,
} as unknown as Match;

describe('MatchService', () => {
  let matchService: MatchService;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all previous mocks
    matchService = new MatchService(mockPlayerService, mockTeamService, mockMatchEventService);
  });

  describe('playMatches', () => {
    it('should retrieve matches and call playMatch for each match', async () => {
      const mockMatches = [mockMatch, { ...mockMatch, match_idx: 2 }];
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
      mockedAxios.post.mockResolvedValue({ data: { updatedSkills: [[], []], matchLogsAndEvents: [], earnedTrainingPoints: 0 } });

      const buildRequestBodySpy = jest.spyOn(matchService, 'buildRequestBody');
      const response = await matchService.playMatch(mockMatch, "test-seed");

      expect(buildRequestBodySpy).toHaveBeenCalledWith(mockMatch, "test-seed");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.CORE_API_URL}/match/play1stHalf`,
        expect.any(Object)
      );
      expect(response).toBe('ok');
    });

    it('should call playerService, teamService, and matchEventService with EntityManager', async () => {
      mockedAxios.post.mockResolvedValue({ data: { updatedSkills: [[], []], matchLogsAndEvents: [], earnedTrainingPoints: 0 } });

      const updateSkillsSpy = jest.spyOn(mockPlayerService, 'updateSkills');
      const updateTeamDataSpy = jest.spyOn(mockTeamService, 'updateTeamData');
      const saveMatchEventsSpy = jest.spyOn(mockMatchEventService, 'saveMatchEvents');

      await matchService['playMatch'](mockMatch, "test-seed");

      expect(updateSkillsSpy).toHaveBeenCalled();
      expect(updateTeamDataSpy).toHaveBeenCalled();
      expect(saveMatchEventsSpy).toHaveBeenCalled();
    });
  });

  describe('buildRequestBody', () => {
    it('should correctly build the PlayMatchRequest body', () => {
      const result = matchService['buildRequestBody'](mockMatch, "test-seed");

      expect(result.verseSeed).toBe("test-seed");
      expect(result.matchStartTime).toBe(Number(mockMatch.start_epoch));
      expect(result.teamIds).toEqual([1, 2]);
    });
  });
});
