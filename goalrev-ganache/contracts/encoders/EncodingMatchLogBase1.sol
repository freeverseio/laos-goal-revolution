pragma solidity >= 0.6.3;
import "./EncodingMatchLogBase4.sol";

/**
 @title Subset of Library of functions to serialize matchLogs
 @author Freeverse.io, www.freeverse.io
 @dev see EncodingMatchLog.sol for full spec
*/

contract EncodingMatchLogBase1 is EncodingMatchLogBase4{

    uint256 private constant ONE256 = 1; 

    function addNGoals(uint256 log, uint8 goals) public pure returns (uint256) {
        return log + goals;
    }
    
    function addScoredPenalty(uint256 log, uint8 pos)  public pure returns (uint256) {
        return log | (ONE256 << (124 + pos));
    }

    function getOutOfGamePlayer(uint256 log, bool is2ndHalf)  public pure returns (uint256) {
        uint8 offset = is2ndHalf ? 141 : 131;
        return ((uint256(log) >> offset) & 15);
    }

    function getOutOfGameType(uint256 log, bool is2ndHalf)  public pure returns (uint256) {
        uint8 offset = is2ndHalf ? 141 : 131;
        return ((uint256(log) >> (offset + 4)) & 3);
    }

    function getOutOfGameRound(uint256 log, bool is2ndHalf)  public pure returns (uint256) {
        uint8 offset = is2ndHalf ? 141 : 131;
        return ((uint256(log) >> (offset + 6)) & 15);
    }

    function setOutOfGame(uint256 log, uint8 player, uint8 round, uint8 typeOfOutOfGame, bool is2ndHalf)  public pure returns (uint256) {
        uint8 offset = is2ndHalf ? 141 : 131;
        /// in total, we will write 4b + 2b + 4b = 10b
        log &= ~(uint256(1023) << offset); /// note: 2**10-1 = 1023
        log |= (uint256(player) << offset);
        log |= (uint256(typeOfOutOfGame) << (offset + 4));
        return log | (uint256(round) << (offset + 6));
    }

    function addYellowCard(uint256 log, uint8 player, uint8 posInHaf, bool is2ndHalf)  public pure returns (uint256) {
        uint8 offset = (is2ndHalf ? 159 : 151) + posInHaf * 4;
        return log | (uint256(player) << offset);
    }
    
    function getYellowCard(uint256 log, uint8 posInHaf, bool is2ndHalf)  public pure returns (uint8) {
        uint8 offset = (is2ndHalf ? 159 : 151) + posInHaf * 4;
        return uint8((log >> offset) & 15);
    }
    
    function setInGameSubsHappened(uint256 log, uint8 happenedType, uint8 posInHalf, bool is2ndHalf) public pure returns (uint256) {
        uint8 offset = 167 + 2 * (posInHalf + (is2ndHalf ? 3 : 0));
        return (log & ~(uint256(3) << offset)) | (uint256(happenedType) << offset);
    }

    /// recall that 0 means no subs, and we store here lineUp[p]+1 (where lineUp[p] = player shirt in the 25 that was substituted)
    function addHalfTimeSubs(uint256 log, uint8 player, uint8 pos)  public pure returns (uint256) {
        return log | (uint256(player) << (179 + 5 * pos));
    }

    function addNTot(uint256 log, uint8 nTot, bool is2ndHalf)  public pure returns (uint256) {
        return log | (uint256(nTot) << (202 + (is2ndHalf ? 4 : 0)));
    }

    function addTeamSumSkills(uint256 log, uint256 extraSumSkills)  public pure returns (uint256) {
        return log | (uint256(extraSumSkills) << 212);
    }

}
