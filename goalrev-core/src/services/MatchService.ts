import { ethers } from "ethers";
import PlayAndEvolveAbi from '../contracts/abi/PlayAndEvolve.json';
import { MatchEvent, PlayInput, PlayOutput } from "../types";
import DecodeMatchEvents from "./decoder/DecodeMatchEvents";
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
  async play1stHalf(body: PlayInput): Promise<PlayOutput> {
   // console.log('play1stHalf', body);
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

    // console.log('result', result);
    const parsedResult = MatchMapper.mapPlay1stHalfAndEvolveResult(result);
    if (parsedResult.err != "0") {
      //console.error('Error playing 1st half', result);
      throw new Error(parsedResult.err);
    }
    const updatedSkills = MatchMapper.mapEncodedSkillsToPlayerSkills(parsedResult.finalSkills);
    const decodedMatchLogs = MatchMapper.mapMatchLogsAndEventsToMatchLogs(parsedResult.matchLogsAndEvents);

    const matchEventsDecoder = new DecodeMatchEvents(parsedResult.matchLogsAndEvents, {
      homeTeamId: teamIds[0].toString(),
      awayTeamId: teamIds[1].toString(),
      tacticsHome: tactics[0],
      tacticsAway: tactics[1],
    }, decodedMatchLogs);
    const matchEvents: MatchEvent[] = matchEventsDecoder.decode();
    console.log('FIRST HALF **********************************************');
    return {
      updatedSkills,
      matchLogs: decodedMatchLogs,
      matchEvents,
      err: parsedResult.err.toString(),
    };
  }

  // Logic for playing the second half
  async play2ndHalf(body: PlayInput): Promise<PlayOutput> {
    // console.log('play2ndHalf: ', JSON.stringify(body));
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


    const parsedResult = MatchMapper.mapPlay1stHalfAndEvolveResult(result);
    if (parsedResult.err != "0") {
      console.error('Error playing 2st half', result);
      throw new Error(parsedResult.err);
    }
    const updatedSkills = MatchMapper.mapEncodedSkillsToPlayerSkills(parsedResult.finalSkills);
    const decodedMatchLogs = MatchMapper.mapMatchLogsAndEventsToMatchLogs(parsedResult.matchLogsAndEvents);

    const matchEventsDecoder = new DecodeMatchEvents(parsedResult.matchLogsAndEvents, {
      homeTeamId: teamIds[0].toString(),
      awayTeamId: teamIds[1].toString(),
      tacticsHome: tactics[0],
      tacticsAway: tactics[1],
    }, decodedMatchLogs);
    const matchEvents: MatchEvent[] = matchEventsDecoder.decode();
  
    console.log('SECOND HALF **********************************************');
    return {
      updatedSkills,
      matchLogs: decodedMatchLogs,
      matchEvents,
      err: parsedResult.err.toString(),
    };
  }

}
