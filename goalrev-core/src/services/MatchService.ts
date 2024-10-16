import { MatchEvent, MatchEventType, PlayerSkill, PlayInput, PlayOutput } from "../types";
import { ethers } from "ethers";
import PlayAndEvolveAbi from '../contracts/abi/PlayAndEvolve.json';
export class MatchService {

  private provider: ethers.JsonRpcProvider;
  private playAndEvolveContract: ethers.Contract;

  constructor() {
    // Initialize the provider with the RPC URL from environment variables
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL is not defined in the environment variables");
    }

    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // Initialize the contract with the provider and contract address
    if (!process.env.PLAY_AND_EVOLVE_CONTRACT_ADDRESS) {
      throw new Error("PLAY_AND_EVOLVE_CONTRACT_ADDRESS is not defined in the environment variables");
    }

    this.playAndEvolveContract = new ethers.Contract(
      process.env.PLAY_AND_EVOLVE_CONTRACT_ADDRESS,
      PlayAndEvolveAbi.abi,  
      this.provider
    );

  }

  async getPlayersPerTeamMax(): Promise<any> {
    const result = await this.playAndEvolveContract.PLAYERS_PER_TEAM_MAX();
    return result.toString();
  }
  
  // Logic for playing the first half
  async play1stHalf(body: PlayInput): Promise<PlayOutput> {
    const { skills,  tactics, teamIds } = body;

    const playersPerTeamMax = await this.playAndEvolveContract.PLAYERS_PER_TEAM_MAX();
    console.log(playersPerTeamMax);

    const updatedSkills: [PlayerSkill[], PlayerSkill[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => ({
        defence: Math.floor(Math.random() * 10),
        speed: Math.floor(Math.random() * 10),
        pass: Math.floor(Math.random() * 10),
        shoot: Math.floor(Math.random() * 10),
        endurance: Math.floor(Math.random() * 10),
        encodedSkills: skill
      }))
    ) as [PlayerSkill[], PlayerSkill[]];


    const matchEvents: MatchEvent[] = [
      {
        minute: 4,
        team_id: teamIds[0],
        type: MatchEventType.ATTACK,
        manage_to_shoot: false,
        is_goal: false,
        primary_player_id: teamIds[0]+"0001",
        secondary_player_id: teamIds[0]+"0002",
      },
      {
        minute: 10,
        team_id: teamIds[1],
        type: MatchEventType.ATTACK,
        manage_to_shoot: true,
        is_goal: true,
        primary_player_id: teamIds[1]+"0001",
        secondary_player_id: teamIds[1]+"0002",
      },

    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogs: [
        {
          numberOfGoals: 1,
          gamePoints: 0,
          teamSumSkills: 0,
          trainingPoints: 0,
          isHomeStadium: true,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
        {
          numberOfGoals: 1,
          gamePoints: 0,
          teamSumSkills: 0,
          trainingPoints: 0,
          isHomeStadium: false,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
      ],
      matchEvents,
      earnedTrainingPoints: 0,
      err,
    };
  }

  // Logic for playing the second half
  async play2ndHalf(body: PlayInput): Promise<PlayOutput> {
    // Validate the PlayInput object
    const { skills,  tactics, teamIds } = body;

    const updatedSkills: [PlayerSkill[], PlayerSkill[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => ({
        defence: Math.floor(Math.random() * 10),
        speed: Math.floor(Math.random() * 10),
        pass: Math.floor(Math.random() * 10),
        shoot: Math.floor(Math.random() * 10),
        endurance: Math.floor(Math.random() * 10),
        encodedSkills: skill
      }))
    ) as [PlayerSkill[], PlayerSkill[]];

    const matchEvents: MatchEvent[] = [
      {
        minute: 56,
        team_id: teamIds[0],
        type: MatchEventType.ATTACK,
        manage_to_shoot: false,
        is_goal: false,
        primary_player_id: teamIds[1]+"0001",
        secondary_player_id: teamIds[1]+"0002",
      },
      {
        minute: 50,
        team_id: teamIds[1],
        type: MatchEventType.ATTACK,
        manage_to_shoot: true,
        is_goal: true,
        primary_player_id: teamIds[1]+"0001",
        secondary_player_id: teamIds[1]+"0002",
      },

    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogs: [
        {
          numberOfGoals: 2,
          gamePoints: 0,
          teamSumSkills: 10,
          trainingPoints: 10,
          isHomeStadium: true,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
        {
          numberOfGoals: 2,
          gamePoints: 3,
          teamSumSkills: 25,
          trainingPoints: 25,
          isHomeStadium: false,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
      ],
      matchEvents,
      earnedTrainingPoints: 10,
      err,
    };
  }
}
