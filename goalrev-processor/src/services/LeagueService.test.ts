import { LeagueService } from "./LeagueService";
import { TeamRepository } from "../db/repository/TeamRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { EntityManager, Transaction } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { Country } from "../db/entity/Country";
import { Team } from "../db/entity/Team";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { LeagueGroup } from "../types/leaguegroup";
import { CalendarService } from "./CalendarService";
import { Verse } from "../db/entity";
import { AxiosResponse } from "axios";
import axios from 'axios';
import { LeagueRepository } from "../db/repository/LeagueRepository";
import { TrainingRepository } from "../db/repository/TrainingRepository";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../db/AppDataSource");

describe("LeagueService", () => {
  let leagueService: LeagueService;
  let teamRepository: jest.Mocked<TeamRepository>;
  let matchRepository: jest.Mocked<MatchRepository>;
  let verseRepository: jest.Mocked<VerseRepository>;
  let entityManager: jest.Mocked<EntityManager>;
  let matchEventRepository: jest.Mocked<MatchEventRepository>;
  let calendarService: jest.Mocked<CalendarService>;
  let leagueRepository: jest.Mocked<LeagueRepository>;
  let trainingRepository: jest.Mocked<TrainingRepository>;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    teamRepository = {
      findTeamsByCountryAndTimezone: jest.fn(),
      updateLeagueIdx: jest.fn(),
      countTeamsByTimezone: jest.fn(),
    } as any;
    
    matchRepository = {
      countPendingMatchesByCountry: jest.fn(),
    } as any;
    
    verseRepository = {
      countVersesByTimezone: jest.fn(),
      getLastVerse: jest.fn(),
      getInitialVerse: jest.fn(),
      saveVerse: jest.fn(),
    } as any;

    leagueRepository = {
      countLeaguesByTimezoneAndCountry: jest.fn(),
      updateLeaderboard: jest.fn(),
    } as any;

    calendarService = {
      generateCalendarForTimezone: jest.fn(),
    } as any;

    entityManager = {
      find: jest.fn(),
      findOne: jest.fn(),
      transaction: jest.fn(),
    } as any;

    // Mocking the manager for the AppDataSource
    (AppDataSource.manager as any) = entityManager;

    leagueService = new LeagueService(teamRepository, matchRepository, verseRepository, matchEventRepository, leagueRepository, trainingRepository, calendarService);
  });

  describe("getNewLeaguesByCountry", () => {
    it("should return a league group for a valid country and timezone", async () => {
      const mockCountry = { country_idx: 1, timezone_idx: 1 } as Country;
      const mockTeams = [{ team_id: 1 }, { team_id: 2 }] as unknown as Team[];

      entityManager.findOne.mockResolvedValueOnce(mockCountry);
      teamRepository.findTeamsByCountryAndTimezone.mockResolvedValueOnce(mockTeams);

      const result = await leagueService.getNewLeaguesByCountry(1, 1);
      expect(entityManager.findOne).toHaveBeenCalledWith(Country, { where: { country_idx: 1 } });
      expect(result).not.toBeNull();
      expect(result?.leagues.length).toBe(1);
    });

    it("should return null if country is not found", async () => {
      entityManager.findOne.mockResolvedValueOnce(null);

      const result = await leagueService.getNewLeaguesByCountry(999, 1);
      expect(result).toBeNull();
    });
  });

  


  describe("addDivision", () => {
    it("happy path", async () => {      
      const mockVerse = {
        verseNumber: 1,
        verseTimestamp: 1643723400,
        timezoneIdx: 10,
        root: 'mock-root',
        timezone: {          
          timezone_idx: 10,
        },
      } as Verse;
      const mockResponse = {
        data: {
          teamId: '12345',
          teamName: 'Mock Team',
          teamMembers: ['Member1', 'Member2', 'Member3'],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse;
  
      verseRepository.getInitialVerse.mockResolvedValue(mockVerse);
      teamRepository.countTeamsByTimezone.mockResolvedValueOnce(1);
      leagueRepository.countLeaguesByTimezoneAndCountry.mockResolvedValue(1);
      mockedAxios.post.mockResolvedValue(mockResponse);
      const result = await leagueService.addDivision(1, 10, 1);      
      expect(result).toBe(true);
    });
  });

  describe("normalizeRankingPoints", () => {
    it("should normalize ranking points", () => {
      const result = leagueService.normalizeRankingPoints("49217641126035460");
      expect(result).toBe("1018");
    });
  });

});