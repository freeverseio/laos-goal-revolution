import { PlayInput, PlayOutput } from "../types";
import { validate } from "class-validator";

export class MatchService {
  
  // Logic for playing the first half
  static async play1stHalf(body: PlayInput): Promise<PlayOutput> {
    const { skills, matchLogs, tactics } = body;
    console.log(JSON.stringify(tactics));
    
    const updatedSkills: [string[], string[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => (parseInt(skill) + 1).toString())
    ) as [string[], string[]];

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
  static async play2ndHalf(body: PlayInput): Promise<PlayOutput> {
    // Validate the PlayInput object
    const { skills, matchLogs, tactics } = body;
    console.log(JSON.stringify(tactics));

    const updatedSkills: [string[], string[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => (parseInt(skill) + 1).toString())
    ) as [string[], string[]];

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
