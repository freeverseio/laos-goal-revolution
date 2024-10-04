import { MatchEvent, MatchEventType, PlayerSkill, PlayInput, PlayOutput } from "../types";
import { validate } from "class-validator";

export class MatchService {
  
  // Logic for playing the first half
  static async play1stHalf(body: PlayInput): Promise<PlayOutput> {
    const { skills,  tactics, teamIds } = body;
    
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


    const matchEvents: MatchEvent[] = [
      {
        minute: 4,
        team_id: teamIds[0],
        type: MatchEventType.ATTACK,
        manage_to_shoot: false,
        is_goal: false,
      },
      {
        minute: 10,
        team_id: teamIds[1],
        type: MatchEventType.ATTACK,
        manage_to_shoot: true,
        is_goal: true,
      },

    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogs: [
        {
          numberOfGoals: 1,
          gamePoints: 0,
          teamSumSkills: 10,
          trainingPoints: 10,
          isHomeStadium: true,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
        {
          numberOfGoals: 1,
          gamePoints: 0,
          teamSumSkills: 5,
          trainingPoints: 5,
          isHomeStadium: false,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
      ],
      matchEvents,
      earnedTrainingPoints: 0,
      err,
    };
  }

  // Logic for playing the second half
  static async play2ndHalf(body: PlayInput): Promise<PlayOutput> {
    // Validate the PlayInput object
    const { skills,  tactics, teamIds } = body;
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

    const matchEvents: MatchEvent[] = [
      {
        minute: 4,
        team_id: teamIds[0],
        type: MatchEventType.ATTACK,
        manage_to_shoot: false,
        is_goal: false,
      },
      {
        minute: 10,
        team_id: teamIds[1],
        type: MatchEventType.ATTACK,
        manage_to_shoot: true,
        is_goal: true,
      },

    ];

    const err = 0;

    return {
      updatedSkills,
      matchLogs: [
        {
          numberOfGoals: 1,
          gamePoints: 0,
          teamSumSkills: 10,
          trainingPoints: 10,
          isHomeStadium: true,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
        {
          numberOfGoals: 1,
          gamePoints: 3,
          teamSumSkills: 5,
          trainingPoints: 5,
          isHomeStadium: false,
          changesAtHalftime: true,
          isCancelled: false,
          encodedMatchLog: "3618502788669422116101235693605807058779801721811233097964316659973982519296",
        },
      ],
      matchEvents,
      earnedTrainingPoints: 0,
      err,
    };
  }
}
