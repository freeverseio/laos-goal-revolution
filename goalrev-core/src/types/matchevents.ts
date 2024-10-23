import { TacticRequest } from "./rest/input/match";

export enum TeamType {
  HOME = '0',
  AWAY = '1'
}

export interface MatchTeams {
  homeTeamId: string;
  awayTeamId: string;
  tacticsHome: TacticRequest;
  tacticsAway: TacticRequest;
}

export interface MatchEventDecoded {
  attackingTeamId: string;
  minute: number;
  managesToShoot: boolean;
  isGoal: boolean;
  primaryPlayerId: string;
  secondaryPlayerId: string;
}