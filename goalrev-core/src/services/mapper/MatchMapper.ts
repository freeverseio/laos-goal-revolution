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

  // static mapContractFirstHalfResultToPlayOutput(result: any): PlayOutput {
  //   const play1stHalfAndEvolveResult = MatchMapper.mapPlay1stHalfAndEvolveResult(result);
  //   const playerSkills = MatchMapper.mapEncodedSkillsToPlayerSkills(play1stHalfAndEvolveResult.finalSkills);
  //   const matchLogsAndEvents = play1stHalfAndEvolveResult.matchLogsAndEvents;
  //   const err = play1stHalfAndEvolveResult.err;

  //   return {
  //     updatedSkills: [playerSkills[0], playerSkills[1]],
  //     matchLogs: [matchLogsAndEvents[0], matchLogsAndEvents[1]],
  //     err: err
  //   }
    
  // }
}
