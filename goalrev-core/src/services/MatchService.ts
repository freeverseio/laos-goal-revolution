import { ethers } from "ethers";
import PlayAndEvolveAbi from '../contracts/abi/PlayAndEvolve.json';
import utilsAbi from "../contracts/abi/Utils.json";
import { MatchEvent, PlayInput, PlayOutput } from "../types";
import DecodeMatchEvents from "./decoder/DecodeMatchEvents";
import { EncodeTrainingPoints } from "./encoder/EncodeTrainingPoints";
import { MatchMapper } from "./mapper/MatchMapper";
export class MatchService {

  private provider: ethers.JsonRpcProvider;
  private playAndEvolveContract: ethers.Contract;
  private utilsContract: ethers.Contract;

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
    if (!process.env.UTILS_CONTRACT_ADDRESS) {
      throw new Error("UTILS_CONTRACT_ADDRESS is not defined in the environment variables");
    }

    this.playAndEvolveContract = new ethers.Contract(
      process.env.PLAY_AND_EVOLVE_CONTRACT_ADDRESS,
      PlayAndEvolveAbi.abi,
      this.provider
    );
    this.utilsContract = new ethers.Contract(
      process.env.UTILS_CONTRACT_ADDRESS!,
      utilsAbi.abi,
      this.provider
    );

  }

  async getPlayersPerTeamMax(): Promise<any> {
    const result = await this.playAndEvolveContract.PLAYERS_PER_TEAM_MAX();
    return result.toString();
  }

  // Logic for playing the first half
  async play1stHalf(body: PlayInput): Promise<PlayOutput> {
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

    const parsedResult = MatchMapper.mapPlayHalfAndEvolveResult(result);
    
    if (parsedResult.err != "0") {
      console.error('body', JSON.stringify(body));
      console.error('Error playing 1st half: ', parsedResult.err);
      throw new Error(parsedResult.err);
    }
    const updatedSkills = MatchMapper.mapEncodedSkillsToPlayerSkills(parsedResult.finalSkills);
    const logsHome = await this.utilsContract.fullDecodeMatchLog(parsedResult.matchLogsAndEvents[0], false);
    const logsAway = await this.utilsContract.fullDecodeMatchLog(parsedResult.matchLogsAndEvents[1], false);
    const decodedMatchLogs = MatchMapper.mapMatchLogsToMatchLogs(logsHome, logsAway, false, parsedResult.matchLogsAndEvents[0], parsedResult.matchLogsAndEvents[1]);

    const matchEventsDecoder = new DecodeMatchEvents(parsedResult.matchLogsAndEvents, {
      homeTeamId: teamIds[0].toString(),
      awayTeamId: teamIds[1].toString(),
      tacticsHome: tactics[0],
      tacticsAway: tactics[1],
    }, decodedMatchLogs);

    const matchEvents: MatchEvent[] = matchEventsDecoder.decode(false);
    
    return {
      updatedSkills,
      matchLogs: decodedMatchLogs,
      matchEvents,
      encodedTactics: [encodedTactics[0], encodedTactics[1]],
      err: parsedResult.err.toString(),
    };
  }

  // Logic for playing the second half
  async play2ndHalf(body: PlayInput): Promise<PlayOutput> {
    const { verseSeed, matchStartTime, skills, tactics, teamIds, matchBools } = body;
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
    encodedTactics = encodedTactics.map(tactic => tactic.toString());

    const result = await this.playAndEvolveContract.play2ndHalfAndEvolve(
      `0x${verseSeed}`,
      matchStartTime,
      skills,
      teamIds,
      encodedTactics,
      matchLogs,
      matchBools,
    );


    const parsedResult = MatchMapper.mapPlayHalfAndEvolveResult(result);
    if (parsedResult.err != "0") {
      console.log('body', JSON.stringify(body));
      console.error('Error playing 2st half', parsedResult.err);
      throw new Error(parsedResult.err);
    }
    const updatedSkills = MatchMapper.mapEncodedSkillsToPlayerSkills(parsedResult.finalSkills);

    const logsHome = await this.utilsContract.fullDecodeMatchLog(parsedResult.matchLogsAndEvents[0], true);
    const logsAway = await this.utilsContract.fullDecodeMatchLog(parsedResult.matchLogsAndEvents[1], true);
    const decodedMatchLogs = MatchMapper.mapMatchLogsToMatchLogs(logsHome, logsAway, true, parsedResult.matchLogsAndEvents[0], parsedResult.matchLogsAndEvents[1]);

    const matchEventsDecoder = new DecodeMatchEvents(parsedResult.matchLogsAndEvents, {
      homeTeamId: teamIds[0].toString(),
      awayTeamId: teamIds[1].toString(),
      tacticsHome: tactics[0],
      tacticsAway: tactics[1],
    }, decodedMatchLogs);

    const matchEvents: MatchEvent[] = matchEventsDecoder.decode(true);
  
    return {
      updatedSkills,
      matchLogs: decodedMatchLogs,
      matchEvents,
      encodedTactics: [encodedTactics[0], encodedTactics[1]],
      err: parsedResult.err.toString(),
    };
  }

}
