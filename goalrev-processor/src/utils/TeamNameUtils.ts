import { id } from "ethers";
import { readFileSync } from "fs";

function loadTeamNamesList() {
  const teamNamesMain = readFileSync('./src/utils/names/team_mainnames.txt', 'utf8').split('\n');
  const teamNamesPreffix = readFileSync('./src/utils/names/team_prefixnames.txt', 'utf8').split('\n');
  const teamNamesSuffix = readFileSync('./src/utils/names/team_suffixnames.txt', 'utf8').split('\n');
  return { teamNamesMain, teamNamesPreffix, teamNamesSuffix };
}

function generateTeamName(teamNamesMain: string[], teamNamesPreffix: string[], teamNamesSuffix: string[], teamId: string) {
  let salt = teamId + 'ff';
  const nameIdx = generateRnd(teamId, salt, teamNamesMain.length);
  const mainName = teamNamesMain[Number(nameIdx)];
  if (mainName.includes(' ')) {
    return mainName;
  }

  // add preffix or suffix
  salt += "gg"
  const complementIdx = generateRnd(teamId, salt, teamNamesPreffix.length + teamNamesSuffix.length);
  salt += "hh";
  if (complementIdx < teamNamesPreffix.length) {
    const preffixNameIdx = generateRnd(teamId, salt, teamNamesPreffix.length);
    return teamNamesPreffix[Number(preffixNameIdx)] + ' ' + mainName;
  } else {
    const suffixNameIdx = generateRnd(teamId, salt, teamNamesSuffix.length);
    return mainName + ' ' + teamNamesSuffix[Number(suffixNameIdx)];
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

export { loadTeamNamesList, generateTeamName, generateRnd }