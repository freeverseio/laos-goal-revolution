import { PlayInput, PlayOutput } from "../types";

export class MatchService {
  // Logic for playing the first half
  static play1stHalf(body: PlayInput): PlayOutput {
    const { skills, matchLogs } = body;

    const updatedSkills: [number[], number[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => skill + 1)
    ) as [number[], number[]];

    const ROUNDS_PER_MATCH = 4; // Example constant for number of rounds in the match
    const matchLogsAndEvents: number[] = [
      ...matchLogs,   // Start with the original matchLogs
      ...new Array(5 * ROUNDS_PER_MATCH).fill(0), // Add empty events for each round
    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogsAndEvents,
      err,
    };
  }

  // Logic for playing the second half
  static play2ndHalf(body: PlayInput): PlayOutput {
    const { skills, matchLogs } = body;

    const updatedSkills: [number[], number[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => skill + 1)
    ) as [number[], number[]];

    const ROUNDS_PER_MATCH = 2; // Example constant for number of rounds in the match
    const matchLogsAndEvents: number[] = [
      ...matchLogs,   // Start with the original matchLogs
      ...new Array(5 * ROUNDS_PER_MATCH).fill(0), // Add empty events for each round
    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogsAndEvents,
      err,
    };
  }
}
