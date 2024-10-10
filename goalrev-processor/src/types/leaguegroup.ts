import { Country } from "../db/entity/Country";

export type TeamId = string;


export interface LeagueGroup {
  country: Country;
  timezone: number;
  leagues: TeamId[][];
}
