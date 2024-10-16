pragma solidity >= 0.6.3;

import "../storage/Constants.sol";

/**
 @title Pure function that computes skills at birth
 @author Freeverse.io, www.freeverse.io
*/


contract ComputeSkills is Constants {

    //// Compute the pseudorandom skills, sum of the skills is 5K (1K each skill on average)
    //// skills have currently, 16bits each, and there are 5 of them
    //// potential is a number between 0 and 9 => takes 4 bit
    //// 0: 000, 1: 001, 2: 010, 3: 011, 4: 100, 5: 101, 6: 110, 7: 111
    //// @return uint32[N_SKILLS] skills, uint8 potential, uint8 forwardness, uint8 leftishness
    function computeSkills(uint256 teamId, uint8 shirtNum, uint8 potential) public pure returns (uint32[N_SKILLS] memory, uint8[4] memory, uint32) {
        uint32[5] memory skills;
        uint256[N_SKILLS] memory correctFactor;
        uint256 dna = uint256(keccak256(abi.encode(teamId, shirtNum)));
        uint8 forwardness;
        uint8 leftishness;
        uint8 aggressiveness = uint8(dna % 4);
        dna >>= 2; /// log2(4) = 2
        /// correctFactor/10 increases a particular skill depending on player's forwardness
        if (shirtNum < 2) {
            /// 2 GoalKeepers:
            correctFactor[SK_SHO] = 14;
            correctFactor[SK_PAS] = 6;
            forwardness = IDX_GK;
            leftishness = 0;
        } else if (shirtNum < 7) {
            /// 5 Defenders
            correctFactor[SK_SHO] = 4;
            correctFactor[SK_DEF] = 16;
            forwardness = IDX_D;
            leftishness = uint8(1+ (dna % 7));
        } else if (shirtNum < 10) {
            /// 3 Pure Midfielders
            correctFactor[SK_PAS] = 16;
            forwardness = IDX_M;
            leftishness = uint8(1+ (dna % 7));
        } else if (shirtNum < 12) {
            /// 2 Defensive Midfielders
            correctFactor[SK_PAS] = 13;
            correctFactor[SK_SHO] = 7;
            forwardness = IDX_MD;
            leftishness = uint8(1+ (dna % 7));
        } else if (shirtNum < 14) {
            /// 2 Attachking Midfielders
            correctFactor[SK_PAS] = 13;
            correctFactor[SK_DEF] = 7;
            forwardness = IDX_MF;
            leftishness = uint8(1+ (dna % 7));
        } else if (shirtNum < 16) {
            /// 2 Forwards that play center-left
            correctFactor[SK_SHO] = 16;
            correctFactor[SK_DEF] = 5;
            forwardness = IDX_F;
            leftishness = 6;
        } else {
            /// 2 Forwards that play center-right
            correctFactor[SK_SHO] = 16;
            correctFactor[SK_DEF] = 5;
            forwardness = IDX_F;
            leftishness = 3;
        }
        dna >>= 3; /// log2(7) = 2.9 => ceil = 3                      

        //// Compute initial skills, as a random with [0, 49] 
        //// ...apply correction factor depending on preferred pos,
        uint32 excess;
        for (uint8 i = 0; i < N_SKILLS; i++) {
            if (correctFactor[i] == 0) {
                skills[i] = uint16(dna % 800);
            } else {
                skills[i] = uint16(((dna % 800) * correctFactor[i])/10);
            }
            excess += skills[i];
            dna >>= 10; /// los2(1000) -> ceil
        }
        /// at this point, excess is at most, last two cases: (1.6+0.7+3)*800 = 4240, so 5000-excess is safe
        /// and for GKS: (2+ 0.6 + 3)*800 = 4480, so 5000-excess is safe.
        uint32 delta;
        delta = (5000 - excess) / N_SKILLS;
        for (uint8 i = 0; i < N_SKILLS; i++) skills[i] = skills[i] + delta;
        /// note: final sum of skills = excess + N_SKILLS * delta;
        return (skills, [potential, forwardness, leftishness, aggressiveness], uint32(excess + N_SKILLS * delta));
    }
}