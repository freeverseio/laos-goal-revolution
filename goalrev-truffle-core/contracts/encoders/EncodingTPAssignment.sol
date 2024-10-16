pragma solidity >= 0.6.3;

import "../gameEngine/ErrorCodes.sol";

/**
 @title Library to serialize/deserialize assignment of Traning points by users
 @author Freeverse.io, www.freeverse.io
*/

/**
 Spec: 
 We have 5 buckets: GK, D, M, A, Special
 We need 5 TPperSkill per bucket 
      - 9 bit per each of the TPperSkill
      - such that sum(TPperSkill) < TP (except for special player)
 assignedTP encodes a total: 5 buckets * 5 TPperSKill * 9b + 1 totalTP * 9b + 5 for specialPlId = 239
 offsets:
      - TPperSkill: 0 --> 224
      - TP: 225 --> 233
      - specIf --> 234 -> 238
 9 bit for TP  => max val = 511
 5 bit for specialPlayer
 TP: all the available Training point earned in the previous match log
 specialPlayer: no specialPlayer if == 25
*/

contract EncodingTPAssignment is ErrorCodes {

    uint256 public constant MAX_PERCENT = 60; 
    uint8 private constant PLAYERS_PER_TEAM_MAX  = 25;
    uint8 public constant NO_PLAYER = PLAYERS_PER_TEAM_MAX; /// No player chosen
    
    function encodeTP(uint16 TP, uint16[25] memory TPperSkill, uint8 specialPlayer) public pure returns (uint256 encoded) {
        require(specialPlayer <= PLAYERS_PER_TEAM_MAX, "specialPlayer value too large");

        uint256 TP256 = uint256(TP);
        encoded = TP256 << 225;
        encoded |= uint256(specialPlayer) << 234;

        uint256 maxRHS = (TP256 < 4) ? 100 * TP256 : MAX_PERCENT * TP256;
        uint8 lastBucket = (specialPlayer == NO_PLAYER ? 4 : 5);
        for (uint8 bucket = 0; bucket < lastBucket; bucket++) {
            if (bucket == 4) {
                TP256 = (TP256 * 11)/10;
                maxRHS = (TP256 < 4) ? 100 * TP256 : MAX_PERCENT * TP256;
            }
            uint256 sum = 0;
            for (uint8 sk = 5 * bucket; sk < 5 * (bucket+1); sk++) {
                uint256 skill = uint256(TPperSkill[sk]);
                require(100*skill <= maxRHS, "one of the assigned TPs is too large");
                sum += skill;
                encoded |= skill << (9 * sk);
            }
            require(sum <= TP256, "sum of Traning Points is too large");
        }
    } 

    function decodeTP(uint256 encoded) public pure returns(uint16[25] memory TPperSkill, uint8 specialPlayer, uint16 TP, uint8) {
        uint256 TPtemp = (encoded >> 225) & 511;
        TP = uint16(TPtemp);
        specialPlayer = uint8((encoded >> 234) & 31);
        if (specialPlayer > PLAYERS_PER_TEAM_MAX) return (TPperSkill, specialPlayer, TP, ERR_TRAINING_SPLAYER); // specialPlayer value too large
        uint256 maxRHS = (TPtemp < 4) ? 100 * TPtemp : MAX_PERCENT * TPtemp;
        for (uint8 bucket = 0; bucket < 5; bucket++) {
            if (bucket == 4) {
                TPtemp = (TPtemp * 11)/10;
                maxRHS = (TPtemp < 4) ? 100 * TPtemp : MAX_PERCENT * TPtemp;
            }
            uint256 sum = 0;
            for (uint8 sk = 5 * bucket; sk < 5* (bucket+1); sk++) {
                uint256 skill = (encoded >> (9 * sk)) & 511;
                if (100*skill > maxRHS) return (TPperSkill, specialPlayer, TP, ERR_TRAINING_SINGLESKILL); // one of the assigned TPs is too large or too small
                TPperSkill[sk] = uint16(skill);
                sum += skill;
            }
            if (sum > TPtemp) return (TPperSkill, specialPlayer, TP, ERR_TRAINING_SUMSKILLS); // sum of Traning Points is too large"
        }
    } 
}
