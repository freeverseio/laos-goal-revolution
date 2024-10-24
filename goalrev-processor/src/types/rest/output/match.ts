import { PlayerSkill } from "../output/team";

export interface PlayOutput {
  updatedSkills: [PlayerSkill[], PlayerSkill[]]; 
  matchLogs: [MatchLog, MatchLog];
  matchEvents: MatchEventOutput[]; 
  err: string; // Error code
}

export interface MatchLog {
  numberOfGoals: number;
  gamePoints: number;
  teamSumSkills: number;
  trainingPoints: number;
  isHomeStadium: boolean;
  changesAtHalftime: number;
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

export interface MatchEventOutput {
  minute: number;
  type: MatchEventType;
  team_id: string;
  primary_shirt_number?: string;
  secondary_shirt_number?: string;
  manage_to_shoot: boolean;
  is_goal: boolean;
}