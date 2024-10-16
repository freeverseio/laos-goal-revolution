pragma solidity >= 0.6.3;

/**
 @title Library of pure functions used by company to compute useful data
 @author Freeverse.io, www.freeverse.io
 @dev The name Privileged is due to expectation that this is only valid for later,
 @dev as the company, use the returned data to, e.g. offer BuyNow or Special players.
*/

import "../storage/ComputeSkills.sol";
import "../encoders/EncodingSkills.sol";
import "../encoders/EncodingSkillsGetters.sol";
import "../encoders/EncodingSkillsSetters.sol";
import "../encoders/EncodingIDs.sol";

contract Privileged is ComputeSkills, EncodingSkills, EncodingSkillsGetters, EncodingSkillsSetters, EncodingIDs {
    
    uint256 public constant MAX_RND = 68719476735; /// Max random number used in throwDice

    /// order of idxs:
    /// skills: shoot, speed, pass, defence, endurance
    /// birthTraits: potential, forwardness, leftishness, aggressiveness
    /// prefPosition: GoalKeeper, Defender, Midfielder, Forward, MidDefender, MidAttacker
    /// leftishness:   0: 000, 1: 001, 2: 010, 3: 011, 4: 100, 5: 101, 6: 110, 7: 111

    function createSpecialPlayer(
        uint32[N_SKILLS] memory skillsVec,
        uint256 ageInSecs,
        uint8[4] memory birthTraits,
        uint256 playerId,
        uint256 nowInSecs
    ) 
        public 
        pure 
        returns (uint256) 
    {
        uint256 dayOfBirth = (nowInSecs - ageInSecs/INGAMETIME_VS_REALTIME)/86400; /// 86400 = secsInDay
        uint32 sumSkills;
        for (uint8 s = 0; s < N_SKILLS; s++) sumSkills += skillsVec[s];
        uint256 skills = encodePlayerSkills(
            skillsVec, 
            dayOfBirth, 
            0,
            playerId, 
            birthTraits, 
            false, 
            false, 
            0, 
            0, 
            false, 
            sumSkills
        );
        return addIsSpecial(skills);
    }
    
    /// returns a value relative to 10000
    /// Relative to 1, it would be = age < 31) ? 1.7 - 0.7/15 * (age - 16) : 1 - 0.08 * (age - 31)
    function ageModifier(uint256 ageYears) public pure returns(uint256) {
        return (ageYears < 31) ? 17000 - 466 * (ageYears - 16) : 10000 - 800 * (ageYears - 31);
    }

    /// returns a value relative to 10000
    /// relative to 1 it would be = 0.5 + 1.5 * potential * ( so that it ranges in [0.5, 2]
    /// relative to 1e4: 5000+10000*p*1.2/10 = 5000+1200*p
    function potentialModifier(uint256 potential) public pure returns(uint256) {
        return (5000 + 1200 * potential);
    }
    
    function computeAvgSkills(uint256 playerValue, uint256 ageYears, uint8 potential) public pure returns (uint256) {
        return (playerValue * 100000000)/(ageModifier(ageYears) * potentialModifier(potential));
    }
    
    function createBuyNowPlayerIdPure(
        uint256 playerValue, 
        uint8 maxPotential,
        uint256 seed, 
        uint8 forwardPos,
        uint8 tz,
        uint256 countryIdxInTZ
    ) 
        public 
        pure 
        returns(uint32[N_SKILLS] memory skillsVec, uint256 ageYears, uint8[4] memory birthTraits, uint256 internalPlayerId) 
    {
        require(maxPotential < 10, "potential out of bouds");
        uint8 potential = uint8(seed % (maxPotential+1));
        seed /= 10;
        ageYears = 16 + (seed % 20);
        seed /= 20;
        uint8 shirtNum;
        if (forwardPos == IDX_GK) {
            shirtNum = uint8(seed % 2);
        } else if (forwardPos == IDX_D) {
            shirtNum = 2 + uint8(seed % 5);
        } else if (forwardPos == IDX_M) {
            shirtNum = 7 + uint8(seed % 7);
        } else if (forwardPos == IDX_F) {
            shirtNum = 14 + uint8(seed % 4);
        }
        seed /= 8;
        (skillsVec, birthTraits, ) = computeSkills(seed, shirtNum, potential);
        for (uint8 sk = 0; sk < N_SKILLS; sk++) {
            skillsVec[sk] = uint16(
                (uint256(skillsVec[sk]) * computeAvgSkills(playerValue, ageYears, potential))/uint256(1000)
            );
        }
        internalPlayerId = encodeTZCountryAndVal(tz, countryIdxInTZ, seed % 268435455); /// maxPlayerIdxInCountry (28b) = 2**28 - 1 = 268435455
    }

    /// birthTraits = [potential, forwardness, leftishness, aggressiveness]
    function createBuyNowPlayerId(
        uint256 playerValue, 
        uint8 maxPotential,
        uint256 seed, 
        uint8 forwardPos,
        uint256 epochInDays,
        uint8 tz,
        uint256 countryIdxInTZ
    ) 
        public 
        pure 
        returns
    (
        uint256 playerId,
        uint32[N_SKILLS] memory skillsVec, 
        uint16 dayOfBirth, 
        uint8[4] memory birthTraits, 
        uint256 internalPlayerId
    )
    {
        uint256 ageYears;
        (skillsVec, ageYears, birthTraits, internalPlayerId) = createBuyNowPlayerIdPure(playerValue, maxPotential, seed, forwardPos, tz, countryIdxInTZ);
        /// 1 year = 31536000 sec
        playerId = createSpecialPlayer(skillsVec, ageYears * 31536000, birthTraits, internalPlayerId, epochInDays*24*3600);
        dayOfBirth = uint16(getBirthDay(playerId));
    }
    
    function createBuyNowPlayerIdBatch(
        uint256 playerValue, 
        uint8 maxPotential,
        uint256 seed, 
        uint8[4] memory nPlayersPerForwardPos,
        uint256 epochInDays,
        uint8 tz,
        uint256 countryIdxInTZ
    ) 
        public 
        pure 
        returns
    (
        uint256[] memory playerIdArray,
        uint32[N_SKILLS][] memory skillsVecArray, 
        uint16[] memory dayOfBirthArray, 
        uint8[4][] memory birthTraitsArray, 
        uint256[] memory internalPlayerIdArray
    )
    {
        uint16 counter;
        for (uint8 pos = 0; pos < 4; pos++) { counter += nPlayersPerForwardPos[pos]; }

        playerIdArray = new uint256[](counter);
        skillsVecArray = new uint32[N_SKILLS][](counter);
        dayOfBirthArray = new uint16[](counter);
        birthTraitsArray = new uint8[4][](counter);
        internalPlayerIdArray = new uint256[](counter);

        counter = 0;
        for (uint8 pos = 0; pos < 4; pos++) { 
            for (uint16 n = 0; n < nPlayersPerForwardPos[pos]; n++) {
                seed = uint256(keccak256(abi.encode(seed, n)));
                (playerIdArray[counter], skillsVecArray[counter], dayOfBirthArray[counter], birthTraitsArray[counter], internalPlayerIdArray[counter]) =
                    createBuyNowPlayerId(playerValue, maxPotential, seed, pos, epochInDays, tz, countryIdxInTZ);
                counter++;
            }
        }
    }
    
    function getTZandCountryIdxFromPlayerId(uint256 playerId) public pure returns (uint8 tz, uint256 countryIdxInTZ) {
        (tz, countryIdxInTZ, ) = decodeTZCountryAndVal(getInternalPlayerId(playerId));
    } 

    function createBuyNowPlayerIdPureV2(
        uint32[2] memory levelRanges, 
        uint32[10] memory potentialWeights,
        uint256 seed, 
        uint8 forwardPos,
        uint8 tz,
        uint256 countryIdxInTZ
    ) 
        public 
        pure 
        returns(uint32[N_SKILLS] memory skillsVec, uint256 ageYears, uint8[4] memory birthTraits, uint256 internalPlayerId) 
    {
        uint8 potential = throwDiceArray(potentialWeights, seed % MAX_RND);  
        seed /= 10;
        ageYears = 16 + (seed % 20);
        seed /= 20;
        uint8 shirtNum;
        if (forwardPos == IDX_GK) {
            shirtNum = uint8(seed % 2);
        } else if (forwardPos == IDX_D) {
            shirtNum = 2 + uint8(seed % 5);
        } else if (forwardPos == IDX_M) {
            shirtNum = 7 + uint8(seed % 7);
        } else if (forwardPos == IDX_F) {
            shirtNum = 14 + uint8(seed % 4);
        }
        seed /= 8;
        (skillsVec, birthTraits, ) = computeSkills(seed, shirtNum, potential);
        uint256 targetLevel = uint256(levelRanges[0]) + ((seed % 1000000) * uint256(levelRanges[1]- levelRanges[0])) / 1000000;
        recascaleToTarget(skillsVec, targetLevel, seed);
        internalPlayerId = encodeTZCountryAndVal(tz, countryIdxInTZ, seed % 268435455); /// maxPlayerIdxInCountry (28b) = 2**28 - 1 = 268435455
    }

    function divideAndCeil(uint256 numerator, uint256 denominator) public pure returns (uint256) {
        uint256 quotient = numerator / denominator;
        return (numerator == quotient * denominator) ? quotient : (quotient + 1);
    }

    function recascaleToTarget(uint32[N_SKILLS] memory skillsVec, uint256 targetLevel, uint256 seed) public pure {
        uint256 level;
        for (uint8 sk = 0; sk < N_SKILLS; sk++) { level += skillsVec[sk]; }

        uint256 tempLevel;
        for (uint8 sk = 0; sk < N_SKILLS; sk++) {
            skillsVec[sk] = uint32((uint256(skillsVec[sk]) * targetLevel * 1000) / level);
            tempLevel += divideAndCeil(uint256(skillsVec[sk]), 1000);
        }

        // It could be that we reached a level up to +5 from target due to use of ceiling.
        // If so, decrease by 1000 some skills, starting with a random skill, until you reach correct level.
        // Do not repeat attempts more than 5 times.
        uint8 skToFineTune = uint8(seed % N_SKILLS);
        uint8 attempts = 0;

        while((tempLevel > targetLevel) && (attempts < 6)) {
            if (skillsVec[skToFineTune] > 1300) {
                skillsVec[skToFineTune] -= 1000;
                tempLevel -= 1;
            }
            skToFineTune = (skToFineTune + 1) % N_SKILLS;
            attempts++;
        }
        return;
    }

    /// birthTraits = [potential, forwardness, leftishness, aggressiveness]
    function createBuyNowPlayerIdV2(
        uint32[2] memory levelRanges, 
        uint32[10] memory potentialWeights,
        uint256 seed, 
        uint8 forwardPos,
        uint256 epochInDays,
        uint8 tz,
        uint256 countryIdxInTZ
    ) 
        public 
        pure 
        returns
    (
        uint256 playerId,
        uint32[N_SKILLS] memory skillsVec, 
        uint16 dayOfBirth, 
        uint8[4] memory birthTraits, 
        uint256 internalPlayerId
    )
    {
        uint256 ageYears;
        (skillsVec, ageYears, birthTraits, internalPlayerId) = createBuyNowPlayerIdPureV2(levelRanges, potentialWeights, seed, forwardPos, tz, countryIdxInTZ);
        /// 1 year = 31536000 sec
        playerId = createSpecialPlayer(skillsVec, ageYears * 31536000, birthTraits, internalPlayerId, epochInDays*24*3600);
        dayOfBirth = uint16(getBirthDay(playerId));
    }

    function createBuyNowPlayerIdBatchV2(
        uint32[2] memory levelRanges, 
        uint32[10] memory potentialWeights, 
        uint256 seed, 
        uint8[4] memory nPlayersPerForwardPos,
        uint256 epochInDays,
        uint8 tz,
        uint256 countryIdxInTZ
    ) 
        public 
        pure 
        returns
    (
        uint256[] memory playerIdArray,
        uint32[N_SKILLS][] memory skillsVecArray, 
        uint16[] memory dayOfBirthArray, 
        uint8[4][] memory birthTraitsArray, 
        uint256[] memory internalPlayerIdArray
    )
    {
        uint16 counter;
        for (uint8 pos = 0; pos < 4; pos++) { counter += nPlayersPerForwardPos[pos]; }

        playerIdArray = new uint256[](counter);
        skillsVecArray = new uint32[N_SKILLS][](counter);
        dayOfBirthArray = new uint16[](counter);
        birthTraitsArray = new uint8[4][](counter);
        internalPlayerIdArray = new uint256[](counter);

        counter = 0;
        for (uint8 pos = 0; pos < 4; pos++) { 
            for (uint16 n = 0; n < nPlayersPerForwardPos[pos]; n++) {
                seed = uint256(keccak256(abi.encode(seed, n)));
                (playerIdArray[counter], skillsVecArray[counter], dayOfBirthArray[counter], birthTraitsArray[counter], internalPlayerIdArray[counter]) =
                    createBuyNowPlayerIdV2(levelRanges, potentialWeights, seed, pos, epochInDays, tz, countryIdxInTZ);
                counter++;
            }
        }
    }
    
    //// @dev Throws any number of dice and returns the winner's idx.
    //// @dev Following the explanation above, consider this limits:
    function throwDiceArray(uint32[10] memory weights, uint256 rndNum) private pure returns(uint8 w) {
        uint256 uniformRndInSumOfWeights;
        for (w = 0; w < weights.length; w++) {
            uniformRndInSumOfWeights += uint256(weights[w]);
        }
        /// if all weights are null, return uniform chance
        if (uniformRndInSumOfWeights == 0) return uint8(rndNum % weights.length);

        uniformRndInSumOfWeights *= rndNum;
        uint256 maxRndPlusOne = MAX_RND + 1;
        uint256 cumSum = 0;
        for (w = 0; w < weights.length-1; w++) {
            cumSum += uint256(weights[w]);
            if( uniformRndInSumOfWeights < ( cumSum * maxRndPlusOne)) {
                return w;
            }
        }
        return w;
    }
}
