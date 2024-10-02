// tests/services/MatchService.test.ts

import { MatchService } from "../../src/services/MatchService";
import { PlayInput } from "../../src/types";

describe("MatchService", () => {
  const playInput: PlayInput = {
    verseSeed: "0xabc",
    matchStartTime: 1234567890,
    skills: [
      [80, 85, 90], // Team 1 skills
      [70, 75, 80], // Team 2 skills
    ],
    teamIds: ["team1", "team2"], // Team IDs as strings
    tactics: ["tactic1", "tactic2"], // Tactics as strings
    matchLogs: ["100", "200"], // Match logs as strings
    matchBools: [false, true, false, true, false],
    assignedTPs: ["150", "180"], // Assigned TPs as strings
  };

  it("should update skills and generate logs for the first half", () => {
    const result = MatchService.play1stHalf(playInput);

    // Check if skills have been updated correctly
    expect(result.updatedSkills).toEqual([
      [81, 86, 91], // Incremented by 1
      [71, 76, 81],
    ]);

    // Check if matchLogsAndEvents has been updated with logs
    expect(result.matchLogsAndEvents.length).toBe(5 * 4 + 2); // 2 initial logs + 5 rounds of events

    // Check if the error code is 0
    expect(result.err).toBe(0);
  });

  it("should update skills and generate logs for the second half", () => {
    const result = MatchService.play2ndHalf(playInput);

    // Check if skills have been updated correctly
    expect(result.updatedSkills).toEqual([
      [81, 86, 91], // Incremented by 1
      [71, 76, 81],
    ]);

    // Check if matchLogsAndEvents has been updated with logs
    expect(result.matchLogsAndEvents.length).toBe(5 * 2 + 2); // 2 initial logs + 5 rounds of events

    // Check if the error code is 0
    expect(result.err).toBe(0);
  });
});
