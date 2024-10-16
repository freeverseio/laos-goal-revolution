pragma solidity >= 0.6.3;

/**
 @title Subset of Library of functions to serialize matchLogs
 @author Freeverse.io, www.freeverse.io
 @dev see EncodingMatchLog.sol for full spec
*/

contract EncodingMatchLogBase4 {
    function getInGameSubsHappened(uint256 log, uint8 posInHalf, bool is2ndHalf) public pure returns (uint8) {
        uint8 offset = 167 + 2 * (posInHalf + (is2ndHalf ? 3 : 0));
        return uint8((log >> offset) & 3);
    }

    function setChangesAtHalfTime(uint256 log, uint8 nChanges) public pure returns(uint256) {
        return (log & ~(uint256(3) << 249)) | (uint256(nChanges) << 249);
    }

    function getChangesAtHalfTime(uint256 log) public pure returns(uint8 nChanges) {
        return uint8((log >> 249) & 3);
    }
}
