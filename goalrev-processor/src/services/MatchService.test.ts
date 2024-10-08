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
import { VerseService } from './VerseService';
import { Verse } from '../db/entity/Verse';

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
  updateTeamMatchLog: jest.fn(),
} as unknown as TeamService;

jest.mock('./MatchEventService');
const mockMatchEventService = {
  saveMatchEvents: jest.fn(),
} as unknown as MatchEventService;

jest.mock('./VerseService');
const mockVerseService = {
  getLastVerse: jest.fn(),
  getInitialVerse: jest.fn(),
  saveVerse: jest.fn(),
} as unknown as VerseService;

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
    matchService = new MatchService(mockPlayerService, mockTeamService, mockMatchEventService, mockVerseService);
  });

  describe('playMatches', () => {
    it('should retrieve matches and call playMatch for each match', async () => {
      const mockMatches = [mockMatch, { ...mockMatch, match_idx: 2 }];
      mockRepository.find.mockResolvedValue(mockMatches);
      const playMatchSpy = jest.spyOn(matchService, 'playMatch').mockResolvedValue('ok');
      const verseServiceSpy = jest.spyOn(mockVerseService, 'getInitialVerse').mockResolvedValue({ verseNumber: 0, verseTimestamp: new Date(), timezoneIdx: 1 } as Verse);
      const lastVerseSpy = jest.spyOn(mockVerseService, 'getLastVerse').mockResolvedValue({ verseNumber: 0, verseTimestamp: new Date(), timezoneIdx: 1 } as Verse);
      const saveVerseSpy = jest.spyOn(mockVerseService, 'saveVerse');
      await matchService.playMatches(1, 1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          timezone_idx: 1,
          match_day_idx: 1,
        },
        relations: [
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
      expect(saveVerseSpy).toHaveBeenCalled();

    });
  });

  describe('playMatch', () => {
    it('should build request body and send a request to the external API for 1st half', async () => {
      mockedAxios.post.mockResolvedValue({ data: { matchEvents: [], updatedSkills: [[], []], matchLogs: [{}, {}], earnedTrainingPoints: 0 } });

      const buildRequestBodySpy = jest.spyOn(matchService, 'buildRequestBody');
      const response = await matchService.playMatch(mockMatch, "test-seed");

      expect(buildRequestBodySpy).toHaveBeenCalledWith(mockMatch, "test-seed", true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.CORE_API_URL}/match/play1stHalf`,
        expect.any(Object)
      );
      expect(mockEntityManager.save).toHaveBeenCalledWith(mockMatch);
      expect(response).toBe('ok');
    });

    it('should update skills, team data, and save match when in 2nd half', async () => {
      // Prepare mock for 2nd half
      mockedAxios.post.mockResolvedValue({
        data: {
          matchEvents: [],
          updatedSkills: [[], []],
          matchLogs: [
            { teamSumSkills: 150 },
            { teamSumSkills: 140 },
          ],
        }
      });
      mockMatch.state = MatchState.HALF;

      await matchService.playMatch(mockMatch, "test-seed");

      // Ensure methods are called
      expect(mockPlayerService.updateSkills).toHaveBeenCalledTimes(2); // Both home and visitor team
      expect(mockTeamService.updateTeamData).toHaveBeenCalledTimes(2); // Both teams
      expect(mockMatch.home_teamsumskills).toBe(150); // Updated skill points
      expect(mockMatch.visitor_teamsumskills).toBe(140);
      expect(mockEntityManager.save).toHaveBeenCalledWith(mockMatch);
    });
  });

  describe('buildRequestBody', () => {
    it('should correctly build the PlayMatchRequest body', () => {
      const result = matchService['buildRequestBody'](mockMatch, "test-seed", true);

      expect(result.verseSeed).toBe("test-seed");
      expect(result.matchStartTime).toBe(Number(mockMatch.start_epoch));
      expect(result.teamIds).toEqual([1, 2]);
    });
  });
});
