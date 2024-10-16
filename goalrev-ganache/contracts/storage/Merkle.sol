pragma solidity >= 0.6.3;

/**
 @title Standard Merkle Tree functions
 @author Freeverse.io, www.freeverse.io
*/

contract Merkle {
    
    bytes32 constant private NULL_BYTES32 = bytes32(0);

    /// This function will revert if nLevels = 0.
    /// nLeafs = 2**nLevels
    ///  nLevels = 1 => 3 leafs = lev1 - root /// lev0 - 2 leafs
    ///  nLevels = 2 => 7 leafs = lev2 - root /// lev1 - 2 leafs /// lev0 - 4 leafs
    function merkleRoot(bytes32[] memory leafs, uint256 nLevels) public pure returns(bytes32) {
        uint256 nLeafs = 2**nLevels;
        uint256 nLeafsNonNull = leafs.length;

        for (uint8 level = 0; level < nLevels; level++) {
            nLeafs /= 2;
            nLeafsNonNull = (nLeafsNonNull % 2 == 0) ? (nLeafsNonNull / 2) : ((nLeafsNonNull / 2) + 1);
            if (nLeafsNonNull > nLeafs) nLeafsNonNull = nLeafs;

            for (uint256 pos = 0; pos < nLeafsNonNull; pos++) {
                leafs[pos] = hash_node(leafs[2 * pos], leafs[2 * pos + 1]);      
            }
            for (uint256 pos = nLeafsNonNull; pos < nLeafs; pos++) {
                leafs[pos] = NULL_BYTES32;      
            }
        }
        return leafs[0];
    }
  
    function hash_node(bytes32 left, bytes32 right) public pure returns (bytes32 hash) {
        if ((right == NULL_BYTES32) && (left == NULL_BYTES32)) return NULL_BYTES32;
        assembly {
            mstore(0x00, left)
            mstore(0x20, right)
            hash := keccak256(0x00, 0x40)
        }
        return hash;
    }

    /// if nLevels = 1, we need 1 element in the proof
    /// if nLevels = 2, we need 2 elements...
    ///        .
    ///     ..   ..
    ///   .. .. .. ..
    ///   01 23 45 67
    
    function verify(bytes32 root, bytes32[] memory proof, bytes32 leafHash, uint256 leafPos) public pure returns(bool) {
        for (uint32 pos = 0; pos < proof.length; pos++) {
            if ((leafPos % 2) == 0) {
                leafHash = hash_node(leafHash, proof[pos]);
            } else {
                leafHash = hash_node(proof[pos], leafHash);
            }
            leafPos /= 2;
        }     
        return root == leafHash;   
    }
    
    function buildProof(uint256 leafPos, bytes32[] memory leafs, uint256 nLevels) public pure returns(bytes32[] memory proof) {
        uint256 nLeafs = 2**nLevels;
        require(leafs.length == nLeafs, "number of leafs is not = pow(2,nLevels)");
        proof = new bytes32[](nLevels);
        /// The 1st element is just its pair
        proof[0] = ((leafPos % 2) == 0) ? leafs[leafPos+1] : leafs[leafPos-1];
        /// The rest requires computing all hashes
        for (uint8 level = 0; level < nLevels-1; level++) {
            nLeafs /= 2;
            leafPos /= 2; 
            for (uint256 pos = 0; pos < nLeafs; pos++) {
                leafs[pos] = hash_node(leafs[2 * pos], leafs[2 * pos + 1]);      
            }
            proof[level + 1] = ((leafPos % 2) == 0) ? leafs[leafPos+1] : leafs[leafPos-1];
        }
    }
    
}
