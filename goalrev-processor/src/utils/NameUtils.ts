import { id } from "ethers";
import sqlite3 from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';

type Database = SqliteDatabase<sqlite3.Database>;
type PlayerNamesDb = {
  db: Database,
  nonEmptyCountries: string[],
  nonEmptyRegions: string[],
  nNamesPerCountry: { [id: string]: number; };
  nSurnamesPerRegion: { [id: string]: number; };
}

async function loadNamesDatabase(): Promise<{playerNamesDb: PlayerNamesDb; }> {
  const db = await open({
    filename: './src/utils/names/names.db',
    driver: sqlite3.Database
  });
    
  const {nonEmptyCountries, nNamesPerCountry} = await countEntriesPerArea(db, false, "iso2", "countries", "names")
  const {nonEmptyRegions, nSurnamesPerRegion} = await countEntriesPerArea(db, true, "region", "regions", "surnames");
  console.log(` Non-empty countries: ${nonEmptyCountries} nNamesPerCountry: ${nNamesPerCountry}`);
  console.log(` Non-empty regions: ${nonEmptyRegions} nSurnamesPerRegion: ${nSurnamesPerRegion}`);

  const PlayerNamesDb: PlayerNamesDb = {
    db,
    nonEmptyCountries,
    nonEmptyRegions,
    nNamesPerCountry,
    nSurnamesPerRegion
  }
  return { playerNamesDb: PlayerNamesDb };
}

interface CountrySpecs {
  iso2: string;
  region: string;
  namePurity: number;
  surnamePurity: number;
}

const deployedCountriesSpecs: Map<number, DeployedCountriesSpecs> = new Map();

