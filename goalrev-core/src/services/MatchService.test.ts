import { MatchService } from "../../src/services/MatchService";
import { PlayInput } from "../../src/types";
import { validate } from "class-validator";

describe("MatchService", () => {
  const validPlayInput: PlayInput = {
    verseSeed: "0xabc",
    matchStartTime: 1234567890,
    skills: [
      Array(25).fill("80"), // Team 1 skills (25 elements)
      Array(25).fill("70"), // Team 2 skills (25 elements)
    ],
    teamIds: [1, 2],
    tactics: [2, 2],
    matchLogs: ["100", "200"],
    matchBools: [false, true, false, true, false],
    assignedTPs: ["150", "180"],
  };



  it("should validate and update skills and generate logs for the first half", async () => {
    // Validate input first
    const errors = await validate(validPlayInput);
    expect(errors.length).toBe(0); // Expect no validation errors

    const result = await MatchService.play1stHalf(validPlayInput);

    // Check if skills have been updated correctly
    expect(result.updatedSkills).toEqual([
      Array(25).fill("81"), // Team 1 skills incremented by 1
      Array(25).fill("71"), // Team 2 skills incremented by 1
    ]);

    // Check if matchLogsAndEvents has been updated with logs
    expect(result.matchLogsAndEvents.length).toBe(5 * 4 + 2); // 2 initial logs + 5 rounds of events

    // Check if the error code is 0
    expect(result.err).toBe(0);
  });

  it("should validate and update skills and generate logs for the second half", async () => {
    // Validate input first
    const errors = await validate(validPlayInput);
    expect(errors.length).toBe(0); // Expect no validation errors

    const result = await MatchService.play2ndHalf(validPlayInput);

    // Check if skills have been updated correctly
    expect(result.updatedSkills).toEqual([
      Array(25).fill("81"), // Team 1 skills incremented by 1
      Array(25).fill("71"), // Team 2 skills incremented by 1
    ]);

    // Check if matchLogsAndEvents has been updated with logs
    expect(result.matchLogsAndEvents.length).toBe(5 * 2 + 2); // 2 initial logs + 5 rounds of events

    // Check if the error code is 0
    expect(result.err).toBe(0);
  });


});
