pragma solidity >= 0.6.3;

import "./UpdatesBase.sol";

/**
 @title Library of functions used to Challenge
 @author Freeverse.io, www.freeverse.io
 @dev Under construction. Only a small subset implemented yet
 @dev Currently, all functions in this contract are fully disabled.
*/

/// Warning: This contract must ALWAYS inherit UpdatesBase first, so that it ends up inheriting Storage before any other contract.
contract Challenges is UpdatesBase {

    function BCVerifableChallengeFake(bytes32[] memory leagueLeafs, bool forceSuccess) public {
        /// intData = [tz, level, levelVerifiable, idx]
        uint8[4] memory intData = _cleanTimeAcceptedChallenges();
        _assertFormallyCorrectChallenge(intData, 0, 0, new bytes32[](0) , leagueLeafs);
        require(intData[1] == intData[2] - 1, "this function must only be called for non-verifiable-by-BC challenges"); 
        require(forceSuccess, "fake challenge failed because it was told to fail");
        _completeSuccessfulVerifiableChallenge(intData);
    }

    function BCVerifableChallengeZeros(bytes32[] memory leagueLeafs) public {
        /// intData = [tz, level, levelVerifiable, idx]
        uint8[4] memory intData = _cleanTimeAcceptedChallenges();
        require(intData[1] == intData[2] - 1, "this function must only be called for non-verifiable-by-BC challenges"); 

        (, uint8 day, uint8 half) = prevTimeZoneToUpdate();
        require(areThereUnexpectedZeros(leagueLeafs, day, half), "challenge to unexpected zeros failed");
        _assertFormallyCorrectChallenge(intData, 0, 0, new bytes32[](0), leagueLeafs);
        _completeSuccessfulVerifiableChallenge(intData);
    }
    
    /// check that leagueLeafs.length == 640 has been done before calling this function (to preserve it being pure)
    function areThereUnexpectedZeros(bytes32[] memory leagueLeafs, uint8 day, uint8 half) public pure returns(bool) {
        if ((day == 0) && (half == 0)) {
            /// at end of 1st half we still do not have league points
            for (uint16 i = 0; i < 8; i++) {
                if (leagueLeafs[i] != 0) return true;
            }
            /// we do not have tactics, nor training, nor ML before
            for (uint16 team = 0; team < TEAMS_PER_LEAGUE; team++) {
                uint16 off = 128 + 64 * team;
                for (uint16 i = 25; i < 28; i++) {
                    if (leagueLeafs[off + i] != 0) return true;
                }
            }
        }
        /// every element of team from 28 to 32 is 0
        for (uint16 team = 0; team < TEAMS_PER_LEAGUE; team++) {
            uint16 off = 128 + 64 * team;
            for (uint16 i = 28; i < 32; i++) {
                if (leagueLeafs[off + i] != 0) return true;
                if (leagueLeafs[off+ 32 + i] != 0) return true;
            }
        }
        /// no goals after this day
        uint16 off = 8 + 8 * day;
        if (half == 1) off += 8;
        for (uint16 i = off; i < 128; i++) {
            if (leagueLeafs[i] != 0) return true;
        }
        return false;
    }
}
