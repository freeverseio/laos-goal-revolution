export interface LeagueLeaderboardTeamOutput {
  teamId: number;
  leaderboardPosition: number;
  teamPoints: number;
}

export interface LeagueLeaderboardOutput {
  teams: LeagueLeaderboardTeamOutput[];
  err: number;
}

// TODO define fields
export interface CreateTeamOutput {
  team: string,
  players: string[],
}
