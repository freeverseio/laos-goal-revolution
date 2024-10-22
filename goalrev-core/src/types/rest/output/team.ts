import { Player } from "./player";

export interface CreateTeamOutput {
  teamId: string;
  playerIds: string[];
  playerSkillsAtBirth: string[];
}

export interface Team {
  id: string;
  players: Player[];
}