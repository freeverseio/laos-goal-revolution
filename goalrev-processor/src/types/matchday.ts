type Match = {
  home: string;
  away: string;
};

export type Matchday = Match[];

export type Schedule = Matchday[];

export type MatchHalf = 0 | 1;
