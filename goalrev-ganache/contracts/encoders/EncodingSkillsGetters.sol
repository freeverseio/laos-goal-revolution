pragma solidity >= 0.6.3;

/**
 @title Getters for library to serialize/deserialize player skills
 @author Freeverse.io, www.freeverse.io
*/

contract EncodingSkillsGetters {

    function getSkill(uint256 encodedSkills, uint8 skillIdx) public pure returns (uint256) {
        return (encodedSkills >> (uint256(skillIdx) * 20)) & 1048575; /// 1048575 = 2**20 - 1
    }

    function getBirthDay(uint256 encodedSkills) public pure returns (uint256) {
        return (encodedSkills >> 100) & 65535;
    }

    function getPlayerIdFromSkills(uint256 encodedSkills) public pure returns (uint256) {
        return (getIsSpecial(encodedSkills)) ? encodedSkills : getInternalPlayerId(encodedSkills);
    }

    function getInternalPlayerId(uint256 encodedSkills) public pure returns (uint256) {
        return uint256(encodedSkills >> 129 & 8796093022207); /// 2**43 - 1 = 8796093022207
    }

    function getPotential(uint256 encodedSkills) public pure returns (uint256) {
        return uint256(encodedSkills >> 116 & 15);
    }

    function getForwardness(uint256 encodedSkills) public pure returns (uint256) {
        return uint256(encodedSkills >> 120 & 7);
    }

    function getLeftishness(uint256 encodedSkills) public pure returns (uint256) {
        return uint256(encodedSkills >> 123 & 7);
    }

    function getAggressiveness(uint256 encodedSkills) public pure returns (uint256) {
        return uint256(encodedSkills >> 126 & 7);
    }

    function getAlignedEndOfFirstHalf(uint256 encodedSkills) public pure returns (bool) {
        return (encodedSkills >> 172 & 1) == 1;
    }

    function getRedCardLastGame(uint256 encodedSkills) public pure returns (bool) {
        return (encodedSkills >> 173 & 1) == 1;
    }

    function getGamesNonStopping(uint256 encodedSkills) public pure returns (uint8) {
        return uint8(encodedSkills >> 174 & 7);
    }

    function getInjuryWeeksLeft(uint256 encodedSkills) public pure returns (uint8) {
        return uint8(encodedSkills >> 177 & 7);
    }

    function getSubstitutedFirstHalf(uint256 encodedSkills) public pure returns (bool) {
        return (encodedSkills >> 180 & 1) == 1;
    }

    function getSumOfSkills(uint256 encodedSkills) public pure returns (uint256) {
        return uint256(encodedSkills >> 181 & 524287); /// 2**19-1
    }
    
    function getIsSpecial(uint256 encodedSkills) public pure returns (bool) {
        return uint256(encodedSkills >> 204 & 1) == 1; 
    }
     
    function getGeneration(uint256 encodedSkills) public pure returns (uint256) {
        return (encodedSkills >> 205) & 255;
    }

    function getOutOfGameFirstHalf(uint256 encodedSkills) public pure returns (bool) {
        return uint256(encodedSkills >> 213 & 1) == 1; 
    }    
    
    function getYellowCardFirstHalf(uint256 encodedSkills) public pure returns (bool) {
        return uint256(encodedSkills >> 214 & 1) == 1; 
    }
}
