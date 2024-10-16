const UNDEF = undefined;
const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
const substitutions = [6, 10, 0];
const subsRounds = [3, 7, 1];
const noSubstitutions = [11, 11, 11];
const lineup0 = [0, 3, 4, 5, 6, 9, 10, 11, 12, 15, 16, 7, 13, 17];
const lineup1 = [0, 3, 4, 5, 6, 9, 10, 11, 16, 17, 18, 7, 13, 17];
const lineupConsecutive = Array.from(new Array(14), (x,i) => i); 
const extraAttackNull =  Array.from(new Array(10), (x,i) => 0);
const tacticId442 = 0; // 442
const tacticId433 = 2; // 433
const playersPerZone442 = [1,2,1,1,2,1,0,2,0];
const playersPerZone433 = [1,2,1,1,1,1,1,1,1];
const PLAYERS_PER_TEAM_MAX = 25;
const firstHalfLog = [0, 0];
const subLastHalf = false;
const is2ndHalf = false;
const isHomeStadium = false;
const isPlayoff = false;
const matchBools = [is2ndHalf, isHomeStadium, isPlayoff]
const IDX_R = 1;
const IDX_C = 2;
const IDX_CR = 3;
const IDX_L = 4;
const IDX_LR = 5;
const IDX_LC = 6;
const IDX_LCR = 7;
const fwd442 =  [0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3];
const left442 = [0, IDX_L, IDX_C, IDX_C, IDX_R, IDX_L, IDX_C, IDX_C, IDX_R, IDX_C, IDX_C];
// const now = Math.floor(new Date()/1000);
// const dayOfBirth21 = Math.round(secsToDays(now) - 21/7);
const now = 1570147200; // this number has the property that 7*nowFake % (SECS_IN_DAY) = 0 and it is basically Oct 3, 2019
const dayOfBirth21 = secsToDays(now) - 21*365/7; // = exactly 17078, no need to round
const dayOfBirthOld = secsToDays(now) - Math.floor(37*365/7);
const MAX_PENALTY = 10000;
const DRAW = 2;
const WINNER_HOME = 0;
const WINNER_AWAY = 1;
const teamSumSkillsDefault = 3256244;
const MAX_GOALS_IN_HALF = 12;
const it2 = async(text, f) => {};
const trainingPointsDefault = 12;


function setNoSubstInLineUp(lineup, substitutions) {
  modifiedLineup = [...lineup];
  NO_SUBST = 11;
  NO_LINEUP = 25;
  for (s = 0; s < 3; s++) {
      if (substitutions[s] == NO_SUBST) modifiedLineup[s + 11] = NO_LINEUP;
  }
  return modifiedLineup;
}

function daysToSecs(dayz) {
  return (dayz * 24 * 3600); 
}

function secsToDays(secs) {
  return secs/ (24 * 3600);
}

// extendend logs are arrays of the form [logTeam0, logTeam1, event0, event1, event2, ...]
function extractMatchLogs(extendedLog) {
  return [extendedLog[0], extendedLog[1]]
}

const createTeamState442 = async (engine, forceSkills, alignedEndOfLastHalfTwoVec = [false, false]) => {
  teamState = [];
  playerId = 123121;
  pot = 3;
  aggr = 0;
  alignedEndOfLastHalf = true;
  redCardLastGame = false;
  gamesNonStopping = 0;
  injuryWeeksLeft = 0;
  sumSkills = forceSkills.reduce((a, b) => a + b, 0);
  for (p = 0; p < 11; p++) {
      pSkills = await assets.encodePlayerSkills(forceSkills, dayOfBirth21, gen = 0, playerId + p, [pot, fwd442[p], left442[p], aggr],
          alignedEndOfLastHalfTwoVec[0], redCardLastGame, gamesNonStopping, 
          injuryWeeksLeft, subLastHalf, sumSkills).should.be.fulfilled 
      teamState.push(pSkills)
  }
  p = 10;
  pSkills = await assets.encodePlayerSkills(forceSkills, dayOfBirth21,  gen = 0, playerId + p, [pot, fwd442[p], left442[p], aggr],
          alignedEndOfLastHalfTwoVec[1], redCardLastGame, gamesNonStopping, 
          injuryWeeksLeft, subLastHalf, sumSkills).should.be.fulfilled 
  for (p = 11; p < PLAYERS_PER_TEAM_MAX; p++) {
      teamState.push(pSkills)
  }        
  return teamState;
};

const createTeamStateFromSinglePlayer = async (skills, engine, forwardness = 3, leftishness = 2, alignedEndOfLastHalfTwoVec = [false, false]) => {
  teamState = []
  sumSkills = skills.reduce((a, b) => a + b, 0);
  var playerStateTemp = await assets.encodePlayerSkills(
      skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr = 0],
      alignedEndOfLastHalfTwoVec[0], redCardLastGame = false, gamesNonStopping = 0, 
      injuryWeeksLeft = 0, subLastHalf, sumSkills
  ).should.be.fulfilled;
  for (player = 0; player < 11; player++) {
      teamState.push(playerStateTemp)
  }

  playerStateTemp = await assets.encodePlayerSkills(
      skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr = 0],
      alignedEndOfLastHalfTwoVec[1], redCardLastGame = false, gamesNonStopping = 0, 
      injuryWeeksLeft = 0, subLastHalf, sumSkills
  ).should.be.fulfilled;
  for (player = 11; player < PLAYERS_PER_TEAM_MAX; player++) {
      teamState.push(playerStateTemp)
  }
  return teamState;
};


  module.exports = {
    createTeamState442,
  }