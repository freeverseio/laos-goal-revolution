pragma solidity >= 0.6.3;

import "../storage/AssetsView.sol";

/**
 @title Creation of all "default" game assets via creation of timezones, countries and divisions
 @author Freeverse.io, www.freeverse.io
 @dev Only other way of creating assets is via BuyNow pattern, in the Market contract.
 @dev All functions in this file modify storage. All view/pure funcions are inherited from AssetsView.
 @dev Timezones range from 1 to 24, with timeZone = 0 being null.
 @dev All storage is govenrned by Proxy, via the Storage contract.
*/

/// Warning: This contract must ALWAYS inherit AssetsView first, so that it ends up inheriting Storage before any other contract.
contract Assets is AssetsView {

    event AssetsInit(address creatorAddr);
    event DivisionCreation(uint8 timezone, uint256 countryIdxInTZ, uint256 divisionIdxInCountry);
    event DivisionCreationFailed(uint8 timezone, uint256 countryIdxInTZ);
    
    //// Setter for main roles: COO, Market owner, Relay owner
    function setCOO(address addr) external onlySuperUser { _COO = addr; }
    
    function setMarket(address addr) external onlySuperUser {
        _market = addr;
        _teamIdToOwner[ACADEMY_TEAM] = addr;
        if (gameDeployDay == 0) { emit AssetsInit(msg.sender); }
        emit TeamTransfer(ACADEMY_TEAM, addr);        
    }
    
    function setRelay(address addr) external onlySuperUser { _relay = addr; }
   

    /// External Functions

    /// Inits all 24 timezones, each with one country, each with one division
    function initTZs(uint256 deployTimeInUnixEpochSecs) external onlyCOO {
        require(gameDeployDay == 0, "cannot initialize twice");
        gameDeployDay = secsToDays(deployTimeInUnixEpochSecs);
        for (uint8 tz = 1; tz < 25; tz++) {
            _initTimeZone(tz);
        }
        if (_market == NULL_ADDR) { emit AssetsInit(msg.sender); }
    }

    /// Next function is only used for testing: it inits only one timezone
    function initSingleTZ(uint8 tz, uint256 deployTimeInUnixEpochSecs) external onlyCOO {
        require(gameDeployDay == 0, "cannot initialize twice");
        gameDeployDay = secsToDays(deployTimeInUnixEpochSecs);
        _initTimeZone(tz);
        if (_market == NULL_ADDR) { emit AssetsInit(msg.sender); }
    }

    function addDivisionManually(uint8 tz, uint256 countryIdxInTZ) external onlyCOO { 
        require(_addDivision(tz, countryIdxInTZ), "manual division creation failed"); 
    }

    function addCountryManually(uint8 tz) external onlyCOO { _addCountry(tz); }

    /// Entry point for new users: acquiring a bot team
    function transferFirstBotToAddr(uint8 tz, uint256 countryIdxInTZ, address addr) public onlyRelay {
        require(_tzToNCountries[tz] > countryIdxInTZ, "Country does not exist in TZ");
        uint256 countryId = encodeTZCountryAndVal(tz, countryIdxInTZ, 0); 
        uint256 firstFreeBotIdx = _countryIdToNHumanTeams[countryId];
        uint256 teamId = encodeTZCountryAndVal(tz, countryIdxInTZ, firstFreeBotIdx);
        require(isBotTeam(teamId), "cannot transfer a non-bot team");
        require(addr != NULL_ADDR, "invalid address");
        // when we arrive to all teams created (minus 16), we start trying to create a new division.
        // such creation will fail during the 15 minutes of half time of this timezone.
        // Even in such case, we allow new assignments, until we reach the limit (no more bots available)
        // For example, bot = 127 requires a new division to be created.
        uint256 teamsInCountry = getNDivisionsInCountry(tz, countryIdxInTZ) * 128; // 128 = LEAGUES_PER_DIV * TEAMS_PER_LEAGUE
        if (firstFreeBotIdx > (teamsInCountry - 16)) { 
            if (!_addDivision(tz, countryIdxInTZ)) {
                require(firstFreeBotIdx < teamsInCountry - 1,  "division creation was necessary to assign new bot, but it failed");
           }
        }
        _teamIdToOwner[teamId] = addr;
        _countryIdToNHumanTeams[countryId] = firstFreeBotIdx + 1;
        emit TeamTransfer(teamId, addr);
    }
    
    /// Speeds up assignment to new users. 
    /// This function will crash if it cannot handle all transfers in one single TX
    /// It is the responsibility of the caller to ensure that the arrays length match correctly
    function transferFirstBotsToAddresses(uint8[] calldata tz, uint256[] calldata countryIdxInTZ, address[] calldata addr) external onlyRelay {
        for (uint256 i = 0; i < tz.length; i++) {
            transferFirstBotToAddr(tz[i], countryIdxInTZ[i], addr[i]); 
        }            
    }
    

    // Private Functions

    function _initTimeZone(uint8 tz) private {
        _orgMapRoot[tz][0] = INIT_ORGMAP_HASH;
        _addCountry(tz);
    }
    
    function _addCountry(uint8 tz) private {
        uint256 countryIdxInTZ = _tzToNCountries[tz];
        _tzToNCountries[tz] = countryIdxInTZ + 1;
        for (uint8 division = 0 ; division < DIVS_PER_LEAGUE_AT_START; division++){
            _addDivision(tz, countryIdxInTZ); 
        }
    }

    function _addDivision(uint8 tz, uint256 countryIdxInTZ) private returns(bool) {
        (uint8 tzToUpdate, , uint8 turnInDay) = nextTimeZoneToUpdate();
        if((tz == tzToUpdate) && (turnInDay == 1)) {
            // cannot create a division during half time of matches in that division
            emit DivisionCreationFailed(tz, countryIdxInTZ);    
            return false;
        } 
        uint256 countryId = encodeTZCountryAndVal(tz, countryIdxInTZ, 0);
        uint256 nDivs = _countryIdToNDivisions[countryId];
        uint256 divisionId = encodeTZCountryAndVal(tz, countryIdxInTZ, nDivs);
        _countryIdToNDivisions[countryId] = nDivs + 1;
        _divisionIdToRound[divisionId] = getCurrentRound(tz) + 1;
        emit DivisionCreation(tz, countryIdxInTZ, nDivs);
        return true;
    }
}
