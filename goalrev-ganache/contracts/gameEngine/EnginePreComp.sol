pragma solidity >= 0.6.3;

import "../encoders/EncodingTacticsBase1.sol";
import "./EngineLib.sol";
import "./SortValues.sol";
import "../encoders/EncodingMatchLogBase1.sol";
import "../encoders/EncodingMatchLogBase3.sol";
import "../gameEngine/ErrorCodes.sol";

/**
 @title Library or pure functions, part of Engine
 @author Freeverse.io, www.freeverse.io
*/

contract EnginePreComp is EngineLib, EncodingMatchLogBase1, EncodingMatchLogBase3, EncodingTacticsBase1, SortValues, ErrorCodes{
    uint8 constant public PLAYERS_PER_TEAM_MAX  = 25;
    /// Skills: shoot, speed, pass, defence, endurance
    uint8 constant public SK_SHO = 0;
    uint8 constant public SK_SPE = 1;
    uint8 constant public SK_PAS = 2;
    uint8 constant public SK_DEF = 3;
    uint8 constant public SK_END = 4;   
     
    /// Skills for GKs: shot-stopping, 1-on-1, pass, penaltySaving, endurance 
    uint8 constant internal GK_SHO = 0;
    uint8 constant internal GK_1O1 = 1;
    uint8 constant internal GK_PAS = 2;
    uint8 constant internal GK_PEN = 3;
    uint8 constant internal GK_END = 4;    
    
    
    /// prefPosition idxs: GoalKeeper, Defender, Midfielder, Forward, MidDefender, MidAttacker
    uint8 constant public IDX_GK = 0;
    uint8 constant public IDX_D  = 1;
    uint8 constant public IDX_M  = 2;
    uint8 constant public IDX_F  = 3;
    uint8 constant public IDX_MD = 4;
    uint8 constant public IDX_MF = 5;
    /// forward modifier
    uint8 constant public IDX_BOOST = 0;
    uint8 constant public IDX_TRIM = 1;
    
    
    uint256 private constant ONE256            = uint256(1); 
    uint8 private constant CHG_HAPPENED        = uint8(1); 
    uint8 private constant CHG_CANCELLED       = uint8(2); 
    /// /// Idxs for vector of globSkills: [0=move2attack, 1=globSkills[IDX_CREATE_SHOOT], 2=globSkills[IDX_DEFEND_SHOOT], 3=blockShoot, 4=currentEndurance]
    uint8 private constant IDX_MOVE2ATTACK  = 0;        
    uint8 private constant IDX_CREATE_SHOOT = 1; 
    uint8 private constant IDX_DEFEND_SHOOT = 2; 
    uint8 private constant IDX_BLOCK_SHOOT  = 3; 
    uint8 private constant IDX_ENDURANCE    = 4; 
    uint256 private constant TEN_TO_4       = uint256(10000); 
    uint256 private constant TEN_TO_8       = uint256(100000000); 
    uint256 private constant SECS_IN_DAY    = 86400; /// 24 * 3600 

    uint8 public constant ROUNDS_PER_MATCH  = 12;   /// Number of relevant actions that happen during a game (12 equals one per 3.7 min)
    /// uint8 public constant NO_SUBST  = 11;   /// noone was subtituted
    uint8 public constant NO_OUT_OF_GAME_PLAYER  = 14;   /// noone saw a card
    uint8 public constant SOFT_INJURY  = 1;   /// type of event
    uint8 public constant HARD_INJURY  = 2;   /// type of event
    uint8 public constant RED_CARD  = 3;   /// type of event
    /// uint8 public constant NO_LINEUP = 25; /// No player chosen in that position
    uint8 private constant WINNER_AWAY = 1;
    uint8 private constant WINNER_DRAW = 2;

    /// Over a game, we would like:
    ///      - injuryHard = 1 per 100 games => 0.01 per game per player => 0.02 per game
    ///      - injuryLow = 0.7 per 100 games => 0.007 per game per player => 0.04 per game
    ///      - redCard 1/10 = 0.1 per game
    ///      - yellowCard 2.5 per game 
    /// We encode this in uint16[3] events, which applies to 1 half of the game only.
    ///  - 1 possible event that leaves a player out of the match, encoded in:
    ///          events[0, 1] = [player (from 0 to 13), eventType (injuryHard, injuryLow, redCard)]
    ///  - 2 possible events for yellow card:
    ///          events[2] = player (from 0 to 13)
    ///          events[3] = player (from 0 to 13)
    /// The player value is set to NO_EVENT ( = 14) if no event took place
    /// If we're on the 2nd half, the idx are events[4,5,6,7]
    /// for out of game:
    ///      it cannot return 0
    ///      injuryHard:  1
    ///      injuryLow:   2
    ///      redCard:     3  (aka RED_CARD)
    function computeExceptionalEvents
    (
        uint256 matchLog,
        uint256[PLAYERS_PER_TEAM_MAX] memory skills,
        uint256 tactics,
        bool is2ndHalf,
        bool isBot,
        uint256 seed
    ) 
        public 
        pure 
        returns (uint256) 
    {
        // for bots: set everything to NO_OUT_OF_GAME_PLAYER and return
        if (isBot) {
            matchLog = addYellowCard(matchLog, NO_OUT_OF_GAME_PLAYER, 0, is2ndHalf);
            matchLog = addYellowCard(matchLog, NO_OUT_OF_GAME_PLAYER, 1, is2ndHalf);
            return setOutOfGame(matchLog, NO_OUT_OF_GAME_PLAYER, 0, 0, is2ndHalf);
        }
        // Define 15 weights. Each is the aggressiveness of a given player.
        // The last one (weights[14 = NO_OUT_OF_GAME_PLAYER]) is the weight that nothing happens. 
        uint256[] memory weights = new uint256[](15);
        uint64[] memory rnds = getNRandsFromSeed(seed + 42, 4);

        /// Start by logging that all substitutions are possible. It will be re-written 
        /// only by the function logOutOfGame, in case an outOfGame event prevents the subst
        for (uint8 p = 0; p < 3; p++) {
            if (getSubstitution(tactics,p) != NO_SUBST) {
                matchLog = setInGameSubsHappened(matchLog, CHG_HAPPENED, p, is2ndHalf);
            } 
        }

        /// Build weights for players, based on their aggressiveness.
        /// If no change was planned (in pos = 11,12,13) => skills remain 0 => skills[pos] = 0 => weight = 0
        for (uint8 p = 0; p < NO_OUT_OF_GAME_PLAYER; p++) {
            if (skills[p] != 0) weights[p] = 1 + getAggressiveness(skills[p]); /// weights must be > 0 to ever be selected
        }
        
        /// next: two events for yellow cards
        /// average sumAggressiveness = 11 * 2.5 = 27.5
        /// total = 2.5 per game = 1.25 per half => 0.75 per dice thrown
        /// weight nothing happens = 9
        weights[NO_OUT_OF_GAME_PLAYER] = 9;
        uint8[2] memory yellowCardeds;
        
        yellowCardeds[0] = throwDiceArray(weights, rnds[2]);
        yellowCardeds[1] = throwDiceArray(weights, rnds[3]);

        /// Policiy: if a redcard is given (even if as a result of 2 yellows), log it and leave. Enough punishment.
        /// In 2nd half, first check against yellows in 1st half:
        if (is2ndHalf) {
            if (getYellowCardFirstHalf(skills[yellowCardeds[0]])) {
                matchLog = addYellowCard(matchLog, NO_OUT_OF_GAME_PLAYER, 0, is2ndHalf);
                matchLog = addYellowCard(matchLog, NO_OUT_OF_GAME_PLAYER, 1, is2ndHalf);
                return logOutOfGame(is2ndHalf, true, yellowCardeds[0], matchLog, tactics, [rnds[0], rnds[1]]);
            }
            if (getYellowCardFirstHalf(skills[yellowCardeds[1]])) {
                matchLog = addYellowCard(matchLog, NO_OUT_OF_GAME_PLAYER, 0, is2ndHalf);
                matchLog = addYellowCard(matchLog, NO_OUT_OF_GAME_PLAYER, 1, is2ndHalf);
                return logOutOfGame(is2ndHalf, true, yellowCardeds[0], matchLog, tactics, [rnds[0], rnds[1]]); 
            }
        }

        /// If we made it here, it's either 1st half, or the 2 yellows do not match any yellow in 1st half. 
        /// So just check if both yellows are for the same player. If so, log one yellow only, and one red card. 
        /// Note that if it is 1st half, we need to log
        if (yellowCardeds[0] == yellowCardeds[1] && yellowCardeds[0] != NO_OUT_OF_GAME_PLAYER) {
            matchLog = addYellowCard(matchLog, yellowCardeds[0], 0, is2ndHalf);
            matchLog = addYellowCard(matchLog, NO_OUT_OF_GAME_PLAYER, 1, is2ndHalf);
            return logOutOfGame(is2ndHalf, true, yellowCardeds[0], matchLog, tactics, [rnds[0], rnds[1]]);
        }
        
        /// if we get here: both yellows are to different players, who can continue playing. Record them.
        matchLog = addYellowCard(matchLog, yellowCardeds[0], 0, is2ndHalf);
        matchLog = addYellowCard(matchLog, yellowCardeds[1], 1, is2ndHalf);

        /// Redcards & Injuries:
        /// If a new red card is given to a previously yellow-carded player, no prob, such things happen.
        /// To assign a weight to having an out of game event, consider that:
        /// - average sumOfAllAggressiveness = 11 * ( 1 + avg(0,1,2,3)) = 11 * 2.5 = 27.5
        /// total = 0.07 per game = 0.035 per half => weight nothing happens = 758
        /// The problem is that we very often do not arrive to this line of code, since there have been 2 yellows.
        /// After having played a few leagues, it seems good to increase likelihood of injuries by a factor of x3-x4,
        /// while leaving untouched the likelihood of red cards.
        /// Previously, we had 3 (injuries) vs 5 (red cards) => move to 10 vs 5
        /// So, leave likelihood to 7.2% ( wegiht = 350), and change 3 vs 5 to 7 vs 5
        /// This is an increase in injuries of 7.2/3.5*(10/15)/(3/8) = x 3.6
        /// For red cards, this is an increase of 7.2/3.5*(5/15)/(5/8) = 1.09
        if (getOutOfGameType(matchLog, is2ndHalf) == 0) {
            weights[NO_OUT_OF_GAME_PLAYER] = 350;
            uint8 outOfGamePlayer = throwDiceArray(weights, rnds[0]);
            matchLog = logOutOfGame(is2ndHalf, false, outOfGamePlayer, matchLog, tactics, [rnds[0], rnds[1]]);
        }
        return matchLog;
    }

    // returns true if the outOfGamePlayer is either the starting GK, or a substituted one
    function isOutOfGameForGK(uint8 outOfGamePlayer, uint256 tactics) public pure returns(bool) {
        if (getSubstitution(tactics, 0) == 0 && outOfGamePlayer == 11) return true;
        if (getSubstitution(tactics, 1) == 0 && outOfGamePlayer == 12) return true;
        if (getSubstitution(tactics, 2) == 0 && outOfGamePlayer == 13) return true;
        if (outOfGamePlayer == 0) return true;
        return false;
    }
    
    // returns the pos of the outOfGamePlayer: either the starting GK, or a substituted one
    function getOutOfGameForGK(uint8 outOfGamePlayer, uint256 tactics) public pure returns(uint8) {
        if (getSubstitution(tactics, 0) == 0 && outOfGamePlayer == 11) return 11;
        if (getSubstitution(tactics, 1) == 0 && outOfGamePlayer == 12) return 12;
        if (getSubstitution(tactics, 2) == 0 && outOfGamePlayer == 13) return 13;
        return 0;
    }
    
    function logOutOfGame(
        bool is2ndHalf,
        bool forceRedCard,
        uint8 outOfGamePlayer, 
        uint256 matchLog,
        uint256 tactics,
        uint64[2] memory rnds
    ) 
        public 
        pure 
        returns(uint256) 
    {
        if (outOfGamePlayer == NO_OUT_OF_GAME_PLAYER) return setOutOfGame(matchLog, NO_OUT_OF_GAME_PLAYER, 0, 0, is2ndHalf);

        uint8 minRound = 0;
        uint8 maxRound = ROUNDS_PER_MATCH-1;

        /// first compute the type of event        
        uint8 typeOfEvent = forceRedCard ? RED_CARD : computeTypeOfEvent(rnds[1]);

        /// explicitly reduce red card frequency by 3
        if (typeOfEvent == RED_CARD && ((rnds[1] >> 10) % 3 != 0)) { 
            return setOutOfGame(matchLog, NO_OUT_OF_GAME_PLAYER, 0, 0, is2ndHalf);
        }

        /// for GKs, make sure they do not see a red card, and if they are injured, allow it at the end of 2nd half only.
        /// note that it a GK is substituted, the same applies to the entry GK.
        /// note that in-game events end up in round = ROUNDS_PER_MATCH - 1, so we leave endOfGame for round = ROUNDS_PER_MATCH
        if (isOutOfGameForGK(outOfGamePlayer, tactics)) {
            return (!is2ndHalf || typeOfEvent == RED_CARD) ? 
                setOutOfGame(matchLog, NO_OUT_OF_GAME_PLAYER, 0, 0, is2ndHalf) :
                setOutOfGame(matchLog, getOutOfGameForGK(outOfGamePlayer, tactics), ROUNDS_PER_MATCH, typeOfEvent, is2ndHalf);
        }

        /// if the selected player was one of the guys joining during this half (outGame = 11, 12, or 13),
        /// make sure that the round selected for this event is after joining. 
        if (outOfGamePlayer > 10) {
            minRound = getSubsRound(tactics, outOfGamePlayer - 11);
        }
        /// if the selected player was one of the guys to be changed during this half (outGame = 0,...10),
        /// make sure that the round selected for this event is before the change.
        /// (note that substitution[p] == 11 => NO_SUBS, cannot happen 
        /// in the next else-if (since outOfGamePlayer <= 10 in that branch)
        else {
            for (uint8 p = 0; p < 3; p++) {
                if (outOfGamePlayer == getSubstitution(tactics, p)) {
                    maxRound = getSubsRound(tactics, p);
                    /// log that this substitution was unable to take place
                    if (typeOfEvent == RED_CARD) {
                        matchLog = setInGameSubsHappened(matchLog, CHG_CANCELLED, p, is2ndHalf);
                    }
                } 
            }
        }
        return setOutOfGame(matchLog, outOfGamePlayer, computeRound(rnds[0]+1, minRound, maxRound), typeOfEvent, is2ndHalf);
    }

    function computeRound(uint256 seed, uint8 minRound, uint8 maxRound) public pure returns (uint8 round) {
        if (!(maxRound > minRound)) return minRound; // this should never happen, but it is here for safety
        return minRound + uint8(seed % (maxRound - minRound + 1));
    }

    /// it cannot return 0.
    /// injuryHard:  1
    /// injuryLow:   2
    /// redCard:     3
    function computeTypeOfEvent(uint256 rnd) public pure returns (uint8) {
        uint256[] memory weights = new uint256[](3);
        weights[0] = 3; /// injuryHard   
        weights[1] = 7; /// injuryLow
        weights[2] = 5; /// redCard
        return 1 + throwDiceArray(weights, rnd);
    }

    /// TODO: avoid redCarded or outOfGame players to shoot, include changed players.
    function computePenalties(
        uint256[2] memory matchLogs, 
        uint256[PLAYERS_PER_TEAM_MAX][2] memory skills, 
        uint256 block0, 
        uint256 block1, 
        uint64 seed
    )
        public 
        pure 
        returns(uint256[2] memory) 
    {
        uint64[] memory rnds = getNRandsFromSeed(seed * 7, 14);
        uint8[2] memory totalGoals;
        for (uint8 round = 0; round < 6; round++) {
            if (throwDice(block1, 3 * getSkill(skills[0][10-round], SK_SHO), rnds[2 *round]) == 1) {
                matchLogs[0] = addScoredPenalty(matchLogs[0], round); 
                totalGoals[0] += 1;
            }
            if (throwDice(block0, 3 * getSkill(skills[1][10-round], SK_SHO), rnds[2 *round + 1]) == 1) {
                matchLogs[1] = addScoredPenalty(matchLogs[1], round); 
                totalGoals[1] += 1;
            }
            if (round > 3) {
                /// note: winner = 0: home, 1: away, 2: draw (so if home wins, no need to write anything)
                if (totalGoals[0] > totalGoals[1]) return matchLogs;
                if (totalGoals[0] < totalGoals[1]) { return addWinnerToBothLogs(matchLogs, WINNER_AWAY); }
            }
        }
        if (throwDice(block0 + getSkill(skills[0][4], SK_SHO), block1 + getSkill(skills[1][4], SK_SHO), rnds[13]) == 0) {
            matchLogs[0] = addScoredPenalty(matchLogs[0], 6); 
        } else {
            matchLogs[1] = addScoredPenalty(matchLogs[1], 6); 
            matchLogs = addWinnerToBothLogs(matchLogs, WINNER_AWAY);
        }
        return matchLogs;
    }

    //// @dev Computes basic data, including globalSkills, needed during the game.
    //// @dev Basically implements the formulas:
    /// move2attack =    defence(defenders + 2*midfields + attackers) +
    ///                  speed(defenders + 2*midfields) +
    ///                  pass(defenders + 3*midfields)
    /// globSkills[IDX_CREATE_SHOOT] =    speed(attackers) + pass(attackers)
    /// globSkills[IDX_DEFEND_SHOOT] =    speed(defenders) + defence(defenders);
    /// blockShoot  =    shoot(keeper);
    function getTeamGlobSkills(
        uint256[PLAYERS_PER_TEAM_MAX] memory skills,
        uint256 tactics,
        bool isBot
    )
        public
        pure
        returns(uint256[5] memory globSkills)
    {
        uint8[9] memory playersPerZone = getPlayersPerZone(tactics);
        
        /// for a keeper, the 'shoot skill' is interpreted as block skill
        /// if for whatever reason, user places a non-GK as GK, the block skill is a terrible minimum.
        uint256 posCondModifier;
        uint256 playerSkills = skills[0];
        if (playerSkills != 0) {
            posCondModifier = computeModifierBadPositionAndCondition(0, playersPerZone, playerSkills, isBot);
            computeGKGlobSkills(globSkills, playerSkills, posCondModifier);
        }
        uint256[2] memory fwdModFactors;
        for (uint8 p = 1; p < 11; p++){
            playerSkills = skills[p];
            if (playerSkills != 0) {
                posCondModifier = computeModifierBadPositionAndCondition(p, playersPerZone, playerSkills, isBot);
                fwdModFactors = getExtraAttackFactors(getExtraAttack(tactics, p-1));
                if (p < 1 + getNDefenders(playersPerZone)) {computeDefenderGlobSkills(globSkills, playerSkills, posCondModifier, fwdModFactors);}
                else if (p < 1 + getNDefenders(playersPerZone) + getNMidfielders(playersPerZone)) {computeMidfielderGlobSkills(globSkills, playerSkills, posCondModifier, fwdModFactors);}
                else {computeForwardsGlobSkills(globSkills, playerSkills, posCondModifier, fwdModFactors);}       
            }
        }
        /// endurance is converted to a percentage, 
        /// used to multiply (and hence decrease) the start endurance.
        /// 100 is super-endurant (1500), 70 is bad, for an avg starting team (550).
        /// 20000*11 is super-endurant => 100%
        /// 1000*11 is starting => 65%
        /// 100*11 is terrible => 20%
        
        if (globSkills[IDX_ENDURANCE] > 0) {
            if (globSkills[IDX_ENDURANCE] < 11000) {
                globSkills[IDX_ENDURANCE] = 65 - ((11000-globSkills[IDX_ENDURANCE])*65)/11000;
            } else if (globSkills[IDX_ENDURANCE] < 220000) {
                globSkills[IDX_ENDURANCE] = 100 - ((220000-globSkills[IDX_ENDURANCE])*35)/209000;
            } else {
                globSkills[IDX_ENDURANCE] = 100;
            }
        }
    }

    function subtractOutOfGameSkills(uint256[5] memory globSkills, uint256 skills, uint256 tactics, uint256 posInLineUp) public pure returns(uint256[5] memory) {
        if (skills == 0) return globSkills;

        // If the outOfGamePlayer entered the field during this half time, then it plays in the position of the
        // player it entered for. In such cas, posInLineUp = 11, 12, 13.
        if (posInLineUp > 10) {
           posInLineUp = getSubstitution(tactics, uint8(posInLineUp) - 11);
        }
        uint256[5] memory toSubtractSkills;
        uint8[9] memory playersPerZone = getPlayersPerZone(tactics);
        uint256 posCondModifier = computeModifierBadPositionAndCondition(uint8(posInLineUp), playersPerZone, skills, false);
        if (posInLineUp == 0) {
            computeGKGlobSkills(toSubtractSkills, skills, posCondModifier);
        } else {
            uint256[2] memory fwdModFactors;
            fwdModFactors = getExtraAttackFactors(getExtraAttack(tactics, uint8(posInLineUp) - 1));
            if (posInLineUp < 1 + getNDefenders(playersPerZone)) {computeDefenderGlobSkills(toSubtractSkills, skills, posCondModifier, fwdModFactors);}
            else if (posInLineUp < 1 + getNDefenders(playersPerZone) + getNMidfielders(playersPerZone)) {computeMidfielderGlobSkills(toSubtractSkills, skills, posCondModifier, fwdModFactors);}
            else {computeForwardsGlobSkills(toSubtractSkills, skills, posCondModifier, fwdModFactors);}       
        }

        // do not update endurance, until it is fixed an not rescaled in future versions.
        for (uint8 i = 0; i < IDX_ENDURANCE; i++) {
            if (globSkills[i] > toSubtractSkills[i]) {
                globSkills[i] -= toSubtractSkills[i];
            } else {
                globSkills[i] = 1;
            }
        }
        return globSkills;
    }


    /// It internally computes a "penalty" quantity, and returns modifier = 10000-penalty.
    /// So: large modifier => good, large penalty => bad
    /// Examples: modifier = 0 => max penalty, modifier = 1000 => huge penalty, modifier = 10000 => no penalty
    function computeModifierBadPositionAndCondition(
        uint8 lineupPos, 
        uint8[9] memory playersPerZone, 
        uint256 playerSkills,
        bool isBot
    ) 
        public
        pure
        returns (uint256) 
    {
        /// by construction, we should always have lineupPos < NO_SUBST
        uint256 penalty;
        uint256 forwardness = getForwardness(playerSkills);
        uint256 leftishness = getLeftishness(playerSkills);
        if (forwardness == IDX_GK && lineupPos > 0 || forwardness != IDX_GK && lineupPos == 0) return 500; /// 5%
        uint8[9] memory playersBelow = playersBelowZones(playersPerZone);
        lineupPos--; /// remove the offset due to the GK
        if (lineupPos < playersBelow[0]) { 
            /// assigned to defense left
            penalty = penaltyForDefenders(forwardness);
            penalty += penaltyForLefts(leftishness);
        } else if (lineupPos < playersBelow[1]) { 
            /// assigned to defense center
            penalty = penaltyForDefenders(forwardness);
            penalty += penaltyForCenters(leftishness);
        } else if (lineupPos < playersBelow[2]) { 
            /// assigned to defense left
            penalty = penaltyForDefenders(forwardness);
            penalty += penaltyForRights(leftishness);
        } else if (lineupPos < playersBelow[3]) { 
            /// assigned to mid left
            penalty = penaltyForMids(forwardness);
            penalty += penaltyForLefts(leftishness);
        } else if (lineupPos < playersBelow[4]) { 
            /// assigned to mid center
            penalty = penaltyForMids(forwardness);
            penalty += penaltyForCenters(leftishness);
        } else if (lineupPos < playersBelow[5]) { 
            /// assigned to mid right
            penalty = penaltyForMids(forwardness);
            penalty += penaltyForRights(leftishness);
        } else if (lineupPos < playersBelow[6]) { 
            /// assigned to attack left
            penalty = penaltyForAttackers(forwardness);
            penalty += penaltyForLefts(leftishness);
        } else if (lineupPos < playersBelow[7]) { 
            /// assigned to attack center
            penalty = penaltyForAttackers(forwardness);
            penalty += penaltyForCenters(leftishness);
        } else { 
            /// assigned to attack right
            penalty = penaltyForAttackers(forwardness);
            penalty += penaltyForRights(leftishness);
        }
        /// In no case can penalty be larger than 4000 since it is 
        /// the sum of 2 penalties, and each is at most 2000.
        uint8 gamesNonStop = isBot ? 3 : getGamesNonStopping(playerSkills);
        if (gamesNonStop > 5) {
            return 5000 - penalty;
        } else {
            return 10000 - gamesNonStop * 1000 - penalty;
        }
    }

    /// If extraAttack is active, it will boost 35% some addition of this player to global stats, and decrease by 35% some others.
    /// So, relative to 1e4, this is 1.35*1e4 and 1e4/1.35
    function getExtraAttackFactors(bool extraAttack) public pure returns (uint256[2] memory fwdModFactors) {
        if (extraAttack)    {fwdModFactors = [uint256(13500), uint256(7407)];}
        else                {fwdModFactors = [TEN_TO_4,TEN_TO_4];}
    }

    function computeGKGlobSkills(
        uint256[5] memory globSkills,
        uint256 playerSkills, 
        uint256 posCondModifier
    ) 
        public 
        pure
    {
        /// extraAttack for defenders: 
        ///  - higher move2attack
        ///  - less defend_shoot
        ///  - less endurance
        globSkills[IDX_BLOCK_SHOOT]  += (getSkill(playerSkills, GK_SHO) * posCondModifier) / TEN_TO_4;
        globSkills[IDX_MOVE2ATTACK]  += (getSkill(playerSkills, GK_PAS) * posCondModifier) / (3 * TEN_TO_4); /// 3 times less than a defender
        globSkills[IDX_DEFEND_SHOOT] += (getSkill(playerSkills, GK_1O1) * posCondModifier) / (3 * TEN_TO_4); /// 3 times less than a defender
        globSkills[IDX_ENDURANCE]    += (getSkill(playerSkills, GK_END) * posCondModifier) / TEN_TO_4;
    }
  
    function computeDefenderGlobSkills(
        uint256[5] memory globSkills,
        uint256 playerSkills, 
        uint256 posCondModifier, 
        uint256[2] memory fwdModFactors
    ) 
        public 
        pure
    {
        /// extraAttack for defenders: 
        ///  - higher move2attack
        ///  - less defend_shoot
        ///  - less endurance
        globSkills[IDX_MOVE2ATTACK] += ((getSkill(playerSkills, SK_DEF) + getSkill(playerSkills, SK_SPE) + 2 * getSkill(playerSkills, SK_PAS)) * posCondModifier * fwdModFactors[IDX_BOOST])/TEN_TO_8;
        globSkills[IDX_DEFEND_SHOOT] += ((getSkill(playerSkills, SK_DEF) + getSkill(playerSkills, SK_SPE)) * posCondModifier * fwdModFactors[IDX_TRIM])/TEN_TO_8;
        globSkills[IDX_ENDURANCE]   += ((getSkill(playerSkills, SK_END)) * posCondModifier)/TEN_TO_4;
    }


    function computeMidfielderGlobSkills(
        uint256[5] memory globSkills,
        uint256 playerSkills, 
        uint256 posCondModifier, 
        uint256[2] memory fwdModFactors
    ) 
        public 
        pure
    {
        /// extraAttack for midfielders: 
        ///  - move2attack remains the same, but create shoot increases
        ///  - less defend_shoot, less endurance
        globSkills[IDX_MOVE2ATTACK] += ((2*getSkill(playerSkills, SK_DEF) + 2*getSkill(playerSkills, SK_SPE) + 3*getSkill(playerSkills, SK_PAS)) * posCondModifier)/TEN_TO_4;
        globSkills[IDX_CREATE_SHOOT] += ((getSkill(playerSkills, SK_SPE) + getSkill(playerSkills, SK_PAS)) * posCondModifier * fwdModFactors[IDX_BOOST])/(5 * TEN_TO_8);
        globSkills[IDX_DEFEND_SHOOT] += ((getSkill(playerSkills, SK_DEF) + getSkill(playerSkills, SK_SPE)) * posCondModifier * fwdModFactors[IDX_TRIM])/(5 * TEN_TO_8);
        globSkills[IDX_ENDURANCE]   += ((getSkill(playerSkills, SK_END)) * posCondModifier)/TEN_TO_4;
    }
    
    
    function computeForwardsGlobSkills(
        uint256[5] memory globSkills,
        uint256 playerSkills, 
        uint256 posCondModifier, 
        uint256[2] memory fwdModFactors
    ) 
        public 
        pure
    {
        /// extraAttack for forwards: 
        ///  - by disconnecting them from midifield => less move2attack
        ///  - but once ball is in attack => more likely to create shoot
        globSkills[IDX_MOVE2ATTACK] += ((getSkill(playerSkills, SK_DEF)) * posCondModifier * fwdModFactors[IDX_TRIM])/TEN_TO_8;
        globSkills[IDX_CREATE_SHOOT] += ((getSkill(playerSkills, SK_SPE) + getSkill(playerSkills, SK_PAS)) * posCondModifier * fwdModFactors[IDX_BOOST])/TEN_TO_8;
        globSkills[IDX_ENDURANCE] += ((getSkill(playerSkills, SK_END)) * posCondModifier)/TEN_TO_4;
    }

    function playersBelowZones(uint8[9] memory playersPerZone) public pure returns(uint8[9] memory  playersBelow) {
        playersBelow[0] = playersPerZone[0];    
        for (uint8 z = 1; z < 9; z++) {
            playersBelow[z] = playersBelow[z-1] + playersPerZone[z];
        }
    }

    function penaltyForLefts(uint256 leftishness) public pure returns(uint16) {
        if (leftishness == IDX_C || leftishness == IDX_CR) {return 1000;} 
        else if (leftishness == IDX_R) {return 2000;}
    }

    function penaltyForCenters(uint256 leftishness) public pure returns(uint16) {
        if (leftishness == IDX_L || leftishness == IDX_R) {return 1000;} 
    }

    function penaltyForRights(uint256 leftishness) public pure returns(uint16) {
        if (leftishness == IDX_C || leftishness == IDX_LC) {return 1000;} 
        else if (leftishness == IDX_L) {return 2000;}
    }
    
    function penaltyForDefenders(uint256 forwardness) public pure returns(uint16) {
        if (forwardness == IDX_M || forwardness == IDX_MF) {return 1000;}
        else if (forwardness == IDX_F) {return 2000;}
    }

    function penaltyForMids(uint256 forwardness) public pure returns(uint16) {
        if (forwardness == IDX_D || forwardness == IDX_F) {return 1000;}
    }

    function penaltyForAttackers(uint256 forwardness) public pure returns(uint16) {
        if (forwardness == IDX_M || forwardness == IDX_MD) {return 1000;}
        else if (forwardness == IDX_D) {return 2000;}
    }

    function getLinedUpSkills(
        uint256 matchLog, 
        uint256 tactics, 
        uint256[PLAYERS_PER_TEAM_MAX] memory skills, 
        bool is2ndHalf
    )
        public 
        pure 
        returns 
    (
        uint256,
        uint256[PLAYERS_PER_TEAM_MAX] memory linedUpSkills,
        uint8 err
    ) 
    {
        uint8[14] memory lineup = getFullLineUp(tactics);
        uint8 changes;
        uint8 fieldPlayers;
        
        /// Count changes during half-time, as well as not-aligned players
        for (uint8 p = 0; p < 11; p++) {
            if (lineup[p] != NO_LINEUP) {   
                linedUpSkills[p] = verifyCanPlay(lineup[p], skills[lineup[p]], is2ndHalf, false);
                if (linedUpSkills[p] != 0) {
                    fieldPlayers++;
                    if (is2ndHalf && !getAlignedEndOfFirstHalf(linedUpSkills[p])) {
                        matchLog = addHalfTimeSubs(matchLog, lineup[p]+1, changes); /// for halftime subs, 0 = NO_SUBS
                        changes++;
                    }
                }
            }
        }
        
        /// If we are in 2nd half, count ingame changes that took place during 1st half
        if (is2ndHalf) {
            for (uint8 p = 0; p < 3; p++) {
                if (getInGameSubsHappened(matchLog, p, false) == CHG_HAPPENED) changes++;
            }        
        }

        /// Count subtitutions planned for the half to be played now:
        for (uint8 p = 0; p < 3; p++) {
            if ((getSubstitution(tactics, p) != NO_SUBST) && (lineup[11+p] != NO_LINEUP)) {
                linedUpSkills[11+p] = verifyCanPlay(lineup[11+p], skills[lineup[11+p]], is2ndHalf, true);
                if (linedUpSkills[11+p]>0) {
                    changes++;
                    /// if the player to be substituted was an empty slot, then add 1 to fieldPlayers
                    /// this prevents, e.g., having a red-carded from 1st half not starting the 2nd half (so that the
                    /// system would allow a 10 players lineup), to be immediately substituted by another player, hence
                    /// having 11 players again in the field.
                    if (
                        (lineup[getSubstitution(tactics, p)] == NO_LINEUP) || 
                        (verifyCanPlay(lineup[getSubstitution(tactics, p)], skills[lineup[getSubstitution(tactics, p)]], is2ndHalf, false) == 0)
                    ) {
                        fieldPlayers++;
                    }
                }
            }
        }
        if (changes > 3) return (matchLog, linedUpSkills, ERR_PLAYHALF_HALFCHANGES);
        matchLog = setChangesAtHalfTime(matchLog, changes);
        if (fieldPlayers >= (getOutOfGameType(matchLog, false) == RED_CARD ? 11 : 12)) return (matchLog, linedUpSkills, ERR_PLAYHALF_TOO_MANY_LINEDUP);

        matchLog = addNTot(matchLog, fieldPlayers, is2ndHalf);

        /// Check that the same player does not appear twice in the lineup
        lineup = sort14(lineup);
        for (uint8 p = 1; p < 11; p++) {
            /// check that player does not appear twice in lineUp
            if (!((lineup[p] >= NO_LINEUP) || lineup[p] < lineup[p-1])) return (matchLog, linedUpSkills, ERR_PLAYHALF_PLAYER_TWICE);
        }  
        /// Note that teamSumSkills is the sum of, at most, 14 skills of, at most, 20b each. 
        /// So the total cannot be larger that 24b, which is the limit reserved for teamSumSkills.
        return (matchLog, linedUpSkills, err);      
    }

    function verifyCanPlay(uint8 lineup, uint256 playerSkills, bool is2ndHalf, bool isSubst) public pure returns(uint256) {
        lineup = 0; /// revisit this when subst at 1st half is ready
        bool isWrong =  (playerSkills == 0) ||
                        (getInjuryWeeksLeft(playerSkills) != 0) ||
                        getRedCardLastGame(playerSkills);
        if (is2ndHalf) isWrong = isWrong || getSubstitutedFirstHalf(playerSkills);
        if (isSubst) isWrong = isWrong || getAlignedEndOfFirstHalf(playerSkills);
        if (isWrong) {return 0;} 
        else {return playerSkills;}
    }
}

