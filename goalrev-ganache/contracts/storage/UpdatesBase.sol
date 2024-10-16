pragma solidity >= 0.6.3;

import "./UpdatesView.sol";
import "./Merkle.sol";

/**
 @title Storage-writing Library inherited by both Updates and Challenges contracts
 @author Freeverse.io, www.freeverse.io
*/

contract UpdatesBase is UpdatesView, Merkle {
    
    event ChallengeResolved(uint8 tz, uint8 resolvedLevel, bool isSuccessful);
   
    function _cleanTimeAcceptedChallenges() internal returns (uint8[4] memory intData) {
        /// intData encapsulates various variables, required due to avoid stack overflow
        /// intData = [tz, level, levelVerifiable, idx]
        (intData[0],,) = prevTimeZoneToUpdate();
        require(intData[0] != NULL_TIMEZONE, "cannot challenge the null timezone");
        (intData[3], intData[1], intData[2]) = getChallengeData(intData[0], true);

        (uint8 finalLevel, uint8 nJumps, bool isSettled) = getStatus(intData[0], true);
        require(!isSettled, "challenging time is over for the current timezone");
        /// if there was 0 jumps, do nothing
        if (nJumps == 0) return intData;
        /// otherwise clean all data except for the lowest level
        require(intData[1] == finalLevel + 2 * nJumps, "challenge status: nJumps incompatible with writtenLevel and finalLevel");
        uint8 idx = _newestRootsIdx[intData[0]];
        for (uint8 j = 0; j < nJumps; j++) {
            uint8 levelAccepted = finalLevel + 2 * (j + 1);
            _roots[intData[0]][idx][levelAccepted] = 0;
            _roots[intData[0]][idx][levelAccepted-1] = 0;
            emit ChallengeResolved(intData[0], levelAccepted, true);
            emit ChallengeResolved(intData[0], levelAccepted - 1, false);
        }
        _challengeLevel[intData[0]][idx] = finalLevel;
        intData[1] = finalLevel;
    }
    
    function _assertFormallyCorrectChallenge(
        /// intData encapsulates various variables, required due to avoid stack overflow
        /// intData = [tz, level, levelVerifiable, idx]
        uint8[4] memory intData,
        bytes32 challLeaveVal, 
        uint256 challLeavePos, 
        bytes32[] memory proofChallLeave, 
        bytes32[] memory providedRoots
    ) 
        internal
        returns (bytes32)
    {
        /// intData = [tz, level, levelVerifiable, idx]
        intData = _cleanTimeAcceptedChallenges();

        /// build the root of the providedData
        bytes32 root;
        if (intData[1] + 2 >= intData[2]) {
            require(providedRoots.length == _leafsInLeague, "league leafs must have len 640");
            root = merkleRoot(providedRoots, _levelsInLastChallenge);
        } else {
            require(providedRoots.length == 2**uint256(_levelsInOneChallenge), "league leafs must have len 640");
            root = merkleRoot(providedRoots, _levelsInOneChallenge);
        }

        /// We first check that the provided roots are an actual challenge,
        /// hence leading to a root different from the one provided by previous challenge/update)
        if (intData[1] == 0) {
            /// at level 0, the value one challenges is the one written in the BC, so we don't use challLeaveVal (could be anything)
            /// and we don't need to verifiy that it belonged to a previous commit.
            require(root != getRoot(intData[0], 0, true), "provided leafs lead to same root being challenged");
        } else if ((intData[1] + 1) == intData[2]) {
            /// at last level, we just provide the league leaves provided by the last challenger,
            /// and we verify that they DO match with what is written.
            require(root == getRoot(intData[0], intData[1], true), "provided leafs lead to same root being challenged");
        } else {
            /// otherwise we also check that the challVal belonged to a previous commit
            require(root != challLeaveVal, "you are declaring that the provided leafs lead to same root being challenged");
            bytes32 prevRoot = getRoot(intData[0], intData[1], true);
            require(verify(prevRoot, proofChallLeave, challLeaveVal, challLeavePos), "merkle proof not correct");
        }
        return root;        
    }
    
    function _completeSuccessfulVerifiableChallenge(uint8[4] memory intData) internal {
        /// intData encapsulates various variables, required due to avoid stack overflow
        /// intData = [tz, level, levelVerifiable, idx]
        _roots[intData[0]][intData[3]][intData[1]] = 0;
        _challengeLevel[intData[0]][intData[3]] = intData[1] - 1;
        emit ChallengeResolved(intData[0], intData[1] + 1, true);
        emit ChallengeResolved(intData[0], intData[1], false);
        _stakers.update(intData[1]-1, msg.sender);
    }
}
