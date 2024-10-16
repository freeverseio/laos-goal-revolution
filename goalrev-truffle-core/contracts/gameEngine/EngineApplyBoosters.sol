pragma solidity >= 0.6.3;

import "../encoders/EncodingTactics.sol";
import "../encoders/EncodingSkillsGetters.sol";
import "../encoders/EncodingSkillsSetters.sol";

/**
 @title Library to manage how boosters affect skills
 @author Freeverse.io, www.freeverse.io
*/

contract EngineApplyBoosters is EncodingSkillsSetters, EncodingSkillsGetters, EncodingTactics  {

    uint8 constant private PLAYERS_PER_TEAM_MAX = 25;
    uint8 constant public N_SKILLS = 5;

    /// skills order: shoot, speed, pass, defence, endurance
    function applyItemBoost(uint256[PLAYERS_PER_TEAM_MAX] memory linedUpSkills, uint256 tactics) public pure returns(uint256[PLAYERS_PER_TEAM_MAX] memory) {
        ( , uint16 itemId, uint32 boost) = getItemsData(tactics);
        if (itemId == 0) return linedUpSkills;
        uint8[N_SKILLS+1] memory skillsBoost = decodeBoosts(boost);
        for (uint8 p = 0; p < 14; p++) {
            uint256 skills = linedUpSkills[p];
            for (uint8 sk = 0; sk < N_SKILLS; sk++) {
                skills = setSkill(
                    skills, 
                    (getSkill(skills, sk) * (100 + skillsBoost[sk])) / 100,
                    sk
                );
            }
            linedUpSkills[p] = skills;
        }
        return linedUpSkills;
    }

}