function readDeployedCountriesSpecs(): void {
  deployedCountriesSpecs.set(serializeTZandCountryIdx(10, 0n), { iso2: "ES", region: "Spanish", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(11, 0n), { iso2: "IT", region: "ItalySurnames", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(7, 0n), { iso2: "CN", region: "Chinese", namePurity: 75, surnamePurity: 70 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(9, 0n), { iso2: "NL", region: "NetherlandsSurnames", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(9, 1n), { iso2: "BE", region: "BelgiumSurnames", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(8, 0n), { iso2: "PL", region: "PolandSurnames", namePurity: 75, surnamePurity: 60 });
}

interface DeployedCountriesSpecs {
  iso2: string;
  region: string;
  namePurity: number;
  surnamePurity: number;
}

function generateRnd(seed: string, salt: string, maxVal: number): bigint {    
  const hash = id(seed + salt);
  const result = BigInt(hash);
  if (maxVal === 0) {
    return result;
  }
  return result % BigInt(maxVal);
}

function serializeTZandCountryIdx(tz: number, countryIdxInTZ: bigint): number {
  return Number(BigInt(tz) * 1000000n + countryIdxInTZ);
}

async function countEntriesPerArea(db: Database, isSurname: boolean, colName: string, tableName: string, entryPerAreaTable: string): Promise<{ nonEmptyRegions: string[]; nonEmptyCountries: string[]; nSurnamesPerRegion: { [id: string]: number; }; nNamesPerCountry: { [id: string]: number; }; }> {
  const SELECT_COUNTRIES_QUERY = `SELECT ${colName} FROM ${tableName}`;
  const statement = await db.prepare(SELECT_COUNTRIES_QUERY);
  const countries = await statement.all<Record<string, string>>();
  await statement.finalize();

  const SELECT_COUNT_QUERY = `SELECT COUNT(*) as count FROM ${entryPerAreaTable} WHERE (${colName} = ?)`;
  let nonEmptyRegions = [];
  let nonEmptyCountries = [];
  let nSurnamesPerRegion: { [id: string]: number } = {};
  let nNamesPerCountry: { [id: string]: number } = {};

  const map: { [id: string]: number } = {};
  for (const id of Object.values(countries)) {    
    const statement = await db.prepare(SELECT_COUNT_QUERY);
    const result = await statement.get<{ count: number }>(id);
    await statement.finalize();
    const count = result ? result.count : 0;
    map[id] = count;
    if (count > 0) {
      if (isSurname) {
        nonEmptyRegions.push(id);
      } else {
        nonEmptyCountries.push(id);
      }
    }
  }

  if (isSurname) {
    nSurnamesPerRegion = map;
  } else {
    nNamesPerCountry = map;
  }
  return { nonEmptyRegions, nonEmptyCountries, nSurnamesPerRegion, nNamesPerCountry };
}


async function generateName(playerNamesDb: PlayerNamesDb, playerId: string, generation: number, iso2: string, purity: number): Promise<[string, string, Error | null]> {
  const dice = generateRnd(playerId, "aa", 100);
  if (Number(dice) > purity) {
    const newPick = generateRnd(playerId, "bb", playerNamesDb.nonEmptyCountries.length);
    iso2 = playerNamesDb.nonEmptyCountries[Number(newPick)];
  }
  const salt = "cc" + generation.toString();
  const rowRandom = generateRnd(playerId, salt, playerNamesDb.nNamesPerCountry[iso2]);

  const query = `SELECT name FROM names WHERE (iso2 = ?) ORDER BY name ASC LIMIT 1 OFFSET ?`;
  const statement = await playerNamesDb.db.prepare(query);
  const result = await statement.get<{ name: string }>(iso2, rowRandom);
  if (!result) {
    throw new Error('Name not found in names with iso2 = ' + iso2);
  }
  const name = result.name;
  await statement.finalize();
  
  return [name, iso2, null];
}

async function generateSurname(playerNamesDb: PlayerNamesDb, playerId: string, generation: number, region: string, purity: number): Promise<[string, string, Error | null]> {
  const dice = generateRnd(playerId, "dd", 100);
  if (Number(dice) > purity) {
    const newPick = generateRnd(playerId, "ee", playerNamesDb.nonEmptyRegions.length);
    region = playerNamesDb.nonEmptyRegions[Number(newPick)];
  }
  let salt: string;
  if (generation < 32) {
    salt = "ff0";
  } else {
    salt = "ff" + generation.toString();
  }
  const rowRandom = generateRnd(playerId, salt, playerNamesDb.nSurnamesPerRegion[region]);

  const query = `SELECT surname FROM surnames WHERE (region = ?) ORDER BY surname ASC LIMIT 1 OFFSET ?`;
  const statement = await playerNamesDb.db.prepare(query);
  const result = await statement.get<{ name: string }>(region, rowRandom);
  if (!result) {
    throw new Error('Name not found in names with region = ' + region);
  }
  let surname = result.name;
  await statement.finalize();
  
  const isSon = generation > 0 && generation < 32;
  if (isSon) {
    surname += " Jr.";
  }
  
  return [surname, region, null];
}

async function generatePlayerFullName(playerNamesDb: PlayerNamesDb, playerId: string, generation: number, tz: number, countryIdxInTZ: bigint): Promise<[string, string, string] | [null, null, null, Error]> {
  console.debug(`[NAMES] GeneratePlayerFullName of playerId ${playerId}`);

  if (tz < 1 || tz > 24) {
    return [null, null, null, new Error(`Timezone should be within [1, 24], but it was ${tz}`)];
  }

  if (generation >= 64) {
    return [null, null, null, new Error(`Generation should be within [0, 63], but it was ${generation}`)];
  }

  //let specs: DeployedCountriesSpecs = deployedCountriesSpecs[serializeTZandCountryIdx(tz, countryIdxInTZ)];
  let specs = deployedCountriesSpecs.get(serializeTZandCountryIdx(tz, countryIdxInTZ));
  if (!specs) {
    // Spain is the default country if you query for one that is not specified
    specs = deployedCountriesSpecs.get(serializeTZandCountryIdx(10, 0n));
  }
  if (!specs) {
    throw new Error(`Specs not found for tz = ${tz}, countryIdxInTZ = ${countryIdxInTZ}`);
  }

  const [name, countryISO2, nameError] = await generateName(playerNamesDb, playerId, generation, specs.iso2, specs.namePurity);
  if (nameError) {
    return [null, null, null, nameError];
  }

  const [surname, region, surnameError] = await generateSurname(playerNamesDb, playerId, generation, specs.region, specs.surnamePurity);
  if (surnameError) {
    return [null, null, null, surnameError];
  }

  return [`${name} ${surname}`, countryISO2, region];
}

export {
  generatePlayerFullName,
}
