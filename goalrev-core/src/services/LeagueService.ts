import { ethers } from "ethers";
import LeaguesAbi from '../contracts/abi/Leagues.json';
import { LeagueLeaderboardInput, LeagueLeaderboardTeamInput, LeagueLeaderboardOutput, LeagueLeaderboardTeamOutput, RankingPointsInput, RankingPointsOutput, CreateTeamOutput, CreateTeamInput } from "../types";
import Big from 'big.js';

export class LeagueService {

  private provider: ethers.JsonRpcProvider;
  private leaguesContract: ethers.Contract;

  constructor() {
    // Initialize the provider with the RPC URL from environment variables
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL is not defined in the environment variables");
    }

    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // Initialize the contract with the provider and contract address
    if (!process.env.LEAGUES_CONTRACT_ADDRESS) {
      throw new Error("LEAGUES_CONTRACT_ADDRESS is not defined in the environment variables");
    }

    this.leaguesContract = new ethers.Contract(
      process.env.LEAGUES_CONTRACT_ADDRESS,
      LeaguesAbi.abi,  
      this.provider
    );
  }

  async computeLeagueLeaderboardProcess(teamIdxInLeague: bigint[], results: Uint8Array[], matchDay: number): Promise<{ranking: number[], points: number[]}> {
    const teamIds: number[] = Array.from(teamIdxInLeague).map((value) => Number(value));
    const resultsArray: number[][] = Array.from(results).map((value) => Array.from(value).map((byte) => Number(byte)));  
    const result = await this.leaguesContract.computeLeagueLeaderBoard(teamIds, resultsArray, matchDay);
    const ranking = result[0].map((value: bigint) => Number(value));
    const points = result[1].map((value: bigint) => {  
      // remove tiebreakers numbers    
      const dividedValue = new Big(value.toString()).div(new Big("10000000000000000000000")).toFixed(0);      
      return Number(dividedValue);
    });
    return {
      ranking,
      points
    };
  }

  async computeLeagueLeaderboard(body: LeagueLeaderboardInput): Promise<LeagueLeaderboardOutput> {
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

    // call Smart Contract
    const {ranking, points} = await this.computeLeagueLeaderboardProcess(teamIdxInLeague, results, matchDay);    
    const teamsOutput: LeagueLeaderboardTeamOutput[] = [];
    for (let i = 0; i < 8; i++) {
      const leagueLeaderboardTeamOutput: LeagueLeaderboardTeamOutput = {
        teamId: teamsInput[i].teamId,
        leaderboardPosition: ranking[i], //0..7
        teamPoints: points[i],
      }
      teamsOutput.push(leagueLeaderboardTeamOutput);
    }
    const leagueLeaderboardOutput: LeagueLeaderboardOutput = { 
      teams: teamsOutput,      
      err: 0
    }

    return leagueLeaderboardOutput;
  }  

  async computeRankingPoints(body: RankingPointsInput): Promise<RankingPointsOutput> {
    //randomly generate new ranking points from 1 to 100
    const newRankingPoints = Math.floor(Math.random() * 100) + 1;

    return { rankingPoints: newRankingPoints, err: 0 };
  }

  // TODO call SMART CONTRACT
  async createTeam(body: CreateTeamInput): Promise<CreateTeamOutput> {
    console.log("createTeam.call SC: ", body);
    return { team: "team data", players: ["player1 data", "player2 data"]};
  }

}