pragma solidity >= 0.6.3;

import "../encoders/EncodingSkillsGetters.sol";
import "../encoders/EncodingTacticsBase3.sol";

/**
 @title Library or pure functions, part of Engine
 @author Freeverse.io, www.freeverse.io
*/

contract EngineLib is EncodingSkillsGetters, EncodingTacticsBase3 {
    uint8 private constant BITS_PER_RND     = 36;   /// Number of bits allowed for random numbers inside match decisisons
    uint256 public constant MAX_RND         = 68719476735; /// Max random number allowed inside match decisions: 2^36-1
    /// /// Idxs for vector of globSkills: [0=move2attack, 1=globSkills[IDX_CREATE_SHOOT], 2=globSkills[IDX_DEFEND_SHOOT], 3=blockShoot, 4=currentEndurance]
    uint256 private constant SECS_IN_DAY    = 86400; /// 24 * 3600 

    //// Throws a dice that returns 0 with probability weight0/(weight0+weight1), and 1 otherwise.
    //// So, returning 0 has semantics: "the responsible for weight0 is selected".
    //// We return a uint8, not bool, to allow the return to be used as an idx in an array by the callee.
    //// The formula is derived as follows. Consider a segment which is the union of a segment of length w0, and one of length w1.
    ///      0, 1, ... w0-1 | w0 ... w0+w1-1
    ///  We want to get a random number in that segment: (w0+w1) * R/(maxR + 1)
    ///  w0 wins if (w0+w1) * R/(maxR + 1) < w0 => (w0+w1) * R < w0 * (maxR + 1)
    ///  w1 wins otherwise
    ///  Limits:
    ///  (w0 = 0, w1 != 0) => w0 never wins;   (w0 ! 0, w1 = 0) => w1 never wins;   
    ///  MAX_RND controls the resolution or fine-graining of the algorithm.
    function throwDice(uint256 weight0, uint256 weight1, uint256 rndNum) public pure returns(uint8) {
        /// if both weights are null, return approx 50% chance
        if (weight0 == 0 && weight1 == 0) return uint8(rndNum % 2);
        if( ( (weight0 + weight1) * rndNum ) < (weight0 * (MAX_RND +1)) ) {
            return 0;
        } else {
            return 1;
        }
    }

    //// @dev Generalization of the previous to any number of input weights
    //// @dev It therefore throws any number of dice and returns the winner's idx.
    //// @dev Following the explanation above, consider this limits:
    function throwDiceArray(uint256[] memory weights, uint256 rndNum) public pure returns(uint8 w) {
        uint256 uniformRndInSumOfWeights;
        for (w = 0; w < weights.length; w++) {
            uniformRndInSumOfWeights += weights[w];
        }
        /// if all weights are null, return uniform chance
        if (uniformRndInSumOfWeights == 0) return uint8(rndNum % weights.length);

        uniformRndInSumOfWeights *= rndNum;
        uint256 maxRndPlusOne = MAX_RND + 1;
        uint256 cumSum = 0;
        for (w = 0; w < weights.length-1; w++) {
            cumSum += weights[w];
            if( uniformRndInSumOfWeights < ( cumSum * maxRndPlusOne)) {
                return w;
            }
        }
        return w;
    }

    function getNRandsFromSeed(uint256 seed, uint8 nRnds) public pure returns (uint64[] memory) {
        uint256 currentBigRnd = uint256(keccak256(abi.encode(seed)));
        uint8 remainingBits = 255;
        uint64[] memory rnds = new uint64[](nRnds);
        for (uint8 n = 0; n < nRnds; n++) {
            if (remainingBits < BITS_PER_RND) {
                currentBigRnd = uint256(keccak256(abi.encode(seed, n)));
                remainingBits = 255;
            }
            rnds[n] = uint64(currentBigRnd & MAX_RND);
            currentBigRnd >>= BITS_PER_RND;
            remainingBits -= BITS_PER_RND;
        }
        return rnds;
    }

    function getNDefendersFromTactics(uint256 tactics) public pure returns (uint8) {
        uint8[9] memory playersPerZone = getPlayersPerZone(tactics);
        return 2 * playersPerZone[0] + playersPerZone[1];
    }

    function getNDefenders(uint8[9] memory playersPerZone) public pure returns (uint8) {
        return 2 * playersPerZone[0] + playersPerZone[1];
    }

    function getNMidfielders(uint8[9] memory playersPerZone) public pure returns (uint8) {
        return 2 * playersPerZone[3] + playersPerZone[4];
    }

    function getNAttackers(uint8[9] memory playersPerZone) public pure returns (uint8) {
        return 2 * playersPerZone[6] + playersPerZone[7];
    }
    
    /// TODO: can this be expressed as
    /// translates from a high level tacticsId (e.g. 442) to a format that describes how many
    /// players play in each of the 9 zones in the field (Def, Mid, Forw) x (L, C, R), 
    /// We impose left-right symmetry: DR = DL, MR = ML, FR = FL.
    /// So we only manage 6 numbers: [DL, DM, ML, MM, FL, FM], and force 
    function getPlayersPerZone(uint256 tactics) public pure returns (uint8[9] memory) {
        uint8 tacticsId = getTacticsId(tactics);
        if (tacticsId == 0) return [1,2,1,1,2,1,0,2,0];  /// 0 = 442
        if (tacticsId == 1) return [1,3,1,1,2,1,0,1,0];  /// 0 = 541
        if (tacticsId == 2) return [1,2,1,1,1,1,1,1,1];  /// 0 = 433
        if (tacticsId == 3) return [1,2,1,1,3,1,0,1,0];  /// 0 = 451
        if (tacticsId == 4) return [1,1,1,1,2,1,1,1,1];  /// 0 = 343
        if (tacticsId == 5) return [1,1,1,1,3,1,0,2,0];  /// 0 = 352
        if (tacticsId == 6) return [1,1,1,1,1,1,1,2,1];  /// 0 = 334
        if (tacticsId == 7) return [1,2,1,0,2,0,1,2,1];  /// 0 = 424
        if (tacticsId == 8) return [0,2,0,1,3,1,1,1,1];  /// 0 = 253
    }
}

