export interface PlayInput {
  verseSeed: string; //
  matchStartTime: number;
  skills: [number[], number[]]; // 2D array for PLAYERS_PER_TEAM_MAX skills per team
  teamIds: [string, string];
  tactics: [string, string];
  matchLogs: [string, string];
  matchBools: [boolean, boolean, boolean, boolean, boolean]; // [is2ndHalf, isHomeStadium, etc.]
  assignedTPs: [string, string];
}
