pragma solidity >=0.6.3;
import "../encoders/EncodingMatchLog.sol";
import "../encoders/EncodingTacticsBase3.sol";
import "../storage/AssetsView.sol";

/**
 @title Library of pure functions used by company to compute useful data
 @author Freeverse.io, www.freeverse.io
*/

contract Utils is AssetsView, EncodingMatchLog, EncodingTacticsBase3 {

    function createTeam(
        uint8 timeZone,
        uint256 countryIdxInTZ,
        uint256 teamIdxInTZ,
        uint256 deployTimeInUnixEpochSecs,
        uint256 divisionCreationRound
    ) public pure returns (
        uint256 teamId,
        uint256[PLAYERS_PER_TEAM_INIT] memory playerIds,
        uint256[PLAYERS_PER_TEAM_INIT] memory playerSkillsAtBirth
    ) {
        teamId = encodeTZCountryAndVal(timeZone, countryIdxInTZ, teamIdxInTZ);
        uint256 playerIdxInCountry = teamIdxInTZ * PLAYERS_PER_TEAM_INIT;
        uint256 gameDeployDay = secsToDays(deployTimeInUnixEpochSecs);

        for (uint256 i = 0; i < PLAYERS_PER_TEAM_INIT; i++ ) {
            uint256 playerId = encodeTZCountryAndVal(timeZone, countryIdxInTZ, playerIdxInCountry + i);
            playerIds[i] = playerId;
            playerSkillsAtBirth[i] = getPlayerSkillsAtBirthPure(playerId, gameDeployDay, divisionCreationRound);
        }
    }


    function fullDecodeSkillsForEntireTeam(
        uint256[PLAYERS_PER_TEAM_INIT] memory encodedSkills
    )
        public
        pure
        returns (
            uint32[N_SKILLS][PLAYERS_PER_TEAM_INIT] memory skills,
            uint16[PLAYERS_PER_TEAM_INIT] memory dayOfBirth,
            uint8[4][PLAYERS_PER_TEAM_INIT] memory birthTraits,
            uint256[PLAYERS_PER_TEAM_INIT] memory playerId,
            bool[5][PLAYERS_PER_TEAM_INIT]
                memory aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st,
            uint8[3][PLAYERS_PER_TEAM_INIT]
                memory generationGamesNonStopInjuryWeeks
        )
    {
        for (uint256 i = 0; i < PLAYERS_PER_TEAM_INIT; i++) {
            (
                uint32[N_SKILLS] memory playerSkills,
                uint16 birth,
                uint8[4] memory traits,
                uint256 id,
                bool[5] memory status,
                uint8[3] memory genGamesInjury
            ) = fullDecodeSkills(encodedSkills[i]);

            for (uint8 j = 0; j < N_SKILLS; j++) {
                skills[i][j] = playerSkills[j];
                aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st[i][j] = status[j];
            }

            for (uint8 j = 0; j < 4; j++) {
                birthTraits[i][j] = traits[j];
            }

            for (uint8 j = 0; j < 3; j++) {
                generationGamesNonStopInjuryWeeks[i][j] = genGamesInjury[j];
            }

            dayOfBirth[i] = birth;
            playerId[i] = id;
        }

        return (
            skills,
            dayOfBirth,
            birthTraits,
            playerId,
            aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st,
            generationGamesNonStopInjuryWeeks
        );
    }

    function fullDecodeMatchLog(uint256 log, bool is2ndHalf) public pure returns (uint32[15] memory decodedLog) {
        decodedLog[0] = uint32(getTeamSumSkills(log));
        decodedLog[1] = uint32(getWinner(log));
        decodedLog[2] = uint32(getNGoals(log));
        if (is2ndHalf) decodedLog[3] = uint32(getTrainingPoints(log));
        
        decodedLog[4] = uint32(getOutOfGamePlayer(log, is2ndHalf));
        decodedLog[5] = uint32(getOutOfGameType(log, is2ndHalf));
        decodedLog[6] = uint32(getOutOfGameRound(log, is2ndHalf));
    
        decodedLog[7] = uint32(getYellowCard(log, 0, is2ndHalf));
        decodedLog[8] = uint32(getYellowCard(log, 1, is2ndHalf));
        
        decodedLog[9]  = uint32(getInGameSubsHappened(log, 0, is2ndHalf));
        decodedLog[10] = uint32(getInGameSubsHappened(log, 1, is2ndHalf));
        decodedLog[11] = uint32(getInGameSubsHappened(log, 2, is2ndHalf));

        /// getHalfTimeSubs: recall that 0 means no subs, and we store here p+1 (where p = player in the starting 11 that was substituted)
        if (is2ndHalf) {
            decodedLog[12]  = uint32(getHalfTimeSubs(log, 0));
            decodedLog[13]  = uint32(getHalfTimeSubs(log, 1));
            decodedLog[14]  = uint32(getHalfTimeSubs(log, 2));
        }
        return decodedLog;
    }
    
    function fullDecodeSkills(uint256 encodedSkills) public pure returns(
        uint32[N_SKILLS] memory skills,
        uint16 dayOfBirth,
        uint8[4] memory birthTraits,
        uint256 playerId, 
        bool[5] memory aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st,
        uint8[3] memory generationGamesNonStopInjuryWeeks
    ) {
        for (uint8 sk = 0; sk < N_SKILLS; sk++) skills[sk] = uint32(getSkill(encodedSkills, sk));

        dayOfBirth = uint16(getBirthDay(encodedSkills));

        birthTraits[0] = uint8(getPotential(encodedSkills));
        birthTraits[1] = uint8(getForwardness(encodedSkills));
        birthTraits[2] = uint8(getLeftishness(encodedSkills));
        birthTraits[3] = uint8(getAggressiveness(encodedSkills));
        
        playerId = getPlayerIdFromSkills(encodedSkills);
        
        aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st[0] = getAlignedEndOfFirstHalf(encodedSkills);
        aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st[1] = getSubstitutedFirstHalf(encodedSkills);
        aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st[2] = getRedCardLastGame(encodedSkills);
        aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st[3] = getOutOfGameFirstHalf(encodedSkills);
        aligned1stSubst1stRedCardLastGameOutOfGame1stYellow1st[4] = getYellowCardFirstHalf(encodedSkills);
        
        generationGamesNonStopInjuryWeeks[0] = uint8(getGeneration(encodedSkills));
        generationGamesNonStopInjuryWeeks[1] = getGamesNonStopping(encodedSkills);
        generationGamesNonStopInjuryWeeks[2] = getInjuryWeeksLeft(encodedSkills);
    }
    
    function getNow() public view returns(uint256) {
        return now;
    }
    
    function decodeTactics(uint256 tactics) public pure returns (
        uint8[3] memory substitutions, 
        uint8[3] memory subsRounds, 
        uint8[14] memory lineup, 
        bool[10] memory extraAttack, 
        uint8 tacticsId
    ) {
        tacticsId = getTacticsId(tactics);
        extraAttack = getFullExtraAttack(tactics);
        for (uint8 p = 0; p < 3; p++) {
            substitutions[p] = getSubstitution(tactics, p);
        }          
        lineup = getFullLineUp(tactics);
        for (uint8 p = 0; p < 3; p++) {
            subsRounds[p] = getSubsRound(tactics, p);
        }          
    }
}
