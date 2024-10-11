import { LeagueService } from "./LeagueService";
import { TeamRepository } from "../db/repository/TeamRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { EntityManager } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { Country } from "../db/entity/Country";
import { Team } from "../db/entity/Team";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { LeagueGroup } from "../types/leaguegroup";
import { CalendarService } from "./CalendarService";


jest.mock("../db/AppDataSource");

describe("LeagueService", () => {
  let leagueService: LeagueService;
  let teamRepository: jest.Mocked<TeamRepository>;
  let matchRepository: jest.Mocked<MatchRepository>;
  let verseRepository: jest.Mocked<VerseRepository>;
  let entityManager: jest.Mocked<EntityManager>;
  let matchEventRepository: jest.Mocked<MatchEventRepository>;
  let calendarService: jest.Mocked<CalendarService>;

  beforeEach(() => {
    teamRepository = {
      findTeamsByCountryAndTimezone: jest.fn(),
      updateLeagueIdx: jest.fn(),
    } as any;
    
    matchRepository = {
      countPendingMatchesByCountry: jest.fn(),
    } as any;
    
    verseRepository = {
      countVersesByTimezone: jest.fn(),
    } as any;

    calendarService = {
      generateCalendarForTimezone: jest.fn(),
    } as any;

    entityManager = {
      find: jest.fn(),
      findOne: jest.fn(),
    } as any;

    // Mocking the manager for the AppDataSource
    (AppDataSource.manager as any) = entityManager;

    leagueService = new LeagueService(teamRepository, matchRepository, verseRepository, matchEventRepository, calendarService);
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

  

  describe("getActualRoundOfLeague", () => {
    it("should calculate the current round of a league based on verses", async () => {
      verseRepository.countVersesByTimezone.mockResolvedValueOnce(20);

      const result = await leagueService.getActualRoundOfLeague(1);
      expect(verseRepository.countVersesByTimezone).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    it("should calculate the current round of a league based on verses", async () => {
      verseRepository.countVersesByTimezone.mockResolvedValueOnce(1);

      const result = await leagueService.getActualRoundOfLeague(1);
      expect(verseRepository.countVersesByTimezone).toHaveBeenCalledWith(1);
      expect(result).toBe(0);
    });

    it("should calculate the current round of a league based on verses", async () => {
      verseRepository.countVersesByTimezone.mockResolvedValueOnce(88);

      const result = await leagueService.getActualRoundOfLeague(1);
      expect(verseRepository.countVersesByTimezone).toHaveBeenCalledWith(1);
      expect(result).toBe(6);
    });

    it("should calculate the current round of a league based on verses", async () => {
      verseRepository.countVersesByTimezone.mockResolvedValueOnce(28);

      const result = await leagueService.getActualRoundOfLeague(1);
      expect(verseRepository.countVersesByTimezone).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    it("should calculate the current round of a league based on verses", async () => {
      verseRepository.countVersesByTimezone.mockResolvedValueOnce(14);

      const result = await leagueService.getActualRoundOfLeague(1);
      expect(verseRepository.countVersesByTimezone).toHaveBeenCalledWith(1);
      expect(result).toBe(0);
    });
    it("should calculate the current round of a league based on verses", async () => {
      verseRepository.countVersesByTimezone.mockResolvedValueOnce(0);

      const result = await leagueService.getActualRoundOfLeague(1);
      expect(verseRepository.countVersesByTimezone).toHaveBeenCalledWith(1);
      expect(result).toBe(0);
    });
  });


  
});
