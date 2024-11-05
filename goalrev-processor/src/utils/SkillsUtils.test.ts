import SkillsUtils from "./SkillsUtils";

describe('SkillsUtils', () => {
  test('getAge', () => {
    expect(SkillsUtils.getAge('15297545962655887100167109293577078115981383288866903950008')).toBe(31);
  });

  test('getAge', () => {
    expect(SkillsUtils.getAge('15322065891309741322552164591833840476709375597496268489669')).toBe(30);
  });

  test('getAge', () => {
    expect(SkillsUtils.getBirthDay('13113566945151332165817391379934887555794724631714026444777635841')).toBe(65535);
  });
});
