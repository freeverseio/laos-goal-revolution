pragma solidity >= 0.6.3;

import "./UniverseInfo.sol";

/**
 @title View/Pure functions inherited by both Updates and Challenges contracts
 @author Freeverse.io, www.freeverse.io
*/

/// Warning: This contract must ALWAYS inherit UniverseInfo first, so that it ends up inheriting Storage first.
contract UpdatesView is UniverseInfo {

    function getLastUpdateTime(uint8 tz) public view returns(uint256) {
        require(tzExists(tz), "tz does not exist");
        return _lastUpdateTime[tz];
    }
    
    function getLastActionsSubmissionTime(uint8 tz) public view returns(uint256) {
        require(tzExists(tz), "tz does not exist");
        return _lastActionsSubmissionTime[tz];
    }
        
    function getNextVerseTimestamp() public view returns (uint256) { return _nextVerseTimestamp; }
    function getTimeZoneForRound1() public view returns (uint8) { return _timeZoneForRound1; }
    function getCurrentVerse() public view returns (uint256) { return _currentVerse; }
    function getCurrentVerseSeed() public view returns (bytes32) { return _currentVerseSeed; }

    function getRoot(uint8 tz, uint8 level, bool current) public view returns(bytes32) { 
        return (current) ? _roots[tz][_newestRootsIdx[tz]][level] : _roots[tz][1-_newestRootsIdx[tz]][level];
    }

    function getChallengeTime() public view returns (uint256) { return _challengeTime; }

    function getChallengeData(uint8 tz, bool current) public view returns(uint8, uint8, uint8) { 
        uint8 idx = current ? _newestRootsIdx[tz] : 1 - _newestRootsIdx[tz];
        return (idx, _challengeLevel[tz][idx], _levelVerifiableByBC[tz][idx]);
    }

    function getStatus(uint8 tz, bool current) public view returns(uint8, uint8, bool) { 
        uint8 idx = current ? _newestRootsIdx[tz] : 1 - _newestRootsIdx[tz];
        uint8 writtenLevel = _challengeLevel[tz][idx];
        return getStatusPure(now, _lastUpdateTime[tz], _challengeTime, writtenLevel);
    }
    
    function isTimeToUpdate(uint256 verse) public view returns(bool) {
        if (verse != _currentVerse) return false;
        (uint8 tz,,) = prevTimeZoneToUpdate();
        if (tz == NULL_TIMEZONE) return false;
        if (getLastUpdateTime(tz) >= getLastActionsSubmissionTime(tz)) return false;
        (,, bool isSettled) = getStatus(tz, true);
        return isSettled;
    }
    
    function getStatusPure(uint256 nowTime, uint256 lastUpdate, uint256 challengeTime, uint8 writtenLevel) public pure returns(uint8 finalLevel, uint8 nJumps, bool isSettled) {
        if (challengeTime == 0) return (writtenLevel, 0, nowTime > lastUpdate);
        uint256 numChallPeriods = (nowTime > lastUpdate) ? (nowTime - lastUpdate)/challengeTime : 0;
        finalLevel = (writtenLevel >= 2 * numChallPeriods) ? uint8(writtenLevel - 2 * numChallPeriods) : (writtenLevel % 2);
        nJumps = (writtenLevel - finalLevel) / 2;
        isSettled = nowTime > lastUpdate + (nJumps + 1) * challengeTime;
    }
    
    /// tz(n0)   : 11.30 = 0
    ///          : 21.00 = 11.30 + 9.30h
    /// tz(n)    : 11.30 + (n-n0)*1h
    ///          : 21.00 + (n-n0)*1h
    ///          : 11.30 + (n-n0)*1h + 24h * day (day = mDay/2)
    ///              = 11.30 + ( deltaN + 12 * mDay ) * 1h
    ///          : 21.00 + (n-n0) + 24h * day (day = (mDay-1)/2)
    ///              = 11.30 + (9.5 + deltaN + 12 * (mDay-1) ) * 1h
    /// add round * T_round = round * 7 * 24 * 3600 = round * DAYS_PER_ROUND * 24 * 1h
    /// 
    /// if even: 11.30 + ( deltaN + 12 * mDay + 24 * round * DAYS_PER_ROUND ) * 1h
    /// if odd:  11.30 + (9.5 + deltaN + 12 * (mDay-1) + 24 * round * DAYS_PER_ROUND ) * 1h
    ///        = 11.30 + (19 + 2*deltaN + 24 * (mDay-1) + 48 * round * DAYS_PER_ROUND ) * (1h/2)
    
    function getMatchUTC(uint8 tz, uint256 round, uint256 matchDay) public view returns(uint256 timeUTC) {
        require(tz > 0 && tz < 25, "timezone out of range");
        uint256 deltaN = (tz >= _timeZoneForRound1) ? (tz - _timeZoneForRound1) : ((tz + 24) - _timeZoneForRound1);
        if (matchDay % 2 == 0) {
            return _firstVerseTimeStamp + (deltaN + 12 * matchDay + 24 * DAYS_PER_ROUND * round) * 3600;
        } else {
            return _firstVerseTimeStamp + (19 + 2*deltaN + 24 * (matchDay-1) + 48 * DAYS_PER_ROUND * round) * 1800;
        }
    }

    function getMatchUTCInCurrentRound(uint8 tz, uint256 matchDay) public view returns(uint256 timeUTC) {
        return getMatchUTC(tz, getCurrentRound(tz), matchDay);
    }
    
    function getAllMatchdaysUTCInRound(uint8 tz, uint256 round) public view returns(uint256[MATCHDAYS_PER_ROUND] memory timesUTC) {
        for (uint8 m = 0; m < MATCHDAYS_PER_ROUND; m++) timesUTC[m] = getMatchUTC(tz, round, m);
    }

    function getAllMatchdaysUTCInCurrentRound(uint8 tz) public view returns(uint256[MATCHDAYS_PER_ROUND] memory timesUTC) {
        for (uint8 m = 0; m < MATCHDAYS_PER_ROUND; m++) timesUTC[m] = getMatchUTC(tz, getCurrentRound(tz), m);
    }

}
