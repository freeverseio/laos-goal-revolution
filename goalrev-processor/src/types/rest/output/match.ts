export interface PlayOutput {
  updatedSkills: [PlayerSkill[], PlayerSkill[]]; 
  matchLogsAndEvents: MatchEventOutput[]; 
  earnedTrainingPoints: number;
  err: number; // Error code
}

export interface PlayerSkill {
  defence: number;
  speed: number;
  pass: number;
  shoot: number;
  endurance: number;
  encodedSkills: string;
}

export interface MatchEventOutput {
  minute: number;
  type: string;
  team_id: number;
  primary_player_id?: string;
  secondary_player_id?: string;
  manage_to_shoot: boolean;
  is_goal: boolean;
}