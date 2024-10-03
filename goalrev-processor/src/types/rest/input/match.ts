export interface PlayMatchesInput {
  timeZone: number,
  league: number,
  matchDay: number
}

export interface PlayMatchRequest {
  verseSeed: string

  matchStartTime: number

  skills: [string[], string[]]

  teamIds: [number, number]

  tactics: [number, number]

  matchLogs: [string, string]

  matchBools: [boolean, boolean, boolean, boolean, boolean]

  assignedTPs: [string, string]
}