import { PlayerSkill } from "../../types";

export default class DecodePlayerSkills {
  static getSkill(encodedSkills: string, skillIdx: number): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(skillIdx * 20)) & BigInt(1048575)); // 1048575 = 2**20 - 1
  }

  static decode(encodedSkills: string): PlayerSkill {
    return {
      defence: DecodePlayerSkills.getSkill(encodedSkills, 0),
      speed: DecodePlayerSkills.getSkill(encodedSkills, 1),
      pass: DecodePlayerSkills.getSkill(encodedSkills, 2),
      shoot: DecodePlayerSkills.getSkill(encodedSkills, 3),
      endurance: DecodePlayerSkills.getSkill(encodedSkills, 4),
      encodedSkills: encodedSkills.toString(),
    };
  }
}