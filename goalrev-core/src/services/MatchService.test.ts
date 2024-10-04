import { MatchService } from "../../src/services/MatchService";
import { PlayInput } from "../../src/types";
import { validate } from "class-validator";

// mock playInput

describe("MatchService", () => {
  const validPlayInput: PlayInput = {
    verseSeed: "0xabc",
    matchStartTime: 1234567890,
    skills: [
      Array(25).fill("80"), // Team 1 skills (25 elements)
      Array(25).fill("70"), // Team 2 skills (25 elements)
    ],
    teamIds: [1, 2],
    tactics: [
      {
        lineup: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        substitutions: [
          { shirt: 1, target: 2, minute: 89 },
          { shirt: 1, target: 2, minute: 89 },
          { shirt: 1, target: 2, minute: 89 },
        ],
        extraAttack: Array(10).fill(false),
      },
      {
        lineup: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        substitutions: [
          { shirt: 1, target: 2, minute: 89 },
          { shirt: 1, target: 2, minute: 89 },
          { shirt: 1, target: 2, minute: 89 },
        ],
        extraAttack: Array(10).fill(false),
      },
    ],
    matchEvents: [],
    matchBools: [false, true, false, true, false],
    trainings: [
      {
        specialPlayerShirt: 1,
        goalkeepers: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        defenders: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        midfielders: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        attackers: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        specialPlayer: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
      },
      {
        specialPlayerShirt: 1,
        goalkeepers: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        defenders: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        midfielders: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        attackers: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
        specialPlayer: { defence: 10, speed: 10, pass: 10, shoot: 10, endurance: 10 },
      },
    ],
  };

  it("should validate and update skills and generate logs for the first half", async () => {
    // Validate input first
    const errors = await validate(validPlayInput);
    expect(errors.length).toBe(0); // Expect no validation errors

    const result = await MatchService.play1stHalf(validPlayInput);

    // Check if skills have been updated correctly
    expect(result.updatedSkills.length).toBe(2); // Two teams
    expect(result.updatedSkills[0].length).toBe(25); // 25 players in team 1
    expect(result.updatedSkills[1].length).toBe(25); // 25 players in team 2
    expect(result.updatedSkills[0][0].encodedSkills).toBe("80"); // Check encoded skills
    expect(result.updatedSkills[1][0].encodedSkills).toBe("70");
    expect(result.updatedSkills[0][0].defence).toBeGreaterThanOrEqual(0); // Randomized defence attribute

    // Check if matchLogs have been updated with logs
    expect(result.matchLogs.length).toBe(2); // 2 match logs (1 per team)
    expect(result.matchEvents.length).toBe(2); // 2 match events

    // Check if the error code is 0
    expect(result.err).toBe(0);
  });

  it("should validate and update skills and generate logs for the second half", async () => {
    // Validate input first
    const errors = await validate(validPlayInput);
    expect(errors.length).toBe(0); // Expect no validation errors

    const result = await MatchService.play2ndHalf(validPlayInput);

    // Check if skills have been updated correctly
    expect(result.updatedSkills.length).toBe(2); // Two teams
    expect(result.updatedSkills[0].length).toBe(25); // 25 players in team 1
    expect(result.updatedSkills[1].length).toBe(25); // 25 players in team 2

    // Check if matchLogs have been updated with logs
    expect(result.matchLogs.length).toBe(2); // 2 match logs (1 per team)
    expect(result.matchEvents.length).toBe(2); // 2 match events

    // Check if the error code is 0
    expect(result.err).toBe(0);
  });
});
