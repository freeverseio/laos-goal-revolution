import sqlite3 from 'sqlite3';
import { Database as SqliteDatabase } from 'sqlite';

export type Database = SqliteDatabase<sqlite3.Database>;
export type NamesDb = {
  db: Database,
  nonEmptyCountries: string[],
  nonEmptyRegions: string[],
  nNamesPerCountry: { [id: string]: number; },
  nSurnamesPerRegion: { [id: string]: number; },
  deployedCountriesSpecs: Map<number, DeployedCountriesSpecs>,
}

export interface CountResult {
  count: number;
}

export interface CountrySpecs {
  iso2: string;
  region: string;
  namePurity: number;
  surnamePurity: number;
}

export interface DeployedCountriesSpecs {
  iso2: string;
  region: string;
  namePurity: number;
  surnamePurity: number;
}

export type CountEntriesResult = {
  counts: Record<string, number>;
  nonEmptyRegionsOrCountries: string[];
};

export type PlayerNamesMap =  { 
  [id: string]: {
    name: string, 
    countryISO2: string, 
    region: string
  } 
}