import { MatchEvent, PlayerSkill, PlayInput, PlayOutput } from "../types";
import { validate } from "class-validator";

export class MatchService {
  
  // Logic for playing the first half
  static async play1stHalf(body: PlayInput): Promise<PlayOutput> {
    const { skills, matchEvents, tactics, teamIds } = body;
    
    const updatedSkills: [PlayerSkill[], PlayerSkill[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => ({
        defence: Math.floor(Math.random() * 10),
        speed: Math.floor(Math.random() * 10),
        pass: Math.floor(Math.random() * 10),
        shoot: Math.floor(Math.random() * 10),
        endurance: Math.floor(Math.random() * 10),
        encodedSkills: skill
      }))
    ) as [PlayerSkill[], PlayerSkill[]];

    const ROUNDS_PER_MATCH = 4; // Example constant for number of rounds in the match
    const matchLogsAndEvents: MatchEvent[] = [
      {
        minute: 4,
        team_id: teamIds[0],
        type: "attack",
        manage_to_shoot: false,
        is_goal: false,
      },
      {
        minute: 10,
        team_id: teamIds[1],
        type: "attack",
        manage_to_shoot: true,
        is_goal: true,
      },

    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogsAndEvents,
      earnedTrainingPoints: 0,
      err,
    };
  }

  // Logic for playing the second half
  static async play2ndHalf(body: PlayInput): Promise<PlayOutput> {
    // Validate the PlayInput object
    const { skills, matchEvents, tactics, teamIds } = body;
    console.log(JSON.stringify(tactics));

    const updatedSkills: [PlayerSkill[], PlayerSkill[]] = skills.map((teamSkills) =>
      teamSkills.map((skill) => ({
        defence: Math.floor(Math.random() * 10),
        speed: Math.floor(Math.random() * 10),
        pass: Math.floor(Math.random() * 10),
        shoot: Math.floor(Math.random() * 10),
        endurance: Math.floor(Math.random() * 10),
        encodedSkills: skill
      }))
    ) as [PlayerSkill[], PlayerSkill[]];

    const ROUNDS_PER_MATCH = 2; // Example constant for number of rounds in the match
    const matchLogsAndEvents: MatchEvent[] = [
      {
        minute: 65,
        team_id: teamIds[0],
        type: "attack",
        manage_to_shoot: true,
        is_goal: false,
      },
      {
        minute: 70,
        team_id: teamIds[1],
        type: "attack",
        manage_to_shoot: false,
        is_goal: false,
      },
      
    ];
    const err = 0;

    return {
      updatedSkills,
      matchLogsAndEvents,
      err,
      earnedTrainingPoints: 70,
    };
  }
}
