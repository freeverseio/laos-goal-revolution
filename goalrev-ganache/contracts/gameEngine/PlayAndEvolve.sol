pragma solidity >= 0.6.3;

import "./TrainingPoints.sol";
import "./Evolution.sol";
import "./Engine.sol";
import "../gameEngine/ErrorCodes.sol";
import "../encoders/EncodingTacticsBase1.sol";
import "../encoders/EncodingSkillsSetters.sol";
import "../encoders/EncodingSkillsGetters.sol";
import "../encoders/EncodingMatchLogBase3.sol";


/**
 @title Main entry point for backend. Plays 1st and 2nd half and evolves players.
 @author Freeverse.io, www.freeverse.io
 @dev All functions are basically pure, but some had to be made view
 @dev because they use a storage pointer to other contracts.
*/

contract PlayAndEvolve is ErrorCodes, EncodingTacticsBase1, EncodingSkillsSetters, EncodingSkillsGetters, EncodingMatchLogBase3 {

    uint8 constant public PLAYERS_PER_TEAM_MAX = 25;
    uint8 private constant IDX_IS_2ND_HALF = 0; 
    uint8 public constant ROUNDS_PER_MATCH = 12;   /// Number of relevant actions that happen during a game (12 equals one per 3.7 min)
    uint8 private constant IDX_IS_BOT_HOME = 3; 
    uint8 private constant IDX_IS_BOT_AWAY = 4; 
    uint8 private constant WINNER_DRAW = 2;
    
    TrainingPoints private training;
    Evolution private evo;
    Engine private engine;

    constructor(address trainingAddr, address evolutionAddr, address engineAddr) public {
        training = TrainingPoints(trainingAddr);
        evo = Evolution(evolutionAddr);
        engine = Engine(engineAddr);
    }

    function generateMatchSeed(bytes32 seed, uint256[2] memory teamIds) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(seed, teamIds[0], teamIds[1])));
    }

    /// In a 1st half we need to:
    ///      1. applyTrainingPoints: (oldSkills, assignedTPs) => (newSkills)
    ///      2. playHalfMatch: (newSkills) => (matchLogs, events)
    ///      3. updateSkillsAfterPlayHalf: (newSkills, matchLogs) => finalSkills
    /// Output: (finalSkills, matchLogsAndEvents)
    function play1stHalfAndEvolve(
        bytes32 verseSeed,
        uint256 matchStartTime,
        uint256[PLAYERS_PER_TEAM_MAX][2] memory skills,
        uint256[2] memory teamIds,
        uint256[2] memory tactics,
        uint256[2] memory matchLogs,
        bool[5] memory matchBools, /// [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]
        uint256[2] memory assignedTPs
    )
        public 
        view 
        returns 
    (
        uint256[PLAYERS_PER_TEAM_MAX][2] memory, 
        uint256[2+5*ROUNDS_PER_MATCH] memory matchLogsAndEvents,
        uint8 err
    )
    {
        if (matchBools[IDX_IS_2ND_HALF]) { return (skills, matchLogsAndEvents, ERR_IS2NDHALF); }

        for (uint8 team = 0; team < 2; team++) {
            if (matchBools[IDX_IS_BOT_HOME + team]) {
                tactics[team] = getBotTactics();
                skills[team] = training.evolveBot(skills[team], matchStartTime);
            } else {
                (skills[team], err) = training.applyTrainingPoints(skills[team], assignedTPs[team], tactics[team], matchStartTime, evo.getTrainingPoints(matchLogs[team]));
                if (err > 0) return cancelHalf(skills, false, err);
                // TODO: when we support shop, enable these 2 lines:
                // err = shop.validateItemsInTactics(tactics[team]);
                // if (err > 0) return (skills, matchLogsAndEvents, err);
            }
        }
            
        /// Note that the following call does not change de values of "skills" because it calls a separate contract.
        /// It would do so if playHalfMatch was part of this contract code.
        (matchLogsAndEvents, err) = engine.playHalfMatch(
            generateMatchSeed(verseSeed, teamIds), 
            matchStartTime, 
            skills, 
            tactics, 
            [uint256(0),uint256(0)], 
            matchBools
        );
        if (err > 0) return cancelHalf(skills, false, err);

        for (uint8 team = 0; team < 2; team++) {
            (skills[team], err) = evo.updateSkillsAfterPlayHalf(skills[team], matchLogsAndEvents[team], tactics[team], false, matchBools[IDX_IS_BOT_HOME + team]);
            if (err > 0) return cancelHalf(skills, false, err);
        }

        return (skills, matchLogsAndEvents, 0);
    }
    
    
    /// In a 2nd half we need to:
    ///      1. playHalfMatch: (oldSkills, matchLogsHalf1) => (matchLogsHalf2, events)
    ///      2. updateSkillsAfterPlayHalf: (oldSkills, matchLogsHalf2) => newSkills
    ///      3. computeTrainingPoints: (matchLogsHalf2) => (matchLogsHalf2 with TPs)
    /// Output: (newSkills, matchLogsAndEvents with TPs)
    function play2ndHalfAndEvolve(
        bytes32 verseSeed,
        uint256 matchStartTime,
        uint256[PLAYERS_PER_TEAM_MAX][2] memory skills,
        uint256[2] memory teamIds,
        uint256[2] memory tactics,
        uint256[2] memory matchLogs,
        bool[5] memory matchBools /// [is2ndHalf, isHomeStadium, isPlayoff, isBotHomeTeam, isBotAwayTeam]
    )
        public 
        view 
        returns
    (
        uint256[PLAYERS_PER_TEAM_MAX][2] memory, 
        uint256[2+5*ROUNDS_PER_MATCH] memory matchLogsAndEvents,
        uint8 err
    )
    {
        if (!matchBools[IDX_IS_2ND_HALF]) { return (skills, matchLogsAndEvents, ERR_IS2NDHALF); }
        if (getIsCancelled(matchLogs[0]) || getIsCancelled(matchLogs[1])) {
            return cancelHalf(skills, true, ERR_2NDHALF_CANCELLED_DUE_TO_1STHALF_CANCELLED);
        }

        for (uint8 team = 0; team < 2; team++) {
            if (matchBools[IDX_IS_BOT_HOME + team]) {
                tactics[team] = getBotTactics();
            } else {
                // TODO: when we support shop, enable these 2 lines:
                // err = shop.validateItemsInTactics(tactics[team]);
                // if (err > 0) return (skills, matchLogsAndEvents, err);
            }
        }

        /// Note that the following call does not change de values of "skills" because it calls a separate contract.
        /// It would do so if playHalfMatch was part of this contract code.
        (matchLogsAndEvents, err) = engine.playHalfMatch(
            generateMatchSeed(verseSeed, teamIds), 
            matchStartTime, 
            skills, 
            tactics, 
            matchLogs, 
            matchBools
        );
        if (err > 0) return cancelHalf(skills, true, err);

        for (uint8 team = 0; team < 2; team++) {
            (skills[team], err) = evo.updateSkillsAfterPlayHalf(skills[team], matchLogsAndEvents[team], tactics[team], true, matchBools[IDX_IS_BOT_HOME + team]);
            if (err > 0) return cancelHalf(skills, true, err);
            // warning: the following line would change skills if it was not an external contract call!
            matchLogsAndEvents[team] = evo.addTeamSumSkillsToLog(matchLogsAndEvents[team], skills[team]);
        }

        (matchLogsAndEvents[0], matchLogsAndEvents[1]) = training.computeTrainingPoints(matchLogsAndEvents[0], matchLogsAndEvents[1]);

        return (skills, matchLogsAndEvents, 0);
    }

    function getBotTactics() public pure returns(uint256) { 
        return encodeTactics(
            [NO_SUBST, NO_SUBST, NO_SUBST], // no substitutions
            [0, 0, 0], // subRounds don't matter
            [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 25, 25, 25], // consecutive lineup, with one single GK 
            [false, false, false, false, false, false, false, false, false, false], // no extra attack
            1 // tacticsId = 1 = 5-4-1
        );
    }

    /// sets skills as "noone played this match", and returns almost-null matchLog:
    /// - no events, no goals, no TPs
    /// - except for is2ndHalf, in which case it returns DRAW
    /// In 2nd half, it also resets all "games non stopping" for all players, and redCardsLastGame to false. 
    function cancelHalf(
        uint256[PLAYERS_PER_TEAM_MAX][2] memory skills, 
        bool is2ndHalf,
        uint8 error
    ) 
        public 
        pure
        returns 
    (
        uint256[PLAYERS_PER_TEAM_MAX][2] memory, 
        uint256[2+5*ROUNDS_PER_MATCH] memory, 
        uint8
    ) 
    {
        uint256[2+5*ROUNDS_PER_MATCH] memory matchLogsAndEvents;
        for (uint8 team = 0; team < 2; team++) {
            for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
                if (skills[team][p] != 0) {
                    skills[team][p] = setAlignedEndOfFirstHalf(skills[team][p], false);
                    skills[team][p] = setSubstitutedFirstHalf(skills[team][p], false);
                    skills[team][p] = setOutOfGameFirstHalf(skills[team][p], false);
                    skills[team][p] = setYellowCardFirstHalf(skills[team][p], false);
                    skills[team][p] = setRedCardLastGame(skills[team][p], false); 
                    skills[team][p] = setGamesNonStopping(skills[team][p], 0);        
                    if (is2ndHalf) {
                        uint8 injuryWeeksLeft = getInjuryWeeksLeft(skills[team][p]);
                        if (injuryWeeksLeft > 0) {
                            skills[team][p] = setInjuryWeeksLeft(skills[team][p], injuryWeeksLeft-1);
                        }
                    }
                }
            }
            matchLogsAndEvents[team] = setIsCancelled(matchLogsAndEvents[team], true);
            if (is2ndHalf) { matchLogsAndEvents[team] = addWinner(matchLogsAndEvents[team], WINNER_DRAW); }
        }
        return (skills, matchLogsAndEvents, error);
    }

}

