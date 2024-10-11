import { LeagueService } from './LeagueService';
import { LeagueLeaderboardInput, LeagueLeaderboardTeamInput, LeagueLeaderboardOutput, LeagueLeaderboardTeamOutput } from '../types';

describe('LeagueService', () => {
  describe('computeLeagueLeaderBoard', () => {
    it('returns an error when matches are empty', async () => {
      const input: LeagueLeaderboardInput = {
        teams: [],
        matches: [],
        matchDay: 1,
      };
      const result = await LeagueService.computeLeagueLeaderboard(input);
      expect(result).toEqual({ teams: [], err: 1 });
    });

    it('returns an error when teams are not ordered correctly', async () => {
      const input: LeagueLeaderboardInput = {
        teams: [
          { teamId: 1, teamIdxInLeague: 1 },
          { teamId: 2, teamIdxInLeague: 0 },
        ],
        matches: [],
        matchDay: 1,
      };
      const result = await LeagueService.computeLeagueLeaderboard(input);
      expect(result).toEqual({ teams: [], err: 1 });
    });

    it('returns a valid leaderboard when teams are ordered correctly and matches are present', async () => {
      const input: LeagueLeaderboardInput = {
        teams: [
          { teamId: 1, teamIdxInLeague: 0 },
          { teamId: 2, teamIdxInLeague: 1 },
          { teamId: 3, teamIdxInLeague: 2 },
          { teamId: 4, teamIdxInLeague: 3 },
          { teamId: 5, teamIdxInLeague: 4 },
          { teamId: 6, teamIdxInLeague: 5 },
          { teamId: 7, teamIdxInLeague: 6 },
          { teamId: 8, teamIdxInLeague: 7 },
        ],
        matches: [
          { homeGoals: 1, visitorGoals: 0 },
          { homeGoals: 0, visitorGoals: 1 },
          { homeGoals: 1, visitorGoals: 1 },
        ],
        matchDay: 1,
      };
      const result = await LeagueService.computeLeagueLeaderboard(input);
      expect(result).toEqual({
        teams: [
          { teamId: 1, leaderboardPosition: 0, teamPoints: 8 },
          { teamId: 2, leaderboardPosition: 1, teamPoints: 7 },
          { teamId: 3, leaderboardPosition: 2, teamPoints: 6 },
          { teamId: 4, leaderboardPosition: 3, teamPoints: 5 },
          { teamId: 5, leaderboardPosition: 4, teamPoints: 4 },
          { teamId: 6, leaderboardPosition: 5, teamPoints: 3 },
          { teamId: 7, leaderboardPosition: 6, teamPoints: 2 },
          { teamId: 8, leaderboardPosition: 7, teamPoints: 1 },
        ],
        err: 0,
      });
    });
  });
});