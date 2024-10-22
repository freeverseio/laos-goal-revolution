import { ethers } from "ethers";
import PlayAndEvolveAbi from '../contracts/abi/PlayAndEvolve.json';
import { MatchEvent, MatchEventType, PlayerSkill, PlayInput, PlayOutput } from "../types";
import { EncodeTrainingPoints } from "./encoder/EncodeTrainingPoints";
import { MatchMapper } from "./mapper/MatchMapper";
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
  async play1stHalf__(body: PlayInput): Promise<PlayOutput> {
    const { verseSeed, matchStartTime, skills, tactics, teamIds, matchBools, trainings } = body;
    const matchLogs = body.getMatchLogs();

    let encodedTactics = await Promise.all(tactics.map(tactic => {
      const substitutions = tactic.getSubstitutions();
      const subsRounds = tactic.getSubstitutionRounds();
      const lineup = tactic.lineup;
      const extraAttack = tactic.extraAttack;
      const tacticsId = tactic.tacticsId;

      return this.playAndEvolveContract.encodeTactics(
        substitutions,
        subsRounds,
        lineup,
        extraAttack,
        tacticsId
      );
    }));
    const encodedTrainings = trainings.map(training => EncodeTrainingPoints.encode(training));
    encodedTactics = encodedTactics.map(tactic => tactic.toString());
    const result = await this.playAndEvolveContract.play1stHalfAndEvolve(
      `0x${verseSeed}`,
      matchStartTime,
      skills,
      teamIds,
      encodedTactics,
      matchLogs,
      matchBools,
      encodedTrainings
    );

    const parsedResult = MatchMapper.mapPlay1stHalfAndEvolveResult(result);
    const updatedSkills = MatchMapper.mapEncodedSkillsToPlayerSkills(parsedResult.finalSkills);
    const decodedMatchLogs = MatchMapper.mapMatchLogsAndEventsToMatchLogs(parsedResult.matchLogsAndEvents);
        
    const matchEvents: MatchEvent[] = [
      {
        minute: 4,
        team_id: teamIds[0],
        type: MatchEventType.ATTACK,
        manage_to_shoot: false,
        is_goal: false,
        primary_player_id:  "2748779069626",
        secondary_player_id: "2748779069627",
      },
      {
        minute: 10,
        team_id: teamIds[1],
        type: MatchEventType.ATTACK,
        manage_to_shoot: true,
        is_goal: true,
        primary_player_id:  "2748779069626",
        secondary_player_id: "2748779069627",
      },

    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogs: decodedMatchLogs,
      matchEvents,
      earnedTrainingPoints: 0,
      err,
    };
  }

  // Logic for playing the second half
  async play2ndHalf(body: PlayInput): Promise<PlayOutput> {
    // Validate the PlayInput object
    const { skills, tactics, teamIds } = body;

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
        primary_player_id:  "2748779069626",
        secondary_player_id: "2748779069627",
      },
      {
        minute: 50,
        team_id: teamIds[1],
        type: MatchEventType.ATTACK,
        manage_to_shoot: true,
        is_goal: true,
        primary_player_id:  "2748779069626",
        secondary_player_id: "2748779069627",
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
          changesAtHalftime: 1,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
        {
          numberOfGoals: 2,
          gamePoints: 3,
          teamSumSkills: 25,
          trainingPoints: 25,
          isHomeStadium: false,
          changesAtHalftime: 1,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
      ],
      matchEvents,
      earnedTrainingPoints: 10,
      err,
    };
  }

  async play1stHalf(body: PlayInput): Promise<PlayOutput> {
    // Validate the PlayInput object
    const { skills, tactics, teamIds } = body;

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
        primary_player_id:  "2748779069626",
        secondary_player_id: "2748779069627",
      },
      {
        minute: 50,
        team_id: teamIds[1],
        type: MatchEventType.ATTACK,
        manage_to_shoot: true,
        is_goal: true,
        primary_player_id:  "2748779069626",
        secondary_player_id: "2748779069627",
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
          changesAtHalftime: 1,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
        {
          numberOfGoals: 2,
          gamePoints: 3,
          teamSumSkills: 25,
          trainingPoints: 25,
          isHomeStadium: false,
          changesAtHalftime: 1,
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
