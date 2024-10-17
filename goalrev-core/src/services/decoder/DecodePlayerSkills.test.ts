import { PlayerSkill } from "../../types/rest/output/match";
import DecodePlayerSkills from "./DecodePlayerSkills";

describe('DecodePlayerSkills', () => {
  test('should correctly decode player skills', () => {
    const encodedSkills = "766247770433284718790816306265731207695699513069315031090";
    const expected: PlayerSkill = {
      defence: 50,
      speed: 50,
      pass: 50,
      shoot: 50,
      endurance: 50,
      encodedSkills,
    };
    const result = DecodePlayerSkills.decode(encodedSkills);
    expect(result).toEqual(expected);
  });

  test('should correctly decode player skills', () => {
    const encodedSkills = "13113566945151332165817391379934887555794724631714026444777635841";
    const expected: PlayerSkill = {
      defence: 49153,
      speed: 65523,
      pass: 65532,
      shoot: 65480,
      endurance: 65080,
      encodedSkills,
    };
    const result = DecodePlayerSkills.decode(encodedSkills);
    expect(result).toEqual(expected);
  });
});

