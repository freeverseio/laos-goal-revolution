pragma solidity >= 0.6.3;

/**
 @title Subset library to serialize/deserialize match tactics decided by users
 @author Freeverse.io, www.freeverse.io
*/ 
 
contract EncodingTacticsBase3 {
    function getTacticsId(uint256 tactics) public pure returns(uint8) {
        return uint8(tactics & 63);
    }

    function getExtraAttack(uint256 tactics, uint8 p) public pure returns(bool) {
        return (((tactics >> (6 + p)) & 1) == 1 ? true : false); /// 2^1 - 1
    }
    
    function getFullExtraAttack(uint256 tactics) public pure returns(bool[10] memory extraAttack) {
        for (uint8 p = 0; p < 10; p++) {
            extraAttack[p] = (((tactics >> (6 + p)) & 1) == 1 ? true : false); /// 2^1 - 1
        }
    }

    function getSubstitution(uint256 tactics, uint8 p) public pure returns(uint8) {
        return uint8((tactics >> (86 + 4 * p)) & 15); /// 2^4 - 1
    }
    
    function getSubsRound(uint256 tactics, uint8 p) public pure returns(uint8) {
        return uint8(tactics >> (98 + 4 * p) & 15); /// 2^4 - 1
    }

    function getLinedUp(uint256 tactics, uint8 p) public pure returns(uint8) {
        return uint8((tactics >> (16 + 5 * p)) & 31); /// 2^5 - 1
    }
    
    function getFullLineUp(uint256 tactics) public pure returns(uint8[14] memory lineup) {
        for (uint8 p = 0; p < 14; p++) {
            lineup[p] = uint8((tactics >> (16 + 5 * p)) & 31); /// 2^5 - 1
        }
    }
}
