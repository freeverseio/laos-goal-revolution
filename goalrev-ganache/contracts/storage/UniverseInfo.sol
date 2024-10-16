pragma solidity >= 0.6.3;

import "./Constants.sol";
import "./Storage.sol";
import "../encoders/EncodingIDs.sol";
import "../encoders/EncodingSkillsGetters.sol";

/**
 @title Library of View/Pure functions to needed by game assets and market
 @author Freeverse.io, www.freeverse.io
*/

/// Warning: This contract must ALWAYS inherit Storage first, so that it ends up inheriting the correct order in storage slots
contract UniverseInfo is Storage, EncodingSkillsGetters, EncodingIDs, Constants {
    
    event TeamTransfer(uint256 teamId, address to);

    /// Modifiers for all functions that write to Storage
    
    modifier onlyMarket() {
        require(msg.sender == _market, "Only market owner is authorized.");
        _;
    }

    modifier onlyRelay() {
        require(msg.sender == _relay, "Only Relay owner is authorized.");
        _;
    }
    
    modifier onlyCOO() {
        require(msg.sender == _COO, "Only COO is authorized.");
        _;
    }
    
    /// Rest of view/pure functions 
    
    function isBotTeamInCountry(uint8 timeZone, uint256 countryIdxInTZ, uint256 teamIdxInCountry) public view returns(bool) {
        return getOwnerTeamInCountry(timeZone, countryIdxInTZ, teamIdxInCountry) == NULL_ADDR;
    }

    function isBotTeam(uint256 teamId) public view returns(bool) {
        if (teamId == ACADEMY_TEAM) return false;
        return _teamIdToOwner[teamId] == NULL_ADDR;
    }

    /// returns NULL_ADDR if team is bot
    function getOwnerTeamInCountry(uint8 timeZone, uint256 countryIdxInTZ, uint256 teamIdxInCountry) public view returns(address) {
        if (!tzExists(timeZone) || !countryInTZExists(timeZone, countryIdxInTZ)) return NULL_ADDR;
        return _teamIdToOwner[encodeTZCountryAndVal(timeZone, countryIdxInTZ, teamIdxInCountry)];
    }
    
    function teamExistsInCountry(uint8 timeZone, uint256 countryIdxInTZ, uint256 teamIdxInCountry) public view returns(bool) {
        return (teamIdxInCountry < getNTeamsInCountry(timeZone, countryIdxInTZ));
    }

    function wasTeamCreatedVirtually(uint256 teamId) public view returns (bool) {
        (uint8 timeZone, uint256 countryIdxInTZ, uint256 teamIdxInCountry) = decodeTZCountryAndVal(teamId);
        return teamExistsInCountry(timeZone, countryIdxInTZ, teamIdxInCountry);
    }
    
    function getNDivisionsInCountry(uint8 timeZone, uint256 countryIdxInTZ) public view returns(uint256) {
        if (!tzExists(timeZone) || !countryInTZExists(timeZone, countryIdxInTZ)) return 0;
        return _countryIdToNDivisions[encodeTZCountryAndVal(timeZone, countryIdxInTZ, 0)];
    }

    function getNLeaguesInCountry(uint8 timeZone, uint256 countryIdxInTZ) public view returns(uint256) {
        return getNDivisionsInCountry(timeZone, countryIdxInTZ) * LEAGUES_PER_DIV;
    }

    function getNTeamsInCountry(uint8 timeZone, uint256 countryIdxInTZ) public view returns(uint256) {
        return getNLeaguesInCountry(timeZone, countryIdxInTZ) * TEAMS_PER_LEAGUE;
    }

    function getNHumansInCountry(uint8 timeZone, uint256 countryIdxInTZ) public view returns(uint256) {
        return _countryIdToNHumanTeams[encodeTZCountryAndVal(timeZone, countryIdxInTZ, 0)];
    }
    
    function wasPlayerCreatedVirtually(uint256 playerId) public view returns(bool) {
        (uint8 timeZone, uint256 countryIdxInTZ, uint256 playerIdxInCountry) = decodeTZCountryAndVal(playerId);
        return wasPlayerCreatedInCountry(timeZone, countryIdxInTZ, playerIdxInCountry);
    }

    function getCurrentRound(uint8 tz) public view returns (uint256) {
        return getCurrentRoundPure(tz, _timeZoneForRound1, _currentVerse);
    }

    function getCurrentRoundPure(uint8 tz, uint8 tz1, uint256 verse) public pure returns (uint256) { 
        /// first, compute "roundTZ1" for the first timezone that played a match
        /// first, ensure that round is always >= 1.
        if (verse < VERSES_PER_ROUND) return 0;
        uint256 roundTZ1 = verse / VERSES_PER_ROUND;
        /// Next, note that verses where this tz plays first matches of rounds:
        ///   verses(round) = deltaN * 4 + VERSES_PER_ROUND * round
        uint256 deltaN = (tz >= tz1) ? (tz - tz1) : ((tz + 24) - tz1);
        if (verse < 4 * deltaN + roundTZ1 * VERSES_PER_ROUND) {
            return roundTZ1 - 1;
        } else {
            return roundTZ1;
        }
    }
    
    function countryInTZExists(uint8 timeZone, uint256 countryIdxInTZ) public view returns(bool) {
        return(countryIdxInTZ < _tzToNCountries[timeZone]);
    }

    function wasPlayerCreatedInCountry(uint8 timeZone, uint256 countryIdxInTZ, uint256 playerIdxInCountry) public view returns(bool) {
        return (playerIdxInCountry < getNTeamsInCountry(timeZone, countryIdxInTZ) * PLAYERS_PER_TEAM_INIT);
    }
    
    /// each day has 24 hours, each with 4 verses => 96 verses per day.
    /// day = 0,..13
    /// turnInDay = 0, 1, 2, 3
    /// so for each TZ, we go from (day, turn) = (0, 0) ... (13,3) => a total of 14*4 = 56 turns per tz
    /// from these, all map easily to timeZones
    function nextTimeZoneToUpdate() public view returns (uint8 tz, uint8 day, uint8 turnInDay) {
        return timeZoneToUpdatePure(_currentVerse, _timeZoneForRound1);
    }

    function prevTimeZoneToUpdate() public view returns (uint8 tz, uint8 day, uint8 turnInDay) {
        if (_currentVerse == 0) {
            return (NULL_TIMEZONE, 0, 0);
        }
        return timeZoneToUpdatePure(_currentVerse - 1, _timeZoneForRound1);
    }

    /// tz0  : v = 0, V_DAY, 2 * V_DAY...
    /// tzN  : v = 4N + V_DAY * day,  day = 0,...6
    /// tzN  : v = 4N + V_DAY * day,  day = 0,...6
    ///  => tzN - tz0 = (v - V_DAY*day)
    ///  => 4 tzN = 4 tz0 + v % VERSES_PER_DAY
    /// last : v = V_DAY + DELTA + V_DAY * 6 
    /// Imagine 2 tzs:
    /// 0:00 - tz0; 0:30 - NUL; 1:00 - tz1; 1:30 - tz0; 0:00 - tz0; 0:30 - tz1;
    /// So the last
    function timeZoneToUpdatePure(uint256 verse, uint8 TZForRound1) public pure returns (uint8 timezone, uint8 day, uint8 turnInDay) {
        /// if _currentVerse = 0, we should be updating _timeZoneForRound1
        /// recall that timeZones range from 1...24 (not from 0...24)
        uint256 turn = verse % 4;
        uint256 delta = 9 * 4 + turnInDay;
        uint256 tz;
        uint256 dia;        
        if (turn >= 2 && verse < delta) return (NULL_TIMEZONE, 0, 0);
        if (turn < 2) {
            tz = TZForRound1 + ((verse - turn) % VERSES_PER_DAY)/4;
            dia = 2 * (verse - 4 * (tz - TZForRound1) - turn)/VERSES_PER_DAY;
        } else {
            tz = TZForRound1 + ((verse - delta) % VERSES_PER_DAY)/4;
            dia = 1 + 2 * (verse - 4 * (tz - TZForRound1) - delta)/VERSES_PER_DAY;
            turn -= 2;
        }
        turnInDay = uint8(turn);
        timezone = normalizeTZ(tz);
        day = uint8(dia % MATCHDAYS_PER_ROUND);
    }
    
    function normalizeTZ(uint256 tz) public pure returns (uint8) {
        return uint8(1 + ((24 + tz - 1)% 24));
    }

    function market() public view returns (address) { return _market; }
    function COO() public view returns (address) { return _COO; }
    function relay() public view returns (address) { return _relay; }
    function cryptoMktAddr() public view returns (address) { return _cryptoMktAddr; }
    
    function tzExists(uint8 timeZone) public pure returns(bool) {
        return(timeZone > NULL_TIMEZONE && timeZone < 25);
    }
}
