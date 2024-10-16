pragma solidity >= 0.6.3;

import "../storage/ComputeSkills.sol";
import "./EngineLib.sol";
import "../encoders/EncodingMatchLog.sol";
import "../encoders/EncodingTPAssignment.sol";
import "../encoders/EncodingSkills.sol";
import "../encoders/EncodingSkillsSetters.sol";
import "../encoders/EncodingTacticsBase2.sol";

/**
 @title Computes training points given a matchLog, and applies them given a TP assignment by user
 @author Freeverse.io, www.freeverse.io
 @dev all functions are pure except for several ones, that had to be made view to access the Assets code.
 @dev Inheriting Assets led to too-large-to-deploy 
*/

contract TrainingPoints is EncodingMatchLog, EngineLib, EncodingTPAssignment, EncodingSkills, EncodingSkillsSetters, EncodingTacticsBase2, ComputeSkills {
    
    /// a set of constants that make the formulas below more readable
    uint256 constant internal YEARS_30  = 946080000; /// 30 years in sec
    uint256 constant internal YEARS_35h = 1119528000; /// 35.5 years in sec
    uint256 constant internal YEARS_1   = 31536000; /// 1 year in sec
    uint256 constant internal YEARS_2   = 63072000; /// 2 year in sec
    uint256 constant internal YEARS_16  = 504576000; /// 16 year in sec
    uint256 constant internal DAYS_1    = 86400; /// 1 day in sec

    function computeTrainingPoints(uint256 matchLog0, uint256 matchLog1) public pure returns (uint256, uint256)
    {
        /// +11 point for winning at home, +22 points for winning
        /// away, or in a cup match. 0 points for drawing.
        uint256 nGoals0 = getNGoals(matchLog0);
        uint256 nGoals1 = getNGoals(matchLog1);
        uint256[2] memory points;
        points[0] = POINTS_FOR_HAVING_PLAYED;
        points[1] = POINTS_FOR_HAVING_PLAYED;

        if (getWinner(matchLog0)==0) { /// we can get winner from [0] or [1], they are the same   
            points[0] += (getIsHomeStadium(matchLog0) ? 11 : 22); /// we can get homeStadium from [0] or [1], they are the same   
        } else if (getWinner(matchLog0)==1) {
            points[1] += (getIsHomeStadium(matchLog0) ? 22 : 22);    
        }
        
        /// +6 for goal scored by GK/D; +5 for midfielder; +4 for attacker; +3 for each assist
        points[0] += pointsPerWhoScoredGoalsAndAssists(matchLog0, nGoals0);
        points[1] += pointsPerWhoScoredGoalsAndAssists(matchLog1, nGoals1);

        /// if clean-sheet (opponent did not score):
        /// +2 per half played by GK/D, +1 per half played for Mids and Atts
        if (nGoals1 == 0) points[0] += pointsPerCleanSheet(matchLog0);
        if (nGoals0 == 0) points[1] += pointsPerCleanSheet(matchLog1);

        uint256[2] memory pointsNeg;
        /// -1 for each opponent goal
        pointsNeg[0] = nGoals1;
        pointsNeg[1] = nGoals0;
        /// -3 for redCards, -1 for yellows
        for (uint8 team = 0; team < 2; team++) {
            uint256 thisLog = (team == 0 ? matchLog0 : matchLog1);
            pointsNeg[team] += 
                    (getOutOfGameType(thisLog, false) == RED_CARD ? 3 : 0)
                +   (getOutOfGameType(thisLog, true)  == RED_CARD ? 3 : 0)
                +   ((getYellowCard(thisLog, 0, false) < NO_OUT_OF_GAME_PLAYER) ? 1 : 0) 
                +   ((getYellowCard(thisLog, 1, false) < NO_OUT_OF_GAME_PLAYER) ? 1 : 0)
                +   ((getYellowCard(thisLog, 0, true)  < NO_OUT_OF_GAME_PLAYER) ? 1 : 0) 
                +   ((getYellowCard(thisLog, 1, true)  < NO_OUT_OF_GAME_PLAYER) ? 1 : 0);
        }
        
        /// subtract points, keeping them always non-negativre
        points[0] = (points[0] > pointsNeg[0]) ? (points[0] - pointsNeg[0]) : 0;
        points[1] = (points[1] > pointsNeg[1]) ? (points[1] - pointsNeg[1]) : 0;
        
        /// +10% for each extra 50 points of lack of balance between teams
        uint256 teamSumSkills0 = getTeamSumSkills(matchLog0);
        uint256 teamSumSkills1 = getTeamSumSkills(matchLog1);

        if ((teamSumSkills0 == 0) || (teamSumSkills1 == 0)) {
            points[0] = POINTS_FOR_HAVING_PLAYED;
            points[1] = POINTS_FOR_HAVING_PLAYED;
        } else {
            if (teamSumSkills1 > 3 * teamSumSkills0) teamSumSkills1 = 3 * teamSumSkills0;
            if (teamSumSkills0 > 3 * teamSumSkills1) teamSumSkills0 = 3 * teamSumSkills1;
            points[0] = (points[0] * teamSumSkills1) / (teamSumSkills0);
            points[1] = (points[1] * teamSumSkills0) / (teamSumSkills1);
        }

        if (points[0] > MAX_POINTS_PER_GAME) points[0] = MAX_POINTS_PER_GAME;
        if (points[1] > MAX_POINTS_PER_GAME) points[1] = MAX_POINTS_PER_GAME;

        if (points[0] < POINTS_FOR_HAVING_PLAYED) points[0] = POINTS_FOR_HAVING_PLAYED;
        if (points[1] < POINTS_FOR_HAVING_PLAYED) points[1] = POINTS_FOR_HAVING_PLAYED;
        
        matchLog0 = addTrainingPoints(matchLog0, points[0]);
        matchLog1 = addTrainingPoints(matchLog1, points[1]);
        return (matchLog0, matchLog1);
    }
    
    /// if clean-sheet (opponent did not score):
    /// +2 per half played by GK/D, +1 per half played for Mids and Atts
    function pointsPerCleanSheet(uint256 matchLog) public pure returns (uint256) {
        /// formula: (note that for a given half: nGK + nDef + nMid + nAtt = nTot)
        ///      pointsPerHalf   = 2 (nGK + nDef) + nMid + nAtt 
        ///                      = 2 (nGK + nDef) + nTot - nDef - nGK = 
        ///                      = nTot + nGk + nDef
        return getNTot(matchLog, false) + getNTot(matchLog, true) + getNGKAndDefs(matchLog, false) + getNGKAndDefs(matchLog, true) ;
    }
    
    /// +6 for goal scored by GK/D; +5 for midfielder; +4 for attacker; +3 for each assist
    function pointsPerWhoScoredGoalsAndAssists(uint256 matchLog, uint256 nGoals) public pure returns(uint256 points) {
        for (uint8 goal = 0; goal < nGoals; goal++) {
            uint256 fwdPos = getForwardPos(matchLog, goal);
            if (fwdPos < 2) {points += 6;}
            else if (fwdPos == 2) {points += 5;}
            else {points += 4;}
            /// if assister is different the shooter, it was a true assist
            if (getShooter(matchLog, goal) != getAssister(matchLog, goal)) {points += 3;}
        }
    }

    // bot evolution is restricted to generating children if needed, to avoid assigning teams with very old players
    function evolveBot(
        uint256[PLAYERS_PER_TEAM_MAX] memory teamSkills, 
        uint256 matchStartTime
    ) 
        public
        pure
        returns (uint256[PLAYERS_PER_TEAM_MAX] memory)
    {
        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            uint256 thisSkills = teamSkills[p];
            if (thisSkills == 0) continue; 
            uint256 ageInSecs = INGAMETIME_VS_REALTIME * (matchStartTime - getBirthDay(thisSkills) * DAYS_1); 
            teamSkills[p] = generateChildIfNeeded(thisSkills, ageInSecs, matchStartTime);
        }
        return teamSkills;
    }

    function applyTrainingPoints(
        uint256[PLAYERS_PER_TEAM_MAX] memory teamSkills, 
        uint256 assignedTPs,
        uint256 tactics,
        uint256 matchStartTime,
        uint16 earnedTPs
    ) 
        public
        pure
        returns (uint256[PLAYERS_PER_TEAM_MAX] memory, uint8 err)
    {
        uint16[25] memory TPperSkill;
        uint8 specialPlayer; 
        uint16 TP; 
        
        /// even if assignedTPs = 0, players can get older, and use stamina pills to reduce nGamesNonStopping
        if (assignedTPs != 0) {
            (TPperSkill, specialPlayer, TP, err) = decodeTP(assignedTPs);
            if (err > 0) return (teamSkills, err);
            if (earnedTPs != TP) return (teamSkills, ERR_TRAINING_PREVMATCH); // assignedTPs used an amount of TP that does not match the earned TPs in previous match
        } else {
            specialPlayer = NO_PLAYER;
        }
        
        uint16[5] memory singleTPperSkill;
        (uint8[PLAYERS_PER_TEAM_MAX] memory staminas,,) = getItemsData(tactics);
                
        /// note that if no special player was selected => specialPlayer = PLAYERS_PER_TEAM_MAX 
        /// ==> it will never be processed in this loop
        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            uint256 thisSkills = teamSkills[p];
            if (thisSkills == 0) continue; 
            if (staminas[p] > 0) {
                (thisSkills, err) = reduceGamesNonStopping(thisSkills, staminas[p]);
                if (err > 0) return (teamSkills, err);
            }
            for (uint8 s = 0; s < 5; s++) singleTPperSkill[s] = TPperSkill[getOffset(p, specialPlayer, getForwardness(thisSkills)) + s];
            teamSkills[p] = evolvePlayer(thisSkills, singleTPperSkill, matchStartTime);
        }    
        return (teamSkills, 0);
    }
    
    function getOffset(uint8 p, uint8 specialPlayer, uint256 forwardness) public pure returns (uint8 offset) {
        if (p == specialPlayer) offset = 20; 
        else if(forwardness == IDX_GK) offset = 0;
        else if(forwardness == IDX_D) offset = 5;
        else if(forwardness == IDX_F) offset = 15;
        else offset = 10;
    }
    
    /// deltaS(i)    = max[ TP(i), TP(i) * (pot * 4/3 - (age-16)/2) ] - max(0,(age-31)*f), where f = 1 for slow, 16 for fast
    /// If age is in days, define Yd = year2days
    /// deltaS(i)    = max[ TP(i), TP(i) * (pot * 8 * Yd - 3 * ageDays + 48 Yd)/ (6 Yd)] - max(0,(ageDays-31)*f/Yd)
    /// If age is in secs, define Ys = year2secs
    /// deltaS(i)    = max[ TP(i), TP(i) * (pot * 8 * Ys - 3 * ageInSecs + 48 Ys)/ (6 Ys)] - max(0,(ageInSecs-31)*f/Ys)
    /// skill(i)     = max(0, skill(i) + deltaS(i))
    /// deltaS(i)    = max[ TP(i), TP(i) * numerator / denominator] - max(0,(ageInSecs-31)*f/Ys)
    /// skill(i)     = max(0, skill(i) + deltaS(i))
    /// shoot, speed, pass, defence, endurance
    function evolvePlayer(uint256 skills, uint16[5] memory TPperSkill, uint256 matchStartTime) public pure returns(uint256) {
        uint256 ageInSecs = INGAMETIME_VS_REALTIME * (matchStartTime - getBirthDay(skills) * DAYS_1); 
        uint256 deltaNeg;
        if (ageInSecs > YEARS_35h) {
            deltaNeg = ((ageInSecs-YEARS_30) * 16)/YEARS_1;
        } else if (ageInSecs > YEARS_30) {
            deltaNeg = (ageInSecs-YEARS_30)/YEARS_1;
        }
        uint256 numerator;
        if (getPotential(skills) * 252288000 + 1513728000 > 3 * ageInSecs) {  /// 252288000 = 8 Ys,  1513728000 = 48 Ys, 189216000 = 6 Ys
            numerator = (getPotential(skills) * 252288000 + 1513728000 - 3 * ageInSecs);
        } else {
            numerator = 0;
        }
        uint256 sum;
        for (uint8 sk = 0; sk < N_SKILLS; sk++) {
            uint256 newSkill = getNewSkill(getSkill(skills, sk), TPperSkill[sk], numerator, 189216000, deltaNeg);
            skills = setSkill(skills, newSkill, sk);
            sum += newSkill;
        }
        skills = setSumOfSkills(skills, uint32(sum));
        return generateChildIfNeeded(skills, ageInSecs, matchStartTime);
    } 
    
    /// stamina = 0 => do not reduce
    /// stamina = 1 => reduce 2 games
    /// stamina = 2 => reduce 4 games
    /// stamina = 3 => full recovery
    function reduceGamesNonStopping(uint256 skills, uint8 stamina) public pure returns (uint256, uint8) {
        if (stamina >= 4) return (0, ERR_TRAINING_STAMINA); // stamina value too large;
        uint8 gamesNonStopping = getGamesNonStopping(skills);
        if (gamesNonStopping == 0) return (skills, 0);
        if ((stamina == 3) || (gamesNonStopping <= 2 * stamina)) return (setGamesNonStopping(skills, 0), 0);
        return (setGamesNonStopping(skills, gamesNonStopping - 2 * stamina), 0);
    }

    function getNewSkill(uint256 oldSkill, uint16 TPthisSkill, uint256 numerator, uint256 denominator, uint256 deltaNeg) public pure returns (uint256) {
        uint256 term1 = (uint256(TPthisSkill)*numerator) / denominator;
        if (term1 <= TPthisSkill) { term1 = uint256(TPthisSkill); }
        if ((oldSkill + term1) > deltaNeg) return oldSkill + term1 - deltaNeg;
        return 1;
    }

    function generateChildIfNeeded(uint256 skills, uint256 ageInSecs, uint256 matchStartTime) public pure returns (uint256) {
        if (ageInSecs < 1166832000) { return skills; }   /// 1166832000 = 37 * Ys

        /// 75% chances to lead to a child, 25% to lead to academy player:
        uint256 dna = uint256(keccak256(abi.encode(skills, ageInSecs)));
        bool isChild = (dna % 4) > 0;
        
        /// Generation syntax: 0, 1, 2, 3... but with +32 if is not a child, so it can go: 0, 1, 32+2, 32+3, 4, 32+5,...
        ///  - which would mean that 1 was child, 2 was child, 33 is Academy, etc...
        ///  - we will start having uint8 overflow at generation 32 (after 64 years of real gameplay), and even then it'll look like a new player
        ///  - Formula copied directly to avoid stack overflow: uint8 generation = uint8((getGeneration(skills) % 32) + 1 + (isChild ? 0 : 32));

        /// AGe determination: age is a random between 16 and 18.
        ///  - Formula copied directly to avoid stack overflow: uint256 dayOfBirth = (matchStartTime - ageInSecs / INGAMETIME_VS_REALTIME) / DAYS_1; 
        ageInSecs = YEARS_16 + (dna % YEARS_2);

        (uint32[N_SKILLS] memory newSkills, uint8[4] memory birthTraits, uint32 sumSkills) = computeSkills(
            dna, 
            forwardnessToShirtNum(dna, getForwardness(skills)), /// ensure they play in the same pos in field:
            0
        );
        /// Potential determination:
        ///  - if child, ensure potential is potential(father) + 1, otherwise, random
        ///  - this rewards users that keep the same player over many years
        if (isChild && (getPotential(skills) < 9)) {
            birthTraits[IDX_POT] = uint8(getPotential(skills)) + 1;
        } else {
            birthTraits[IDX_POT] = uint8(dna % (MAX_POTENTIAL_AT_BIRTH+1));
        }

        uint256 finalSkills = encodePlayerSkills(
            newSkills, 
            (matchStartTime - ageInSecs / INGAMETIME_VS_REALTIME) / DAYS_1, /// day of Birth, formula above
            uint8(1 + (getGeneration(skills) % 32) + (isChild ? 0 : 32)), /// generation, formula above
            getInternalPlayerId(skills), 
            birthTraits, 
            false, false, 0, 0, false, sumSkills
        );
        return (getIsSpecial(skills)) ? addIsSpecial(finalSkills) : finalSkills;
    }
    
    function forwardnessToShirtNum(uint256 seed, uint256 forwardPos) public pure returns(uint8 shirtNum) {
        if (forwardPos == IDX_GK) {
            shirtNum = uint8(seed % 2);
        } else if (forwardPos == IDX_D) {
            shirtNum = 2 + uint8(seed % 5);
        } else if (forwardPos == IDX_M) {
            shirtNum = 7 + uint8(seed % 7);
        } else {
            shirtNum = 14 + uint8(seed % 4);
        }
    }
}