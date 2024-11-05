import { id } from "ethers";
import sqlite3 from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';

type Database = SqliteDatabase<sqlite3.Database>;
type NamesDb = {
  db: Database,
  nonEmptyCountries: string[],
  nonEmptyRegions: string[],
  nNamesPerCountry: { [id: string]: number; },
  nSurnamesPerRegion: { [id: string]: number; },
  deployedCountriesSpecs: Map<number, DeployedCountriesSpecs>,
}

interface CountResult {
  count: number;
}

async function loadNamesDatabase(): Promise<NamesDb> {
  const db = await open({
    filename: './src/utils/names/names.db',
    driver: sqlite3.Database
  });
  const deployedCountriesSpecs = readDeployedCountriesSpecs();
  const countiesResult = await countEntriesPerArea(db, false, "iso2", "countries", "names")
  const {counts: nNamesPerCountry, nonEmptyRegionsOrCountries: nonEmptyCountries } = countiesResult;

  const regionsResult = await countEntriesPerArea(db, true, "region", "regions", "surnames")
  const {counts: nSurnamesPerRegion, nonEmptyRegionsOrCountries: nonEmptyRegions } = regionsResult;

  const namesDb: NamesDb = {
    db,
    nonEmptyCountries,
    nonEmptyRegions,
    nNamesPerCountry,
    nSurnamesPerRegion,
    deployedCountriesSpecs
  }
  return namesDb;
}

// Teams

async function countRecordsInTable(db: Database, tableName: string): Promise<number> {
  try {
    const SELECT_QUERY = `SELECT COUNT(*) as count FROM ${tableName}`;
    const result = await db.get<CountResult>(SELECT_QUERY);
    return result ? result.count : 0;
  } catch (error) {
    console.error('Error querying the database:', error);
    return 0;
  }
}

async function generateTeamName(namesDb: NamesDb, teamId: string) {
  let salt = teamId + 'ff';
  const teamNamesCount = await countRecordsInTable(namesDb.db, 'team_mainnames');  
  const nameIdx = generateRnd(teamId, salt, teamNamesCount);
  const statement = await namesDb.db.prepare('SELECT name FROM team_mainnames WHERE idx = ?');
  const result = await statement.get<{ name: string }>(nameIdx.toString());
  if (!result) {
    throw new Error('Name not found in team_mainnames');
  }
  const mainName = result.name;
  await statement.finalize();
  if (mainName.includes(' ')) {
    return mainName;
  }
  
  // add preffix or suffix
  const teamNamesPreffixCount = await countRecordsInTable(namesDb.db, 'team_prefixnames');  
  const teamNamesSuffixCount = await countRecordsInTable(namesDb.db, 'team_suffixnames');  
  salt += "gg"
  const complementIdx = generateRnd(teamId, salt, teamNamesPreffixCount + teamNamesSuffixCount);
  salt += "hh";
  if (complementIdx < teamNamesPreffixCount) {
    const preffixNameIdx = generateRnd(teamId, salt, teamNamesPreffixCount);
    const statement = await namesDb.db.prepare('SELECT name FROM team_prefixnames WHERE idx = ?');
    const result = await statement.get<{ name: string }>(preffixNameIdx.toString());
    await statement.finalize();
    if (!result) {
      throw new Error('Name not found in team_prefixnames');
    }
    const preffixName = result.name;
    return preffixName + ' ' + mainName;

  } else {
    const suffixNameIdx = generateRnd(teamId, salt, teamNamesSuffixCount);
    const statement = await namesDb.db.prepare('SELECT name FROM team_suffixnames WHERE idx = ?');
    const result = await statement.get<{ name: string }>(suffixNameIdx.toString());
    await statement.finalize();
    if (!result) {
      throw new Error('Name not found in team_suffixnames');
    }
    const suffixName = result.name;
    return mainName + ' ' + suffixName;
  }
}


// Players

interface CountrySpecs {
  iso2: string;
  region: string;
  namePurity: number;
  surnamePurity: number;
}

interface DeployedCountriesSpecs {
  iso2: string;
  region: string;
  namePurity: number;
  surnamePurity: number;
}

