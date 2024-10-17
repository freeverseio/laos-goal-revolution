import { ethers } from "ethers";
import { LeagueService } from "./LeagueService";
import { LeagueLeaderboardInput, RankingPointsInput } from "../types";
import LeaguesAbi from '../contracts/abi/Leagues.json';

jest.mock("ethers");

describe("LeagueService", () => {
  let leagueService: LeagueService;
  let mockProvider: ethers.JsonRpcProvider;
  let mockContract: ethers.Contract;

  beforeEach(() => {
    // Mock environment variables
    process.env.RPC_URL = "http://localhost:8545";
    process.env.LEAGUES_CONTRACT_ADDRESS = "0xContractAddress";

    // Mock the ethers provider and contract
    mockProvider = new ethers.JsonRpcProvider(process.env.RPC_URL) as jest.Mocked<ethers.JsonRpcProvider>;
    mockContract = {
      computeLeagueLeaderBoard: jest.fn()
    } as unknown as jest.Mocked<ethers.Contract>;

    (ethers.JsonRpcProvider as jest.Mock).mockReturnValue(mockProvider);
    (ethers.Contract as jest.Mock).mockReturnValue(mockContract);

    // Initialize the LeagueService
    leagueService = new LeagueService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize provider and contract", () => {
      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith("http://localhost:8545");
      expect(ethers.Contract).toHaveBeenCalledWith(
        process.env.LEAGUES_CONTRACT_ADDRESS,
        LeaguesAbi.abi,
        mockProvider
      );
    });

    it("should throw an error if RPC_URL is not defined", () => {
      delete process.env.RPC_URL;
      expect(() => new LeagueService()).toThrow("RPC_URL is not defined in the environment variables");
    });

    it("should throw an error if LEAGUES_CONTRACT_ADDRESS is not defined", () => {
      delete process.env.LEAGUES_CONTRACT_ADDRESS;
      expect(() => new LeagueService()).toThrow("LEAGUES_CONTRACT_ADDRESS is not defined in the environment variables");
    });
  });

  describe("computeLeagueLeaderboardProcess", () => {
    it("should return ranking and points from the contract", async () => {
      // Mock contract response
      const mockResult = [
        [BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5), BigInt(6), BigInt(7), BigInt(8)],
        [BigInt("10000000000000000000000"), BigInt("20000000000000000000000"), BigInt("30000000000000000000000")]
      ];
      
      // Fix: Cast the contract method to 'unknown' and then 'jest.Mock' for mocking
      (mockContract.computeLeagueLeaderBoard as unknown as jest.Mock).mockResolvedValue(mockResult);

      const teamIdxInLeague = [BigInt(0), BigInt(1)];
      const results = [new Uint8Array([1, 2]), new Uint8Array([2, 3])];
      const matchDay = 1;

      const { ranking, points } = await leagueService.computeLeagueLeaderboardProcess(teamIdxInLeague, results, matchDay);

      expect(ranking).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(points).toEqual([1, 2, 3]); // After removing tiebreakers
      expect(mockContract.computeLeagueLeaderBoard).toHaveBeenCalledWith(
        [0, 1],
        [[1, 2], [2, 3]],
        1
      );
    });
  });

  describe("computeLeagueLeaderboard", () => {
    it("should return empty teams and error if matches are empty", async () => {
      const input: LeagueLeaderboardInput = {
        teams: [
          { teamId: 1, teamIdxInLeague: 0 },
          { teamId: 2, teamIdxInLeague: 1 }
        ],
        matches: [],
        matchDay: 1
      };

      const result = await leagueService.computeLeagueLeaderboard(input);

      expect(result).toEqual({ teams: [], err: 1 });
    });

    it("should return error if teams are not ordered correctly", async () => {
      const input: LeagueLeaderboardInput = {
        teams: [
          { teamId: 1, teamIdxInLeague: 1 }, // Incorrect order
          { teamId: 2, teamIdxInLeague: 0 }
        ],
        matches: [{ homeGoals: 2, visitorGoals: 1 }],
        matchDay: 1
      };

      const result = await leagueService.computeLeagueLeaderboard(input);

      expect(result).toEqual({ teams: [], err: 1 });
    });

    it("should return valid leaderboard output when input is valid", async () => {
      const input: LeagueLeaderboardInput = {
        teams: [
          { teamId: 1, teamIdxInLeague: 0 },
          { teamId: 2, teamIdxInLeague: 1 },
          { teamId: 3, teamIdxInLeague: 2 },
          { teamId: 4, teamIdxInLeague: 3 },
          { teamId: 5, teamIdxInLeague: 4 },
          { teamId: 6, teamIdxInLeague: 5 },
          { teamId: 7, teamIdxInLeague: 6 },
          { teamId: 8, teamIdxInLeague: 7 }
        ],
        matches: [
          { homeGoals: 2, visitorGoals: 1 }, 
          { homeGoals: 3, visitorGoals: 2 }, 
          { homeGoals: 4, visitorGoals: 3 }, 
          { homeGoals: 5, visitorGoals: 4 }, 
          { homeGoals: 6, visitorGoals: 5 }, 
          { homeGoals: 7, visitorGoals: 6 }, 
          { homeGoals: 8, visitorGoals: 7 }, 
          { homeGoals: 9, visitorGoals: 8 }
        ],
        matchDay: 0
      };

      // Mock process function
      const mockResult = {
        ranking: [0, 1, 2, 3, 4, 5, 6, 7],
        points: [10, 20, 30, 40, 50, 60, 70, 80]
      };
      jest.spyOn(leagueService, 'computeLeagueLeaderboardProcess').mockResolvedValue(mockResult);

      const result = await leagueService.computeLeagueLeaderboard(input);

      expect(result).toEqual({
        teams: [
          { teamId: 1, leaderboardPosition: 0, teamPoints: 10 },
          { teamId: 2, leaderboardPosition: 1, teamPoints: 20 },
          { teamId: 3, leaderboardPosition: 2, teamPoints: 30 },
          { teamId: 4, leaderboardPosition: 3, teamPoints: 40 },
          { teamId: 5, leaderboardPosition: 4, teamPoints: 50 },
          { teamId: 6, leaderboardPosition: 5, teamPoints: 60 },
          { teamId: 7, leaderboardPosition: 6, teamPoints: 70 },
          { teamId: 8, leaderboardPosition: 7, teamPoints: 80 }
        ],
        err: 0
      });
    });
  });

  describe("computeRankingPoints", () => {
    it("should return a valid rankingPoints value", async () => {
      // Fix: Provide correct input structure
      const input: RankingPointsInput = {
        leagueRanking: 1,
        prevPerfPoints: 10,
        teamId: '1',
        isBot: false,
        skills: []
      };

      const result = await leagueService.computeRankingPoints(input);

      expect(result.rankingPoints).toBeGreaterThanOrEqual(1);
      expect(result.rankingPoints).toBeLessThanOrEqual(100);
      expect(result.err).toBe(0);
    });
  });
});
