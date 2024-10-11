import { LeagueLeaderboardInput, LeagueLeaderboardTeamInput, LeagueLeaderboardOutput, LeagueLeaderboardTeamOutput, RankingPointsInput, RankingPointsOutput } from "../types";

export class LeagueService {

  static async computeLeagueLeaderboard(body: LeagueLeaderboardInput): Promise<LeagueLeaderboardOutput> {
    const { teams: teamsInput, matches, matchDay } = body;

    if (matches.length === 0) {
      return { teams: [], err: 1 };
    }
  
    // validate that the teams are ordered correctly
    for (let i = 0; i < teamsInput.length; i++) {
      if (teamsInput[i].teamIdxInLeague !== i) {
        return { teams: [], err: 1 };
      }
    }

    // validate that the teams are ordered correctly
    for (let i = 0; i < teamsInput.length; i++) {
      if (teamsInput[i].teamIdxInLeague !== i) {
        console.error("Teams are not ordered correctly");
        return { teams: [], err: 1 };
      }
    }

    let teamIdxInLeague: bigint[] = new Array(8).fill(0n);
    for (let i = 0; i < 8; i++) {
      teamIdxInLeague[i] = BigInt(i);
    }
    
    let results: Uint8Array[] = new Array(56).fill(0).map(() => new Uint8Array(2));
    for (let i = 0; i < matches.length; i++) {
      results[i][0] = matches[i].homeGoals;
      results[i][1] = matches[i].visitorGoals;
    }

    // TODO call Smart Contract
    
    // TODO remove mock results after call Smart Contract
    const teamsOutput: LeagueLeaderboardTeamOutput[] = [];
    for (let i = 0; i < 8; i++) {
      const leagueLeaderboardTeamOutput: LeagueLeaderboardTeamOutput = {
        teamId: teamsInput[i].teamId,
        leaderboardPosition: (i), //0..7
        teamPoints: (8-i),
      }
      teamsOutput.push(leagueLeaderboardTeamOutput);
    }

    const leagueLeaderboardOutput: LeagueLeaderboardOutput = { 
      teams: teamsOutput,      
      err: 0
    }

    return leagueLeaderboardOutput;
  }  

  static async computeRankingPoints(body: RankingPointsInput): Promise<RankingPointsOutput> {
    //randomly generate new ranking points from 1 to 100
    const newRankingPoints = Math.floor(Math.random() * 100) + 1;

    return { rankingPoints: newRankingPoints, err: 0 };
  }
}