function readDeployedCountriesSpecs(): Map<number, DeployedCountriesSpecs> {
  const deployedCountriesSpecs: Map<number, DeployedCountriesSpecs> = new Map();
  deployedCountriesSpecs.set(serializeTZandCountryIdx(10, 0n), { iso2: "ES", region: "Spanish", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(11, 0n), { iso2: "IT", region: "ItalySurnames", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(7, 0n), { iso2: "CN", region: "Chinese", namePurity: 75, surnamePurity: 70 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(9, 0n), { iso2: "NL", region: "NetherlandsSurnames", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(9, 1n), { iso2: "BE", region: "BelgiumSurnames", namePurity: 75, surnamePurity: 60 });
  deployedCountriesSpecs.set(serializeTZandCountryIdx(8, 0n), { iso2: "PL", region: "PolandSurnames", namePurity: 75, surnamePurity: 60 });
  return deployedCountriesSpecs;
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

type CountEntriesResult = {
  counts: Record<string, number>;
  nonEmptyRegionsOrCountries: string[];
};

type PlayerNamesMap =  { 
  [id: string]: {
    name: string, 
    countryISO2: string, 
    region: string
  } 
}

async function countEntriesPerArea(
  db: Database,
  isSurname: boolean,
  colName: string,
  areasTable: string,
  entryPerAreaTable: string
): Promise<CountEntriesResult> {
  const result: CountEntriesResult = {
    counts: {},
    nonEmptyRegionsOrCountries: [],
  };

  try {
    // Get all IDs from areasTable
    const areasQuery = `SELECT ${colName} FROM ${areasTable}`;
    const areaRows = await db.all<{ [key: string]: string }[]>(areasQuery);
    
    for (const area of areaRows) {
      const id = area[colName];
      
      // Count entries in entryPerAreaTable where colName matches the current ID
      const countQuery = `SELECT COUNT(*) AS count FROM ${entryPerAreaTable} WHERE ${colName} = ?`;
      const countRow = await db.get<{ count: number }>(countQuery, id);
      const count = countRow?.count || 0;

      // Store count in the result object
      result.counts[id] = count;

      // Track non-empty regions or countries
      if (count > 0) {
        result.nonEmptyRegionsOrCountries.push(id);
      }
    }

    return result;
  } catch (error) {
    console.error(`Error fetching entries: ${error}`);
    throw new Error(`Error fetching entries: ${error}`);
  }
}


async function generateName(namesDb: NamesDb, playerId: string, generation: number, iso2: string, purity: number): Promise<[string, string, Error | null]> {
  const dice = generateRnd(playerId, "aa", 100);
  if (Number(dice) > purity) {
    const newPick = generateRnd(playerId, "bb", namesDb.nonEmptyCountries.length);
    iso2 = namesDb.nonEmptyCountries[Number(newPick)];
  }
  const salt = "cc" + generation.toString();
  const rowRandom = generateRnd(playerId, salt, namesDb.nNamesPerCountry[iso2]);
  const query = `SELECT name FROM names WHERE (iso2 = ?) ORDER BY name ASC LIMIT 1 OFFSET ?`;
  const statement = await namesDb.db.prepare(query);
  const result = await statement.get<{ name: string }>(iso2, Number(rowRandom));
  if (!result) {
    console.error('Name not found in names with iso2 = ' + iso2);
    throw new Error('Name not found in names with iso2 = ' + iso2);
  }
  const name = result.name;
  await statement.finalize();
  
  return [name, iso2, null];
}

async function generateSurname(namesDb: NamesDb, playerId: string, generation: number, region: string, purity: number): Promise<[string, string, Error | null]> {
  const dice = generateRnd(playerId, "dd", 100);
  if (Number(dice) > purity) {
    const newPick = generateRnd(playerId, "ee", namesDb.nonEmptyRegions.length);
    region = namesDb.nonEmptyRegions[Number(newPick)];
  }
  let salt: string;
  if (generation < 32) {
    salt = "ff0";
  } else {
    salt = "ff" + generation.toString();
  }
  const rowRandom = generateRnd(playerId, salt, namesDb.nSurnamesPerRegion[region]);

  const query = `SELECT surname FROM surnames WHERE (region = ?) ORDER BY surname ASC LIMIT 1 OFFSET ?`;
  const statement = await namesDb.db.prepare(query);
  const result = await statement.get<{ surname: string }>(region, Number(rowRandom));
  if (!result) {
    console.error(`Name not found in surnames with region = ${region}`);
    throw new Error('Name not found in names with region = ' + region);
  }
  let surname = result.surname;
  await statement.finalize();
  
  const isSon = generation > 0 && generation < 32;
  if (isSon) {
    surname += " Jr.";
  }
  
  return [surname, region, null];
}

async function generatePlayerFullName(namesDb: NamesDb, playerId: string, generation: number, tz: number, countryIdxInTZ: bigint): Promise<{ name: string, countryISO2: string, region: string }> {
  if (tz < 1 || tz > 24) {
    console.error(`Timezone should be within [1, 24], but it was ${tz}`);
    throw new Error(`Timezone should be within [1, 24], but it was ${tz}`);
  }

  if (generation >= 64) {
    console.error(`Generation should be within [0, 63], but it was ${generation}`);
    throw new Error(`Generation should be within [0, 63], but it was ${generation}`);
  }

  let specs = namesDb.deployedCountriesSpecs.get(serializeTZandCountryIdx(tz, countryIdxInTZ));
  if (!specs) {
    // Spain is the default country if you query for one that is not specified
    specs = namesDb.deployedCountriesSpecs.get(serializeTZandCountryIdx(10, 0n));
  }
  if (!specs) {
    console.error(`Specs not found for tz = ${tz}, countryIdxInTZ = ${countryIdxInTZ}`);
    throw new Error(`Specs not found for tz = ${tz}, countryIdxInTZ = ${countryIdxInTZ}`);
  }
  const [name, countryISO2, nameError] = await generateName(namesDb, playerId, generation, specs.iso2, specs.namePurity);
  if (nameError) {
    console.error(nameError);
    throw nameError;
  }
  const [surname, region, surnameError] = await generateSurname(namesDb, playerId, generation, specs.region, specs.surnamePurity);
  if (surnameError) {
    console.error(surnameError);
    throw surnameError;
  }

  return {
    name: `${name} ${surname}`, 
    countryISO2, 
    region};
}

export {
  NamesDb,
  PlayerNamesMap,
  loadNamesDatabase,
  generatePlayerFullName,
  generateTeamName
}
