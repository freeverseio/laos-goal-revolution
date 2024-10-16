/*
 Tests for the update/challenge part of the Updates.sol and Challenges.sol contracts
 It also tests a javascript library: challengeUtils
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();
const fs = require('fs');
const truffleAssert = require('truffle-assertions');
const logUtils = require('../utils/matchLogUtils.js');
const debug = require('../utils/debugUtils.js');
const chllUtils = require('../utils/challengeUtils.js');
const merkleUtils = require('../utils/merkleUtils.js');
const deployUtils = require('../utils/deployUtils.js');

const Utils = artifacts.require('Utils');
const TrainingPoints = artifacts.require('TrainingPoints');
const Evolution = artifacts.require('Evolution');
const Proxy = artifacts.require('Proxy');
const Updates = artifacts.require('Updates');
const Challenges = artifacts.require('Challenges');
const Assets = artifacts.require('Assets');
const Market = artifacts.require('Market');
const EncodingMatchLog = artifacts.require('EncodingMatchLog');
const Engine = artifacts.require('Engine');
const EnginePreComp = artifacts.require('EnginePreComp');
const EngineApplyBoosters = artifacts.require('EngineApplyBoosters');
const PlayAndEvolve = artifacts.require('PlayAndEvolve');
const Shop = artifacts.require('Shop');
const Leagues = artifacts.require('Leagues');

const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');
const UpdatesBase = artifacts.require('UpdatesBase');

contract('FullLeague', (accounts) => {
    const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
    const JUST_CHECK_AGAINST_EXPECTED_RESULTS = 0;
    const WRITE_NEW_EXPECTED_RESULTS = 1;
    const nNonNullLeafsInLeague = 640;
    const nLeafs = 1024;
    const nMatchdays = 14;
    const nMatchesPerDay = 4;
    const nTeamsInLeague = 8;
    const nMatchesPerLeague = nMatchesPerDay * nMatchdays;
    const nPlayersInTeam = 25;
    const substitutions = [6, 10, 0];
    const subsRounds = [3, 7, 1];
    const noSubstitutions = [11, 11, 11];
    const lineup0 = [0, 3, 4, 5, 6, 9, 10, 11, 12, 15, 16, 7, 13, 17];
    const lineup1 = [0, 3, 4, 5, 6, 9, 10, 11, 16, 17, 18, 7, 13, 17];
    const lineupConsecutive =  Array.from(new Array(14), (x,i) => i);
    const extraAttackNull =  Array.from(new Array(10), (x,i) => 0);
    const tacticId442 = 0; // 442
    const tacticId433 = 2; // 433
    const playersPerZone442 = [1,2,1,1,2,1,0,2,0];
    const playersPerZone433 = [1,2,1,1,1,1,1,1,1];
    const PLAYERS_PER_TEAM_MAX = 25;
    const firstHalfLog = [0, 0];
    const subLastHalf = false;
    const is2ndHalf = false;
    const isHomeStadium = true;
    const isPlayoff = false;
    const matchBools = [is2ndHalf, isHomeStadium, isPlayoff]
    const IDX_R = 1;
    const IDX_C = 2;
    const IDX_CR = 3;
    const IDX_L = 4;
    const IDX_LR = 5;
    const IDX_LC = 6;
    const IDX_LCR = 7;
    const fwd442 =  [0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3];
    const left442 = [0, IDX_L, IDX_C, IDX_C, IDX_R, IDX_L, IDX_C, IDX_C, IDX_R, IDX_C, IDX_C];
    // const now = Math.floor(new Date()/1000);
    // const dayOfBirth21 = Math.round(secsToDays(now) - 21/7);
    const now = 1570147200; // this number has the property that 7*nowFake % (SECS_IN_DAY) = 0 and it is basically Oct 3, 2019
    const dayOfBirth21 = secsToDays(now) - 21*365/7; // = exactly 17078, no need to round
    const MAX_PENALTY = 10000;
    const MAX_GOALS = 12;
    const RED_CARD = 3;

    const assistersIdx = Array.from(new Array(MAX_GOALS), (x,i) => i);
    const shootersIdx  = Array.from(new Array(MAX_GOALS), (x,i) => 1);
    const shooterForwardPos  = Array.from(new Array(MAX_GOALS), (x,i) => 1);
    const penalties  = Array.from(new Array(7), (x,i) => false);
    const typesOutOfGames = [0, 0];
    const outOfGameRounds = [0, 0];
    const yellowCardedDidNotFinish1stHalf = [false, false];
    const ingameSubs1 = [0, 0, 0]
    const ingameSubs2 = [0, 0, 0]
    const outOfGames = [14, 14]
    const yellowCards1 = [14, 14]
    const yellowCards2 = [14, 14]
    const halfTimeSubstitutions = [14, 14, 14]
    const nGKAndDefs1 = 4; 
    const nGKAndDefs2 = 4; 
    const nTot = 11; 
    const winner = 2; // DRAW = 2
    const isHomeSt = false;
    const teamSumSkillsDefault = 0;
    const trainingPointsInit = 0;
    
    // Skills: shoot, speed, pass, defence, endurance
    const SK_SHO = 0;
    const SK_SPE = 1;
    const SK_PAS = 2;
    const SK_DEF = 3;
    const SK_END = 4;
    
    const it2 = async(text, f) => {};

    function setNoSubstInLineUp(lineup, substitutions) {
        modifiedLineup = [...lineup];
        NO_SUBST = 11;
        NO_LINEUP = 25;
        for (s = 0; s < 3; s++) {
            if (substitutions[s] == NO_SUBST) modifiedLineup[s + 11] = NO_LINEUP;
        }
        return modifiedLineup;
    }

    function daysToSecs(dayz) {
        return (dayz * 24 * 3600); 
    }

    function secsToDays(secs) {
        return secs/ (24 * 3600);
    }
    
    function getDefaultTPs() {
        TP = 200;
        TPperSkill = Array.from(new Array(25), (x,i) => TP/5 - 3*i % 6);
        specialPlayer = 21;
        // make sure they sum to TP:
        for (bucket = 0; bucket < 5; bucket++){
            sum4 = 0;
            for (sk = 5 * bucket; sk < (5 * bucket + 4); sk++) {
                sum4 += TPperSkill[sk];
            }
            TPperSkill[5 * bucket + 4] = TP - sum4;
        }       
        return [TP, TPperSkill];
    }
    
    const createTeamState442 = async (engine, forceSkills, alignedEndOfLastHalfTwoVec = [false, false]) => {
        teamState = [];
        playerId = 123121;
        pot = 3;
        aggr = 0;
        alignedEndOfLastHalf = true;
        redCardLastGame = false;
        gamesNonStopping = 0;
        injuryWeeksLeft = 0;
        sumSkills = forceSkills.reduce((a, b) => a + b, 0);
        for (p = 0; p < 11; p++) {
            pSkills = await assets.encodePlayerSkills(forceSkills, dayOfBirth21, gen = 0, playerId + p, [pot, fwd442[p], left442[p], aggr],
                alignedEndOfLastHalfTwoVec[0], redCardLastGame, gamesNonStopping, 
                injuryWeeksLeft, subLastHalf, sumSkills).should.be.fulfilled 
            teamState.push(pSkills)
        }
        p = 10;
        pSkills = await assets.encodePlayerSkills(forceSkills, dayOfBirth21, gen = 0, playerId + p, [pot, fwd442[p], left442[p], aggr],
                alignedEndOfLastHalfTwoVec[1], redCardLastGame, gamesNonStopping, 
                injuryWeeksLeft, subLastHalf, sumSkills).should.be.fulfilled 
        for (p = 11; p < PLAYERS_PER_TEAM_MAX; p++) {
            teamState.push(pSkills)
        }        
        return teamState;
    };

    const createTeamStateFromSinglePlayer = async (skills, engine, forwardness = 3, leftishness = 2, alignedEndOfLastHalfTwoVec = [false, false]) => {
        teamState = []
        sumSkills = skills.reduce((a, b) => a + b, 0);
        var playerStateTemp = await assets.encodePlayerSkills(
            skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalfTwoVec[0], redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills
        ).should.be.fulfilled;
        for (player = 0; player < 11; player++) {
            teamState.push(playerStateTemp)
        }

        playerStateTemp = await assets.encodePlayerSkills(
            skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalfTwoVec[1], redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills
        ).should.be.fulfilled;
        for (player = 11; player < PLAYERS_PER_TEAM_MAX; player++) {
            teamState.push(playerStateTemp)
        }
        return teamState;
    };

    const createHardcodedTeam = function () {
        // returns 18 players generated with the following code. We hardcode it to avoid the "deployDate" time-dependency
        // teamState = [];
        // playerId0 = await assets.encodeTZCountryAndVal(tz = 1, countryIdx = 0, playerIdx = 0).should.be.fulfilled;
        // for (p = 0; p < 18; p++) {
        //     skills = await assets.getPlayerSkillsAtBirth(playerId0.toNumber() + p);
        //     teamState.push(skills);
        //     console.log(skills.toString(10))
        // }
        return [
            '14606248079918261338806855150670198598294524424421999',
            '14603325075249802958062362651785117246719383552393656',
            '14615017086954653606499907426763036762091679724733245',
            '14609171184243174825485386589332947715467405749846827',
            '14615017461189033969342085869889674545308663693968083',
            '14603325891317697566792669908219362044711638355411673',
            '14606249873734453245614329076439313941148075272765994',
            '14603324461979309998470701478621001103697221903123183',
            '14606248281321866413037179508268863783570851530343215',
            '14606249082057998697777445123967984023640370982880706',
            '14603327085801362263089568768708477093108613577769640',
            '14612095382001501327618929648053879079031002742916002',
            '14603326117112742701915784319947485139466656825672861',
            '14612093787498219632679532865607761507997232766977103',
            '14609173081200313275497388848716119026424650418029241',
            '14603326360330245023390630956127251848106222989410926',
            '14606249807529115937477333996086265720951632055960118',
            '14603326808435843856365497638008216685947959514366883'
        ];
    };
    
    function parseLog(tr) {
        arr = [
            tr.goalkeepersShoot,
            tr.goalkeepersSpeed,
            tr.goalkeepersPass,
            tr.goalkeepersDefence,
            tr.goalkeepersEndurance,
            // 
            tr.defendersShoot,
            tr.defendersSpeed,
            tr.defendersPass,
            tr.defendersDefence,
            tr.defendersEndurance,
            // 
            tr.midfieldersShoot,
            tr.midfieldersSpeed,
            tr.midfieldersPass,
            tr.midfieldersDefence,
            tr.midfieldersEndurance,
            // 
            tr.attackersShoot,
            tr.attackersSpeed,
            tr.attackersPass,
            tr.attackersDefence,
            tr.attackersEndurance,
            // 
            tr.specialPlayerShoot,
            tr.specialPlayerSpeed,
            tr.specialPlayerPass,
            tr.specialPlayerDefence,
            tr.specialPlayerEndurance,
        ];    
        for (i = 0; i < arr.length; i++) arr[i] = parseInt(arr[i]);        
        return arr;
    }
    
    function checkTPAssigment(TP, TPassigned25, verbose) {
        OK = true;
        if (verbose) console.log("Total Available: ", TP);
        for (bucket = 0; bucket < 5; bucket++) {
            sum = 0;
            for (i = bucket * 5; i < (bucket+1) * 5; i++) {
                sum += TPassigned25[i];
                thisOK = (10 * TPassigned25[i] <= 6 * TP);
                if (verbose && !thisOK) console.log("skill ", i, " exceeds 60 percent of TPs. TP_thisSkill / Available = ", TPassigned25[i]/TP);
                OK = OK && thisOK;
            }
            thisOK = (sum <= TP);
            if (verbose && !thisOK) console.log("bucket ", bucket, " exceeds available TPs. Sum / Available = ", sum/TP);
            OK = OK && thisOK;
        }        
        if (verbose) console.log("OK = ", OK);
        return OK;
    }
    
    function assertStr(cond, x, y, msg) {
        if (cond == "eq") assert(x.toString() == y.toString(), msg);
        else assert(!(x.toString() == y.toString()), msg);
    }

    function assertBN(cond, x, y, msg) {
        if (cond == "eq") assert(web3.utils.toBN(x).eq(web3.utils.toBN(y)), msg);
        else assert(!web3.utils.toBN(x).eq(web3.utils.toBN(y)), msg);
    }

    beforeEach(async () => {
        evo = await Evolution.new().should.be.fulfilled;
        precomp = await EnginePreComp.new().should.be.fulfilled;
        applyBoosters = await EngineApplyBoosters.new().should.be.fulfilled;
        engine = await Engine.new(precomp.address, applyBoosters.address).should.be.fulfilled;

        defaultSetup = deployUtils.getDefaultSetup(accounts);
        owners = defaultSetup.owners;
        depl = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
        [proxy, assets, market, updates, challenges] = depl;
        await deployUtils.setProxyContractOwners(proxy, assets, owners, owners.company).should.be.fulfilled;

        blockChainTimeSec = Math.floor(Date.now()/1000);
        await assets.initTZs(blockChainTimeSec, {from: owners.COO}).should.be.fulfilled;
        
        training= await TrainingPoints.new().should.be.fulfilled;
        // shop = await Shop.new(assets.address).should.be.fulfilled;
        encodeLog = await EncodingMatchLog.new().should.be.fulfilled;
        play = await PlayAndEvolve.new(training.address, evo.address, engine.address).should.be.fulfilled;
        
        tactics0 = await engine.encodeTactics(substitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, substitutions), 
            extraAttackNull, tacticId442).should.be.fulfilled;
        tactics1 = await engine.encodeTactics(substitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, substitutions), 
            extraAttackNull, tacticId433).should.be.fulfilled;
        tactics1NoChanges = await engine.encodeTactics(noSubstitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, noSubstitutions), 
            extraAttackNull, tacticId433).should.be.fulfilled;
        tactics442 = await engine.encodeTactics(substitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, substitutions),
            extraAttackNull, tacticId442).should.be.fulfilled;
        tactics442NoChanges = await engine.encodeTactics(noSubstitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, noSubstitutions), 
            extraAttackNull, tacticId442).should.be.fulfilled;
        teamStateAll50Half1 = await createTeamStateFromSinglePlayer([50, 50, 50, 50, 50], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        teamStateAll1Half1 = await createTeamStateFromSinglePlayer([1,1,1,1,1], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        teamStateAll50Half2 = await createTeamStateFromSinglePlayer([50, 50, 50, 50, 50], engine, forwardness = 3, leftishness = 2, aligned = [true, false]).should.be.fulfilled;
        teamStateAll1Half2 = await createTeamStateFromSinglePlayer([1,1,1,1,1], engine, forwardness = 3, leftishness = 2, aligned = [true, false]).should.be.fulfilled;
        MAX_RND = await engine.MAX_RND().should.be.fulfilled;
        MAX_RND = MAX_RND.toNumber();
        kMaxRndNumHalf = Math.floor(MAX_RND/2)-200; 
        events1Half = Array.from(new Array(7), (x,i) => 0);
        events1Half = [events1Half,events1Half];

        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        almostNullTraning = await training.encodeTP(TP = 0, TPperSkill, specialPlayer = 21).should.be.fulfilled;
    });
  
    it2('create real data for an entire league', async () => {
        mode = JUST_CHECK_AGAINST_EXPECTED_RESULTS; // JUST_CHECK_AGAINST_EXPECTED_RESULTS for testing, 1 WRITE_NEW_EXPECTED_RESULTS
        // prepare a training that is not identical to the bignumber(0), but which works irrespective of the previously earned TP
        // => all assingments to 0, but with a special player chosen

        leagues = await Leagues.new().should.be.fulfilled;
        teamState442 = await createTeamState442(engine, forceSkills= [1000,1000,1000,1000,1000]).should.be.fulfilled;
        teamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0);
        leagueData = await chllUtils.createLeagueData(leagues, play, encodeLog, now, teamState442, teamId).should.be.fulfilled;
        
        if (mode == WRITE_NEW_EXPECTED_RESULTS) {
            fs.writeFileSync('test/testdata/fullleague.json', JSON.stringify(leagueData), function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        expectedData = fs.readFileSync('test/testdata/fullleague.json', 'utf8');
        assert.equal(
            web3.utils.keccak256(expectedData),
            web3.utils.keccak256(JSON.stringify(leagueData)),
            "leafs do not coincide with expected"
        );
    });

    it('read an entire league and organize data in the leaf format required', async () => {
        mode = JUST_CHECK_AGAINST_EXPECTED_RESULTS; // JUST_CHECK_AGAINST_EXPECTED_RESULTS for testing, 1 WRITE_NEW_EXPECTED_RESULTS
        leagueData = chllUtils.readCreatedLeagueData();
        var leafs = [];
        for (day = 0; day < nMatchdays; day++) {
            dayLeafs = chllUtils.buildLeafs(leagueData, day, half = 0, nNonNullLeafs = nNonNullLeafsInLeague);
            leafs.push([...dayLeafs]);
            dayLeafs = chllUtils.buildLeafs(leagueData, day, half = 1, nNonNullLeafs = nNonNullLeafsInLeague);
            leafs.push([...dayLeafs]);
        }
        if (mode == WRITE_NEW_EXPECTED_RESULTS) {
            fs.writeFileSync('test/testdata/leafsPerHalf.json', JSON.stringify(leafs), function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        expectedLeafs = fs.readFileSync('test/testdata/leafsPerHalf.json', 'utf8');
        assert.equal(
            web3.utils.keccak256(expectedLeafs),
            web3.utils.keccak256(JSON.stringify(leafs)),
            "leafs do not coincide with expected"
        );
    });
    
    it('test day 0, half 0', async () => {
        leafs = chllUtils.readCreatedLeagueLeafs();
        day = 0;
        assert.equal(leafs.length, nMatchdays * 2);
        assert.equal(leafs[day].length, nNonNullLeafsInLeague);
        // at end of 1st half we still do not have end-game results nor league points
        for (i = 0; i < 128; i++) {
            assert.equal(leafs[day][i], 0, "unexpected non-null leaf at start of league");
        }
        for (team = 0; team < nTeamsInLeague; team++) {
            // BEFORE first half ---------
            off = 128 + 64 * team;
            // ...player 0...10 are non-null, and different among them because of the different playerId
            for (i = off; i < off + 11; i++) assert.notEqual(leafs[day][i], 0, "unexpected teamstate leaf at start of league");
            // ...player 11...25 are identical because we used the same playerId for all of them
            for (i = off + 12; i < off + 25; i++) assert.equal(leafs[day][i], leafs[day][off+12], "unexpected teamstate leaf at start of league");
            assert.equal(leafs[day][off + 25], 0, "unexpected nonnull tactics leaf at start of league");
            assert.equal(leafs[day][off + 26], 0, "unexpected nonnull training leaf at start of league");
            assert.equal(leafs[day][off + 27], 0, "unexpected nonnull matchLog leaf at start of league");
            // AFTER first half ---------
            off += 32;
            // ...player 0...10 are non-null, and different among them because of the different playerId
            for (i = off; i < off + 11; i++) assert.notEqual(leafs[day][i], 0, "unexpected teamstate leaf at start of league");
            // ...player 11...25 are identical because we used the same playerId for all of them
            for (i = off + 12; i < off + 25; i++) assert.equal(leafs[day][i], leafs[day][off+12], "unexpected teamstate leaf at start of league");
            assert.equal(leafs[day][off + 25], tactics442NoChanges, "unexpected tactics leaf after 1st half of league");
            assert.equal(leafs[day][off + 26], almostNullTraning, "unexpected training leaf after 1st half of league");
            assert.notEqual(leafs[day][off + 27], 0, "unexpected null matchLog leaf after 1st half of league");
        }
    });
    

    it('test all days after 2nd half (day = odd)', async () => {
        leafs = chllUtils.readCreatedLeagueLeafs();
        day = 1;
        assert.equal(leafs.length, nMatchdays * 2);
        assert.equal(leafs[day].length, nNonNullLeafsInLeague);
        // at end of 2nd half we already league points (8 first entries) and have end-game results (8 following entries)
        // On league points, at least 7 should be non-null
        for (day = 1; day < 14; day += 2) {
            for (i = 0; i < 7; i++) {
                assert.notEqual(leafs[day][i], 0, "unexpected null leaf in league points at the end of a match");
                if (day < 13) assert.equal(leafs[day][i], leafs[day+1][i], "league points at end of 1st half is not as end of previous 2nd half");
            }
        }
        day=1;
        goals = [ 2, 2, 1, 1, 2, 3, 0, 0 ];
        for (i = 0; i < 7; i++) {
            assert.equal(leafs[day][8+i], goals[i], "unexpected goals at the end of 1st match");
        }

        // Check results for all days
        for (day = 1; day < 14; day += 1) {
            // check that all previous league results are not null
            for (league  = 0; league < Math.floor(day/2); league++) {
                off = 8 * league;
                goalsInLeague = 0;
                for (i = off; i < off+8; i++) {
                    goalsInLeague += leafs[day][8+i];
                }
                assert.equal(goalsInLeague > 5, true, "unexpected league without goals");
            }                
            off = 8 * Math.floor(day/2);
            goalsInLeague = 0;
            for (i = off; i < off+8; i++) {
                goalsInLeague += leafs[day][8+i];
            }
            // after 1st half, all results should be 0:
            // after 2nd half, sum of all goals should be at least 5:
            if (day % 2 == 0) { assert.equal(goalsInLeague, 0, "unexpected goals at the end of a match"); }
            else { assert.equal(goalsInLeague > 5, true, "unexpected league without goals");}
        }

        for (day = 1; day < 14; day += 2) {
            for (team = 0; team < nTeamsInLeague; team++) {
                // BEFORE second half ---------
                off = 128 + 64 * team;
                // ...player 0...10 are non-null, and different among them because of the different playerId
                for (i = off; i < off + 25; i++) {
                    assert.equal(leafs[day][i], leafs[day-1][i + 32], "skills at start of 2nd half not equal to end of previous half");
                }
                assert.equal(leafs[day][off + 25], tactics442NoChanges, "unexpected tactics leaf after 1st half of league");
                assert.equal(leafs[day][off + 26], almostNullTraning, "unexpected training leaf after 1st half of league");
                assert.equal(leafs[day][off + 27], leafs[day-1][off + 32 + 27], "matchlog at start of 2nd half not equal to end of previous half");
                // AFTER second half ---------
                off += 32;
                // ...player 0...10 are non-null, and different among them because of the different playerId
                for (i = off; i < off + 11; i++) assert.notEqual(leafs[day][i], leafs[day][i-32], "states did not change after 1st half");
                // ...player 11...25 are identical because we used the same playerId for all of them
                for (i = off + 12; i < off + 25; i++) assert.equal(leafs[day][i], leafs[day][off+12], "players that did not play changed unexpectedly");
                assert.equal(leafs[day][off + 25], tactics442NoChanges, "unexpected tactics leaf after 1st half of league");
                assert.equal(leafs[day][off + 26], 0, "unexpected training leaf after 1st half of league");
                assert.notEqual(leafs[day][off + 27], 0, "unexpected null matchLog leaf after 1st half of league");
            }
        }
    });
    
    it('challenge unexpected zero values', async () => {
        defaultSetup = deployUtils.getDefaultSetup(accounts);
        depl = await deployUtils.deploy(defaultSetup.owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
        proxy  = depl[0];
        updates = depl[3];
        challenges = depl[4];

        leafsDecimal = chllUtils.readCreatedLeagueLeafs();
        leafs = chllUtils.leafsToBytes32(leafsDecimal);
        
        for (day = 0; day < nMatchdays; day++) {
            for (half = 0; half < 2; half++) {
                leafsThisDay = [...leafs[2 * day + half]];
                assert.equal(leafsThisDay.length, nNonNullLeafsInLeague);
                assert.equal(
                    chllUtils.areThereUnexpectedZeros(leafsThisDay, day, half, nNonNullLeafsInLeague),
                    false,
                    "wrong leafs"
                )
                result = await challenges.areThereUnexpectedZeros(leafsThisDay, day, half).should.be.fulfilled;
                result.should.be.equal(false);
            }
        }
    });
    
    // - **OrgMapHeader** = [nActiveUsersCountry0, nActiveUsersCountry1, ...]
    // - **OrgMap** = [tIdx0, ....tIdxNActive; ...]; max = 34 levels
    // - **UserActions** = [UA$_{tact,0}$, UA$_{train,0}$, ...]; max = 35 levels
    // - **TZState** = [R[Data[League0]], ...]; max = 31 levels
    it('create orgmap', async () => {
        // all returns of this function are arrays as a function of TZ_0-based!!!
        const {0: orgMapHeader, 1: orgMap, 2: userActions} = await chllUtils.createOrgMap(assets, nCountriesPerTZ = 2, nActiveUsersPerCountry = 6)
        h = web3.utils.keccak256(
            JSON.stringify(orgMapHeader) + 
            JSON.stringify(orgMap) + 
            JSON.stringify(userActions) 
        );
        assert.equal(h, '0xaa5ce6abd5de9979adba0ff58246086f9cbd5c970670c834b8045986e19ac063', "orgmap not as expected");
    });

    // level 0: Root => emit Root
    // level 1: 2048 leagueRoots (only 24 TZs x 2 Countries = 48 are nonzero) => Emit 2048 leagueRoots, store new Root
    // level 2: 2048 x 640 leagueLeafs => emit one of these => only 640 leagueLeafs for one of those roots, store that leagueRoot
    // level 3: provide 640 leagueLeafs, and BC-challenge.
    
    it('create struct given an orgmap based on repeated league', async () => {
        const {0: orgMapHeader, 1: orgMap, 2: userActions} = await chllUtils.createOrgMap(assets, nCountriesPerTZ = 2, nActiveUsersPerCountry = 6)
        tzZeroBased = 2;
        const {0: leafsPerLeague, 1: nLeaguesInTz} = chllUtils.createLeafsForOrgMap(day = 3, half = 1, orgMapHeader[tzZeroBased], nExplicitLeaves = nNonNullLeafsInLeague);
        levelVerifiableByBC = merkleUtils.computeLevelVerifiableByBC(nLeaguesInTz, nLeafsPerRoot = 2048);
        assert.equal(nLeaguesInTz, 2, "nLeagues not as expected");
        assert.equal(leafsPerLeague.length, nLeaguesInTz, "leafsPerLeague.length not as expected");
        assert.equal(leafsPerLeague[0].length, nNonNullLeafsInLeague, "leafsInLeague length not as expected");
        assert.equal(levelVerifiableByBC, 3, "levelVerifiableByBC not as expected");
        h = web3.utils.keccak256(JSON.stringify(leafsPerLeague));
        assert.equal(h, '0x265c6fbcc77b18e6831221ff78f0044a4ded80eae9f2f651334b8f6fe808abf0', "leafs not as expected");
    });
    
    
});