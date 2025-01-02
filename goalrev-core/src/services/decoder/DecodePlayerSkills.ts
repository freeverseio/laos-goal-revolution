import { PlayerSkill } from "../../types";
import { SK_DEF, SK_END, SK_PAS, SK_SHO, SK_SPE } from "../../utils/constants";

export default class DecodePlayerSkills {
  static getSkill(encodedSkills: string, skillIdx: number): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(skillIdx * 20)) & BigInt(1048575)); // 1048575 = 2**20 - 1
  }

  static decode(encodedSkills: string): PlayerSkill {
    return {
      playerId: DecodePlayerSkills.getPlayerIdFromSkills(encodedSkills).toString(),
      defence: DecodePlayerSkills.getSkill(encodedSkills, SK_DEF).toString(),
      speed: DecodePlayerSkills.getSkill(encodedSkills, SK_SPE).toString(),
      pass: DecodePlayerSkills.getSkill(encodedSkills, SK_PAS).toString(),
      shoot: DecodePlayerSkills.getSkill(encodedSkills, SK_SHO).toString(),
      endurance: DecodePlayerSkills.getSkill(encodedSkills, SK_END).toString(),
      encodedSkills: encodedSkills.toString(),
    };
  }

  static getBirthDay(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(100)) & BigInt(65535)); // 65535 = 2**16 - 1
  }

  static getPlayerIdFromSkills(encodedSkills: string): number {
    return DecodePlayerSkills.getIsSpecial(encodedSkills)
      ? Number(BigInt(encodedSkills))
      : DecodePlayerSkills.getInternalPlayerId(encodedSkills);
  }

  static getInternalPlayerId(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(129)) & BigInt(8796093022207)); // 8796093022207 = 2**43 - 1
  }

  static getPotential(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(116)) & BigInt(15)); // 15 = 2**4 - 1
  }

  static getForwardness(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(120)) & BigInt(7)); // 7 = 2**3 - 1
  }

  static getLeftishness(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(123)) & BigInt(7)); // 7 = 2**3 - 1
  }

  static getAggressiveness(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(126)) & BigInt(7)); // 7 = 2**3 - 1
  }

  static getAlignedEndOfFirstHalf(encodedSkills: string): boolean {
    const encoded = BigInt(encodedSkills);
    return ((encoded >> BigInt(172)) & BigInt(1)) === BigInt(1);
  }

  static getRedCardLastGame(encodedSkills: string): boolean {
    const encoded = BigInt(encodedSkills);
    return ((encoded >> BigInt(173)) & BigInt(1)) === BigInt(1);
  }

  static getGamesNonStopping(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(174)) & BigInt(7)); // 7 = 2**3 - 1
  }

  static getInjuryWeeksLeft(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(177)) & BigInt(7)); // 7 = 2**3 - 1
  }

  static getSubstitutedFirstHalf(encodedSkills: string): boolean {
    const encoded = BigInt(encodedSkills);
    return ((encoded >> BigInt(180)) & BigInt(1)) === BigInt(1);
  }

  static getSumOfSkills(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(181)) & BigInt(524287)); // 524287 = 2**19 - 1
  }

  static getIsSpecial(encodedSkills: string): boolean {
    const encoded = BigInt(encodedSkills);
    return ((encoded >> BigInt(204)) & BigInt(1)) === BigInt(1);
  }

  static getGeneration(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(205)) & BigInt(255)); // 255 = 2**8 - 1
  }

  static getOutOfGameFirstHalf(encodedSkills: string): boolean {
    const encoded = BigInt(encodedSkills);
    return ((encoded >> BigInt(213)) & BigInt(1)) === BigInt(1);
  }

  static getYellowCardFirstHalf(encodedSkills: string): boolean {
    const encoded = BigInt(encodedSkills);
    return ((encoded >> BigInt(214)) & BigInt(1)) === BigInt(1);
  }
}
