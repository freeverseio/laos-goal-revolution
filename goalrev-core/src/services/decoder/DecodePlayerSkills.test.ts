import { PlayerSkill } from "../../types";
import DecodePlayerSkills from "./DecodePlayerSkills";

describe('DecodePlayerSkills', () => {
  test('should correctly decode player skills', () => {
    const encodedSkills = "766247770433284718790816306265731207695699513069315031090";
    const expected: PlayerSkill = {
      playerId: "500010",
      defence: "50",
      speed: "50",
      pass: "50",
      shoot: "50",
      endurance: "50",
      encodedSkills,
    };
    const result = DecodePlayerSkills.decode(encodedSkills);
    expect(result).toEqual(expected);
  });

  test('should correctly decode player skills', () => {
    const encodedSkills = "13113566945151332165817391379934887555794724631714026444777635841";
    const expected: PlayerSkill = {
      playerId: "8796093022207",
      defence: "49153",
      speed: "65523",
      pass: "65532",
      shoot: "65480",
      endurance: "65080",
      encodedSkills,
    };
    const result = DecodePlayerSkills.decode(encodedSkills);
    expect(result).toEqual(expected);
    const playerIdFromSkills = DecodePlayerSkills.getPlayerIdFromSkills(encodedSkills);
    expect(playerIdFromSkills).toEqual(8796093022207);
  });

  test('should correctly get player id from skills', () => {
    const encodedSkills = "15312697315054057265328975129120144428100318147722999760054";
    const playerId = DecodePlayerSkills.getPlayerIdFromSkills(encodedSkills);
    expect(playerId).toEqual(2748779069453);
  });
});

