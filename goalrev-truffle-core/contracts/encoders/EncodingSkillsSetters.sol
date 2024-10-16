pragma solidity >= 0.6.3;

/**
 @title Setters for library to serialize/deserialize player skills
 @author Freeverse.io, www.freeverse.io
*/

contract EncodingSkillsSetters {

    function setSkill(uint256 encodedSkills, uint256 val, uint8 skillIdx) public pure returns (uint256) {
        return (encodedSkills & ~(uint256(1048575) << (20 * uint256(skillIdx)))) | (val << (20 * uint256(skillIdx)));
    }

    function setPotential(uint256 encodedSkills, uint256 val) public pure returns (uint256) {
        return (encodedSkills & ~(uint256(15) << 116)) | (val << 116);
    }

    function setAlignedEndOfFirstHalf(uint256 encodedSkills, bool val) public pure returns (uint256) {
        if (val) return (encodedSkills & ~(uint256(1) << 172)) | (uint256(1) << 172);
        else return (encodedSkills & ~(uint256(1) << 172));
    }

    function setSubstitutedFirstHalf(uint256 encodedSkills, bool val) public pure returns (uint256) {
        if (val) return (encodedSkills & ~(uint256(1) << 180)) | (uint256(1) << 180);
        else return (encodedSkills & ~(uint256(1) << 180));
    }

    function setRedCardLastGame(uint256 encodedSkills, bool val) public pure returns (uint256) {
        if (val) return (encodedSkills & ~(uint256(1) << 173)) | (uint256(1) << 173);
        else return (encodedSkills & ~(uint256(1) << 173));
    }

    function setInjuryWeeksLeft(uint256 encodedSkills, uint8 val) public pure returns (uint256) {
        return (encodedSkills & ~(uint256(7) << 177)) | (uint256(val) << 177);
    }

    function setSumOfSkills(uint256 encodedSkills, uint32 val) public pure returns (uint256) {
        return (encodedSkills & ~(uint256(524287) << 181)) | (uint256(val) << 181);
    }

    function setGeneration(uint256 encodedSkills, uint32 val) public pure returns (uint256) {
        return (encodedSkills & ~(uint256(255) << 205)) | (uint256(val) << 205);
    }

    function setGamesNonStopping(uint256 encodedSkills, uint8 val) public pure returns (uint256) {
        require(val < 8, "gamesNonStopping out of bound");
        return (encodedSkills & ~(uint256(7) << 174)) | (uint256(val) << 174);
    }

    function addIsSpecial(uint256 encodedSkills) public pure returns (uint256) {
        return (encodedSkills | (uint256(1) << 204));
    }
    
    function setOutOfGameFirstHalf(uint256 encodedSkills, bool val) public pure returns (uint256) {
        if (val) return (encodedSkills & ~(uint256(1) << 213)) | (uint256(1) << 213);
        else return (encodedSkills & ~(uint256(1) << 213));
    }
    
    function setYellowCardFirstHalf(uint256 encodedSkills, bool val) public pure returns (uint256) {
        if (val) return (encodedSkills & ~(uint256(1) << 214)) | (uint256(1) << 214);
        else return (encodedSkills & ~(uint256(1) << 214));
    }

}
