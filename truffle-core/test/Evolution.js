/*
 Tests for all functions in 
  PlayAndEvolve.sol   
  Evolution.sol, 
  TrainingPoints.sol, 
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();
    
var fs = require('fs');
var JSONbig = require('json-bigint');

const truffleAssert = require('truffle-assertions');
const logUtils = require('../utils/matchLogUtils.js');
const debug = require('../utils/debugUtils.js');
const deployUtils = require('../utils/deployUtils.js');
const { assert } = require('chai');

const Utils = artifacts.require('Utils');
const TrainingPoints = artifacts.require('TrainingPoints');
const Evolution = artifacts.require('Evolution');
const Proxy = artifacts.require('Proxy');
const Assets = artifacts.require('Assets');
const Market = artifacts.require('Market');
const Updates = artifacts.require('Updates');
const Challenges = artifacts.require('Challenges');
const EncodingMatchLog = artifacts.require('EncodingMatchLog');
const Engine = artifacts.require('Engine');
const EnginePreComp = artifacts.require('EnginePreComp');
const EngineApplyBoosters = artifacts.require('EngineApplyBoosters');
const PlayAndEvolve = artifacts.require('PlayAndEvolve');
const Shop = artifacts.require('Shop');

const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');
const UpdatesBase = artifacts.require('UpdatesBase');

contract('Evolution', (accounts) => {
    const Err = debug.getErrorCodes();
    const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
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
    const isBotHome = false;
    const isBotAway = false;
    const matchBools = [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]
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
    const INGAMETIME_VS_REALTIME = 14;
    const now = 1570147200; // this number has the property that 7*nowFake % (SECS_IN_DAY) = 0 and it is basically Oct 3, 2019
    const dayOfBirth21 = secsToDays(now) - 7658/INGAMETIME_VS_REALTIME; // = 7658 is almost 21 years, and exactly divisible by 14
    const MAX_PENALTY = 10000;
    const MAX_GOALS = 12;
    const RED_CARD = 3;

    const assistersIdx = Array.from(new Array(MAX_GOALS), (x,i) => i);
    const shootersIdx  = Array.from(new Array(MAX_GOALS), (x,i) => 1);
    const shooterForwardPos  = Array.from(new Array(MAX_GOALS), (x,i) => 1);
    const penalties  = Array.from(new Array(7), (x,i) => false);
    const typesOutOfGames = [0, 0];
    const outOfGameRounds = [0, 0];
    const ingameSubs1 = [0, 0, 0]
    const ingameSubs2 = [0, 0, 0]
    const outOfGames = [14, 14]
    const yellowCards1 = [14, 14]
    const yellowCards2 = [14, 14]
    const halfTimeSubstitutions = [14, 14, 14]
    const nGKAndDefs1 = 5; 
    const nGKAndDefs2 = 5; 
    const nTot = 11; 
    const winner = 2; // DRAW = 2
    const isHomeSt = false;
    const teamSumSkillsDefault = 1;
    const trainingPointsInit = 0;
    const N_SKILLS = 5;

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
    
    function getPenaltyData(mlog) {
        log = [...mlog];
        nPenalties = 0;
        nPenaltiesFailed = 0;
        shooters = [];
        for (e = 0; e < 12; e++) {
            if (100 == log[6+5*e].toNumber()) {
                nPenalties++;
                if (0 == log[5+5*e].toNumber()) { nPenaltiesFailed++; }
                shooters.push(log[4+5*e].toNumber())
            }
        }
        return [nPenalties, nPenaltiesFailed, shooters];            
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
    
    function parseLogCapital(tr) {
        arr = [
            tr.Goalkeepers.Shoot,
            tr.Goalkeepers.Speed,
            tr.Goalkeepers.Pass,
            tr.Goalkeepers.Defence,
            tr.Goalkeepers.Endurance,
            // 
            tr.Defenders.Shoot,
            tr.Defenders.Speed,
            tr.Defenders.Pass,
            tr.Defenders.Defence,
            tr.Defenders.Endurance,
            // 
            tr.Midfielders.Shoot,
            tr.Midfielders.Speed,
            tr.Midfielders.Pass,
            tr.Midfielders.Defence,
            tr.Midfielders.Endurance,
            // 
            tr.Attackers.Shoot,
            tr.Attackers.Speed,
            tr.Attackers.Pass,
            tr.Attackers.Defence,
            tr.Attackers.Endurance,
            // 
            tr.SpecialPlayer.Shoot,
            tr.SpecialPlayer.Speed,
            tr.SpecialPlayer.Pass,
            tr.SpecialPlayer.Defence,
            tr.SpecialPlayer.Endurance,
        ];    
        for (i = 0; i < arr.length; i++) arr[i] = parseInt(arr[i]);        
        return arr;
    }
    
    
    function checkTPAssigment(TP, TPassigned25, verbose) {
        OK = true;
        if (verbose) console.log("Total Available: ", TP);
        for (bucket = 0; bucket < 5; bucket++) {
            sum = 0;
            if (bucket == 4) TP = Math.floor(TP*11/10);
            for (i = bucket * 5; i < (bucket+1) * 5; i++) {
                sum += TPassigned25[i];
                thisOK = (10 * TPassigned25[i] <= 6 * TP);
                if (verbose && !thisOK) console.log("skill ", i, " exceeds 60 percent of TPs. TP_thisSkill / Available = ", TPassigned25[i]/TP);
                OK = OK && thisOK;
            }
            thisOK = (sum <= TP);
            if (verbose && !thisOK) console.log("bucket ", bucket, " exceeds available TPs. Sum / Available = ", sum, TP);
            OK = OK && thisOK;
        }        
        if (verbose) console.log("OK = ", OK);
        return OK;
    }
    
    const createPlayerFromBirthAndPotential = async (assets, dayOfBirth, potential) => {
        playerSkills = await assets.encodePlayerSkills(
            skills = [1000, 1000, 1000, 1000, 1000], 
            dayOfBirth,
            gen = 0,
            playerId = 2132321,
            [potential, forwardness = 1, leftishness = 1, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        return playerSkills;
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
        utils = await Utils.new().should.be.fulfilled;
        blockChainTimeSec = Math.floor(Date.now()/1000);
        await assets.initTZs(blockChainTimeSec, {from: owners.COO}).should.be.fulfilled;
        
        training = await TrainingPoints.new().should.be.fulfilled;
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
    });
  
    it('test from real usage with more than 3 substitutions in half time', async () => {
        m = JSONbig.parse(fs.readFileSync('test/testdata/fe6e996fc594c5043f29040561cc95c02c0f68ccdc80047a30e42e74f3b402f8.2nd.error.json', 'utf8'));
        skills0 = [];
        for (player of m.HomeTeam.Players){ 
            skills0.push(player.EncodedSkills);
        }
        skills1 = [];
        for (player of m.VisitorTeam.Players){ 
            skills1.push(player.EncodedSkills);
        }
        // we set injury weeks to 1, to check that they all become 0 after this 2nd half.
        for (p = 0; p < 8; p++) {
            skills0[p] = await evo.setInjuryWeeksLeft(skills0[p], 1);
        }

        // we started with players that had 0, 1 or 2 games non stopping. We'll see that after cancelling this 2nd half, they all rested. 
        // we also see that someone had a red card from last game, which will also be set to false.
        expectedGamesNonStopping = [ 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0 ];
        gamesNonStopping = [];
        someoneWithRedCard = false;
        for (teamSkills of [skills0, skills1]) {
            for (skill of teamSkills) {
                result = await assets.getGamesNonStopping(skill);
                gamesNonStopping.push(result.toNumber());
                result = await assets.getRedCardLastGame(skill);
                if (result) someoneWithRedCard = true;
            }
        }
        debug.compareArrays(gamesNonStopping, expectedGamesNonStopping, toNum = false);
        someoneWithRedCard.should.be.equal(true);

        assert.equal(false, await evo.getIsCancelled(m.HomeTeam.MatchLog));
        assert.equal(false, await evo.getIsCancelled(m.VisitorTeam.MatchLog));

        var {0: skills, 1: matchLogsAndEvents, 2: err} =  await play.play2ndHalfAndEvolve(
            m.Seed, m.StartTime, [skills0, skills1], [m.HomeTeam.TeamID, m.VisitorTeam.TeamID], 
            [m.HomeTeam.Tactic, m.VisitorTeam.Tactic], [m.HomeTeam.MatchLog, m.VisitorTeam.MatchLog],
            [is2nd = true, isHom = true, isPlay = false, isBotHome, isBotAway]
        ).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_HALFCHANGES);

        for (teamSkills of skills) {
            for (skill of teamSkills) {
                assert.equal(false, await assets.getAlignedEndOfFirstHalf(skill));
                assert.equal(false, await assets.getSubstitutedFirstHalf(skill));
                assert.equal(false, await assets.getOutOfGameFirstHalf(skill));
                assert.equal(false, await assets.getYellowCardFirstHalf(skill));
                assert.equal(false, await assets.getRedCardLastGame(skill));
                assert.equal(0, await assets.getGamesNonStopping(skill));
                assert.equal(0, await assets.getInjuryWeeksLeft(skill));
            }
        }
        assert.equal(true, await evo.getIsCancelled(matchLogsAndEvents[0]));
        assert.equal(true, await evo.getIsCancelled(matchLogsAndEvents[1]));

        // check that the result is a valid 0-0, with no events
        const DRAW = 2;
        assert.equal(DRAW, Number(await evo.getWinner(matchLogsAndEvents[0])));
        assert.equal(DRAW, Number(await evo.getWinner(matchLogsAndEvents[1])));
        assert.equal(0, Number(await evo.getNGoals(matchLogsAndEvents[0])));
        assert.equal(0, Number(await evo.getNGoals(matchLogsAndEvents[1])));
        for (event = 2; event < matchLogsAndEvents.length; event++) {
            assert.equal(0, matchLogsAndEvents[event]);
        }
    });

    it('test from real usage that failed in half time because a new division was created in half time, with aligned1stHalf = false', async () => {
        m = JSONbig.parse(fs.readFileSync('test/testdata/390adf17f1b5a785da7f81bd7e32ae8cfd3d69c798c719b66f9b93499070275f.2nd.error.json', 'utf8'));
        isBotH = m.HomeTeam.Owner == "0x0000000000000000000000000000000000000000";
        isBotA = m.VisitorTeam.Owner == "0x0000000000000000000000000000000000000000";
        skills0 = [];   
        for (player of m.HomeTeam.Players){ 
            skills0.push(player.EncodedSkills);
            result = await assets.getAlignedEndOfFirstHalf(player.EncodedSkills).should.be.fulfilled;
            result.should.be.equal(false);
        }
        skills1 = [];
        for (player of m.VisitorTeam.Players){ 
            skills1.push(player.EncodedSkills);
            result = await assets.getAlignedEndOfFirstHalf(player.EncodedSkills).should.be.fulfilled;
            result.should.be.equal(false);
        }
        var {0: skills, 1: matchLogsAndEvents, 2: err} =  await play.play2ndHalfAndEvolve(
            m.Seed, m.StartTime, [skills0, skills1], [m.HomeTeam.TeamID, m.VisitorTeam.TeamID], 
            [m.HomeTeam.Tactic, m.VisitorTeam.Tactic], [m.HomeTeam.MatchLog, m.VisitorTeam.MatchLog],
            [is2nd = true, isHom = true, isPlay = false, isBotH, isBotA]
        ).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_HALFCHANGES);
    });

    it('test that used to fail because yellow cards remained 0 when turned into a red -serious', async () => {
        seed = '0xe52d9c508c502347344d8c07ad91cbd6068afc75ff6292f062a09ca381c89e71';startTime = '1790899200';matchLog0 = '0';teamId0 = '274877906944';tactic0 = '340596594427581673436941882753025';assignedTP0 = '0';players0 = ['14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247','14606248079918261338806855269144928920528183545627247',];matchLog1 = '0';teamId1 = '274877906945';tactic1 = '340596594427581673436941882753025';assignedTP1 = '0';players1 = ['16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614','16573429227295117480385309340654302060354425351701614',];
        var {0: skills, 1: matchLogsAndEvents, 2: errorCode} =  await play.play1stHalfAndEvolve(
            seed, startTime, [players0, players1], [teamId0, teamId1], [tactic0, tactic1], [matchLog0, matchLog1],
            [is2nd = false, isHom = true, isPlay = false, isBotHome, isBotAway], [assignedTP0, assignedTP1]).should.be.fulfilled;
            
        // Team0: show that the two yellows became 1 yellow and 1 red. And that 2nd team had no cards at all.
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = false).should.be.fulfilled;
        result = [sumSkills, outPlayer, typeOut, outRounds, yellow1, yellow2];
        expct = [ 0, 8, 3, 8, 8, 14 ];
        debug.compareArrays(result, expct, toNum = true, isBigNumber = false);
        
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[1], is2nd = false).should.be.fulfilled;
        result = [sumSkills, outPlayer, typeOut, outRounds, yellow1, yellow2];
        expct = [ 0, 14, 0, 0, 14, 14 ];
        debug.compareArrays(result, expct, toNum = true, isBigNumber = false);

        seed = '0xe52d9c508c502347344d8c07ad91cbd6068afc75ff6292f062a09ca381c89e71';startTime = '1790899200';matchLog0 = '1809252841225230840719990802586915413221463612302449923019351491021792870400';teamId0 = '274877906944';tactic0 = '340596594427581673436941882753025';assignedTP0 = '0';players0 = ['444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215348664084887401221731547818249502887980205736758','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215337246103345753542683081530493906926889143763766','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270',];matchLog1 = '1809252842383666049074119856298496506341924193632611326497576041530278307731';teamId1 = '274877906945';tactic1 = '340596594427581673436941882753025';assignedTP1 = '0';players1 = ['13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512357567640649784837729749092819920993002307781397','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901',];        
        var {0: skills, 1: matchLogsAndEvents} =  await play.play2ndHalfAndEvolve(
            seed, startTime, skills, [teamId0, teamId1], [tactic0, tactic1], [matchLogsAndEvents[0], matchLogsAndEvents[1]],
            [is2nd = true, isHom = true, isPlay = false, isBotHome, isBotAway]).should.be.fulfilled;
            
        // same for 2nd half
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = true).should.be.fulfilled;
        result = [sumSkills, outPlayer, typeOut, outRounds, yellow1, yellow2];
        expct = [ 89928, 7, 3, 8, 7, 14 ];
        debug.compareArrays(result, expct, toNum = true, isBigNumber = false);
        
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[1], is2nd = true).should.be.fulfilled;
        result = [sumSkills, outPlayer, typeOut, outRounds, yellow1, yellow2];
        expct = [ 89964, 14, 0, 0, 14, 14 ];
        debug.compareArrays(result, expct, toNum = true, isBigNumber = false);


    });
    
    it('thorough test of training points from the field', async () => {
        // result: 1 - 0
        // [ 2 ]  => fwd
        // [ 9 ]  => sho
        // [10 ] => assisters    
        // winning home: +21
        // 1 goals by Mid: +5 
        // assists... 1 => +3
        // blank sheet: +2*2*6+2*5 = 24+10 = 34
        // yellows x2 => -2
        // red -3
        // total = 21+5+3+34-2-3= 58 
        // we should therefore expect: 58 * 54946 / 54963 = 57
        log0 = '457392895666467739331923269191667002833005448455958129819233716415540232353';
        log1 = '453417489658822064692518838789308263649179980764291094391122304477444440064';
        
        matchLogsAndEvents = [log0, log1];
        goals = [];
        points = [];
        sums = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals.toNumber());
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints.toNumber());
            sum = await encodeLog.getTeamSumSkills(matchLogsAndEvents[team]).should.be.fulfilled;
            sums.push(sum.toNumber());
            
        }   
        // console.log(goals)
        // console.log(points)
        // console.log(sums)

        fwds = [];
        sho = [];
        ass = [];
        for (g = 0; g < goals[0]; g++) {
            result = await encodeLog.getForwardPos(matchLogsAndEvents[0], g).should.be.fulfilled;
            fwds.push(result.toNumber());
            result = await encodeLog.getShooter(matchLogsAndEvents[0], g).should.be.fulfilled;
            sho.push(result.toNumber());
            result = await encodeLog.getAssister(matchLogsAndEvents[0], g).should.be.fulfilled;
            ass.push(result.toNumber());
        }
        // console.log(fwds)
        // console.log(sho)
        // console.log(ass)

        outs = [];
        yellows2 = [];
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = false).should.be.fulfilled;
        // console.log(outPlayer.toNumber(),yellow1.toNumber(),yellow2.toNumber());
        outs.push(outPlayer.toNumber());
        yellows1 = [yellow1.toNumber(), yellow2.toNumber()];
        
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = true).should.be.fulfilled;
        // console.log(outPlayer.toNumber(),yellow1.toNumber(),yellow2.toNumber());
        outs.push(outPlayer.toNumber());
        yellows2 = [yellow1.toNumber(), yellow2.toNumber()];

        result = await encodeLog.getNTot(matchLogsAndEvents[0], false).should.be.fulfilled;
        nTotHalf1 = result.toNumber();
        result = await encodeLog.getNTot(matchLogsAndEvents[0], true).should.be.fulfilled;
        nTotHalf2 = result.toNumber();
        result = await encodeLog.getNGKAndDefs(matchLogsAndEvents[0], false).should.be.fulfilled;
        nGKAndDefsHalf1 = result.toNumber();
        result = await encodeLog.getNGKAndDefs(matchLogsAndEvents[0], true).should.be.fulfilled;
        nGKAndDefsHalf2 = result.toNumber();        
        // console.log(nTotHalf1,nTotHalf2,nGKAndDefsHalf1,nGKAndDefsHalf2);
        result = await encodeLog.getWinner(matchLogsAndEvents[0]).should.be.fulfilled;
        win1 = result.toNumber();            
        result = await encodeLog.getWinner(matchLogsAndEvents[1]).should.be.fulfilled;
        win2 = result.toNumber();            
        // console.log(win1, win2)

        // encoding it manually
        
        log0Enc = await logUtils.encodeLog(encodeLog, goals[0], ass, sho, fwds, penalties,
            outs, outRounds = [0,2], typeOuts = [0,3], 
            isHomeStadium, ingameSubs1, ingameSubs2, yellows1, yellows2, 
            halfTimeSubstitutions, nGKAndDefsHalf1, nGKAndDefsHalf2, nTotHalf1, nTotHalf2, win1, sums[0], trainings = 0
        );
        // for 2nd team, only thing that matters is goals and sumSkills
        log1Enc = await logUtils.encodeLog(encodeLog, goals[1], ass, sho, fwds, penalties,
            outs, outRounds = [0,2], typeOuts = [0,3], 
            isHomeStadium, ingameSubs1, ingameSubs2, yellows1, yellows2, 
            halfTimeSubstitutions, nGKAndDefsHalf1, nGKAndDefsHalf2, nTotHalf1, nTotHalf2, win2, sums[1], trainings = 0
        );
        
        var {0: newlog0, 1: newlog1} = await training.computeTrainingPoints(log0Enc, log1Enc).should.be.fulfilled;
        tps = await encodeLog.getTrainingPoints(newlog0).should.be.fulfilled;
        // console.log(tps.toNumber());
    });
    
    it('thorough test of training points after 1st and 2nd halves', async () => {
        // [ 2, 3,  1, 3, 3, 2,  3, 1, 3 ]  => fwd
        // [ 6, 8,  1, 9, 8, 6,  8, 1, 9 ]  => sho
        // [ 6, 10, 6, 9, 8, 6, 10, 6, 9 ] => assisters    
        // winning home: +21
        // 9 goals = 
        //   - Def: 2 => +12
        //   - Mid: 2 => +10
        //   - Fwd: 5 => +20
        // assists... 4 => +12 => 21 + 12 +10 +20 +12 = 21 + 54 = 75
        // blank sheet: +2*2*5+2*6 = 20+12 = 32
        // yellows -1
        // total = 21+12+10+20+12+32-1= 106 
        // we should therefore expect: 106 * 33022 / 55000 = 63
        expectedGoals = [4, 0];
        expectedPoints = [56, 10];
        expectedSums = [90000,54036];
        expectedFwds = [ 2, 3, 1, 3, 3, 1 ];     
        expectedSho = [ 6, 8,  1, 9, 8, 6,  8, 1, 9 ];     
        expectedAss = [ 6, 10, 6, 9, 8, 6, 10, 6, 9 ];   
        
        assignment = 0;
        // Should be rejected if we earned 0 TPs in previous match, and now we claim 200 in the assignedTPs:
        prev2ndHalfLog = 0;
        teamIds = [1,2]
        verseSeed = '0x234ab3'

        lineUpNew = [...lineupConsecutive];
        subst = [NO_SUBST, NO_SUBST, NO_SUBST]
        tacticsNew = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineUpNew, subst), extraAttackNull, tacticId433).should.be.fulfilled;
        teamStateAll1000Half1 = await createTeamStateFromSinglePlayer([1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        teamStateAll700Half1 = await createTeamStateFromSinglePlayer([0, 0, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        
        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll1000Half1, teamStateAll700Half1], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;

        var {0: nPenalties, 1: nPenaltiesFailed, 2: shooters} = getPenaltyData(matchLogsAndEvents);
        nPenalties.should.be.equal(1);
        nPenaltiesFailed.should.be.equal(0);

        goals = [];
        points = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals.toNumber());
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints.toNumber());
        }        
        debug.compareArrays(goals, expectedGoals, toNum = false, isBigNumber = false);

        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = false).should.be.fulfilled;
        outPlayer.toNumber().should.be.equal(14);
        yellow1.toNumber().should.be.equal(14);
        yellow2.toNumber().should.be.equal(8);

        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[1], is2nd = false).should.be.fulfilled;
        outPlayer.toNumber().should.be.equal(3);
        outRounds.toNumber().should.be.equal(4);
        yellow1.toNumber().should.be.equal(8);
        yellow2.toNumber().should.be.equal(4);

        // 2nd half:
        expectedGoals = [6, 0];
        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play2ndHalfAndEvolve(
            verseSeed, now, [skills[0], skills[1]], teamIds, [tacticsNew, tacticsNew], [matchLogsAndEvents[0], matchLogsAndEvents[1]],
            [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]
        ).should.be.fulfilled;

        // the result is biased because 1 team played with 1 injury and 1 red card
        result = await training.getOutOfGameType(matchLogsAndEvents[0], is2 = false).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        result = await training.getOutOfGameType(matchLogsAndEvents[0], is2 = true).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        result = await training.getOutOfGameType(matchLogsAndEvents[1], is2 = false).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        result = await training.getOutOfGameType(matchLogsAndEvents[1], is2 = true).should.be.fulfilled;
        result.toNumber().should.be.equal(3);

        var {0: nPenalties, 1: nPenaltiesFailed, 2: shooters} = getPenaltyData(matchLogsAndEvents);
        nPenalties.should.be.equal(0);
        nPenaltiesFailed.should.be.equal(0);
     
        goals = [];
        points = [];
        sums = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals.toNumber());
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints.toNumber());
            sum = await encodeLog.getTeamSumSkills(matchLogsAndEvents[team]).should.be.fulfilled;
            sums.push(sum.toNumber());
            
        }   
        expectedFwds = [ 1, 3, 1, 3, 3, 1 ];     
        expectedSho = [ 1, 8, 1, 9, 8, 1 ];     
        expectedAss = [ 4, 14, 6, 9, 8, 6 ];     
        fwds = [];
        sho = [];
        ass = [];
        for (g = 0; g < goals[0]; g++) {
            result = await encodeLog.getForwardPos(matchLogsAndEvents[0], g).should.be.fulfilled;
            fwds.push(result.toNumber());
            result = await encodeLog.getShooter(matchLogsAndEvents[0], g).should.be.fulfilled;
            sho.push(result.toNumber());
            result = await encodeLog.getAssister(matchLogsAndEvents[0], g).should.be.fulfilled;
            ass.push(result.toNumber());
        }

        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = true).should.be.fulfilled;
        outPlayer.toNumber().should.be.equal(14);
        yellow1.toNumber().should.be.equal(14);
        yellow2.toNumber().should.be.equal(14);

        debug.compareArrays(goals, expectedGoals, toNum = false, isBigNumber = false);
        assert.deepEqual(points, expectedPoints);
        // debug.compareArrays(points, expectedPoints, toNum = false, isBigNumber = false);
        debug.compareArrays(sums, expectedSums, toNum = false, isBigNumber = false);
        debug.compareArrays(fwds, expectedFwds, toNum = false, isBigNumber = false);
        debug.compareArrays(sho, expectedSho, toNum = false, isBigNumber = false);
        debug.compareArrays(ass, expectedAss, toNum = false, isBigNumber = false);


    });

    it('bots generate children', async () => {
        expectedGoals = [3,0];
        expectedPoints = [45,11];
        expectedSums = [90000, 54000];
        expectedFwds = [ 1, 3, 2 ];     
        expectedSho = [ 1, 10, 7];     
        expectedAss = [ 6, 10, 8 ];   
        
        assignment = 0;
        // Should be rejected if we earned 0 TPs in previous match, and now we claim 200 in the assignedTPs:
        prev2ndHalfLog = 0;
        teamIds = [1,2]
        verseSeed = '0x234ab3'

        lineUpNew = [...lineupConsecutive];
        subst = [NO_SUBST, NO_SUBST, NO_SUBST]
        tacticsNew = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineUpNew, subst), extraAttackNull, tacticId433).should.be.fulfilled;
        teamStateAll1000Half1 = await createTeamStateFromSinglePlayer([1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        teamStateAll700Half1 = await createTeamStateFromSinglePlayer([0, 0, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;

        // we set one of the players to 38 years old, and expect his bday to change after playing 1st half.
        const dayOfBirth38 = secsToDays(now) - 13860/INGAMETIME_VS_REALTIME; // = 13860 is a bit more than 38 years, and exactly divisible by 14
        teamStateAll1000Half1[1] = await assets.encodePlayerSkills(
            [1000, 1000, 1000, 1000, 1000], dayOfBirth38, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr],
            aligned, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, false, sumSk = 5000
        ).should.be.fulfilled;

        bDayTeam1 = [];
        bDayTeam2 = [];
        for (p = 0; p < 2; p++) {
            var bday = await assets.getBirthDay(teamStateAll1000Half1[p]);
            bDayTeam1.push(bday);
            bday = await assets.getBirthDay(teamStateAll700Half1[p]);
            bDayTeam2.push(bday);
        }                
        console.log(bDayTeam1, bDayTeam2);

        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll1000Half1, teamStateAll700Half1], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isB = true, isB = true], [assignment, assignment]
        ).should.be.fulfilled;
        
        newbDayTeam1 = [];
        newbDayTeam2 = [];
        for (p = 0; p < 2; p++) {
            var bday = await assets.getBirthDay(skills[0][p]);
            newbDayTeam1.push(bday);
            bday = await assets.getBirthDay(skills[1][p]);
            newbDayTeam2.push(bday);
        }      
        // team2 has same bdays
        debug.compareArrays(newbDayTeam2, bDayTeam2, toNum = false, isBigNumber = true);
        // team1 has changed bday of the old player only
        newbDayTeam1[0].toNumber().should.be.equal(bDayTeam1[0].toNumber());
        newbDayTeam1[1].toNumber().should.not.be.equal(bDayTeam1[1].toNumber());
    });

    it('thorough test of training points after 1st and 2nd halves ==> BOTS = true', async () => {
        // [ 2, 3,  1, 3, 3, 2,  3, 1, 3 ]  => fwd
        // [ 6, 8,  1, 9, 8, 6,  8, 1, 9 ]  => sho
        // [ 6, 10, 6, 9, 8, 6, 10, 6, 9 ] => assisters    
        // winning home: +21
        // 9 goals = 
        //   - Def: 2 => +12
        //   - Mid: 2 => +10
        //   - Fwd: 5 => +20
        // assists... 4 => +12 => 21 + 12 +10 +20 +12 = 21 + 54 = 75
        // blank sheet: +2*2*5+2*6 = 20+12 = 32
        // yellows -1
        // total = 21+12+10+20+12+32-1= 106 
        // we should therefore expect: 106 * 33022 / 55000 = 63
        expectedGoals = [2,0];
        expectedPoints = [40,13];
        expectedSums = [90000, 54000];
        expectedFwds = [ 1, 3];     
        expectedSho = [ 1, 10];     
        expectedAss = [ 6, 10];   
        
        assignment = 0;
        // Should be rejected if we earned 0 TPs in previous match, and now we claim 200 in the assignedTPs:
        prev2ndHalfLog = 0;
        teamIds = [1,2]
        verseSeed = '0x234ab3'

        lineUpNew = [...lineupConsecutive];
        subst = [NO_SUBST, NO_SUBST, NO_SUBST]
        tacticsNew = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineUpNew, subst), extraAttackNull, tacticId433).should.be.fulfilled;
        teamStateAll1000Half1 = await createTeamStateFromSinglePlayer([1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        teamStateAll700Half1 = await createTeamStateFromSinglePlayer([0, 0, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        
        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll1000Half1, teamStateAll700Half1], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isB = true, isB = true], [assignment, assignment]
        ).should.be.fulfilled;
        
        goals = [];
        points = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals.toNumber());
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints.toNumber());
        }        
        
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = false).should.be.fulfilled;
        sumSkills.toNumber().should.be.equal(0);
        outPlayer.toNumber().should.be.equal(14);
        yellow1.toNumber().should.be.equal(14);
        yellow2.toNumber().should.be.equal(14);

        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[1], is2nd = false).should.be.fulfilled;
        sumSkills.toNumber().should.be.equal(0);

        for (team = 0; team < 2; team++) {
            result = await assets.getAlignedEndOfFirstHalf(skills[team][0]).should.be.fulfilled;
            result = await assets.getSubstitutedFirstHalf(skills[team][0]).should.be.fulfilled;
            result = await assets.getRedCardLastGame(skills[team][0]).should.be.fulfilled;
            result = await assets.getInjuryWeeksLeft(skills[team][0]).should.be.fulfilled;
            result = await assets.getSkill(skills[team][0],0).should.be.fulfilled;
            result = await assets.getSkill(skills[team][0],3).should.be.fulfilled;
            result = await assets.getSkill(skills[team][0],4).should.be.fulfilled;
            result = await assets.getSumOfSkills(skills[team][0]).should.be.fulfilled;
        }

        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play2ndHalfAndEvolve(
            verseSeed, now, [skills[0], skills[1]], teamIds, [tacticsNew, tacticsNew], [matchLogsAndEvents[0], matchLogsAndEvents[1]],
            [is2nd = true, isHomeStadium, isPlayoff, isB = true, isB = true]
        ).should.be.fulfilled;

        goals = [];
        points = [];
        sums = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals.toNumber());
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints.toNumber());
            sum = await encodeLog.getTeamSumSkills(matchLogsAndEvents[team]).should.be.fulfilled;
            sums.push(sum.toNumber());
            
        }   
        fwds = [];
        sho = [];
        ass = [];
        for (g = 0; g < goals[0]; g++) {
            result = await encodeLog.getForwardPos(matchLogsAndEvents[0], g).should.be.fulfilled;
            fwds.push(result.toNumber());
            result = await encodeLog.getShooter(matchLogsAndEvents[0], g).should.be.fulfilled;
            sho.push(result.toNumber());
            result = await encodeLog.getAssister(matchLogsAndEvents[0], g).should.be.fulfilled;
            ass.push(result.toNumber());
        }

        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = true).should.be.fulfilled;
        outPlayer.toNumber().should.be.equal(14);
        yellow1.toNumber().should.be.equal(14);
        yellow2.toNumber().should.be.equal(14);

        debug.compareArrays(goals, expectedGoals, toNum = false, isBigNumber = false);
        assert.deepEqual(points, expectedPoints);
        debug.compareArrays(sums, expectedSums, toNum = false, isBigNumber = false);
        assert.deepEqual(fwds, expectedFwds);
        debug.compareArrays(sho, expectedSho, toNum = false, isBigNumber = false);
        debug.compareArrays(ass, expectedAss, toNum = false, isBigNumber = false);

        for (team = 0; team < 2; team++) {
            result = await assets.getAlignedEndOfFirstHalf(skills[team][0]).should.be.fulfilled;
            result = await assets.getSubstitutedFirstHalf(skills[team][0]).should.be.fulfilled;
            result = await assets.getRedCardLastGame(skills[team][0]).should.be.fulfilled;
            result = await assets.getInjuryWeeksLeft(skills[team][0]).should.be.fulfilled;
            result = await assets.getSkill(skills[team][0],0).should.be.fulfilled;
            result = await assets.getSkill(skills[team][0],3).should.be.fulfilled;
            result = await assets.getSkill(skills[team][0],4).should.be.fulfilled;
            result = await assets.getSumOfSkills(skills[team][0]).should.be.fulfilled;
        }

    });

    it('test that used to fail because yellow cards remained 0 when turned into a red', async () => {
        seed = '0xe52d9c508c502347344d8c07ad91cbd6068afc75ff6292f062a09ca381c89e71';startTime = '1790899200';matchLog0 = '1809252841225359395763531563040360552848149419233210499192956735625688514560';teamId0 = '274877906944';tactic0 = '340596594427581673436941882753025';assignedTP0 = '0';players0 = ['444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215365791057199872740304247249882896829616798696246','444839120007985571215365791057199872740304247249882896829616798696246','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215354373075658225061255780962127300868525736723254','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270','444839120007985571215331537112574929703158848386616108946343612777270',];matchLog1 = '1853865730769448808439638838008836422826785356564716589545617037606298150806';teamId1 = '274877906945';tactic1 = '340596594427581673436941882753025';assignedTP1 = '0';players1 = ['13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512374694612962256356302448524453314934638900740885','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901','13479973333575334512351858649878960998205515948942123012456776794901',]; 
        var {0: skills, 1: matchLogsAndEvents} =  await play.play1stHalfAndEvolve(
            seed, startTime, [players0, players1], [teamId0, teamId1], [tactic0, tactic1], [matchLog0, matchLog1],
            [is2nd = false, isHom = true, isPlay = false, isBotHome, isBotAway], [assignedTP0, assignedTP1]).should.be.fulfilled;
            
        // same for 2nd half
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[0], is2nd = false).should.be.fulfilled;
        result = [sumSkills, outPlayer, typeOut, outRounds, yellow1, yellow2];
        expct = [ 0, 7, 3, 8, 7, 14 ];
        debug.compareArrays(result, expct, toNum = true, isBigNumber = false);
        
        var {0: sumSkills , 1: winner, 2: nGoals, 3: TPs, 4: outPlayer, 5: typeOut, 6: outRounds, 7: yellow1, 8: yellow2, 9: subs1, 10: subs2, 11: subs3 } = await utils.fullDecodeMatchLog(matchLogsAndEvents[1], is2nd = false).should.be.fulfilled;
        result = [sumSkills, outPlayer, typeOut, outRounds, yellow1, yellow2];
        expct = [ 0, 14, 0, 0, 14, 14 ];
        debug.compareArrays(result, expct, toNum = true, isBigNumber = false);
    });
    
    
    it('test that used to fail because skills[lineUp[p]] would query skills[25]', async () => {
        seed = '0x6c94aa1a7eea1de18637d1145b6d4bd41cf5f6f8412aae446c2c699d7580ac1f';startTime = '1581951774';matchLog0 = '0';teamId0 = '274877906944';tactic0 = '232408266334649167582215536641';assignedTP0 = '0';players0 = ['14606248079918261338806855269144928920528183545627247','14603325075249802958062362770259847568953042673598904','14615017086954653606499907545237767084325338845938493','14609171184243174825485386707807678037701064871052075','14615017461189033969342085988364404867542322815173331','14603325891317697566792670026694092366945297476616921','14606249873734453245614329194914044263381734393971242','14603324461979309998470701597095731425930881024328431','14606248281321866413037179626743594105804510651548463','14606249082057998697777445242442714345874030104085954','14603327085801362263089568887183207415342272698974888','14612095382001501327618929766528609401264661864121250','14603326117112742701915784438422215461700315946878109','14612093787498219632679532984082491830230891888182351','14609173081200313275497388967190849348658309539234489','14603326360330245023390631074601982170339882110616174','14606249807529115937477334114560996043185291177165366','14603326808435843856365497756482947008181618635572131','0','0','0','0','0','0','0',];matchLog1 = '0';teamId1 = '274877906951';tactic1 = '232408266302079135077072109569';assignedTP1 = '0';players1 = ['14615016376815298690800201649220184280315730971132558','14609172511834412425521368984185260418865566827283036','14609171084586719719561567913262331453334268194587406','14609172165475963560842787370746505659732178042290961','14612094897657191547041386733102280708157489908351780','14609171364042932988648677202799875053042440135311897','14606248714792601209485990362067212005781000358003188','14609173055415076639705784028918284727348393612411594','14609171905532902340470607391083606114650385692034077','14609172622641240130721037564311250677507995239581185','14603325390944727174772193097761782592653101121733224','14603324761645573603736249750401919269415400293270169','14603324774189742777909804362708129945470638967817654','14609171585656588399047378013534405380348672917505319','14609173082594109850415535128877508619287877366448825','14612096081687381931527530703691145228948441982501521','14612093676691391927490720233815463751121253833769674','14606249096692862734323783960084670624419958191030946','0','0','0','0','0','0','0',];
        var {0: skills, 1: matchLogsAndEvents} =  await play.play1stHalfAndEvolve(
            seed, startTime, [players0, players1], [teamId0, teamId1], [tactic0, tactic1], [matchLog0, matchLog1],
            [is2nd = false, isHom = true, isPlay = false, isBotHome, isBotAway], [assignedTP0, assignedTP1]).should.be.fulfilled;
    });
    
    it('show that a red card is stored in skills after playing 1st half', async () => {
        TP = 0;
        assignment = 0
        prev2ndHalfLog = 0;
        teamIds = [1,2]

        // for (p=1; p< 1000; p++) {
        //     vSeed = web3.utils.keccak256(p.toString());
        //     var {0: skills, 1: matchLogsAndEvents} =  await play.play1stHalfAndEvolve(
        //         vSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tactics0, tactics1], [prev2ndHalfLog, prev2ndHalfLog],
        //         [is2nd = false, isHomeStadium, isPlayoff], [assignment, assignment]
        //     ).should.be.fulfilled;
        //     outType = await training.getOutOfGameType(matchLogsAndEvents[0], is2 = false).should.be.fulfilled;
        //     console.log(vSeed.toString(), outType.toNumber())
        // }

        vSeed='0x3b4066bd7b7960752225af105d3beafb5c47a26c5aae7e6798a437b7c0bb33e6';
        var {0: skills, 1: matchLogsAndEvents} =  await play.play1stHalfAndEvolve(
            vSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tactics0, tactics1], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
        outType = await training.getOutOfGameType(matchLogsAndEvents[0], is2 = false).should.be.fulfilled;
    
        outType.toNumber().should.be.equal(3); // RED_CARD = 3
        // with this seed, player p = 9 sees the red card
        outPlayer = await training.getOutOfGamePlayer(matchLogsAndEvents[0], is2 = false).should.be.fulfilled;
        p = 9;    
        outPlayer.toNumber().should.be.equal(p);
        red = await assets.getRedCardLastGame(skills[0][p]).should.be.fulfilled;
        red.should.be.equal(true)
    });
    
    it('updateSkillsAfterPlayHalf: half 1', async () => {
        // note: substitutions = [6, 10, 0];
        // note: lineup is consecutive
        var {0: matchLog, 1: err} = await engine.playHalfMatch(
            123456, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], [0, 0], 
            [is2nd = false, isHome = true, playoff = false, isBotHome, isBotAway]
        ).should.be.fulfilled;
        var {0: newSkills, 1: err} = await evo.updateSkillsAfterPlayHalf(teamStateAll50Half1, matchLog[0], tactics0, is2nd = false, isBotHome).should.be.fulfilled;
        // players not aligned did not change state: 
        debug.compareArrays(newSkills.slice(14,25), teamStateAll50Half1.slice(14,25), toNum = false, isBigNumber = true);
        // those that were aligned either finished the 1st half, or were substituted:
        aligned = await evo.setAlignedEndOfFirstHalf(teamStateAll50Half1[0], true).should.be.fulfilled
        substituted = await evo.setSubstitutedFirstHalf(teamStateAll50Half1[0], true).should.be.fulfilled
        for (p = 0; p < 14; p++) {
            result0 = await evo.getAlignedEndOfFirstHalf(newSkills[p]).should.be.fulfilled;
            result1 = await evo.getSubstitutedFirstHalf(newSkills[p]).should.be.fulfilled;
            if (!substitutions.includes(p)) {
                result0.should.be.equal(true);
                result1.should.be.equal(false);
            }
            else {
                result0.should.be.equal(false);
                result1.should.be.equal(true);
            }
        }
        
        // now try the same with a red card:
        // note that a red carded has not been sustituted, so he'll appear as "alignedEndOfFirstHalf"
        newLog = await evo.setOutOfGame(matchLog[0], player = 1, round = 2, typeOfOutOfGame = RED_CARD, is2nd = false).should.be.fulfilled;
        var {0: newSkills, 1: err}  = await evo.updateSkillsAfterPlayHalf(teamStateAll50Half1, newLog, tactics0, is2nd = false, isBotHome).should.be.fulfilled;
        debug.compareArrays(newSkills.slice(14,25), teamStateAll50Half1.slice(14,25), toNum = false, isBigNumber = true);
        alignedRedCarded = await evo.setRedCardLastGame(aligned, true).should.be.fulfilled
        alignedRedCarded = await evo.setAlignedEndOfFirstHalf(alignedRedCarded, true).should.be.fulfilled
        alignedRedCarded = await evo.setOutOfGameFirstHalf(alignedRedCarded, true).should.be.fulfilled
        newSkills[1].should.be.bignumber.equal(alignedRedCarded);
        for (p = 0; p < 14; p++) {
            if (p != 1) {
                result0 = await evo.getAlignedEndOfFirstHalf(newSkills[p]).should.be.fulfilled;
                result1 = await evo.getSubstitutedFirstHalf(newSkills[p]).should.be.fulfilled;
                if (!substitutions.includes(p)) {
                    result0.should.be.equal(true);
                    result1.should.be.equal(false);
                }
                else {
                    result0.should.be.equal(false);
                    result1.should.be.equal(true);
                }
            } 
        }
        
        // now try the same with a hard injury:
        SOFT_INJURY = 1;
        HARD_INJURY = 2;
        WEEKS_SOFT_INJ = 2;
        WEEKS_HARD_INJ = 5;
        newLog = await evo.setOutOfGame(matchLog[0], player = 1, round = 2, typeOfOutOfGame = HARD_INJURY, is2nd = false).should.be.fulfilled;
        var {0: newSkills, 1: err}  = await evo.updateSkillsAfterPlayHalf(teamStateAll50Half1, newLog, tactics0, is2nd = false, isBotHome).should.be.fulfilled;
        debug.compareArrays(newSkills.slice(14,25), teamStateAll50Half1.slice(14,25), toNum = false, isBigNumber = true);
        alignedInjured = await evo.setInjuryWeeksLeft(aligned, WEEKS_HARD_INJ).should.be.fulfilled
        alignedInjured = await evo.setAlignedEndOfFirstHalf(alignedInjured, true).should.be.fulfilled
        alignedInjured = await evo.setOutOfGameFirstHalf(alignedInjured, true).should.be.fulfilled
        newSkills[1].should.be.bignumber.equal(alignedInjured);
        for (p = 0; p < 14; p++) {
            if (p != 1) {
                result0 = await evo.getAlignedEndOfFirstHalf(newSkills[p]).should.be.fulfilled;
                result1 = await evo.getSubstitutedFirstHalf(newSkills[p]).should.be.fulfilled;
                if (!substitutions.includes(p)) {
                    result0.should.be.equal(true);
                    result1.should.be.equal(false);
                }
                else {
                    result0.should.be.equal(false);
                    result1.should.be.equal(true);
                }
            } 
        }
        // now try the same with a soft injury:
        newLog = await evo.setOutOfGame(matchLog[0], player = 1, round = 2, typeOfOutOfGame = SOFT_INJURY, is2nd = false).should.be.fulfilled;
        var {0: newSkills, 1: err}  = await evo.updateSkillsAfterPlayHalf(teamStateAll50Half1, newLog, tactics0, is2nd = false, isBotHome).should.be.fulfilled;
        debug.compareArrays(newSkills.slice(14,25), teamStateAll50Half1.slice(14,25), toNum = false, isBigNumber = true);
        alignedInjured = await evo.setInjuryWeeksLeft(aligned, WEEKS_SOFT_INJ).should.be.fulfilled
        alignedInjured = await evo.setAlignedEndOfFirstHalf(alignedInjured, true).should.be.fulfilled
        alignedInjured = await evo.setOutOfGameFirstHalf(alignedInjured, true).should.be.fulfilled        
        newSkills[1].should.be.bignumber.equal(alignedInjured);
        for (p = 0; p < 14; p++) {
            if (p != 1) {
                result0 = await evo.getAlignedEndOfFirstHalf(newSkills[p]).should.be.fulfilled;
                result1 = await evo.getSubstitutedFirstHalf(newSkills[p]).should.be.fulfilled;
                if (!substitutions.includes(p)) {
                    result0.should.be.equal(true);
                    result1.should.be.equal(false);
                }
                else {
                    result0.should.be.equal(false);
                    result1.should.be.equal(true);
                }
            } 
        }
    });
    
    it('updateSkillsAfterPlayHalf: half 2', async () => {
        // note: substitutions = [6, 10, 0];
        // note: lineup is consecutive
        var {0: matchLog, 1: err} = await engine.playHalfMatch(
            123456, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics0, tactics1], [0, 0], 
            [is2nd = true, isHome = true, playoff = false, isBotHome, isBotAway]
        ).should.be.fulfilled;
        teamStateAll50Half2[1] = await evo.setInjuryWeeksLeft(teamStateAll50Half2[1], 2);
        var {0: newSkills, 1: err}  = await evo.updateSkillsAfterPlayHalf(teamStateAll50Half2, matchLog[0], tactics0, is2nd = true, isBotHome).should.be.fulfilled;
        // players not aligned did not change state: 
        debug.compareArrays(newSkills.slice(14,25), teamStateAll50Half2.slice(14,25), toNum = false, isBigNumber = true);
        for (p = 0; p < 25; p++) {
            aligned = await evo.getAlignedEndOfFirstHalf(newSkills[p]).should.be.fulfilled
            aligned.should.be.equal(false)
            substituted = await evo.getSubstitutedFirstHalf(newSkills[p]).should.be.fulfilled
            substituted.should.be.equal(false)
        }
        weeks = await evo.getInjuryWeeksLeft(newSkills[1]);
        weeks.toNumber().should.be.equal(1);
        
        // now try the same with a red card in both halfs...
        newLog = await evo.setOutOfGame(matchLog[0], player = 1, round = 2, typeOfOutOfGame = RED_CARD, is2nd = false).should.be.fulfilled;
        newLog = await evo.setOutOfGame(newLog, player = 2, round = 2, typeOfOutOfGame = RED_CARD, is2nd = true).should.be.fulfilled;
        var {0: newSkills, 1: err}  = await evo.updateSkillsAfterPlayHalf(teamStateAll50Half2, newLog, tactics0, is2nd = true, isBotHome).should.be.fulfilled;
        debug.compareArrays(newSkills.slice(14,25), teamStateAll50Half2.slice(14,25), toNum = false, isBigNumber = true);
        // since we only updatedSkills in 1st half, player 1 does not show as redCarded
        for (p = 0; p < 25; p++) {
            redCarded = await evo.getRedCardLastGame(newSkills[p]).should.be.fulfilled
            if (p == 2) {redCarded.should.be.equal(true);}
            else {redCarded.should.be.equal(false);}
        }
    });
    
    it('applyTrainingPoints: if assignment = 0, it works by doing absolutely nothing', async () => {
        matchStartTime = now;
        var {0: newSkills, 1: err} = await training.applyTrainingPoints(teamStateAll50Half2, assignment = 0, tactics = 0, matchStartTime, TPs = 0).should.be.fulfilled;
        // newSkills2 = await training.applyTrainingPoints(teamStateAll50Half2, assignment = 0, tactics = 0, matchStartTime, TPs = 1).should.be.fulfilled;
        debug.compareArrays(newSkills, teamStateAll50Half2, toNum = false, isBigNumber = true);
        // debug.compareArrays(newSkills2, teamStateAll50Half2, toNum = false, isBigNumber = true);
    });

    it('training leading to an actual son', async () => {
        playerSkills = await assets.encodePlayerSkills(
            skills = [100, 100, 100, 100, 100], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 45,
            playerId = 2132321,
            [potential = 2, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 40;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPs = 20;
        TPperSkill = Array.from(new Array(5), (x,i) => TPs/5 - 3*i % 5);
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime).should.be.fulfilled;

        // checks that the generation increases by 1. 
        // It sets a "32" at the beginning if it is a Academy player, otherwise it is a child
        // In this case, the randomness leads to an actual son
        result = await assets.getGeneration(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(gen - 32 + 1)

        playerSkills = await assets.encodePlayerSkills(
            skills = [100, 100, 100, 100, 100], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 45,
            playerId = 3,
            [potential = 2, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 40;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPs = 20;
        TPperSkill = Array.from(new Array(5), (x,i) => TPs/5 - 3*i % 5);
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime).should.be.fulfilled;

        // checks that the generation increases by 1. 
        // It sets a "32" at the beginning if it is a Academy player, otherwise it is a child
        // In this case, the randomness leads to an academy player
        result = await assets.getGeneration(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(gen - 32 + 1)
        
        expected = [ 1029, 928, 1311, 673, 1057 ];
        results = [];
        for (sk = 0; sk < N_SKILLS; sk++) {
            result = await engine.getSkill(newSkills, sk).should.be.fulfilled;
            results.push(result);
        }
        debug.compareArrays(results, expected, toNum = true);
        
        expectedSumSkills = expected.reduce((a, b) => a + b, 0);
        result = await engine.getSumOfSkills(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(expectedSumSkills);
        
        // check that potential increases by 1:
        result = await engine.getPotential(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(potential+1);

        // check that forwardness remains the same:
        result = await engine.getForwardness(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(forwardness);
        
    });
    
    it('training leading to an academy', async () => {
        // all inputs are identical to the previous test, except for a +2 in matchStatTime,
        // which changes the entire randomness
        playerSkills = await assets.encodePlayerSkills(
            skills = [101, 310, 1000, 100, 100], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 3,
            playerId = 2139321,
            [potential = 2, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 40;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPs = 20;
        TPperSkill = Array.from(new Array(5), (x,i) => TPs/5 - 3*i % 5);
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime + 2).should.be.fulfilled;

        // checks that the generation increases by 1. It sets a "32" at the beginning if it is a Academy player, otherwise it is a child.
        // In this case, randomness leads to an academy.
        result = await assets.getGeneration(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(32 + gen + 1)

        expected = [ 1640, 580, 800, 738, 1238 ];
        results = []
        for (sk = 0; sk < N_SKILLS; sk++) {
            result = await engine.getSkill(newSkills, sk).should.be.fulfilled;
            results.push(result);
        }
        debug.compareArrays(results, expected, toNum = true);
        
        expectedSumSkills = expected.reduce((a, b) => a + b, 0);
        result = await engine.getSumOfSkills(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(expectedSumSkills);

        // check that forwardness remains the same: (potential is unrelated, since it is not a child)
        result = await engine.getForwardness(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(forwardness);
    });
    
    
    it('applyTrainingPoints', async () => {
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
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
        matchStartTime = now;
        var {0: newSkills, 1: err} = await training.applyTrainingPoints(teamStateAll50Half2, assignment, tactics = 0, matchStartTime, TP+1).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_TRAINING_PREVMATCH);
        var {0: newSkills, 1: err} = await training.applyTrainingPoints(teamStateAll50Half2, assignment, tactics = 0, matchStartTime, TP).should.be.fulfilled;
        for (p = 0; p < 25; p++) {
            result = await training.getSkill(newSkills[p], SK_SHO).should.be.fulfilled;
            if (p == specialPlayer) result.toNumber().should.be.equal(110);
            else result.toNumber().should.be.equal(105);
        }
    });

    it('applyTrainingPoints with recovery stamina', async () => {
        const [TP, TPperSkill] = getDefaultTPs();
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
        matchStartTime = now;
        staminas = Array.from(new Array(PLAYERS_PER_TEAM_MAX), (x,i) => i % 4); 
        gamesNonStopping = Array.from(new Array(PLAYERS_PER_TEAM_MAX), (x,i) => i % 7); 
        skills = [...teamStateAll50Half2];
        for (p = 0; p < PLAYERS_PER_TEAM_MAX; p++){
            skills[p] = await evo.setGamesNonStopping(skills[p], gamesNonStopping[p]).should.be.fulfilled;
        }
        tactics = await training.setStaminaRecovery(initTactics = 0, staminas);
        var {0: newSkills, 1: err} = await training.applyTrainingPoints(skills, assignment, tactics, matchStartTime, TP+1).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_TRAINING_PREVMATCH);
        var {0: newSkills, 1: err} = await training.applyTrainingPoints(skills, assignment, tactics, matchStartTime, TP).should.be.fulfilled;
        newGamesNonStopping = [];
        expectedGamesNonStopping = [];
        for (p = 0; p < 25; p++) {
            result = await training.getSkill(newSkills[p], SK_SHO).should.be.fulfilled;
            if (p == specialPlayer) result.toNumber().should.be.equal(110);
            else result.toNumber().should.be.equal(105);
            result = await evo.getGamesNonStopping(newSkills[p]).should.be.fulfilled;
            newGamesNonStopping.push(result);
            expected = 0;
            if (staminas[p] == 0) { expected = gamesNonStopping[p] }
            else if (staminas[p] == 3 || gamesNonStopping[p] <= 2*staminas[p] ) { expected = 0 }
            else { expected = gamesNonStopping[p] - 2 * staminas[p]}
            expectedGamesNonStopping.push(expected)
        }
        debug.compareArrays(newGamesNonStopping, expectedGamesNonStopping, toNum = true);
    });
    
    it('applyTrainingPoints with realistic team and zero TPs', async () => {
        teamState = teamStateAll50Half1;
        TPperSkill = Array.from(new Array(25), (x,i) => 0);
        TP = TPperSkill.reduce((a, b) => a + b, 0);
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer = 0).should.be.fulfilled;
        matchStartTime = now;
        var {0: newSkills, 1: err} = await training.applyTrainingPoints(teamState, assignment, tactics = 0, matchStartTime, TP);
        initShoot = [];
        newShoot = [];
        expectedInitShoot = [ 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50 ];
        expectedNewShoot  = expectedInitShoot;
        // check that if skills are different, then:
        // - the new ones are worse than the init ones,
        // - it happened because of age (older than 31 y.o.)
        for (p = 0; p < 18; p++) {
            resultInit = await training.getSkill(teamState[p], SK_SHO).should.be.fulfilled;
            resultNew = await training.getSkill(newSkills[p], SK_SHO).should.be.fulfilled;
            if (resultNew.toNumber() != resultInit.toNumber()) {
                resultId = await assets.getPlayerIdFromSkills(newSkills[p]).should.be.fulfilled;
                resultAge = await assets.getPlayerAgeInDays(resultId).should.be.fulfilled;
                (resultAge.toNumber() >= 31 * 365).should.be.equal(true);
                (resultNew.toNumber() < resultInit.toNumber()).should.be.equal(true);
            }
            initShoot.push(resultInit)
            newShoot.push(resultNew)
        }
        debug.compareArrays(newShoot, expectedNewShoot, toNum = true);
        debug.compareArrays(initShoot, expectedInitShoot, toNum = true);
    });
    
    it('applyTrainingPoints with realistic team and non-zero TPs', async () => {
        teamState = teamStateAll50Half1;
        TPperSkill = [ 40, 37, 40, 37, 46, 37, 40, 37, 40, 46, 40, 37, 40, 37, 46, 37, 40, 37, 40, 46, 40, 37, 40, 37, 46 ];
        TP = 200;
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer = 12).should.be.fulfilled;
        matchStartTime = now;
        var {0: newSkills, 1: err} = await training.applyTrainingPoints(teamState, assignment, tactics = 0, matchStartTime, TP);
        initShoot = [];
        newShoot = [];
        expectedInitShoot = [ 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50 ];
        expectedNewShoot  = [ 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 110, 105, 105, 105, 105, 105 ];
        for (p = 0; p < 18; p++) {
            result0 = await training.getSkill(teamState[p], SK_SHO);
            result1 = await training.getSkill(newSkills[p], SK_SHO);
            initShoot.push(result0)
            newShoot.push(result1)
        }
        debug.compareArrays(newShoot, expectedNewShoot, toNum = true);
        debug.compareArrays(initShoot, expectedInitShoot, toNum = true);
    });

    it('test evolvePlayer at zero potential', async () => {
        playerSkills = await assets.encodePlayerSkills(
            skills = [100, 100, 100, 100, 100], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 0,
            playerId = 2132321,
            [potential = 0, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 16;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPs = 20;
        TPperSkill = [10, 20, 30, 40, 50];
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime).should.be.fulfilled;
        expected = [110,120,130,140,150]; // at zero potential, it's easy
        results = []
        for (sk = 0; sk < N_SKILLS; sk++) {
            result = await engine.getSkill(newSkills, sk).should.be.fulfilled;
            results.push(result);
        }
        debug.compareArrays(results, expected, toNum = true);
    });
    
    it('test evolvePlayer with TPs= 0', async () => {
        playerSkills = await assets.encodePlayerSkills(
            skills = [12, 13, 155, 242, 32], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 0,
            playerId = 2132321,
            [potential = 6, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 16;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPperSkill = [0, 0, 0, 0, 00];
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime).should.be.fulfilled;
        result = await engine.getSkill(newSkills, SK_SHO).should.be.fulfilled;
        expected = skills;
        results = []
        for (sk = 0; sk < N_SKILLS; sk++) {
            result = await engine.getSkill(newSkills, sk).should.be.fulfilled;
            results.push(result);
        }
        debug.compareArrays(results, expected, toNum = true);
    });
    
    
    it('test evolvePlayer at non-zero potential', async () => {
        playerSkills = await assets.encodePlayerSkills(
            skills = [100, 100, 100, 100, 100], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 0,
            playerId = 2132321,
            [potential = 1, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 16;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPperSkill = [10, 20, 30, 40, 50];
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime).should.be.fulfilled;
        result = await engine.getSkill(newSkills, SK_SHO).should.be.fulfilled;
        expected = [ 113, 126, 140, 153, 166 ];
        results = []
        for (sk = 0; sk < N_SKILLS; sk++) {
            result = await engine.getSkill(newSkills, sk).should.be.fulfilled;
            results.push(result);
        }
        debug.compareArrays(results, expected, toNum = true);


        expectedSumSkills = expected.reduce((a, b) => a + b, 0);
        result = await engine.getSumOfSkills(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(expectedSumSkills);
    });

    it('test evolvePlayer at non-zero potential and age', async () => {
        playerSkills = await assets.encodePlayerSkills(
            skills = [100, 100, 100, 100, 100], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 0,
            playerId = 2132321,
            [potential = 2, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 17;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPperSkill = [10, 20, 30, 40, 50];
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime).should.be.fulfilled;
        result = await engine.getSkill(newSkills, SK_SHO).should.be.fulfilled;
        expected = [121, 143, 165, 186, 208];
        results = []
        for (sk = 0; sk < N_SKILLS; sk++) {
            result = await engine.getSkill(newSkills, sk).should.be.fulfilled;
            results.push(result);
        }
        debug.compareArrays(results, expected, toNum = true);

        
        expectedSumSkills = expected.reduce((a, b) => a + b, 0);
        result = await engine.getSumOfSkills(newSkills).should.be.fulfilled;
        result.toNumber().should.be.equal(expectedSumSkills);
    });

    it('test evolvePlayer with old age', async () => {
        playerSkills = await assets.encodePlayerSkills(
            skills = [1000, 2000, 3000, 4000, 5000], 
            dayOfBirth = 30*365, // 30 years after unix time 
            gen = 0,
            playerId = 2132321,
            [potential = 2, forwardness, leftishness, aggr = 0],
            alignedEndOfLastHalf = true,
            redCardLastGame = false,
            gamesNonStopping = 0,
            injuryWeeksLeft = 0,
            subLastHalf,
            sumSkills = 5
        ).should.be.fulfilled;
        age = 35;
        matchStartTime = dayOfBirth*24*3600 + Math.floor(age*365*24*3600/INGAMETIME_VS_REALTIME);
        
        TPperSkill = [0, 0, 0, 0, 0];
        newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime).should.be.fulfilled;
        expected = [995, 1995, 2995, 3995, 4995]; // -32 per game
        results = []
        for (sk = 0; sk < N_SKILLS; sk++) {
            result = await engine.getSkill(newSkills, sk).should.be.fulfilled;
            results.push(result);
        }
        debug.compareArrays(results, expected, toNum = true);
    });

    it('test evolvePlayer formula at various points', async () => {
        TPperSkill = Array.from(new Array(5), (x,i) => 100);
        matchStartTime = 982121142;
        potential = 0;
        dayOfBirth = 30*365;
        // syntax: test = [potential, starttime, deltaExpected]
        tests = [
            [0, 982121142, 100],
            [0, 1011404571, 100],
            [0, 1020414857, 97],
            [0, 1027172571, 4],
            [5, 982121142, 666],
            [5, 1011404571, 100],
            [5, 1020414857, 97],
            [5, 1027172571, 4],
            [9, 982121142, 1200],
            [9, 1011404571, 550],
            [9, 1020414857, 347],
            [9, 1027172571, 104]
        ];
        for (t = 0; t < tests.length; t++) {
            playerSkills = await createPlayerFromBirthAndPotential(assets, dayOfBirth, pot = tests[t][0]);
            newSkills = await training.evolvePlayer(playerSkills, TPperSkill, matchStartTime = tests[t][1]).should.be.fulfilled;
            newSkill = await engine.getSkill(newSkills, 0).should.be.fulfilled;
            delta = newSkill.toNumber() - 1000;
            assert.equal(Math.abs(delta - tests[t][2]) < 2, true, "training points not as expected")
        }
    });
    
    
    it('test that we can play a 1st half with log = assignedTPs = 0', async () => {
        TP = 0;
        assignment = 0
        prev2ndHalfLog = 0;
        teamIds = [1,2]
        verseSeed = '0x234ab3'
        await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tactics0, tactics1], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;

        prev2ndHalfLog = await evo.addTrainingPoints(0, TP = 2).should.be.fulfilled;
        await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tactics0, tactics1], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
    });

    it('test that bots do not evolve, and have the correct half-time, end-of-match values', async () => {
        const [TP, TPperSkill] = getDefaultTPs();
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
        // Should be rejected if we earned 0 TPs in previous match, and now we claim 200 in the assignedTPs:
        prev2ndHalfLog = 0;
        teamIds = [1,2]
        verseSeed = '0x234ab3'
        
        truLineUpForBots = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 25, 25, 25];
        // even if we use weird lineups and subst, we'll see that for bots, only truLineUpForBots matters
        lineUpNew = [...lineupConsecutive];
        lineUpNew[0] = 16;
        subst = [6, 10, 0] // this will be disregarded
        tacticsNew = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineUpNew, subst), 
        extraAttackNull, tacticId433).should.be.fulfilled;
        
        prev2ndHalfLog = await evo.addTrainingPoints(0, TP).should.be.fulfilled;
        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotH = true, isBotA = true], [assignment, assignment]
        ).should.be.fulfilled;

        // show that after applying, the bots have not evolved
        sumBeforeEvolving = await evo.getSumOfSkills(teamStateAll50Half1[0]).should.be.fulfilled;
        sumBeforeEvolving.toNumber().should.be.equal(250);
        expectedSums = Array.from(new Array(25), (x,i) => 250);
        sumSkills0 = []  // sum of skills of each player for team 0
        sumSkills1 = []  // sum of skills of each player for team 1
        for (p = 0; p < 25; p++) {
            sum = await evo.getSumOfSkills(skills[0][p]).should.be.fulfilled;
            sumSkills0.push(sum)
            sum = await evo.getSumOfSkills(skills[1][p]).should.be.fulfilled;
            sumSkills1.push(sum)
        }
        debug.compareArrays(sumSkills0, expectedSums, toNum = true, isBigNumber = false);
        debug.compareArrays(sumSkills1, expectedSums, toNum = true, isBigNumber = false);

        for (team = 0; team < 2; team++) {
            for (p = 0; p < 25; p++) {
                endedHalf = await evo.getAlignedEndOfFirstHalf(skills[team][p]).should.be.fulfilled;
                wasSubst = await evo.getSubstitutedFirstHalf(skills[team][p]).should.be.fulfilled;
                wasSubst.should.be.equal(false);
                wasInLineUp = truLineUpForBots.includes(p);
                endedHalf.should.be.equal(wasInLineUp);
            }
        }
    });
    

    it('test cancelling 1st half does what it should', async () => {
        const [TP, TPperSkill] = getDefaultTPs();
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
        // Should be rejected if we earned 0 TPs in previous match, and now we claim 200 in the assignedTPs:
        prev2ndHalfLog = 0;
        teamIds = [1,2]
        verseSeed = '0x234ab3'
        
        lineUpNew = [...lineupConsecutive];
        lineUpNew[0] = 16;
        subst = [6, 10, 0]
        tacticsNew = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineUpNew, subst), 
        extraAttackNull, tacticId433).should.be.fulfilled;
        
        // We will add players with non-null gamesNonStopping, RedCardsLastGame, and Injury weeks
        // They should all be reset when a 1st half is cancelled, except for injury weeks left, which is only updates in 2nd half.
        teamState = [...teamStateAll50Half1];
        teamState[0] = await evo.setGamesNonStopping(teamState[0], 3).should.be.fulfilled; 
        teamState[1] = await evo.setRedCardLastGame(teamState[0], true).should.be.fulfilled; 
        teamState[2] = await evo.setInjuryWeeksLeft(teamState[0], 5).should.be.fulfilled; 

        assert.equal(false, await evo.getIsCancelled(prev2ndHalfLog));

        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamState, teamState], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
        
        err.toNumber().should.be.equal(Err.ERR_TRAINING_PREVMATCH);

        assert.equal(true, await evo.getIsCancelled(matchLogsAndEvents[0]));
        assert.equal(true, await evo.getIsCancelled(matchLogsAndEvents[1]));

        // everything is reset, except for injury weeks left:
        for (teamSkills of skills) {
            for (skill of teamSkills) {
                assert.equal(false, await assets.getAlignedEndOfFirstHalf(skill));
                assert.equal(false, await assets.getSubstitutedFirstHalf(skill));
                assert.equal(false, await assets.getOutOfGameFirstHalf(skill));
                assert.equal(false, await assets.getYellowCardFirstHalf(skill));
                assert.equal(false, await assets.getRedCardLastGame(skill));
                assert.equal(0, Number(await assets.getGamesNonStopping(skill)));
            }
        }
        assert.equal(5, Number(await assets.getInjuryWeeksLeft(skills[team=0][2])));
        assert.equal(5, Number(await assets.getInjuryWeeksLeft(skills[team=1][2])));

        // The winner is still not set (it is only at the end of 2nd half)
        assert.equal(0, Number(await evo.getWinner(matchLogsAndEvents[0])));
        assert.equal(0, Number(await evo.getWinner(matchLogsAndEvents[1])));
        // check that the result is a valid 0-0, with no events
        assert.equal(0, Number(await evo.getNGoals(matchLogsAndEvents[0])));
        assert.equal(0, Number(await evo.getNGoals(matchLogsAndEvents[1])));
        for (event = 2; event < matchLogsAndEvents.length; event++) {
            assert.equal(0, matchLogsAndEvents[event]);
        }
    });

    it('test that we can play a 1st half and include apply training points too', async () => {
        const [TP, TPperSkill] = getDefaultTPs();
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
        // Should be rejected if we earned 0 TPs in previous match, and now we claim 200 in the assignedTPs:
        prev2ndHalfLog = 0;
        teamIds = [1,2]
        verseSeed = '0x234ab3'
        
        lineUpNew = [...lineupConsecutive];
        lineUpNew[0] = 16;
        subst = [6, 10, 0]
        tacticsNew = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineUpNew, subst), 
        extraAttackNull, tacticId433).should.be.fulfilled;
        
        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
        
        err.toNumber().should.be.equal(Err.ERR_TRAINING_PREVMATCH)
        
        prev2ndHalfLog = await evo.addTrainingPoints(0, TP).should.be.fulfilled;
        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
        
        // // check that after 1st half, we do not have a winner
        // result = await encodeLog.getWinner(matchLogsAndEvents[0]).should.be.fulfilled;
        // result.toNumber().should.be.equal(0);

        // show that after applying the training points (before the match), the teams evolved from 250 per player to 549
        sumBeforeEvolving = await evo.getSumOfSkills(teamStateAll50Half1[0]).should.be.fulfilled;
        sumBeforeEvolving.toNumber().should.be.equal(250);
        expectedSums = Array.from(new Array(25), (x,i) => 549);
        sumSkills0 = []  // sum of skills of each player for team 0
        sumSkills1 = []  // sum of skills of each player for team 1
        for (p = 0; p < 25; p++) {
            sum = await evo.getSumOfSkills(skills[0][p]).should.be.fulfilled;
            sumSkills0.push(sum)
            sum = await evo.getSumOfSkills(skills[1][p]).should.be.fulfilled;
            sumSkills1.push(sum)
        }
        debug.compareArrays(sumSkills0, expectedSums, toNum = true, isBigNumber = false);
        debug.compareArrays(sumSkills1, expectedSums, toNum = true, isBigNumber = false);

        // check that the game is played, ends up in 2-2, and that there are no TPs assigned (this is 1st half)
        expectedGoals = [2, 2];
        expectedPoints = [0, 0];
        goals = []
        points = []
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals);
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints);
        }
        debug.compareArrays(goals, expectedGoals, toNum = true, isBigNumber = false);
        debug.compareArrays(points, expectedPoints, toNum = true, isBigNumber = false);
        // check that the events are generated, and match whatever we got once.
        expected = [ 1, 1, 8, 1, 8, 1, 1, 7, 1, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 6, 0, 1, 9, 1, 9 ];
        debug.compareArrays(matchLogsAndEvents.slice(2), expected, toNum = true, isBigNumber = false);

        // check that all 3 substitutions took place
        for (pos = 0; pos < 3; pos++) {
            result = await evo.getInGameSubsHappened(matchLogsAndEvents[0], pos, is2nd = false);
            result.toNumber().should.be.equal(1);
        }
        
        // check that we set the "aligned" properties properly
        // there where 3 changes in total, so was in LineUp includes the three changes
        // recall:   lineUpNew[0] = 16;  subst = [6, 10, 0]
        // So, using lineUp idx:    6 -> 11, 10 -> 12, 0 -> 13
        // Using shirtNum:          6 -> 11, 10 -> 12, 16 -> 13
        shirtNumSubst = Array.from(subst, (subst,i) => lineUpNew[subst]); 
        for (team = 0; team < 2; team++) {
            for (p = 0; p < 25; p++) {
                endedHalf = await evo.getAlignedEndOfFirstHalf(skills[team][p]).should.be.fulfilled;
                wasSubst = await evo.getSubstitutedFirstHalf(skills[team][p]).should.be.fulfilled;
                wasInLineUp = lineUpNew.includes(p);
                wasSubst = shirtNumSubst.includes(p);
                if (wasInLineUp && !wasSubst) {
                    endedHalf.should.be.equal(true);
                    wasSubst.should.be.equal(false);
                }
                if (wasInLineUp && wasSubst) {
                    endedHalf.should.be.equal(false);
                    wasSubst.should.be.equal(true);
                }
                if (!wasInLineUp) {
                    endedHalf.should.be.equal(false);
                    wasSubst.should.be.equal(false);
                }
            }
        }
    });
    
    it('test that we can play a first half with totally null players, and that they do not evolve', async () => {
        teamIds = [0, 0]
        verseSeed = '0x234ab3'
        emptyTeam = Array.from(new Array(25), (x,i) => 0); 
        assignment = 0;
        const {0: skills, 1: matchLogsAndEvents} = await play.play1stHalfAndEvolve(
            verseSeed, now, [emptyTeam, emptyTeam], teamIds, [tactics0, tactics1], [0, 0], 
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
        
        expectedGoals = [0, 0];
        expectedPoints = [0, 0];
        goals = []
        points = []
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals);
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints);
        }
        debug.compareArrays(goals, expectedGoals, toNum = true, isBigNumber = false);
        debug.compareArrays(points, expectedPoints, toNum = true, isBigNumber = false);
        debug.compareArrays(skills[0], emptyTeam, toNum = true, isBigNumber = false);
        debug.compareArrays(skills[1], emptyTeam, toNum = true, isBigNumber = false);
    });
        
    it('test that if 1st half is cancelled, then 2nd half is cancelled properly', async () => {
        // play half 2 works:
        teamState = [...teamStateAll50Half2];
        verseSeed = '0x234ab3';
        teamIds = [1,2];
        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play2ndHalfAndEvolve(
            verseSeed, now, [teamState, teamState], teamIds, [tactics1NoChanges, tactics1NoChanges], [0,0], 
            [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]
        ).should.be.fulfilled;
        err.toNumber().should.be.equal(0);

        // play half 2 with exactly the same params fails because 1st half was cancelled:
        log = await evo.setIsCancelled(0, true);    
        assert.equal(true, await evo.getIsCancelled(log));

        var {0: skills, 1: matchLogsAndEvents, 2: err} = await play.play2ndHalfAndEvolve(
            verseSeed, now, [teamState, teamState], teamIds, [tactics1NoChanges, tactics1NoChanges], [log, log], 
            [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]
        ).should.be.fulfilled;

        err.toNumber().should.be.equal(Err.ERR_2NDHALF_CANCELLED_DUE_TO_1STHALF_CANCELLED);
        // everything is reset, except for injury weeks left:
        for (teamSkills of skills) {
            for (skill of teamSkills) {
                assert.equal(false, await assets.getAlignedEndOfFirstHalf(skill));
                assert.equal(false, await assets.getSubstitutedFirstHalf(skill));
                assert.equal(false, await assets.getOutOfGameFirstHalf(skill));
                assert.equal(false, await assets.getYellowCardFirstHalf(skill));
                assert.equal(false, await assets.getRedCardLastGame(skill));
                assert.equal(0, Number(await assets.getGamesNonStopping(skill)));
                assert.equal(0, Number(await assets.getInjuryWeeksLeft(skill)));
            }
        }
        // check that the result is a valid 0-0, with no events
        DRAW = 2;
        assert.equal(DRAW, Number(await evo.getWinner(matchLogsAndEvents[0])));
        assert.equal(DRAW, Number(await evo.getWinner(matchLogsAndEvents[1])));
        assert.equal(0, Number(await evo.getNGoals(matchLogsAndEvents[0])));
        assert.equal(0, Number(await evo.getNGoals(matchLogsAndEvents[1])));
        for (event = 2; event < matchLogsAndEvents.length; event++) {
            assert.equal(0, matchLogsAndEvents[event]);
        }
    });
    
    it('test that we can play a 2nd half, include the training points, and check gamesNonStopping', async () => {
        const [TP, TPperSkill] = getDefaultTPs();
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
        teamIds = [1,2]
        verseSeed = '0x234ab3'
        prev2ndHalfLog = await evo.addTrainingPoints(0, TP).should.be.fulfilled;

        // FIRST half:
        // add one player who will go from 6 to 7, one that will remain at 7, and two that will reset, since they were not linedUp
        teamStateAll50Half1[0] = await evo.setGamesNonStopping(teamStateAll50Half1[0], 6).should.be.fulfilled;
        teamStateAll50Half1[1] = await evo.setGamesNonStopping(teamStateAll50Half1[1], 7).should.be.fulfilled;
        teamStateAll50Half1[22] = await evo.setGamesNonStopping(teamStateAll50Half1[1], 7).should.be.fulfilled;
        teamStateAll50Half1[23] = await evo.setGamesNonStopping(teamStateAll50Half1[1], 1).should.be.fulfilled;

        // for team1, besides the previous, plan only the 1st of the substitutions
        subst = [...substitutions]; // = [6, 10, 0]
        subst[1] = NO_SUBST;
        subst[2] = NO_SUBST;
        tacticsNew = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineupConsecutive, subst), 
        extraAttackNull, tacticId433).should.be.fulfilled;

        // play the 1st half:
        const {0: skills0, 1: matchLogsAndEvents0} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tactics0, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
        
        var {0: nPenalties, 1: nPenaltiesFailed, 2: shooters} = getPenaltyData(matchLogsAndEvents0);
        nPenalties.should.be.equal(0);
        nPenaltiesFailed.should.be.equal(0);

        goals = []
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents0[team]);
            goals.push(nGoals);
        }
        debug.compareArrays(goals, [2,2], toNum = true, isBigNumber = false);

        // first: check correct properties for team1:
            // recall:   lineUp = consecutive,  subst = [6, NO_SUBST, NO_SUBST]
            // So, using lineUp idx, the sust was::     6 -> 11, 
            // Same as using shirtNum:                  6 -> 11,
        for (p=0; p<25; p++){ 
            result = await engine.getAlignedEndOfFirstHalf(skills0[1][p]).should.be.fulfilled;
            if ((p < 12) && (p!= 6)) result.should.be.equal(true);
            else result.should.be.equal(false);
        }

        // do 1 change at half time for team1, that still had 2 remaining changes.
        lineUpNew = [...lineupConsecutive];
        lineUpNew[3] = 16;
        tactics1NoChangesNew = await engine.encodeTactics(noSubstitutions, subsRounds, setNoSubstInLineUp(lineUpNew, noSubstitutions), 
            extraAttackNull, tacticId433).should.be.fulfilled;
            
        // play half 2:
        const {0: skills, 1: matchLogsAndEvents} = await play.play2ndHalfAndEvolve(
            verseSeed, now, skills0, teamIds, [tactics1NoChanges, tactics1NoChangesNew], matchLogsAndEvents0.slice(0,2), 
            [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]
        ).should.be.fulfilled;

        var {0: nPenalties, 1: nPenaltiesFailed, 2: shooters} = getPenaltyData(matchLogsAndEvents);
        nPenalties.should.be.equal(1);
        nPenaltiesFailed.should.be.equal(0);


        // the result in the 2nd half is biased because team 1 had an injury and a red card over the game! 
        result = await training.getOutOfGameType(matchLogsAndEvents[0], is2 = false).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        result = await training.getOutOfGameType(matchLogsAndEvents[0], is2 = true).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        result = await training.getOutOfGameType(matchLogsAndEvents[1], is2 = false).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        result = await training.getOutOfGameType(matchLogsAndEvents[1], is2 = true).should.be.fulfilled;
        result.toNumber().should.be.equal(3);
        
        // check that we find the correct halfTimeSubs in the matchLog.
        // note that what is stored is: lineUp[p] + 1 = 17
        expectedHalfTimeSubs = [17,0,0];
        halfTimeSubs = []
        for (pos = 0; pos < 3; pos ++) {
            result = await evo.getHalfTimeSubs(matchLogsAndEvents[1], pos).should.be.fulfilled;
            halfTimeSubs.push(result);
        }
        debug.compareArrays(halfTimeSubs, expectedHalfTimeSubs, toNum = true, isBigNumber = false);

        // check Training Points (and Goals)
        expectedGoals = [5, 4];
        expectedPoints = [51, 17];
        goals = []
        points = []
        for (team = 0; team < 2; team++) {
            nGoals = await encodeLog.getNGoals(matchLogsAndEvents[team]);
            goals.push(nGoals);
            nPoints = await encodeLog.getTrainingPoints(matchLogsAndEvents[team]).should.be.fulfilled;
            points.push(nPoints);
        }
        debug.compareArrays(goals, expectedGoals, toNum = true, isBigNumber = false);
        debug.compareArrays(points, expectedPoints, toNum = true, isBigNumber = false);

        // test that the states did not change the intrinsics of the players:
        sumBeforeEvolving = await evo.getSumOfSkills(skills0[0][2]).should.be.fulfilled;
        sumBeforeEvolving.toNumber().should.be.equal(549);
        expectedSums = Array.from(new Array(25), (x,i) => 549);
        sumSkills0 = []  // sum of skills of each player for team 0
        sumSkills1 = []  // sum of skills of each player for team 1
        for (p = 0; p < 25; p++) {
            sum = await evo.getSumOfSkills(skills[0][p]).should.be.fulfilled;
            sumSkills0.push(sum)
            sum = await evo.getSumOfSkills(skills[1][p]).should.be.fulfilled;
            sumSkills1.push(sum)
        }
        debug.compareArrays(sumSkills0, expectedSums, toNum = true, isBigNumber = false);
        debug.compareArrays(sumSkills1, expectedSums, toNum = true, isBigNumber = false);

        // check that we correctly reset the "played game" and gamesNonStopping properties
        // team0 went through subst: [6, 10, 0], so 6 -> 11, 10 -> 12, 0 -> 13
        // team1 went through subst: [6], so 6 -> 11
        // so we expect that team0 has [0,..13] increasing gamesNonStopping
        // so we expect that team1 has [0,..11] increasing gamesNonStopping
        expectedGamesNonStopping = Array.from(new Array(25), (x,i) => 0);
        for (p=0; p < 14; p++) expectedGamesNonStopping[p] = 1;
        expectedGamesNonStopping[0] = 7;    // 6 -> 7
        expectedGamesNonStopping[1] = 7;    // 7 -> 7
        expectedGamesNonStopping[22] = 0;   // 6 -> 0
        expectedGamesNonStopping[23] = 0;   // 1 -> 0
        expected = [];
        expected.push([...expectedGamesNonStopping]);
        expected[0][23] = 0;
        // team1 particular cases:
        expectedGamesNonStopping[12] = 0;   // subst was not planned for team1
        expectedGamesNonStopping[13] = 0;   // subst was not planned for team1
        expectedGamesNonStopping[16] = 1;   // he joined at half time for team1
        expected.push([...expectedGamesNonStopping]);
        
        for (team = 0; team < 2; team++) {
            nonStoppingGames = [];
            for (p = 0; p < 25; p++) {
                endedHalf = await evo.getAlignedEndOfFirstHalf(skills[team][p]).should.be.fulfilled;
                wasSubst = await evo.getSubstitutedFirstHalf(skills[team][p]).should.be.fulfilled;
                nGamesNonStopping = await evo.getGamesNonStopping(skills[team][p]).should.be.fulfilled;
                endedHalf.should.be.equal(false);
                wasSubst.should.be.equal(false);
                nonStoppingGames.push(nGamesNonStopping);
            }
            debug.compareArrays(nonStoppingGames, expected[team], toNum = true, isBigNumber = false);
        }
    });
    
    
    it('test check gamesNonStopping', async () => {
        const [TP, TPperSkill] = getDefaultTPs();
        assignment = await training.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
        teamIds = [1,2]
        verseSeed = '0x234ab3'
        prev2ndHalfLog = await evo.addTrainingPoints(0, TP).should.be.fulfilled;

        // FIRST half:
        // add one player who will go from 6 to 7, one that will remain at 7, and two that will reset, since they were not linedUp
        teamStateAll50Half1[0] = await evo.setGamesNonStopping(teamStateAll50Half1[0], 6).should.be.fulfilled;
        teamStateAll50Half1[1] = await evo.setGamesNonStopping(teamStateAll50Half1[1], 6).should.be.fulfilled;
        teamStateAll50Half1[2] = await evo.setGamesNonStopping(teamStateAll50Half1[2], 6).should.be.fulfilled;

        // for team1, besides the previous, plan only the 1st of the substitutions
        subst = [NO_SUBST, NO_SUBST, NO_SUBST];
        thisLineUp = [...lineupConsecutive];
        thisLineUp[0] = 15;
        thisLineUp[1] = 16;
        
        tacticsNew = await engine.encodeTactics(
            subst, subsRounds, setNoSubstInLineUp(thisLineUp, subst), extraAttackNull, tacticId433
        ).should.be.fulfilled;

        // play the 1st half:
        const {0: skills0, 1: matchLogsAndEvents0} = await play.play1stHalfAndEvolve(
            verseSeed, now, [teamStateAll50Half1, teamStateAll50Half1], teamIds, [tacticsNew, tacticsNew], [prev2ndHalfLog, prev2ndHalfLog],
            [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway], [assignment, assignment]
        ).should.be.fulfilled;
        
        // play half 2:
        const {0: skills, 1: matchLogsAndEvents} = await play.play2ndHalfAndEvolve(
            verseSeed, now, skills0, teamIds, [tacticsNew, tacticsNew], matchLogsAndEvents0.slice(0,2), 
            [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]
        ).should.be.fulfilled;

        expectedGamesNonStopping = Array.from(new Array(25), (x,i) => 0);
        for (p=0; p < 11; p++) expectedGamesNonStopping[p] = 1;
        expectedGamesNonStopping[0] = 0;
        expectedGamesNonStopping[1] = 0; 
        expectedGamesNonStopping[2] = 7; 
        expectedGamesNonStopping[15] = 1;
        expectedGamesNonStopping[16] = 1; 
        
        nonStoppingGames = [];
        for (p = 0; p < 25; p++) {
            nGamesNonStopping = await evo.getGamesNonStopping(skills[0][p]).should.be.fulfilled;
            nonStoppingGames.push(nGamesNonStopping);
        }
        debug.compareArrays(nonStoppingGames, expectedGamesNonStopping, toNum = true, isBigNumber = false);
    });

    it('training points with random inputs', async () => {
        typeOut = [3, 0];
        outRounds = [7, 0];
        outGames = [9, 14]
        yellows1 = [14, 0]
        yellows2 = [0, 0]
        defs1 = 4; 
        defs2 = 0; 
        numTot1 = 10; 
        numTot2 = 10; 
        win = 0; 
        isHome = true;
        
        log0 = await logUtils.encodeLog(encodeLog, nGoals = 3, assistersIdx, shootersIdx, shooterForwardPos, penalties,
            outGames, outRounds, typeOut, 
            isHome, ingameSubs1, ingameSubs2, yellows1, yellows2, 
            halfTimeSubstitutions, defs1, defs2, numTot1, numTot2,  win, teamSumSkillsDefault, trainingPointsInit);

        logFinal = await training.computeTrainingPoints(log0, log0)
        expected = [36, 25];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });

    it('training points cannot go below min points per playing', async () => {
        // the visitor team scores lots of goals, and home team sees red cards
        typeOut = [3, 0];
        outRounds = [7, 0];
        outGames = [9, 14]
        yellows1 = [2, 4]
        yellows2 = [3, 5]
        numTot1 = 10; 
        numTot2 = 10; 
        win = 0; 
        isHome = true;
        
        log0 = await logUtils.encodeLog(encodeLog, nGoals = 0, assistersIdx, shootersIdx, shooterForwardPos, penalties,
            outGames, outRounds, typeOut, 
            isHome, ingameSubs1, ingameSubs2, yellows1, yellows2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, numTot1, numTot2,  win, teamSumSkillsDefault, trainingPointsInit);

        log1 = await logUtils.encodeLog(encodeLog, nGoals = 12, assistersIdx, shootersIdx, shooterForwardPos, penalties,
            outGames, outRounds, typeOut, 
            isHome, ingameSubs1, ingameSubs2, yellows1, yellows2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, numTot1, numTot2,  win, teamSumSkillsDefault, trainingPointsInit);
    
        logFinal = await training.computeTrainingPoints(log0, log1)
        POINTS_FOR_HAVING_PLAYED = 10 
        expected = [POINTS_FOR_HAVING_PLAYED, 138];
        points = [];
        for (team = 0; team < 2; team++) {
            point = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.push(point);
        }
        debug.compareArrays(points, expected, toNum = true, isBigNumber = false);
    });

    
    it('training points with no goals nor anything else', async () => {
        log0 = await logUtils.encodeLog(encodeLog, nGoals = 0, assistersIdx, shootersIdx, shooterForwardPos, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkillsDefault, trainingPointsInit);
        
        logFinal = await training.computeTrainingPoints(log0, log0)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + cleanSheet(24+8) = 42
        expected = [42, 42];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });    

    it('training points with many goals by attackers', async () => {
        goals = 5;
        ass     = Array.from(new Array(goals), (x,i) => 10);
        shoot   = Array.from(new Array(goals), (x,i) => 10);
        fwd     = Array.from(new Array(goals), (x,i) => 3);
        
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkillsDefault, trainingPointsInit);
        
        logFinal = await training.computeTrainingPoints(log0, log0)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + GOALS_BY_ATTACKERS(4 * 5) - GOALS_OPPONENT(5)  
        expected = [25, 25];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });    

    it('training points with many goals by mids', async () => {
        goals = 5;
        ass     = Array.from(new Array(goals), (x,i) => 6);
        shoot   = Array.from(new Array(goals), (x,i) => 6);
        fwd     = Array.from(new Array(goals), (x,i) => 2);
        
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkillsDefault, trainingPointsInit);
        
        logFinal = await training.computeTrainingPoints(log0, log0)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + GOALS_BY_MIDS(5 * 5) - GOALS_OPPONENT(5)  
        expected = [30, 30];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });    

    it('training points with many goals by defs with assists', async () => {
        goals = 5;
        ass     = Array.from(new Array(goals), (x,i) => 6);
        shoot   = Array.from(new Array(goals), (x,i) => 2);
        fwd     = Array.from(new Array(goals), (x,i) => 1);
        
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkillsDefault, trainingPointsInit);
        
        logFinal = await training.computeTrainingPoints(log0, log0)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + GOALS_BY_DEFS(4 * 5) + ASSISTS(3*5) - GOALS_OPPONENT(5)  
        expected = [50, 50];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });    

    it('training points with many goals with a winner at home', async () => {
        win = 0;
        isHome = true;

        goals = 5;
        ass     = Array.from(new Array(goals), (x,i) => 10);
        shoot   = Array.from(new Array(goals), (x,i) => 10);
        fwd     = Array.from(new Array(goals), (x,i) => 3);
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHome, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, win, teamSumSkillsDefault, trainingPointsInit);

        goals = 4;
        ass     = Array.from(new Array(goals), (x,i) => 10);
        shoot   = Array.from(new Array(goals), (x,i) => 10);
        fwd     = Array.from(new Array(goals), (x,i) => 3);
        log1 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHome, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, win, teamSumSkillsDefault, trainingPointsInit);
            
        logFinal = await training.computeTrainingPoints(log0, log1)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + WIN_AT_HOME(11) + GOALS_BY_ATTACKERS(4 * 5) - GOALS_OPPONENT(4)  
        // expect: POINTS_FOR_HAVING_PLAYED(10) + GOALS_BY_ATTACKERS(4 * 4) - GOALS_OPPONENT(5)  
        expected = [37, 21];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });    

    it('training points with many goals with a winner away', async () => {
        win = 1;
        isHome = true;

        goals = 5;
        ass     = Array.from(new Array(goals), (x,i) => 10);
        shoot   = Array.from(new Array(goals), (x,i) => 10);
        fwd     = Array.from(new Array(goals), (x,i) => 3);
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHome, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, win, teamSumSkillsDefault, trainingPointsInit);

        goals = 6;
        ass     = Array.from(new Array(goals), (x,i) => 10);
        shoot   = Array.from(new Array(goals), (x,i) => 10);
        fwd     = Array.from(new Array(goals), (x,i) => 3);
        log1 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHome, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, win, teamSumSkillsDefault, trainingPointsInit);
            
        logFinal = await training.computeTrainingPoints(log0, log1)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + GOALS_BY_ATTACKERS(4 * 5) - GOALS_OPPONENT(6)  
        // expect: POINTS_FOR_HAVING_PLAYED(10) + WIN_AWAY(22) + GOALS_BY_ATTACKERS(4 * 6) - GOALS_OPPONENT(5)  
        expected = [24, 51];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });    
    
    it('training points with no goals but cards', async () => {
        outGames    = [4, 6];
        types       = [RED_CARD, RED_CARD];
        yellows1    = [3, 7];
        yellows2    = [1, 2];
        
        log0 = await logUtils.encodeLog(encodeLog, nGoals = 0, assistersIdx, shootersIdx, shooterForwardPos, penalties,
            outGames, outOfGameRounds, types, 
            isHomeSt, ingameSubs1, ingameSubs2, yellows1, yellows2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkillsDefault, trainingPointsInit);
        
        logFinal = await training.computeTrainingPoints(log0, log0)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + cleanSheet(23+8) - REDS(3*2) - YELLOWS(4) 
        expected = [32, 32];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
    });    
    
    it('training points with many goals by attackers... and different teamSumSkills', async () => {
        // first get the resulting Traning points with teamSkills difference: [25, 25]
        goals = 5;
        ass     = Array.from(new Array(goals), (x,i) => 10);
        shoot   = Array.from(new Array(goals), (x,i) => 10);
        fwd     = Array.from(new Array(goals), (x,i) => 3);
        
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkillsDefault, trainingPointsInit);
        
        logFinal = await training.computeTrainingPoints(log0, log0)
        // expect: POINTS_FOR_HAVING_PLAYED(10) + GOALS_BY_ATTACKERS(4 * 5) - GOALS_OPPONENT(5)  
        expected = [25, 25];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }

        // second: get the resulting Traning points with teamSkills difference
        teamSumSkills = 1000;
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkills, trainingPointsInit);
        teamSumSkills = 2000;
        log1 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkills, trainingPointsInit);
            
        logFinal = await training.computeTrainingPoints(log0, log1)
        expected = [50, 12];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }
        // third: same as above but inverse
        teamSumSkills = 2000;
        log0 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkills, trainingPointsInit);
        teamSumSkills = 1000;
        log1 = await logUtils.encodeLog(encodeLog, goals, ass, shoot, fwd, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeSt, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot, nTot, winner, teamSumSkills, trainingPointsInit);
            
        logFinal = await training.computeTrainingPoints(log0, log1)
        expected = [12, 50];
        for (team = 0; team < 2; team++) {
            points = await encodeLog.getTrainingPoints(logFinal[team]).should.be.fulfilled;
            points.toNumber().should.be.equal(expected[team]);
        }

    });    
});