export interface UpdateLeagueLeaderboardInput {
  timezoneIdx: number,
  countryIdx: number,
  leagueIdx: number,
}

export interface AddDivisionInput {
  timezoneIdx: number,
  countryIdx: number,
}

export interface CreateTeamCoreInput {
  timezoneIdx: number,
  countryIdx: number,    
  teamIdxInTZ: number,
  deployTimeInUnixEpochSecs: number,
  divisionCreationRound: number,
}

