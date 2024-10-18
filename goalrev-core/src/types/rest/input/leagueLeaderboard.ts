interface LeagueLeaderboardMatchInput {
  homeGoals: number;
  visitorGoals: number;
}

export interface LeagueLeaderboardTeamInput {
  teamId: number;
  teamIdxInLeague: number;
}

export interface LeagueLeaderboardInput {
  teams: LeagueLeaderboardTeamInput[];
  matchDay: number;
  matches: LeagueLeaderboardMatchInput[];
}

export interface CreateTeamInput {
  timezoneIdx: number,
  countryIdx: number,    
  teamIdxInTZ: number,
  deployTimeInUnixEpochSecs: number,
  divisionCreationRound: number,
}
