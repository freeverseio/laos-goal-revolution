pragma solidity >= 0.6.3;

import "../storage/Constants.sol";

/**
 @title Library of pure functions to serialize/deserialize player skills
 @author Freeverse.io, www.freeverse.io
 @dev Due to contract-too-large-to-deploy, these functions had to be split into:
 @dev EncodingSkills (this contract, main constructor), EncodingGetters and EncodingSetters
*/

/**
 Here is the full spec of this serialization:

 PlayerSkills serializes a total of 213 bits:

 5 skills                  = 5 x 20 bits (offset: 0)
                           = shoot, speed, pass, defence, endurance
 dayOfBirth                = 16 bits  (since Unix time, max 180 years) (offset: 100)
 birthTraits               = variable num of bits: [potential, forwardness, leftishness, aggressiveness] (offset: 116)
 potential                 = 4 bits (number is limited to [0,...,9]) (offset: 116)
 forwardness               = 3 bits (offset: 120)
                             GK: 0, D: 1, M: 2, F: 3, MD: 4, MF: 5
 leftishness               = 3 bits, in boolean triads: (L, C, R): (offset: 123)
                             0: 000, 1: 001, 2: 010, 3: 011, 4: 100, 5: 101, 6: 110, 7: 111
 aggressiveness            = 3  (offset: 126)
 playerId                  = 43 bits (offset: 129)
 
 alignedEndOfLastHalf      = 1b (bool) (offset: 172)
 redCardLastGame           = 1b (bool) (offset: 173)
 gamesNonStopping          = 3b (0, 1, ..., 6). Finally, 7 means more than 6. (offset: 174)
 injuryWeeksLeft           = 3b  (offset: 177)
 substitutedFirstHalf      = 1b (bool) (offset: 180)
 sumSkills                 = 23b (must equal sum(skills), of if each is 20b, this can be at most 5x20b => use 23b) (offset 181)
 isSpecialPlayer           = 1b (offset: 204)
 generation                = 8b. From [0,...,31] => not-a-child, from [32,..63] => a child (offset: 205)
 outOfGameFirstHalf        = 1b (offset: 213)
 yellowCardFirstHalf       = 1b (offset: 214)
*/

contract EncodingSkills is Constants {

    function encodePlayerSkills(
        uint32[N_SKILLS] memory skills, 
        uint256 dayOfBirth, 
        uint8 generation,
        uint256 playerId, 
        uint8[4] memory birthTraits,
        bool alignedEndOfLastHalf, 
        bool redCardLastGame, 
        uint8 gamesNonStopping, 
        uint8 injuryWeeksLeft,
        bool substitutedFirstHalf,
        uint32 sumSkills
    )
        public
        pure
        returns (uint256 encoded)
    {
        /// checks:
        require(birthTraits[IDX_POT] < 10, "potential out of bound");
        require(birthTraits[IDX_FWD] < 6, "forwardness out of bound");
        require(birthTraits[IDX_LEF] < 8, "lefitshness out of bound");
        require(birthTraits[IDX_AGG] < 8, "aggressiveness out of bound");
        if (birthTraits[IDX_LEF] == 0) require(birthTraits[IDX_FWD] == 0, "leftishnes can only be zero for goalkeepers");
        require(gamesNonStopping < 8, "gamesNonStopping out of bound");
        require(dayOfBirth < 2**16, "dayOfBirthInUnixTime out of bound");
        require(playerId > 0 && playerId < 2**43, "playerId out of bound");

        /// start encoding:
        for (uint16 sk = 0; sk < N_SKILLS; sk++) {
            encoded |= uint256(skills[sk]) << 20 * sk;
        }
        encoded |= dayOfBirth << 100;
        encoded |= uint256(birthTraits[IDX_POT]) << 116;
        encoded |= uint256(birthTraits[IDX_FWD]) << 120;
        encoded |= uint256(birthTraits[IDX_LEF]) << 123;
        encoded |= uint256(birthTraits[IDX_AGG]) << 126;
        encoded |= playerId << 129;
        encoded |= uint256(alignedEndOfLastHalf ? 1 : 0) << 172;
        encoded |= uint256(redCardLastGame ? 1 : 0) << 173;
        encoded |= uint256(gamesNonStopping) << 174;
        encoded |= uint256(injuryWeeksLeft) << 177;
        encoded |= uint256(substitutedFirstHalf ? 1 : 0) << 180;
        encoded |= uint256(sumSkills) << 181;
        return (encoded | uint256(generation) << 205);
    }
}
