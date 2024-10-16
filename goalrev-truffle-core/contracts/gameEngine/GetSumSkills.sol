pragma solidity >= 0.6.3;

/**
 @title Getters for library to serialize/deserialize player skills
 @author Freeverse.io, www.freeverse.io
*/

import "./SortValues25.sol";
import "../encoders/EncodingSkillsGetters.sol";

contract GetSumSkills is SortValues25, EncodingSkillsGetters {

    /// warning: getSumOfTopPlayerSkills rewrites the skills array
    /// this function returns the sum of the skills of the top 18 players in the team
    function getSumOfTopPlayerSkills(uint256[25] memory skills) public pure returns (uint256 teamSkills) {
        for (uint8 p = 0; p < 25; p++) {
            if (skills[p] != 0)
                skills[p] = getSumOfSkills(skills[p]);
        }
        sort25(skills);
        for (uint8 p = 0; p < 18; p++) { teamSkills += skills[p]; }
    }

}
