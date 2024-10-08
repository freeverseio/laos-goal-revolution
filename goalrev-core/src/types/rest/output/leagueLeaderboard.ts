export interface LeagueLeaderboardTeamOutput {
  teamId: number;
  leaderboardPosition: number;
  teamPoints: number;
}

export interface LeagueLeaderboardOutput {
  teams: LeagueLeaderboardTeamOutput[];
  err: number;
}
