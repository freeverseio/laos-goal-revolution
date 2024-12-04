import SkillsUtils from "./SkillsUtils";

describe('SkillsUtils', () => {

  test('getBirthDay', () => {
    expect(SkillsUtils.getBirthDay('13113566945151332165817391379934887555794724631714026444777635841')).toBe(65535);
  });
});
