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
import { CalendarService } from './CalendarService';
import { MatchRepository } from '../db/repository/MatchRepository';
import { Verse } from '../db/entity/Verse';
import { TimeZoneData } from '../types/timezone';
import { VerseRepository } from '../db/repository/VerseRepository';
import { LeagueService } from './LeagueService';
import { MatchHistoryRepository } from '../db/repository/MatchHistoryRepository';
import { TacticRepository } from '../db/repository/TacticRepository';

// Mock axios and the repository
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../db/AppDataSource');
const mockRepository = {
  find: jest.fn(),
  saveMatch: jest.fn(),
  getAllMatches: jest.fn(),
};

jest.mock('../db/repository/MatchRepository');
const mockMatchRepository = {
  saveMatch: jest.fn(),
  getAllMatches: jest.fn(),
} as unknown as MatchRepository;

jest.mock('./PlayerService');
const mockPlayerService = {
  updateSkills: jest.fn(),
} as unknown as PlayerService;

jest.mock('./TeamService');
const mockTeamService = {
  updateTeamData: jest.fn(),
  updateTeamMatchLog: jest.fn(),
  updateTeamGoals: jest.fn(),
} as unknown as TeamService;

jest.mock('./MatchEventService');
const mockMatchEventService = {
  saveMatchEvents: jest.fn(),
  getGoals: jest.fn(),
} as unknown as MatchEventService;

jest.mock('../db/repository/VerseRepository');
const mockVerseRepository = {
  getLastVerse: jest.fn(),
  getInitialVerse: jest.fn(),
  saveVerse: jest.fn(),
} as unknown as VerseRepository;

jest.mock('./CalendarService');
const mockCalendarService = {
  getCalendarInfo: jest.fn(),
  getCalendarInfoAtVerse: jest.fn(),
} as unknown as CalendarService;

jest.mock('./LeagueService');
const mockLeagueService = {
  generateCalendarForTimezone: jest.fn(),
  updateLeaderboard: jest.fn(),
  resetTrainings: jest.fn(),
} as unknown as LeagueService;

jest.mock('../db/repository/TacticRepository');
const mockTacticRepository = {
  insertTacticHistory: jest.fn(),
} as unknown as TacticRepository;

// Mock for EntityManager
const mockEntityManager = {
  transaction: jest.fn((callback) => callback(mockEntityManager)),
  save: jest.fn(),
  findOne: jest.fn(),
  get: jest.fn(),
} as unknown as jest.Mocked<EntityManager>;

jest.mock('../db/repository/MatchHistoryRepository');
const mockMatchHistoryRepository = {
  saveMatchHistory: jest.fn(),
  insertMatchHistory: jest.fn(),
} as unknown as MatchHistoryRepository;

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

const originalLog = console.log;

describe('MatchService', () => {
  let matchService: MatchService;

  beforeEach(() => {    
    jest.clearAllMocks(); // Clear all previous mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'time').mockImplementation(() => {});

    matchService = new MatchService(
      mockPlayerService,
      mockTeamService,
      mockMatchEventService,
      mockCalendarService,
      mockVerseRepository,
      mockMatchRepository,
      mockMatchHistoryRepository,
      mockLeagueService,
      mockTacticRepository,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    console.log = originalLog;
  });

  describe('playMatches', () => {
    it('should retrieve matches and call playMatch for each match', async () => {
      // mock Date.now()
      jest.spyOn(Date, 'now').mockReturnValue(1920000000);
      const mockMatches = [mockMatch, { ...mockMatch, match_idx: 2 }];
      jest.spyOn(mockMatchRepository, 'getAllMatches').mockResolvedValue(mockMatches);

      jest.spyOn(mockCalendarService, 'getCalendarInfo').mockResolvedValue({ verseNumber: 0, timestamp: 1520000, timezone: 10, matchDay: 1, half: 1, leagueRound: 1 } as TimeZoneData);
      jest.spyOn(mockCalendarService, 'getCalendarInfoAtVerse').mockResolvedValue({ verseNumber: 4, timestamp: 1520900, timezone: 11, matchDay: 1, half: 1, leagueRound: 1 } as TimeZoneData);

      const playMatchSpy = jest.spyOn(matchService, 'playMatch').mockResolvedValue('ok');
      const verseServiceSpy = jest.spyOn(mockVerseRepository, 'getInitialVerse').mockResolvedValue({ verseNumber: 0, verseTimestamp: 1620000, timezoneIdx: 10 } as Verse);
      const lastVerseSpy = jest.spyOn(mockVerseRepository, 'getLastVerse').mockResolvedValue({ verseNumber: 0, verseTimestamp: 16200000, timezoneIdx: 10 } as Verse);
      const saveVerseSpy = jest.spyOn(mockVerseRepository, 'saveVerse');
      jest.spyOn(mockLeagueService, 'updateLeaderboard').mockResolvedValue(true);      
      
      await matchService.playMatches();

      expect(mockMatchRepository.getAllMatches).toHaveBeenCalledWith(10, 1);
      expect(playMatchSpy).toHaveBeenCalledTimes(2); // Called for each match
      expect(saveVerseSpy).toHaveBeenCalled();
      expect(mockLeagueService.updateLeaderboard).toHaveBeenCalledTimes(1);      
    });
  });

  describe('playMatch', () => {
    it('should build request body and send a request to the external API for 1st half', async () => {
      mockedAxios.post.mockResolvedValue({ data: { matchEvents: [], updatedSkills: [[], []], matchLogs: [{}, {}], earnedTrainingPoints: 0 } });
      jest.spyOn(mockMatchEventService, 'getGoals').mockReturnValue([0, 0]);
      const buildRequestBodySpy = jest.spyOn(matchService, 'buildRequestBody');
      const response = await matchService.playMatch(mockMatch, "test-seed", 0);

      expect(buildRequestBodySpy).toHaveBeenCalledWith(mockMatch, "2c5829a4b0630b6c0b84177c8b1a5d91dec8188b864131b0370bd78a2ed01f57", true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.CORE_API_URL}/match/play1stHalf`,
        expect.any(Object)
      );
      expect(mockMatchRepository.saveMatch).toHaveBeenCalledWith(mockMatch, mockEntityManager);
      expect(response).toBe('ok');
    });

    it('should update skills, team data, and save match when in 2nd half', async () => {
      jest.spyOn(mockMatchEventService, 'getGoals').mockReturnValue([0, 0]);
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

      await matchService.playMatch(mockMatch, "test-seed", 0);

      // Ensure methods are called
      expect(mockPlayerService.updateSkills).toHaveBeenCalledTimes(2); // Both home and visitor team
      expect(mockTeamService.updateTeamData).toHaveBeenCalledTimes(2); // Both teams
      expect(mockMatch.home_teamsumskills).toBe(150); // Updated skill points
      expect(mockMatch.visitor_teamsumskills).toBe(140);
      expect(mockMatchRepository.saveMatch).toHaveBeenCalledWith(mockMatch, mockEntityManager);
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
