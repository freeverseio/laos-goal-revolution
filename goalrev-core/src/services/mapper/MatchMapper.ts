import { MatchLog, Play1stHalfAndEvolveResult, PlayerSkill, PlayOutput } from "../../types";
import { DecodeMatchLog } from "../decoder/DecodeMatchLog";
import DecodePlayerSkills from "../decoder/DecodePlayerSkills";

export class MatchMapper {
  static mapPlayHalfAndEvolveResult(result: any): Play1stHalfAndEvolveResult {
    
    const parsedResult: Play1stHalfAndEvolveResult = {
      finalSkills: result[0].map((skillsArray: any) => skillsArray.map((skill: any) => skill)),
      matchLogsAndEvents: result[1].map((log: any) => log.toString()),
      err: result[2],
    };
    return parsedResult;
  }


  static mapEncodedSkillsToPlayerSkills(encodedSkills: string[][]): [PlayerSkill[], PlayerSkill[]] {
    try {
      return [encodedSkills[0].map((skill: any) => ({
        playerId: DecodePlayerSkills.getPlayerIdFromSkills(skill).toString(),
        defence: DecodePlayerSkills.getSkill(skill, 0).toString(),
        speed: DecodePlayerSkills.getSkill(skill, 1).toString(),
        pass: DecodePlayerSkills.getSkill(skill, 2).toString(),
        shoot: DecodePlayerSkills.getSkill(skill, 3).toString(),
        endurance: DecodePlayerSkills.getSkill(skill, 4).toString(),
        encodedSkills: `${skill}`
      })), encodedSkills[1].map((skill: any) => ({
        playerId: DecodePlayerSkills.getPlayerIdFromSkills(skill).toString(),
        defence: DecodePlayerSkills.getSkill(skill, 0).toString(),
        speed: DecodePlayerSkills.getSkill(skill, 1).toString(),
        pass: DecodePlayerSkills.getSkill(skill, 2).toString(),
        shoot: DecodePlayerSkills.getSkill(skill, 3).toString(),
        endurance: DecodePlayerSkills.getSkill(skill, 4).toString(),
        encodedSkills: `${skill}`
      }))];
    } catch (error) {
      console.error("Error mapping encoded skills to player skills:", error);
      return [[], []]; // Return empty arrays in case of error
    }
  }

  static mapMatchLogsAndEventsToMatchLogs(matchLogsAndEvents: any): [MatchLog, MatchLog] {
    return [DecodeMatchLog.decode(matchLogsAndEvents[0]), DecodeMatchLog.decode(matchLogsAndEvents[1])];
  }

  static mapMatchLogsToMatchLogs(decodedMatchLogsHome: any, decodedMatchLogsAway: any, is2ndHalf: boolean, encodedMatchLogsHome: any, encodedMatchLogsAway: any): [MatchLog, MatchLog] {
    return [this.mapLogToMatchLog(decodedMatchLogsHome, is2ndHalf, encodedMatchLogsHome), this.mapLogToMatchLog(decodedMatchLogsAway, is2ndHalf, encodedMatchLogsAway)];
  }

  static mapLogToMatchLog(decodedMatchLogArray: any, is2ndHalf: boolean, encodedMatchLog: any): MatchLog {

    const halfTimeSubstitutions1 = is2ndHalf ? (Number(decodedMatchLogArray[12])>0 ?1 : 0) : 0;
    const halfTimeSubstitutions2 = is2ndHalf ? (Number(decodedMatchLogArray[13])>0 ?1 : 0) : 0;
    const halfTimeSubstitutions3 = is2ndHalf ? (Number(decodedMatchLogArray[14])>0 ?1 : 0) : 0;
    const changesAtHalftime = (halfTimeSubstitutions1 + halfTimeSubstitutions2 + halfTimeSubstitutions3).toString();
    return {
      teamSumSkills: decodedMatchLogArray[0].toString(),
      winner: Number(decodedMatchLogArray[1]),
      numberOfGoals: Number(decodedMatchLogArray[2]),
      trainingPoints: decodedMatchLogArray[3].toString(),
      outOfGamePlayers: [decodedMatchLogArray[4].toString()],
      outOfGameTypes: [decodedMatchLogArray[5]?.toString()],
      outOfGameRounds: [decodedMatchLogArray[6].toString()],
      yellowCards: [decodedMatchLogArray[7].toString(), decodedMatchLogArray[8].toString()],
      inGameSubsHappened: [decodedMatchLogArray[9].toString(), decodedMatchLogArray[10].toString(), decodedMatchLogArray[11].toString()],
      halfTimeSubstitutions: is2ndHalf ? [decodedMatchLogArray[12].toString(), decodedMatchLogArray[13].toString(), decodedMatchLogArray[14].toString()] : [],
      changesAtHalftime,
      isHomeStadium: true,
      isCancelled: false,
      penalties: [false, false],
      nDefs: ["0", "0"],
      nTotHalf: ["0", "0"],
      encodedMatchLog: encodedMatchLog.toString(),
    }
  }

}
