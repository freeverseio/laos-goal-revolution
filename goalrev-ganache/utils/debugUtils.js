function compareArraysInternal(result, expected, toNum, isBigNumber, verbose) {
  verb = [];
  for (i = 0; i < expected.length; i++) {
      if (toNum) verb.push(result[i].toNumber());
      else verb.push(result[i]);
      if (!verbose) {
          if (toNum) result[i].toNumber().should.be.equal(expected[i]);
          else {
            if (isBigNumber) result[i].should.be.bignumber.equal(expected[i]);
            else result[i].should.be.equal(expected[i]);
          }
      }            
  }
  if (verbose) console.log(verb);
}

function compareArrays(result, expected, toNum = true, isBigNumber = false) {
  try {
    compareArraysInternal(result, expected, toNum, isBigNumber, verbose = false)
  } 
  catch(e) {
    compareArraysInternal(result, expected, toNum, isBigNumber, verbose = true)
    throw e
  }  
}

function getErrorCodes() {
  return {
    ERR_IS2NDHALF: 1,
    ERR_TRAINING_SPLAYER: 2,
    ERR_TRAINING_SINGLESKILL: 3,
    ERR_TRAINING_SUMSKILLS: 4,
    ERR_TRAINING_PREVMATCH: 5,
    ERR_TRAINING_STAMINA: 6,
    ERR_COMPUTETRAINING: 7,
    ERR_PLAYHALF: 8,
    ERR_EVOLVE: 9,
    ERR_UPDATEAFTER_YELLOW: 10,
    ERR_SHOP: 11,
    ERR_UPDATEAFTER_CHANGES: 12,
    ERR_UPDATEAFTER_OUTOFGAME1: 13,
    ERR_UPDATEAFTER_OUTOFGAME2: 14,
    ERR_PLAYHALF_TOO_MANY_LINEDUP: 15,
    ERR_PLAYHALF_HALFCHANGES: 16,
    ERR_PLAYHALF_PLAYER_TWICE: 17,
    ERR_2NDHALF_CANCELLED_DUE_TO_1STHALF_CANCELLED: 18
  }
}
  
  module.exports = {
    compareArrays,
    getErrorCodes
  }