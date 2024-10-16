pragma solidity >= 0.6.3;

import "./EngineLib.sol";
import "../encoders/EncodingMatchLog.sol";
import "../encoders/EncodingTPAssignment.sol";
import "../encoders/EncodingSkillsSetters.sol";
import "../encoders/EncodingTacticsBase1.sol";
import "../gameEngine/GetSumSkills.sol";

/**
 @title Library or pure functions that manage how players evolve
 @author Freeverse.io, www.freeverse.io
*/

contract Evolution is EncodingMatchLog, EngineLib, EncodingTPAssignment, EncodingSkillsSetters, EncodingTacticsBase1, GetSumSkills {

    uint8 constant private PLAYERS_PER_TEAM_MAX = 25;
    uint8 public constant NO_OUT_OF_GAME_PLAYER  = 14;   /// noone saw a card
    uint8 public constant RED_CARD = 3;   /// noone saw a card
    uint8 public constant SOFT_INJURY = 1;  
    uint8 public constant HARD_INJURY = 2;  
    uint8 public constant WEEKS_HARD_INJ = 5;  /// weeks a player is out when suffered a hard injury
    uint8 public constant WEEKS_SOFT_INJ = 2;  /// weeks a player is out when suffered a soft injury
    uint8 private constant CHG_HAPPENED = uint8(1); 

    
    function updateSkillsAfterPlayHalf(
        uint256[PLAYERS_PER_TEAM_MAX] memory skills,
        uint256 matchLog,
        uint256 tactics,
        bool is2ndHalf,
        bool isBot
    ) 
        public
        pure
        returns (uint256[PLAYERS_PER_TEAM_MAX] memory, uint8 err)
    {
        /// after 1st Half, update:
        ///  - subtDuringFirstHalf, alignedEndOfFirstHalf => properly update
        ///  - redCards, injury => add if any of this happens
        ///  - adds +2 to daysNonStopping to all linedUp players
        /// after 2nd Half, update:
        ///  - subtDuringFirstHalf = 0, alignedEndOfFirstHalf = 0
        ///  - redCards: 
        ///      - set all to false unless it happens in 1st or 2nd half
        ///  -  injury => 
        ///      - decrease by one unless it happens in 1st or 2nd half
        /// BOT teams need to be ready after a game. First half works as a human team.
        /// but at the end of 2ns half, players don't increment gamesNonStop, and see 
        /// all cards and injuries set to 0. 
        if (!is2ndHalf) {
            err = writeOutOfGameInSkills(skills, tactics, matchLog, false);
            if (err > 0) return (skills, err);
            err = writeYellowCardsFirstHalf(skills, tactics, matchLog);
            if (err > 0) return (skills, err);
            writeFirstHalfLineUp(skills, tactics, matchLog);
        }
        else {
            // In the 2nd half, first, decrease injuryDays, and set redCardLastGame = false
            // ...unless that outOfGame happened in 1st half; so don't overwrite what we wrote in 1st half
            decreaseOutOfGames(skills);
            // Then, add the particular outOfGame from this half
            err = writeOutOfGameInSkills(skills, tactics, matchLog, true);
            if (err > 0) return (skills, err);
            if (!isBot) {
                err = updateGamesNonStopping2ndHalf(skills, tactics, matchLog); // only touches gamesNonStopping
                if (err > 0) return (skills, err);
            }
            resetFirstHalfDataInSkills(skills); // sets to false all FistHalf quantities
        }
        return (skills, 0);
    }

    function writeYellowCardsFirstHalf(uint256[PLAYERS_PER_TEAM_MAX] memory skills, uint256 tactics, uint256 matchLog) public pure returns(uint8) {
        /// check if there was an out of player event:
        for (uint8 posInHalf = 0; posInHalf < 2; posInHalf++) {
            uint8 yellowCarded = getYellowCard(matchLog, posInHalf, false); // returns 0...13
            if (yellowCarded < NO_OUT_OF_GAME_PLAYER) {
                yellowCarded = getLinedUp(tactics, yellowCarded);
                if (yellowCarded == NO_LINEUP) return ERR_UPDATEAFTER_YELLOW; // internal problem: out of game player is non-zero but points to noone
                skills[yellowCarded] = setYellowCardFirstHalf(skills[yellowCarded], true);
            }
        }
        return 0;
    }
    

    function updateGamesNonStopping2ndHalf(
        uint256[PLAYERS_PER_TEAM_MAX] memory skills, 
        uint256 tactics, 
        uint256 matchLog 
    ) 
        public 
        pure 
        returns (uint8 err)
    {
        uint8[3] memory joinedAt2ndHalf;
        uint8 nJoined = 0;
        /// first increase +2 the gamesNonStopping for those who joined
        for (uint8 posInHalf = 0; posInHalf < 3; posInHalf++) {
            /// First: those who joined at half time:
            /// note that getHalfTimeSubs: returns lineUp[p]+1 for halftime subs, 0 = NO_SUBS
            /// let us keep with this meaning, and store: joinedAt2ndHalf = shirtNum+1
            uint8 enteringPlayer = getHalfTimeSubs(matchLog, posInHalf); 
            if (enteringPlayer > 0) {
                joinedAt2ndHalf[nJoined] = enteringPlayer;
                nJoined += 1;
            }
            if (getInGameSubsHappened(matchLog, posInHalf, true) == CHG_HAPPENED) {
                joinedAt2ndHalf[nJoined]  = getLinedUp(tactics, 11 + posInHalf) + 1;
                nJoined += 1;
            }
        }
        if(nJoined > 3) return ERR_UPDATEAFTER_CHANGES; // Too many changes detected in this match!
        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            if (skills[p] != 0) {
                if (hasPlayedThisMatch(skills[p], p, joinedAt2ndHalf)) {
                    skills[p] = increaseGamesNonStopping(skills[p]);
                } else {
                    skills[p] = setGamesNonStopping(skills[p], 0); 
                }
            }
        }
        return 0;
    }

    function hasPlayedThisMatch(uint256 skills, uint8 p, uint8[3] memory joinedAt2ndHalf) public pure returns(bool) {
        /// recall the meaning: joinedAt2ndHalf = shirtNum+1, so that joinedAt2ndHalf == 0 => NO SUBS
        return (
            getAlignedEndOfFirstHalf(skills) || 
            getSubstitutedFirstHalf(skills) ||
            ((joinedAt2ndHalf[0] > 0) && ((p + 1) == joinedAt2ndHalf[0])) ||
            ((joinedAt2ndHalf[1] > 0) && ((p + 1) == joinedAt2ndHalf[1])) ||
            ((joinedAt2ndHalf[2] > 0) && ((p + 1) == joinedAt2ndHalf[2]))
        );
    }

    function resetFirstHalfDataInSkills(uint256[PLAYERS_PER_TEAM_MAX] memory skills) public pure {
        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            if (skills[p] != 0) {
                skills[p] = setAlignedEndOfFirstHalf(skills[p], false);
                skills[p] = setSubstitutedFirstHalf(skills[p], false);
                skills[p] = setOutOfGameFirstHalf(skills[p], false);
                skills[p] = setYellowCardFirstHalf(skills[p], false);
            }
        }
    }
    
    function writeFirstHalfLineUp(
        uint256[PLAYERS_PER_TEAM_MAX] memory skills, 
        uint256 tactics, 
        uint256 matchLog 
    ) 
        public 
        pure 
    {
        /// NO_LINEUP = 25, NO_SUBS = 11
        /// First set the starting 11 to Aligned = yes, substituted = false
        for (uint8 p = 0; p < 11; p++) {
            uint8 linedUp = getLinedUp(tactics, p);
            if ((linedUp < NO_LINEUP) && (skills[linedUp] != 0)) {
                skills[linedUp] = setAlignedEndOfFirstHalf(skills[linedUp], true);
                skills[linedUp] = setSubstitutedFirstHalf(skills[linedUp], false);
            }
        }
        /// Then modify only those involved in substitutions
        for (uint8 posInHalf = 0; posInHalf < 3; posInHalf++) {
            if (getInGameSubsHappened(matchLog, posInHalf, false) == CHG_HAPPENED) {
                uint8 leavingFieldPlayer    = getLinedUp(tactics, getSubstitution(tactics, posInHalf));
                uint8 enteringFieldPlayer   = getLinedUp(tactics, 11 + posInHalf);
                if (skills[leavingFieldPlayer] != 0) {
                    skills[leavingFieldPlayer]  = setAlignedEndOfFirstHalf(skills[leavingFieldPlayer], false);
                    skills[leavingFieldPlayer]  = setSubstitutedFirstHalf(skills[leavingFieldPlayer], true);
                }
                if (skills[enteringFieldPlayer] != 0) {
                    skills[enteringFieldPlayer] = setAlignedEndOfFirstHalf(skills[enteringFieldPlayer], true);
                    skills[enteringFieldPlayer] = setSubstitutedFirstHalf(skills[enteringFieldPlayer], false);
                }
            }
        }
    }    
    
    /// we increase 2 units, so that we get a maximum of 7. 
    function increaseGamesNonStopping(uint256 skills) public pure returns (uint256) {
        uint8 gamesNonStopping = getGamesNonStopping(skills);
        if (gamesNonStopping < 7) return setGamesNonStopping(skills, gamesNonStopping + 1); 
        else return skills;
    }

    function writeOutOfGameInSkills(uint256[PLAYERS_PER_TEAM_MAX] memory skills, uint256 tactics, uint256 matchLog, bool is2ndHalf) public pure returns (uint8 err) {
        /// check if there was an out of player event:
        uint8 outOfGamePlayer = uint8(getOutOfGamePlayer(matchLog, is2ndHalf));
        if (outOfGamePlayer == NO_OUT_OF_GAME_PLAYER) return 0;
        /// convert outOfGamePlayer [0...13] to the index that points to the skills in the team [0,..24]
        outOfGamePlayer = getLinedUp(tactics, outOfGamePlayer);
        if(outOfGamePlayer == NO_LINEUP) return ERR_UPDATEAFTER_OUTOFGAME1; // internal problem: out of game player is non-zero but points to noone
        if(skills[outOfGamePlayer] == 0) return ERR_UPDATEAFTER_OUTOFGAME2; // internal problem: out of game player is non-zero but points to null skills
        uint256 outOfGameType = getOutOfGameType(matchLog, is2ndHalf);
        if (outOfGameType == RED_CARD) {
            skills[outOfGamePlayer] = setRedCardLastGame(skills[outOfGamePlayer], true);
        }
        else if (outOfGameType == HARD_INJURY) {
            skills[outOfGamePlayer] = setInjuryWeeksLeft(skills[outOfGamePlayer], WEEKS_HARD_INJ);
        }
        else if (outOfGameType == SOFT_INJURY) {
            skills[outOfGamePlayer] = setInjuryWeeksLeft(skills[outOfGamePlayer], WEEKS_SOFT_INJ);
        }
        if (!is2ndHalf) {
            skills[outOfGamePlayer] = setOutOfGameFirstHalf(skills[outOfGamePlayer], true);
        }
        return 0;
    }
        
    /// at the end of a match, decrease the weeks left from injury and set redRardsLastGame = false...
    /// ...only if this outOfgame did not happen first half
    /// the function called right after this one will add the outOfGames of this particular half where appropriate
    function decreaseOutOfGames(uint256[PLAYERS_PER_TEAM_MAX] memory skills) public pure {
        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            if (skills[p] != 0 && !getOutOfGameFirstHalf(skills[p])) {
                skills[p] = setRedCardLastGame(skills[p], false);
                if (getInjuryWeeksLeft(skills[p]) != 0) {
                    skills[p] = setInjuryWeeksLeft(skills[p], getInjuryWeeksLeft(skills[p])-1);
                }
            }
        }
    }

    // computes teamSumSkills and adds it to matchLog
    function addTeamSumSkillsToLog(uint256 matchLog, uint256[PLAYERS_PER_TEAM_MAX] memory skills) public pure returns (uint256) {
        return addTeamSumSkills(matchLog, getSumOfTopPlayerSkills(skills));
    }
}

