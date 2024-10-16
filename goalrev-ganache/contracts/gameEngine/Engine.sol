pragma solidity >= 0.6.3;

import "./EnginePreComp.sol";
import "./EngineLib.sol";
import "../encoders/EncodingMatchLogBase1.sol";
import "../encoders/EncodingMatchLogBase3.sol";
import "../encoders/EncodingTactics.sol";
import "./EngineApplyBoosters.sol";

/**
 @title Library to compute matches
 @author Freeverse.io, www.freeverse.io
 @dev Due to contract-too-large-to-deploy, this contract was split into various
 @dev Although funcions are basically pure, some remain view because of the pointer
 @dev to the rest of the code (inheritance led to too-large-to-deploy)
*/
 
contract Engine is EngineLib, EncodingMatchLogBase1, EncodingMatchLogBase3, EncodingTactics  {
    uint8 constant private PLAYERS_PER_TEAM_MAX = 25;
    uint8 constant public N_SKILLS = 5;
    uint8 constant internal PENALTY_CODE = 100;

    /// prefPosition idxs: GoalKeeper, Defender, Midfielder, Forward, MidDefender, MidAttacker
    uint8 constant public IDX_GK = 0;
    uint8 constant public IDX_D  = 1;
    uint8 constant public IDX_M  = 2;
    uint8 constant public IDX_F  = 3;
    uint8 constant public IDX_MD = 4;
    uint8 constant public IDX_MF = 5;
    
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

    uint8 public constant ROUNDS_PER_MATCH  = 12;   /// Number of relevant actions that happen during a game (12 equals one per 3.7 min)
    uint8 public constant MAX_GOALS_IN_MATCH  = 15;   /// Max number of goals that one single team in an entire match (no restriction on which half)
    /// Idxs for vector of globSkills: 
    uint8 private constant IDX_MOVE2ATTACK  = 0;        
    uint8 private constant IDX_CREATE_SHOOT = 1; 
    uint8 private constant IDX_DEFEND_SHOOT = 2; 
    uint8 private constant IDX_BLOCK_SHOOT  = 3; 
    uint8 private constant IDX_ENDURANCE    = 4; 
    //
    uint8 private constant IDX_IS_2ND_HALF      = 0; 
    uint8 private constant IDX_IS_HOME_STADIUM  = 1; 
    uint8 private constant IDX_IS_PLAYOFF       = 2; 
    uint8 private constant IDX_IS_BOT_HOME      = 3; 
    uint8 private constant IDX_IS_BOT_AWAY      = 4; 
    //
    uint8 private constant IDX_SEED         = 0; 
    uint8 private constant IDX_ST_TIME      = 1; 
    //
    uint256 private constant CHG_HAPPENED   = uint256(1); 
    uint8 public constant RED_CARD  = 3;   /// type of event = redCard
    uint8 private constant WINNER_AWAY = 1;
    uint8 private constant WINNER_DRAW = 2;

    EnginePreComp private _precomp;
    EngineApplyBoosters private _applyBoosters;

    constructor(address precompAddr, address applyBoosterAddr) public {
        _precomp = EnginePreComp(precompAddr);
        _applyBoosters = EngineApplyBoosters(applyBoosterAddr);
    }
    
    /**
     * @dev playHalfMatch is the main function that simulates a match
     * @param seed the pseudo-random number to use as a seed for the match; it's someone else's due to make it unique for each match.
     * @param matchStartTime in secs, the timeStamp of inside the verse that emitted the seed 
     * @param skills a 2-array, each of the 2 being an array with the skills of the players of the corresponding team
     * @param tactics a 2-array with the tacticId (ex. tacticId = 0 for [4,4,2]) for each team
     * @param matchLogs a 2-array with the matchLogs of the previous half (be it 1st half, of 2nd half of last match) for each team
     * @param matchBools a 3-array containing: [is2ndHalf, isHomeStadium, isPlayoff]
     * @return an array containing: [matchLogs[0], matchLogs[1], event[0],..., event[last]]
     */
    /// for each event: 0: teamThatAttacks, 1: managesToShoot, 2: shooter, 3: isGoal, 4: assister
    function playHalfMatch(
        uint256 seed,
        uint256 matchStartTime, 
        uint256[PLAYERS_PER_TEAM_MAX][2] memory skills,
        uint256[2] memory tactics,
        uint256[2] memory matchLogs,
        bool[5] memory matchBools 
    )
        public
        view
        returns (uint256[2+5*ROUNDS_PER_MATCH] memory, uint8 err)
    {
        uint256[2] memory blockSkillGK;
        uint256[2+5*ROUNDS_PER_MATCH] memory seedAndStartTimeAndEvents;
        seedAndStartTimeAndEvents[0] = seed; 
        seedAndStartTimeAndEvents[1] = matchStartTime; 
        
        (matchLogs, blockSkillGK, err) = playMatchWithoutPenalties(
            seedAndStartTimeAndEvents, 
            skills,
            tactics,
            matchLogs,
            matchBools
        );
        if (err > 0) return (seedAndStartTimeAndEvents, err);

        if (matchBools[IDX_IS_2ND_HALF]) {
            if (matchBools[IDX_IS_PLAYOFF] && ( getNGoals(matchLogs[0]) == getNGoals(matchLogs[1]))) {
                matchLogs = _precomp.computePenalties(matchLogs, skills, blockSkillGK[0], blockSkillGK[1], uint64(seed));  /// TODO seed
            } else {
                /// note that WINNER_HOME = 0, so no need to write anything if home wins.
                if (getNGoals(matchLogs[0]) == getNGoals(matchLogs[1])) matchLogs = addWinnerToBothLogs(matchLogs, WINNER_DRAW);
                else if (getNGoals(matchLogs[0]) < getNGoals(matchLogs[1])) matchLogs = addWinnerToBothLogs(matchLogs, WINNER_AWAY);
            }
        }
        /// convert seedAndStartTimeAndEvents --> matchLogsAndEvents
        seedAndStartTimeAndEvents[0] = setIsHomeStadium(matchLogs[0], matchBools[IDX_IS_HOME_STADIUM]);
        seedAndStartTimeAndEvents[1] = setIsHomeStadium(matchLogs[1], matchBools[IDX_IS_HOME_STADIUM]);
        return (seedAndStartTimeAndEvents, 0);
    }
    
    /**
     * @dev playHalfMatch same interface as playMatch, except that a couple of params are serialized inside seedAndStartTimeAndEvents,
     * @dev ...which contains [seed, startTimeInSecs, events[0], events[1], ...]
     */
    function playMatchWithoutPenalties(
        uint256[2+5*ROUNDS_PER_MATCH] memory seedAndStartTimeAndEvents,
        uint256[PLAYERS_PER_TEAM_MAX][2] memory skills,
        uint256[2] memory tactics,
        uint256[2] memory matchLogs,
        bool[5] memory matchBools /// [is2ndHalf, isHomeStadium, isPlayoff]
    )
        public
        view
        returns (uint256[2] memory, uint256[2] memory, uint8 err)
    {
        uint256[5][2] memory globSkills;
        
        (matchLogs[0], skills[0], err) = getLinedUpSkillsAndOutOfGames(skills[0], tactics[0], matchBools[IDX_IS_2ND_HALF], matchLogs[0], seedAndStartTimeAndEvents[IDX_SEED], matchBools[IDX_IS_BOT_HOME]);
        if (err > 0) return (matchLogs, [uint256(0), uint256(0)], err);
        (matchLogs[1], skills[1], err) = getLinedUpSkillsAndOutOfGames(skills[1], tactics[1], matchBools[IDX_IS_2ND_HALF], matchLogs[1], seedAndStartTimeAndEvents[IDX_SEED]+256, matchBools[IDX_IS_BOT_AWAY]);
        if (err > 0) return (matchLogs, [uint256(0), uint256(0)], err);

        matchLogs[0] = computeNGKAndDefs(matchLogs[0], skills[0], getNDefendersFromTactics(tactics[0]), matchBools[IDX_IS_2ND_HALF]);
        matchLogs[1] = computeNGKAndDefs(matchLogs[1], skills[1], getNDefendersFromTactics(tactics[1]), matchBools[IDX_IS_2ND_HALF]);

        globSkills[0] = _precomp.getTeamGlobSkills(skills[0], tactics[0], matchBools[IDX_IS_BOT_HOME]);
        globSkills[1] = _precomp.getTeamGlobSkills(skills[1], tactics[1], matchBools[IDX_IS_BOT_AWAY]);

        if (matchBools[IDX_IS_HOME_STADIUM]) {
            globSkills[0][IDX_ENDURANCE] = (globSkills[0][IDX_ENDURANCE] * 11500)/10000;
        }
        computeRounds(matchLogs, seedAndStartTimeAndEvents, skills, tactics, globSkills, matchBools[IDX_IS_2ND_HALF]);
        return (matchLogs, [globSkills[0][IDX_BLOCK_SHOOT], globSkills[1][IDX_BLOCK_SHOOT]], err);
    }
    
    function computeRounds(
        uint256[2] memory matchLogs,
        uint256[2+5*ROUNDS_PER_MATCH] memory seedAndStartTimeAndEvents, 
        uint256[PLAYERS_PER_TEAM_MAX][2] memory skills, 
        uint256[2] memory tactics,
        uint256[5][2] memory globSkills, 
        bool is2ndHalf
    ) 
        public
        view
    {
        uint8[9][2] memory playersPerZone = [getPlayersPerZone(tactics[0]), getPlayersPerZone(tactics[1])];
        bool[10][2] memory extraAttack = [getFullExtraAttack(tactics[0]), getFullExtraAttack(tactics[1])];

        uint64[] memory rnds = getNRandsFromSeed(seedAndStartTimeAndEvents[IDX_SEED], ROUNDS_PER_MATCH*5);
        uint8 teamThatAttacks;
        uint256[3][2] memory outOfGameData = getOutOfGameData(matchLogs, is2ndHalf);
        for (uint8 round = 0; round < ROUNDS_PER_MATCH; round++){
            if (outOfGameData[0][0] > 0 && outOfGameData[0][1] == round) { 
                globSkills[0] = _precomp.subtractOutOfGameSkills(globSkills[0], skills[0][outOfGameData[0][2]], tactics[0], outOfGameData[0][2]); 
            }
            if (outOfGameData[1][0] > 0 && outOfGameData[1][1] == round) { 
                globSkills[1] = _precomp.subtractOutOfGameSkills(globSkills[1], skills[1][outOfGameData[1][2]], tactics[1], outOfGameData[1][2]); 
            }
            if (is2ndHalf && ((round == 0) || (round == 5))) {
                teamsGetTired(globSkills[0], globSkills[1], matchLogs);
            }
            teamThatAttacks = throwDice(globSkills[0][IDX_MOVE2ATTACK], globSkills[1][IDX_MOVE2ATTACK], rnds[5*round]);
            seedAndStartTimeAndEvents[2 + round * 5] = teamThatAttacks;
            if (managesToShoot(matchLogs, teamThatAttacks, globSkills, rnds[5*round+1])) {
                seedAndStartTimeAndEvents[2 + round * 5 + 1] = 1;
                bool isPenalty = computeIsPenalty(rnds[5*round+2]);
                uint256 GKskill = getRelevantGKSkill(isPenalty, globSkills[1-teamThatAttacks][IDX_BLOCK_SHOOT], skills[1-teamThatAttacks][0]);
                /// scoreData: 0: matchLog, 1: shooter, 2: isGoal, 3: assister
                uint256[4] memory scoreData = managesToScore(
                    matchLogs[teamThatAttacks],
                    skills[teamThatAttacks],
                    playersPerZone[teamThatAttacks],
                    extraAttack[teamThatAttacks],
                    GKskill,
                    isPenalty,
                    [rnds[5*round+2], rnds[5*round+3], rnds[5*round+4]]
                );
                matchLogs[teamThatAttacks] = scoreData[0];
                seedAndStartTimeAndEvents[2 + round * 5 + 2] = scoreData[1];
                seedAndStartTimeAndEvents[2 + round * 5 + 3] = scoreData[2];
                seedAndStartTimeAndEvents[2 + round * 5 + 4] = scoreData[3];
            }
        }
    }

    // To save penalties, we will average: 80% from the blockPenalty skill, 20% from overall blockShoot.
    function getRelevantGKSkill(bool isPen, uint256 blockShoot, uint256 skillsGK) public pure returns (uint256) {
        return isPen ? (blockShoot + 4 * getSkill(skillsGK, GK_PEN)) / 5 : blockShoot;
    }

    // In real life, there are 0.3 penalties per match. Let us increase them to 0.4.
    // Our matches have 24 rounds per game. Say, in about 12, someone manages to shoot.
    // If a shoot has probability p of being a penalty, then < penalties > = 12 p 
    // So, choose p = 0.4/12 = 4/120 = 1/30
    function computeIsPenalty(uint64 rnd) public pure returns (bool) {
        return (rnd % 20) == 0;
    }

    
    function getOutOfGameData(uint256[2] memory matchLogs, bool is2ndHalf) public pure returns (uint256[3][2] memory outOfGameData) {
        for (uint8 team = 0; team < 2; team++) {
            outOfGameData[team][0] = getOutOfGameType(matchLogs[team], is2ndHalf);
            outOfGameData[team][1] = getOutOfGameRound(matchLogs[team], is2ndHalf);
            outOfGameData[team][2] = getOutOfGamePlayer(matchLogs[team], is2ndHalf);
        }
    }


    /// getLinedUpSkillsAndOutOfGames:
    ///      1. Unpacks the tactics and lineUp, verifies validity 
    ///      2. Rewrites skills[25] so that the first [14] entries correspond to players that will actually play
    ///      3. Compute the yellow cards, red cards, injuries, and adds them to matchLog
    /// RETURNS: (matchLog, linedUpSkills, playerPerZone)
    /// On the unpacking:
    ///  - it translates from a high level tacticsId (e.g. 442) to a format that describes how many
    ///      players play in each of the 9 zones in the field (Def, Mid, Forw) x (L, C, R), 
    ///  - note that we impose left-right symmetry: DR = DL, MR = ML, FR = FL,
    ///      so we only manage 6 numbers: [DL, DM, ML, MM, FL, FM], and force 
    function getLinedUpSkillsAndOutOfGames(
        uint256[PLAYERS_PER_TEAM_MAX] memory skills, 
        uint256 tactics,
        bool is2ndHalf,
        uint256 matchLog,
        uint256 seed,
        bool isBot
    ) 
        public 
        view 
        returns 
    (
        uint256, 
        uint256[PLAYERS_PER_TEAM_MAX] memory linedUpSkills, 
        uint8 err
    ) 
    {
        (matchLog, linedUpSkills, err) = _precomp.getLinedUpSkills(matchLog, tactics, skills, is2ndHalf);
        linedUpSkills = _applyBoosters.applyItemBoost(linedUpSkills, tactics);
        matchLog = _precomp.computeExceptionalEvents(matchLog, linedUpSkills, tactics, is2ndHalf, isBot, seed); 
        return (matchLog, linedUpSkills, err);
    }
    
    /// adds to the matchLog the number of defenders and GKs actually linedUp (some skills could be empty slots)
    /// ...at least, linedUp at the start of the current half
    function computeNGKAndDefs(
        uint256 matchLog, 
        uint256[PLAYERS_PER_TEAM_MAX] memory skills, 
        uint8 nDefsInTactics, 
        bool is2ndHalf
    ) 
        public 
        pure 
        returns (uint256) 
    {
        uint8 n;
        for (uint8 p = 0; p < 1 + nDefsInTactics; p++) {
            if (skills[p] != 0) n++;
        }
        return addNGKAndDefs(matchLog, n, is2ndHalf);
    }

    //// @dev Rescales global skills of both teams according to their endurance
    function teamsGetTired(uint256[5] memory skillsTeamA, uint256[5]  memory skillsTeamB, uint256[2] memory matchLogs)
        public
        pure
        returns (uint256[5] memory , uint256[5] memory) 
    {
        // To accound for halftime changes: assume that if we could change 7 players.
        // then the team would effectively not get tired at all.
        // factor(changes = 0) = endurance/100
        // factor(changes = 7) = 1
        // so: factor = e/100 + changes/7 (1-e/100) = ( (7-changes) * end + 100 * changes)/700
        uint256 changesA = getChangesAtHalfTime(matchLogs[0]);
        uint256 changesB = getChangesAtHalfTime(matchLogs[1]);
        uint256 factorA = (7 - changesA) * skillsTeamA[IDX_ENDURANCE] + 100 * changesA;
        uint256 factorB = (7 - changesB) * skillsTeamB[IDX_ENDURANCE] + 100 * changesB;
        for (uint8 sk = IDX_MOVE2ATTACK; sk < IDX_ENDURANCE; sk++) {
            skillsTeamA[sk] = (skillsTeamA[sk] * factorA) / 700;
            skillsTeamB[sk] = (skillsTeamB[sk] * factorB) / 700;
        }
        return (skillsTeamA, skillsTeamB);
    }

    /// Decides if a team manages to shoot by confronting attack and defense via globSkills
    function managesToShoot(uint256[2] memory matchLogs, uint8 teamThatAttacks, uint256[5][2] memory globSkills, uint256 rndNum)
        public
        pure
        returns (bool)
    {
        if (globSkills[teamThatAttacks][IDX_CREATE_SHOOT] == 0) return false;
        // goalDelta =  0, 1, 2, 3, 4, 5, 6, 7
        // penalty   =  1, 1, 2, 3, 4, 5, 6, 7
        uint256 penaltyForMasacre = 1; 
        uint256 goalsTeamThatAttacks = getNGoals(matchLogs[teamThatAttacks]);
        uint256 goalsTeamThatDefends = getNGoals(matchLogs[1-teamThatAttacks]);
        if (goalsTeamThatAttacks >= goalsTeamThatDefends + 2) {
            penaltyForMasacre = goalsTeamThatAttacks - (goalsTeamThatDefends + 2) + 2;
        }
        return throwDice(
            (globSkills[1-teamThatAttacks][IDX_DEFEND_SHOOT]),       /// globSkills[IDX_DEFEND_SHOOT] of defending team against...
            (globSkills[teamThatAttacks][IDX_CREATE_SHOOT]*6)/(10 * penaltyForMasacre),  /// globSkills[IDX_CREATE_SHOOT] of attacking team.
            rndNum
        ) == 1 ? true : false;
    }

    function selectAssister(
        uint256[PLAYERS_PER_TEAM_MAX] memory skills,
        uint8[9] memory playersPerZone,
        bool[10] memory extraAttack,
        uint8 shooter,
        uint256 rnd
    )
        public
        pure
        returns (uint8)
    {
        uint256[] memory weights = new uint256[](11);
        /// if selected assister == selected shooter =>  
        ///  there was no assist => individual play by shoorter
        weights[0] = 1;
        uint256 teamPassCapacity = weights[0];
        uint8 p = 1;
        for (uint8 i = 0; i < getNDefenders(playersPerZone); i++) {
            weights[p] = uint256(extraAttack[p-1] ? 90 : 20) * getSkill(skills[p], SK_PAS);
            teamPassCapacity += weights[p];
            p++;
        }
        for (uint8 i = 0; i < getNMidfielders(playersPerZone); i++) {
            weights[p] = uint256(extraAttack[p-1] ? 150 : 100) * getSkill(skills[p], SK_PAS);
            teamPassCapacity += weights[p];
            p++;
        }
        for (uint8 i = 0; i < getNAttackers(playersPerZone); i++) {
            weights[p] = uint256(200) * getSkill(skills[p], SK_PAS);
            teamPassCapacity += weights[p];
            p++;
        }
        
        /// on average: teamPassCapacity442 = (1 + 4 * 20 + 4 * 100 + 2 * 200) < getPass > = 881 <pass>_team
        /// on average: shooterSumOfSkills = 5 * <skills>_shooter
        /// so a good ratio is shooterSumOfSkills/teamPassCapacity442 = 5/881 * <skills_shooter>/<pass>_team
        /// or better, to have an avg of 1: (shooterSumOfSkills*271)/(teamPassCapacity * 5) = <skills_shooter>/<pass>_team
        /// or to have a 50% chance, multiply by 10, and to have say, 1/3, multiply by 10/3
        /// this is to be compensated by an overall factor of about.
        if (teamPassCapacity <= weights[shooter]) return shooter;
        
        weights[shooter] = (weights[shooter] * getSumOfSkills(skills[shooter]) * uint256(8810))/ (uint256(3 * N_SKILLS) * (teamPassCapacity - weights[shooter]));
        return throwDiceArray(weights, rnd);
    }

    function selectShooter(
        uint256[PLAYERS_PER_TEAM_MAX] memory skills,
        uint8[9] memory playersPerZone,
        bool[10] memory extraAttack,
        uint256 rnd
    )
        public
        pure
        returns (uint8)
    {
        uint256[] memory weights = new uint256[](11);
        /// GK has minimum weight, all others are relative to this.
        weights[0] = 1;
        uint8 p = 1;
        for (uint8 i = 0; i < getNDefenders(playersPerZone); i++) {
            weights[p] = (extraAttack[p-1] ? 15000 : 5000 ) * getSkill(skills[p], SK_SPE);
            p++;
        }
        for (uint8 i = 0; i < getNMidfielders(playersPerZone); i++) {
            weights[p] = (extraAttack[p-1] ? 50000 : 25000 ) * getSkill(skills[p], SK_SPE);
            p++;
        }
        for (uint8 i = 0; i < getNAttackers(playersPerZone); i++) {
            weights[p] = 75000 * getSkill(skills[p], SK_SPE);
            p++;
        }
        return throwDiceArray(weights, rnd);
    }

    /// Decides if a team that creates a shoot manages to score.
    /// First: select attacker who manages to shoot. Second: challenge him with keeper
    function managesToScore(
        uint256 matchLog,
        uint256[PLAYERS_PER_TEAM_MAX] memory skills,
        uint8[9] memory playersPerZone,
        bool[10] memory extraAttack,
        uint256 blockShoot,
        bool isPenalty,
        uint64[3] memory rnds
    )
        public
        pure
        returns (uint256[4] memory scoreData)
    {
        scoreData[0] = matchLog;
        uint8 currentGoals = getNGoals(matchLog);
        /// if we scored alread the max number of goals, return. Note that isGoal = 0 inside scoreData.
        if (currentGoals >= MAX_GOALS_IN_MATCH) return scoreData;
        uint8 shooter = isPenalty ? getBestShooter(skills) : selectShooter(skills, playersPerZone, extraAttack, rnds[0]);
        scoreData[1] = uint256(shooter);
        bool isGoal;
        if (isPenalty) {
            /// 75% of penalties are scored in the premier league
            isGoal = throwDice(3 * getSkill(skills[shooter], SK_SHO), blockShoot, rnds[1]) == 0;
        } else {
            /// a goal is scored by confronting his shoot skill to the goalkeeper block skill
            /// handicap = 10 for the standard case (not-a-GK shooting), 1 otherise => so we need to divide by extra 10
            uint256 shootHandicap = ( getForwardness(skills[shooter]) == IDX_GK ? 1 : 10);
            isGoal = throwDice((getSkill(skills[shooter], SK_SHO) * 7 * shootHandicap)/100, blockShoot, rnds[1]) == 0;
        }
        scoreData[2] = uint256(isGoal ? 1: 0);
        uint8 assister;
        if (isPenalty) assister = PENALTY_CODE;
        if (!isPenalty && isGoal) assister = selectAssister(skills, playersPerZone, extraAttack, shooter, rnds[2]);
        // stuff is only added to the matchlog if this is a goal
        if (isGoal) {
            matchLog = addAssister(matchLog, assister, currentGoals);
            matchLog = addShooter(matchLog, shooter, currentGoals);
            matchLog = addForwardPos(matchLog, getForwardPosFromPlayersPerZone(shooter, playersPerZone), currentGoals);
            matchLog++; /// adds 1 goal because nGoals is the right-most number serialized
            scoreData[0] = matchLog;
        }
        scoreData[3] = uint256(assister);
        return scoreData;
    }
    
    function getForwardPosFromPlayersPerZone(uint8 posInLineUp, uint8[9] memory playersPerZone) public pure returns (uint8) {
        if (posInLineUp == 0) return 0;
        else if (posInLineUp < 1 + getNDefenders(playersPerZone)) return 1;
        else if (posInLineUp < 1 + getNDefenders(playersPerZone) + getNMidfielders(playersPerZone)) return 2;
        else return 3;
    }

    function getBestShooter(uint256[PLAYERS_PER_TEAM_MAX] memory skills) public pure returns (uint8 bestShooter) {
        uint256 maxSkill = 0;
        for (uint8 p = 1; p < 11; p++) {
            uint256 thisSkill = getSkill(skills[p], SK_SHO);
            if (thisSkill > maxSkill) {
                bestShooter = p;
                maxSkill = thisSkill;
            }
        }
    }
}