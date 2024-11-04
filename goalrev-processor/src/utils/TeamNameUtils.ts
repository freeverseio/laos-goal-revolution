import { id } from "ethers";
import sqlite3 from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';

type Database = SqliteDatabase<sqlite3.Database>;

async function loadNamesDatabase(): Promise<Database> {
  const db = await open({
    filename: './src/utils/names/names.db',
    driver: sqlite3.Database
  });

  await logTableNames(db);
  throw new Error('stop');
  
  return db;
}

async function logTableNames(db: SqliteDatabase): Promise<void> {
  try {
    // const results = await db.all('SELECT * FROM team_mainnames');
    // console.log('Records in team_mainnames:');
    // results.forEach(record => {
    //   console.log(record);
    // });
    
    const tables = await db.all<{ name: string }[]>('SELECT name FROM sqlite_master WHERE type = "table"');
    console.log('Table Names:');
    tables.forEach(table => {
      console.log(table.name);
    });
  } catch (error) {
    console.error('Error retrieving table names:', error);
  }
}

interface CountResult {
  count: number;
}

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

async function generateTeamName(teamNamesDb: Database, teamId: string) {
  let salt = teamId + 'ff';
  const teamNamesCount = await countRecordsInTable(teamNamesDb, 'team_mainnames');  
  const nameIdx = generateRnd(teamId, salt, teamNamesCount);
  const statement = await teamNamesDb.prepare('SELECT name FROM team_mainnames WHERE idx = ?');
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
  const teamNamesPreffixCount = await countRecordsInTable(teamNamesDb, 'team_prefixnames');  
  const teamNamesSuffixCount = await countRecordsInTable(teamNamesDb, 'team_suffixnames');  
  salt += "gg"
  const complementIdx = generateRnd(teamId, salt, teamNamesPreffixCount + teamNamesSuffixCount);
  salt += "hh";
  if (complementIdx < teamNamesPreffixCount) {
    const preffixNameIdx = generateRnd(teamId, salt, teamNamesPreffixCount);
    const statement = await teamNamesDb.prepare('SELECT name FROM team_prefixnames WHERE idx = ?');
    const result = await statement.get<{ name: string }>(preffixNameIdx.toString());
    await statement.finalize();
    if (!result) {
      throw new Error('Name not found in team_prefixnames');
    }
    const preffixName = result.name;
    return preffixName + ' ' + mainName;

  } else {
    const suffixNameIdx = generateRnd(teamId, salt, teamNamesSuffixCount);
    const statement = await teamNamesDb.prepare('SELECT name FROM team_suffixnames WHERE idx = ?');
    const result = await statement.get<{ name: string }>(suffixNameIdx.toString());
    await statement.finalize();
    if (!result) {
      throw new Error('Name not found in team_suffixnames');
    }
    const suffixName = result.name;
    return mainName + ' ' + suffixName;
  }
}

function generateRnd(seed: string, salt: string, maxVal: number): bigint {    
  const hash = id(seed + salt);
  const result = BigInt(hash);
  if (maxVal === 0) {
    return result;
  }
  return result % BigInt(maxVal);
}

export { loadNamesDatabase, generateTeamName, generateRnd }