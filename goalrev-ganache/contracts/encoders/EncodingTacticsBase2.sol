pragma solidity >= 0.6.3;

/**
 @title Subset library to serialize/deserialize match tactics decided by users
 @author Freeverse.io, www.freeverse.io
*/ 

contract EncodingTacticsBase2 {

    uint8 constant private PLAYERS_PER_TEAM_MAX = 25;
    uint8 constant private N_SKILLS = 5;

    function setStaminaRecovery(uint256 tactics, uint8[PLAYERS_PER_TEAM_MAX] memory vals) public pure returns(uint256) {

        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            require(vals[p] < 4, "staminaRecovery must be < 4");
            tactics = (tactics & ~(uint256(3) << (110 + 2*p))) | (uint256(vals[p]) << (110 + 2*p));
        }
        return tactics;
    }

    function setItemId(uint256 tactics, uint16 val) public pure returns(uint256) {
        require(val < 2**13, "staminaRecovery must be < 2**13");
        return (tactics & ~(uint256(8191) << 160)) | (uint256(val) << 160);
    }

    function setItemBoost(uint256 tactics, uint32 val) public pure returns(uint256) {
        return (tactics & ~(uint256(4294967295) << 173)) | (uint256(val) << 173);
    }
    
    function getItemsData(uint256 tactics) public pure returns(uint8[PLAYERS_PER_TEAM_MAX] memory staminas, uint16, uint32) {
        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            staminas[p] = uint8((tactics >> (110 + 2*p)) & 3);
        }
        return (
            staminas, 
            uint16((tactics >> 160) & 8191), 
            uint32((tactics >> 173) & 4294967295)
        );
    }
    
    /// bits: 5 skills * 6b per skill (max 64) + 2b for potential = 32b
    function encodeBoosts(uint8[N_SKILLS+1] memory skillsBoost) public pure returns(uint32 encoded) {
        require(skillsBoost[N_SKILLS] < 4, "cannot offer items that boost potential so much");
        for (uint8 sk = 0; sk <= N_SKILLS; sk++) {
            encoded |= (uint32(skillsBoost[sk]) << 6*sk);
        }
    }

    function decodeBoosts(uint32 encoded) public pure returns(uint8[N_SKILLS+1] memory skillsBoost) {
        for (uint8 sk = 0; sk <= N_SKILLS; sk++) {
            skillsBoost[sk] = uint8((encoded >> 6*sk) & 63);
        }
    }
    


}
