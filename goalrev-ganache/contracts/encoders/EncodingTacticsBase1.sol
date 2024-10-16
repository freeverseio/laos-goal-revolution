pragma solidity >= 0.6.3;

/**
 @title Subset library to serialize/deserialize match tactics decided by users
 @author Freeverse.io, www.freeverse.io
*/ 
 
contract EncodingTacticsBase1 {

    uint8 constant private PLAYERS_PER_TEAM_MAX  = 25;
    uint8 constant public NO_SUBST = 11;
    uint8 constant internal NO_LINEUP = PLAYERS_PER_TEAM_MAX; /// No player chosen in that position
    ///  Leftishness:   0: 000, 1: 001, 2: 010, 3: 011, 4: 100, 5: 101, 6: 110, 7: 111
    uint8 constant internal IDX_R = 1;
    uint8 constant internal IDX_C = 2;
    uint8 constant internal IDX_CR = 3;
    uint8 constant internal IDX_L = 4;
    uint8 constant internal IDX_LR = 5;
    uint8 constant internal IDX_LC = 6;
    uint8 constant internal IDX_LCR = 7;

    function encodeTactics(
        uint8[3] memory substitutions, 
        uint8[3] memory subsRounds, 
        uint8[14] memory lineup, 
        bool[10] memory extraAttack, 
        uint8 tacticsId
    ) 
        public 
        pure 
        returns (uint256) 
    {
        require(tacticsId < 64, "tacticsId should fit in 64 bit");
        uint256 encoded = uint256(tacticsId);
        for (uint8 p = 0; p < 10; p++) {
            encoded |= uint256(extraAttack[p] ? 1 : 0) << 6 + p;
        }          
        for (uint8 p = 0; p < 11; p++) {
            require(lineup[p] <= PLAYERS_PER_TEAM_MAX, "incorrect lineup entry");
            encoded |= uint256(lineup[p]) << 16 + 5 * p;
        }          
        for (uint8 p = 0; p < 3; p++) {
            require(substitutions[p] < 12, "incorrect lineup entry");
            require(subsRounds[p] < 12, "incorrect round");
            /// requirement: if there is no subst at "i", lineup[i + 11] = 25 + p (so that all lineups are different, and sortable)
            if (substitutions[p] == NO_SUBST) {
                require(lineup[p + 11] == NO_LINEUP, "incorrect lineup entry for no substituted player");
            }
            encoded |= uint256(lineup[p + 11]) << 16 + 5 * (p + 11);
            encoded |= uint256(substitutions[p]) << 86 + 4 * p;
            encoded |= uint256(subsRounds[p]) << 98 + 4 * p;
        }          
        return encoded;
    }
    
}
