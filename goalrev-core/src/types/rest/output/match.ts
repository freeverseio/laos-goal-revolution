import { PlayerSkill } from "./player";

export interface PlayOutput {
  updatedSkills?: [PlayerSkill[], PlayerSkill[]]; 
  matchLogs?: [MatchLog, MatchLog];
  matchEvents?: MatchEvent[]; 
  err: string; // Error code
}


export interface MatchLog {
  penalties: boolean[];
  outOfGamePlayers: string[];
  outOfGameTypes: string[];
  outOfGameRounds: string[];
  yellowCards: string[];
  inGameSubsHappened: string[];
  halfTimeSubstitutions: string[];
  nDefs: string[];
  nTotHalf: string[];
  winner: number;
  numberOfGoals: string;
  teamSumSkills: string;
  trainingPoints: string;
  isHomeStadium: boolean;
  changesAtHalftime: string;
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
  minute: string;
  type: MatchEventType;
  team_id: string;
  primary_shirt_number?: string;
  secondary_shirt_number?: string;
  manage_to_shoot: boolean;
  is_goal: boolean;
}

export interface Play1stHalfAndEvolveResult {
  finalSkills: string[][]; 
  matchLogsAndEvents: string[]; 
  err: string;
}