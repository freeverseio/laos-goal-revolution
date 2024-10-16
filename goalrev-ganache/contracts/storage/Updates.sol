pragma solidity >= 0.6.3;

import "./UpdatesBase.sol";

/**
 @title Manages Updates and Challenges game
 @author Freeverse.io, www.freeverse.io
 @dev It reports updates and challenges to the Stakers contract,
 @dev which is responsible of managing stakes and rewards accordingly
*/

/// Warning: This contract must ALWAYS inherit UpdatesBase first, so that it ends up inheriting Storage first.
contract Updates is UpdatesBase {
    event ActionsSubmission(uint256 verse, uint8 timeZone, uint8 day, uint8 turnInDay, bytes32 seed, uint256 submissionTime, bytes32 root, string ipfsCid);
    event TimeZoneUpdate(uint256 verse, uint8 timeZone, bytes32 root, uint256 submissionTime);
    event ChallengeAccepted(uint8 tz, uint8 newLevel, bytes32 root, bytes32[] providedRoots);
    event Inform(uint256 id, string content);
    
    function inform(uint256 id, string calldata content) external onlyRelay { emit Inform(id, content); }

    function setStakersAddress(address payable addr) external onlySuperUser { _stakers = Stakers(addr); }

    function setChallengeTime(uint256 newTime) external onlyCOO { _challengeTime = newTime; }

    function initUpdates(uint256 deployTimeInUnixEpochSecs) external onlyCOO {
        require(_timeZoneForRound1 == 0, "cannot initialize updates twice");
        /// the game starts at verse = 0. The transition to verse = 1 will be at the next exact hour.
        /// that will be the begining of Round = 1. So Round 1 starts at some timezone that depends on
        /// the call to the contract initTZs() function.
        /// TZ = 1 => starts at 1:00... TZ = 23 => starts at 23:00, TZ = 24, starts at 0:00
        uint256 secsOfDay   = deployTimeInUnixEpochSecs % (3600 * 24);
        uint256 hour        = secsOfDay / 3600;  /// 0, ..., 23
        uint256 minute      = (secsOfDay - hour * 3600) / 60; /// 0, ..., 59
        uint256 secs        = (secsOfDay - hour * 3600 - minute * 60); /// 0, ..., 59
        if (minute < 27) {
            _timeZoneForRound1 = normalizeTZ(uint8(hour));
            _nextVerseTimestamp = deployTimeInUnixEpochSecs + (29-minute)*60 + (60 - secs);
        } else {
            _timeZoneForRound1 = normalizeTZ(1+uint8(hour));
            _nextVerseTimestamp = deployTimeInUnixEpochSecs + (29-minute)*60 + (60 - secs) + 3600;
        }
        _firstVerseTimeStamp = _nextVerseTimestamp;
    }

    function submitActionsRoot(
        bytes32 actionsRoot, 
        bytes32 activeTeamsPerCountryRoot, 
        bytes32 orgMapRoot, 
        uint8 levelVerifiableByBC, 
        string calldata ipfsCid
    ) 
        external 
        onlyRelay 
    {
        require(now > _nextVerseTimestamp, "too early to accept actions root");
        /// make sure the last verse is settled
        (uint8 tz,,) = prevTimeZoneToUpdate();
        if (tz != NULL_TIMEZONE) {
            ( , , bool isSettled) = getStatus(tz, true);
            require(isSettled, "last verse is still under challenge period");
            _stakers.finalize();
        }
        uint8 day;
        uint8 turnInDay;
        (tz, day, turnInDay) = nextTimeZoneToUpdate();
        if(tz != NULL_TIMEZONE) {
            uint8 idx = 1 - _newestRootsIdx[tz];
            _newestRootsIdx[tz] = idx;
            _actionsRoot[tz][idx] = actionsRoot;
            _activeTeamsPerCountryRoot[tz][idx] = activeTeamsPerCountryRoot;
            _orgMapRoot[tz][idx] = orgMapRoot;
            _levelVerifiableByBC[tz][idx] = levelVerifiableByBC;
        }
        _lastActionsSubmissionTime[tz] = now;
        _incrementVerse();
        _setCurrentVerseSeed(blockhash(block.number-1));
        emit ActionsSubmission(_currentVerse, tz, day, turnInDay, blockhash(block.number-1), now, actionsRoot, ipfsCid);
    }

    /// accepts an update about the root of the current state of a timezone. 
    /// in order to accept it, either:
    ///  - timezone is null,
    ///  - timezone has not been updated yet (lastUpdate < _lastActionsSubmissionTime)
    function updateTZ(uint256 verse, bytes32 root) public {
        /// when actionRoots were submitted, nextTimeZone points to the future.
        /// so the timezone waiting for updates & challenges is provided by prevTimeZoneToUpdate()
        require(isTimeToUpdate(verse), "it is not time to update yet");
        (uint8 tz,,) = prevTimeZoneToUpdate();
        _setTZRoot(tz, root); /// first time that we update this TZ
        emit TimeZoneUpdate(_currentVerse, tz, root, now);
        _stakers.update(0, msg.sender);
    }

    function setAllowChallenges(bool areAllowed) external onlySuperUser { _allowChallenges = areAllowed; }

    /// TODO: specify which leaf you challenge!!! And bring Merkle proof!
    function challengeTZ(bytes32 challLeaveVal, uint256 challLeavePos, bytes32[] calldata proofChallLeave, bytes32[] calldata providedRoots) external {
        /// intData = [tz, level, levelVerifiable, idx]
        require(_allowChallenges, "challenges are currently not allowed");
        uint8[4] memory intData = _cleanTimeAcceptedChallenges();
        bytes32 root = _assertFormallyCorrectChallenge(
            intData,
            challLeaveVal, 
            challLeavePos, 
            proofChallLeave, 
            providedRoots
        );
        require(intData[1] < intData[2] - 1, "this function must only be called for non-verifiable-by-BC challenges");        
        /// accept the challenge and store new root, or let the BC verify challenge and revert to level - 1
        uint8 level = intData[1] + 1;
        _roots[intData[0]][intData[3]][level] = root;
        _challengeLevel[intData[0]][intData[3]] = level;
        emit ChallengeAccepted(intData[0], level, root, providedRoots);
        _lastUpdateTime[intData[0]] = now;
        _stakers.update(level, msg.sender);
    }

    /// TODO: remove this test function
    function setLevelVerifiableByBC(uint8 newVal) external onlyRelay {
        for (uint8 tz = 1; tz < 25; tz++) {
            _levelVerifiableByBC[tz][0] = newVal;
            _levelVerifiableByBC[tz][1] = newVal;
        }
    }
    
    function setChallengeLevels(uint16 levelsInOneChallenge, uint16 leafsInLeague, uint16 levelsInLastChallenge) external onlyRelay {
        _levelsInOneChallenge   = levelsInOneChallenge;
        _leafsInLeague          = leafsInLeague;
        _levelsInLastChallenge  = levelsInLastChallenge;
    }
    
    function _incrementVerse() private {
        _currentVerse += 1;
        _nextVerseTimestamp += SECS_BETWEEN_VERSES;
    }
    
    function _setCurrentVerseSeed(bytes32 seed) private {
        _currentVerseSeed = seed;
    }

    function _setTZRoot(uint8 tz, bytes32 root) private {
        uint8 idx = _newestRootsIdx[tz];
        _roots[tz][idx][0] = root;
        for (uint8 level = 1; level < MAX_CHALLENGE_LEVELS; level++) _roots[tz][idx][level] = 0;
        _lastUpdateTime[tz] = now;
    }
}
