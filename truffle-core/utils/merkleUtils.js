const NULL_BYTES32 = web3.eth.abi.encodeParameter('bytes32','0x0');

function hashBytes32(x) {
  return web3.utils.keccak256(web3.eth.abi.encodeParameter('bytes32', x));
}

function hashUint256(x) {
  return web3.utils.keccak256(web3.eth.abi.encodeParameter('bytes32', x));
}

function hash_node(x, y) {
  if ((x == NULL_BYTES32) &&  (y == NULL_BYTES32)) return NULL_BYTES32; 
  return web3.utils.keccak256(web3.eth.abi.encodeParameters(['bytes32', 'bytes32'], [x,y]));
}

function zeroPadToLength(x, desiredLength) {
  return x.concat(Array.from(new Array(desiredLength - x.length), (x,i) => 0))
}

function computeLevelVerifiableByBC(nLeaguesInTz, nLeafsPerRoot) {
  return 2+ Math.ceil(getBaseLog(nLeafsPerRoot, nLeaguesInTz));
}

function arrayToHex(x) {
  y = [...x];
  for (i = 0; i < x.length; i++) {
      y[i] = web3.utils.toHex(x[i]);
  }
  return y;
}

function merkleRootZeroPad(leafs, nLevels) {
  leafs = zeroPadToLength(leafs, 2**nLevels)       
  _leafs = [...leafs];
  nLeafs = 2**nLevels;
  assert.equal(_leafs.length, nLeafs, "number of leafs is not = pow(2,nLevels)");
  for (level = 0; level < nLevels; level++) {
      nLeafs = Math.floor(nLeafs/2);
      for (pos = 0; pos < nLeafs; pos++) {
        _leafs[pos] = hash_node(_leafs[2 * pos], _leafs[2 * pos + 1]);      
      }
  }
  return _leafs[0];
}


function merkleRoot(leafs, nLevels) {
  nLeafsNonNull = leafs.length;
  nLeafs = 2**nLevels;
  assert.equal(nLeafsNonNull % 2, 0, "only even nLeafsNonNull accepted");
  assert.equal(nLeafs >= nLeafsNonNull, true, "not enough levels for so many leafs");
  _leafs = [...leafs];

  for (level = 0; level < nLevels; level++) {
      nLeafs = Math.floor(nLeafs/2);
      nLeafsNonNull = Math.min(Math.ceil(nLeafsNonNull/2), nLeafs);
      for (pos = 0; pos < nLeafsNonNull; pos++) {
        _leafs[pos] = hash_node(_leafs[2 * pos], _leafs[2 * pos + 1]);      
      }
      for (pos = nLeafsNonNull; pos < nLeafs; pos++) {
        _leafs[pos] = NULL_BYTES32;      
      } 
  }
  return _leafs[0];
}

function verify(root, proof, leafHash, leafPos) {
  for (pos = 0; pos < proof.length; pos++) {
      if ((leafPos % 2) == 0) {
          leafHash = hash_node(leafHash, proof[pos]);
      } else {
          leafHash = hash_node(proof[pos], leafHash);
      }
      leafPos = Math.floor(leafPos/2);
  }     
  return root == leafHash;   
}



// proof that leafs[leafPos] is the correct leaf in its MerkleTree
function buildProof(leafPos, leafs, nLevels) {
  _leafs = [...leafs];
  nLeafs = 2**nLevels;
  assert.equal(_leafs.length, nLeafs, "number of leafs is not = pow(2,nLevels)");
  proof = [];
  // The 1st element is just its pair
  proof.push( 
    ((leafPos % 2) == 0) ? _leafs[leafPos+1] : _leafs[leafPos-1]
  );
  // The rest requires computing all hashes
  for (level = 0; level < nLevels-1; level++) {
      nLeafs = Math.floor(nLeafs/2);
      leafPos = Math.floor(leafPos/2);
      for (pos = 0; pos < nLeafs; pos++) {
          _leafs[pos] = hash_node(_leafs[2 * pos], _leafs[2 * pos + 1]);      
      }
      proof.push(
        ((leafPos % 2) == 0) ? _leafs[leafPos+1] : _leafs[leafPos-1]
      );
  }
  return proof;
}

function getBaseLog(base, x) {
  return Math.log(x) / Math.log(base);
}

function revertArray(arr) {
  n = arr.length;
  return Array.from(arr, (x,i) => arr[n-1-i]);
}


