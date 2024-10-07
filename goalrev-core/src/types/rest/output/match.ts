export interface PlayOutput {
  updatedSkills: [PlayerSkill[], PlayerSkill[]]; 
  matchLogs: [MatchLog, MatchLog];
  matchEvents: MatchEvent[]; 
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

export interface MatchLog {
  numberOfGoals: number;
  gamePoints: number;
  teamSumSkills: number;
  trainingPoints: number;
  isHomeStadium: boolean;
  changesAtHalftime: boolean;
  isCancelled: boolean;
  encodedMatchLog: string;
}

export enum MatchEventType {
  ATTACK = "attack",
  YELLOW_CARD = "yellow_card",
  RED_CARD = "red_card",
  INJURY_SOFT = "injury_soft",
  INJURY_HARD = "injury_hard",
  SUBSTITUTION = "substitution"
}

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  team_id: number;
  primary_player_id?: string;
  secondary_player_id?: string;
  manage_to_shoot: boolean;
  is_goal: boolean;
}