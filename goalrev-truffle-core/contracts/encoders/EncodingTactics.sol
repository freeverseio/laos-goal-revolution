pragma solidity >= 0.6.3;

import "../encoders/EncodingTacticsBase1.sol";
import "../encoders/EncodingTacticsBase2.sol";

/**
 @title Library to serialize/deserialize match tactics decided by users
 @author Freeverse.io, www.freeverse.io
 @dev Due to contract-too-large-to-deploy, these functions had to be split into Base1, Base2
*/
 
/**
 Spec: Tactics serializes a total of 3*4+3*4+14*5+10+6+25*2+13+32 = 205 bits.

 substitutions[3]    = 4 bit each = [3 different nums from 0 to 10], with 11 = no subs
 subsRounds[3]       = 4 bit each = [3 different nums from 0 to 11], round at which subs are to happen
 lineup[14]          = 5 bit each = [playerIdxInTeam1, ..., ]
 extraAttack[10]     = 1 bit each, 0: normal, 1: player has extra attack duties
 tacticsId           = 6 bit (0 = 442, 1 = 541, ...

 ...added by shop:  offsets: 110 -> 159, 160 -> 172, 173 -> 204...
 staminaRecovery[25] = 2 bit each => 50b ( 0 = none, 1 = 2 games, 2 = 4 games, 3 = full recovery)
 itemId              = 13 bit 
 itemEncodedBoost    = 32 bit
**/

contract EncodingTactics is EncodingTacticsBase1, EncodingTacticsBase2 {

}