// it returns a struct where:
//  * $L_{ch} = 0$: one Merkle Root H
//  * $L_{ch} = 1$: $N_{leafs/root}$ roots
//  * $L_{ch} = 2$: $(N_{leafs/root})^2$ roots
//  * ...
//  * $L_{ch} = N_{ch}$: $(N_{leafs/root})^{N_{ch}} = N_{leafs}$ roots (aka leafs)function buildMerkleStruct(leafs, nLeafsPerRoot) {
// Note that it builds them from the bottom to the top, and at the end, reverts them.
function buildMerkleStruct(leafs, nLeafsPerRoot, levelVerifiableByBC) {
  levelsPerRoot = Math.floor(Math.log2(nLeafsPerRoot));
  assert.equal(nLeafsPerRoot, 2**levelsPerRoot, "nLeafsPerRoot must be a power of 2");
  nTotalLeagues = leafs.length;
  
  nRootsAtBottomLevel = nLeafsPerRoot**(levelVerifiableByBC-2);
  rootsAtBottomLevel = Array.from(new Array(nRootsAtBottomLevel), (x,i) => NULL_BYTES32);
  
  for (l = 0; l < nTotalLeagues; l++) {
    rootsAtBottomLevel[l] = merkleRoot(leafs[l], 10);
  }
  rootsPerLevel = [];
  rootsPerLevel.push([...rootsAtBottomLevel]);
  leafsAtThisLevel = [...rootsAtBottomLevel];

  for (ch = 0; ch < (levelVerifiableByBC-2); ch++) {
      rootsAtThisLevel = [];
      assert.equal(leafsAtThisLevel.length % nLeafsPerRoot, 0, "wrong number of leafs");
      nRootsToCompute = leafsAtThisLevel.length/nLeafsPerRoot;
      for (n = 0; n < nRootsToCompute; n++) {
          left = n * nLeafsPerRoot;
          right = (n+1)*nLeafsPerRoot
          thisRoot = merkleRoot(leafsAtThisLevel.slice(left, right), levelsPerRoot);
          rootsAtThisLevel.push(thisRoot)
      }
      leafsAtThisLevel = [...rootsAtThisLevel];
      rootsPerLevel.push([...rootsAtThisLevel]);
  }
  // check that the last value coinicides with the merkle root computed from the ground up
  assert.equal(
      rootsAtThisLevel[0],
      merkleRoot(rootsAtBottomLevel, nLev = Math.log2(nRootsAtBottomLevel)),
      "the merkle struct built does not have a correct merkle root"
  );
  return revertArray(rootsPerLevel);
}
  
function getRootsBelowRootAtLevel(merkleStruct, level, pos, nLeafsPerRoot) {
  // previous level had nLeafsPerRoot^(level) roots, and pos is one idx in this range.
  // this level has nLeafsPerRoot^(level+1) roots
  left = pos * nLeafsPerRoot;
  right = (pos+1) * nLeafsPerRoot;
  return merkleStruct[level + 1].slice(left,right);
}

function getCallengedPosPerLevel(currentLevel, posArray, nLeafsPerRoot) {
  posInLevels = [0];
  for (l = 0; l <= currentLevel; l++) {
    posInLevels.push(posInLevels[l] * nLeafsPerRoot + posArray[l]);
  }
  return posInLevels;  
}

//                      .
//     .        o        .        .  (ch = 7, provided ..x.)
//  . . . .  . . x .  . . . .  . . . . (comes from 7) (ch = 3)
//  .... .... .... ....    .... .... ....
function getDataToChallenge(posArray, leafs, merkleStruct, nLeafsPerRoot, levelVerifiableByBC) {
  // first it returns the proof needed to verify that 
  // merkleStruct[level][pos] was part of the previous commit
  // then it provides de leafs that form merkleStruct[level][pos]
  // only works for level > 0
  // build posInLevels = [0, pos0, pos0*nLevels + pos1, ...]
  assert.equal(posArray[0], 0, "zeroth level only has 1 root, so only leaf 0 can be challenged");
  posArray = posArray.slice(1);
  const level = posArray.length;

  assert.equal(level < (levelVerifiableByBC-1), true, "this function should not be used to prepare final BC-verifiable challenges");

  if (level == 0) {
    root = merkleStruct[0][0];
    proof = [];
    roots2submit = merkleStruct[1];
    return [root, proof, roots2submit];
  }

  const nLevelsPerRoot = Math.log2(nLeafsPerRoot);
  posInLevels = getCallengedPosPerLevel(level, posArray, nLeafsPerRoot)

  root = merkleStruct[level][posInLevels[level]];  // . . X .
  rootsSubmitted = getRootsBelowRootAtLevel(merkleStruct, level-1, posInLevels[level-1], nLeafsPerRoot);
  assert.equal(rootsSubmitted[posArray[level-1]], root, "wrong slice submitted");
  proof = buildProof(posArray[level-1], rootsSubmitted, nLevelsPerRoot);
  
  rootFromStruct = merkleRoot(rootsSubmitted, nLevelsPerRoot);
  assert.equal(verify(rootFromStruct, proof, root, posArray[level-1]), true, "proof not working");
  // done with checks

  var roots2submit;
  if (level == (levelVerifiableByBC-2)) {
    assert.equal(posInLevels[level] < leafs.length, true, "cannot query for a non existent league: TODO protect");
    roots2submit = leafs[posInLevels[level]]; 
    // double check proof before returning:
    assert.equal(merkleRoot(roots2submit, 10), root, "wrong choice of slice");
  } else {
    roots2submit = getRootsBelowRootAtLevel(merkleStruct, level, posInLevels[level], nLeafsPerRoot);
    // double check proof before returning:
    assert.equal(merkleRoot(roots2submit, nLevelsPerRoot), root, "wrong choice of slice");
  }
  return [root, proof, roots2submit];
}

  module.exports = {
    hash_node,
    merkleRoot,
    merkleRootZeroPad,
    verify,
    buildProof,
    buildMerkleStruct,
    getRootsBelowRootAtLevel,
    getDataToChallenge,
    computeLevelVerifiableByBC,
    getCallengedPosPerLevel
  }