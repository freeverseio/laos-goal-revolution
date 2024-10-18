pragma solidity >= 0.6.3;

import "./UniverseInfo.sol";
import "../encoders/EncodingSkills.sol";
import "../encoders/EncodingState.sol";
import "./ComputeSkills.sol";

/**
 @title Library of View/Pure functions to needed by game assets
 @author Freeverse.io, www.freeverse.io
*/

/// Warning: This contract must ALWAYS inherit UniverseInfo first, so that it ends up inheriting Storage before any other contract.
contract AssetsView is UniverseInfo, EncodingSkills, EncodingState, ComputeSkills {
    
    // function getPlayerSkillsAtBirth(uint256 playerId) public view returns (uint256) {
    //     if (getIsSpecial(playerId)) return playerId;
    //     if (!wasPlayerCreatedVirtually(playerId)) return 0;
    //     (uint256 teamId, uint256 playerCreationDay, uint8 shirtNum) = getTeamIdCreationDayAndShirtNum(playerId);
    //     (uint256 dayOfBirth, uint8 potential) = computeBirthDayAndPotential(teamId, playerCreationDay, shirtNum);
    //     (uint32[N_SKILLS] memory skills, uint8[4] memory birthTraits, uint32 sumSkills) = computeSkills(teamId, shirtNum, potential);
    //     return encodePlayerSkills(skills, dayOfBirth, 0, playerId, birthTraits, false, false, 0, 0, false, sumSkills);
    // }

    function getPlayerSkillsAtBirth(uint256 playerId) public view returns (uint256) {
        if (getIsSpecial(playerId)) return playerId;
        if (!wasPlayerCreatedVirtually(playerId)) return 0;
        (uint8 tz, uint256 countryIdxInTZ, uint256 playerIdxInCountry) = decodeTZCountryAndVal(playerId);
        uint256 teamIdxInCountry = playerIdxInCountry / PLAYERS_PER_TEAM_INIT;
        uint256 divisionIdx = teamIdxInCountry / TEAMS_PER_DIVISION;
        uint256 divisionId = encodeTZCountryAndVal(tz, countryIdxInTZ, divisionIdx);
        return getPlayerSkillsAtBirthPure(playerId, gameDeployDay, _divisionIdToRound[divisionId]);
    }

    function getPlayerSkillsAtBirthPure(uint256 playerId, uint256 _gameDeployDay, uint256 _divisionCreationRound) public pure returns (uint256) {
        if (getIsSpecial(playerId)) return playerId;
        // if (!wasPlayerCreatedVirtually(playerId)) return 0;
        uint256 divisionCreationDay = _gameDeployDay + _divisionCreationRound * DAYS_PER_ROUND;
        (uint256 teamId, , uint8 shirtNum) = getTeamIdCreationDayAndShirtNumPure(playerId, divisionCreationDay);
        (uint256 dayOfBirth, uint8 potential) = computeBirthDayAndPotential(teamId, divisionCreationDay, shirtNum);
        (uint32[N_SKILLS] memory skills, uint8[4] memory birthTraits, uint32 sumSkills) = computeSkills(teamId, shirtNum, potential);
        return encodePlayerSkills(skills, dayOfBirth, 0, playerId, birthTraits, false, false, 0, 0, false, sumSkills);
    }

    function getTeamIdCreationDayAndShirtNum(uint256 playerId) public view returns(uint256 teamId, uint256 creationDay, uint8 shirtNum) {
        (uint8 tz, uint256 countryIdxInTZ, uint256 playerIdxInCountry) = decodeTZCountryAndVal(playerId);
        uint256 teamIdxInCountry = playerIdxInCountry / PLAYERS_PER_TEAM_INIT;
        uint256 divisionIdx = teamIdxInCountry / TEAMS_PER_DIVISION;
        uint256 divisionId = encodeTZCountryAndVal(tz, countryIdxInTZ, divisionIdx);
        teamId = encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry);
        creationDay = gameDeployDay + _divisionIdToRound[divisionId] * DAYS_PER_ROUND;
        shirtNum = uint8(playerIdxInCountry % PLAYERS_PER_TEAM_INIT);
    }

    function getTeamIdCreationDayAndShirtNumPure(uint256 playerId, uint256 creationDay) public pure returns(uint256 teamId, uint256, uint8 shirtNum) {
        (uint8 tz, uint256 countryIdxInTZ, uint256 playerIdxInCountry) = decodeTZCountryAndVal(playerId);
        uint256 teamIdxInCountry = playerIdxInCountry / PLAYERS_PER_TEAM_INIT;
        teamId = encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry);
        shirtNum = uint8(playerIdxInCountry % PLAYERS_PER_TEAM_INIT);
        return(teamId, creationDay, shirtNum);
    }

    //// Compute a random age between 16 and 35.999, with random potential in [0,...7]
    //// @param playerCreationDay - days since unix epoch where the player was created as part of teams of a division
    //// @return dayOfBirth - days since unix epoch
    function computeBirthDayAndPotential(uint256 teamId, uint256 playerCreationDay, uint8 shirtNum) public pure returns (uint16 dayOfBirth, uint8 potential) {
        /// generate a DNA that is unique to pairs of players in the universe.
        /// each team has different DNAs, but within a same team, shirts = 0,1 have the same, shirts = 2,3 have the same...etc
        uint256 dna = uint256(keccak256(abi.encode(teamId, shirtNum/2)));
        /// Generate pairs of potentials such that each is in [0,...,7] and the sum is 7, so average is 3.5
        potential = (shirtNum % 2 == 0) ? uint8(dna % (MAX_POTENTIAL_AT_BIRTH+1)) : MAX_POTENTIAL_AT_BIRTH - uint8(dna % (MAX_POTENTIAL_AT_BIRTH+1));
        /// generate a different dna for each member of the pair by bit-shifting dna differently
        dna >>= (1 +(shirtNum % 2));
        /// Increase potential average to 4.25 = 3.5 + 0.75 
        if ((potential < 7) && (dna % 4) != 0) potential += 1;
        /// Compute days in range [16,36]
        uint256 ageInDays = 5840 + (dna % 7300);  /// 5840 = 16y, 7300 = 20y
        /// ensure that good potential players are not above 31,
        /// by subtracting what is left to reach 31, plus a random between 0 and 2 years
        dna >>= 12;
        if (potential > 5 && ageInDays > 11315) ageInDays -= (ageInDays - 11315) + (dna % 730); /// 11315 = 31y, 730 = 2y.
        dayOfBirth = uint16(playerCreationDay - ageInDays / INGAMETIME_VS_REALTIME); 
    }
    


    function secsToDays(uint256 secs) public pure returns (uint256) {
        return secs / 86400;  /// 86400 = 3600 * 24
    }

    function countCountries(uint8 tz) public view returns (uint256){
        return _tzToNCountries[tz];
    }
    
    /// TODO: remove from this contract, expose as interface for users
    function daysToSecs(uint256 dayz) public pure returns (uint256) {
        return dayz * 86400; /// 86400 = 3600 * 24 * 365
    }

    function getPlayerAgeInDays(uint256 playerId) public view returns (uint256) {
        return secsToDays(INGAMETIME_VS_REALTIME * (now - daysToSecs(getBirthDay(getPlayerSkillsAtBirth(playerId)))));
    }
    
    function divisionIdToRound(uint256 divisionId) public view returns(uint256) { return _divisionIdToRound[divisionId]; }
    
}
