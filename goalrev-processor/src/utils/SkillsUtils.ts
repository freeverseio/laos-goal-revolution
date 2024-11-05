
export default class SkillsUtils  {

  static getBirthDay(encodedSkills: string): number {
    const encoded = BigInt(encodedSkills);
    return Number((encoded >> BigInt(100)) & BigInt(65535)); // 65535 = 2**16 - 1
  }

  static getAge(encodedSkills: string): number {
    const dayOfBirth = SkillsUtils.getBirthDay(encodedSkills);
    // get now in days
    const now = Math.floor(Date.now() / 1000);
    const nowInDays = Math.floor(now / (60 * 60 * 24));
    const ageYears = (nowInDays - dayOfBirth)*14/365;
    return Math.floor(ageYears);
  }


}