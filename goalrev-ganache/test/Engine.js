/*
 Tests for all functions in 
  Engine.sol, 
  EnginePreComp.sol, 
  EngineApplyBoosters.sol, 
  EngineLib.sol
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();
const truffleAssert = require('truffle-assertions');
const debug = require('../utils/debugUtils.js');
const logUtils = require('../utils/matchLogUtils.js');
const deployUtils = require('../utils/deployUtils.js');

const Utils = artifacts.require('Utils');
const Proxy = artifacts.require('Proxy');
const Engine = artifacts.require('Engine');
const Assets = artifacts.require('Assets');
const Market = artifacts.require('Market');
const Updates = artifacts.require('Updates');
const Challenges = artifacts.require('Challenges');
const EncodingMatchLog = artifacts.require('EncodingMatchLog');
const EnginePreComp = artifacts.require('EnginePreComp');
const EngineApplyBoosters = artifacts.require('EngineApplyBoosters');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');


const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const UpdatesBase = artifacts.require('UpdatesBase');

contract('Engine', (accounts) => {
    const Err = debug.getErrorCodes();
    const isBotHome = false;
    const isBotAway = false;
    const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
    const UNDEF = undefined;
    const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
    const substitutions = [6, 10, 0];
    const subsRounds = [3, 7, 1];
    const noSubstitutions = [11, 11, 11];
    const lineup0 = [0, 3, 4, 5, 6, 9, 10, 11, 12, 15, 16, 7, 13, 17];
    const lineup1 = [0, 3, 4, 5, 6, 9, 10, 11, 16, 17, 18, 7, 13, 17];
    const lineupConsecutive = Array.from(new Array(14), (x,i) => i); 
    const extraAttackNull =  Array.from(new Array(10), (x,i) => 0);
    const tacticId442 = 0; // 442
    const tacticId433 = 2; // 433
    const playersPerZone442 = [1,2,1,1,2,1,0,2,0];
    const playersPerZone433 = [1,2,1,1,1,1,1,1,1];
    const PLAYERS_PER_TEAM_MAX = 25;
    const firstHalfLog = [0, 0];
    const subLastHalf = false;
    const is2ndHalf = false;
    const isHomeStadium = false;
    const isPlayoff = false;
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
    const now = 1570147200; // this number has the property that 7*nowFake % (SECS_IN_DAY) = 0 and it is basically Oct 3, 2019
    const dayOfBirth21 = secsToDays(now) - 21*365/7; // = exactly 17078, no need to round
    const dayOfBirthOld = secsToDays(now) - Math.floor(37*365/7);
    const MAX_PENALTY = 10000;
    const DRAW = 2;
    const WINNER_HOME = 0;
    const WINNER_AWAY = 1;
    const teamSumSkillsDefault = 3256244;
    const MAX_GOALS_IN_HALF = 12;
    const it2 = async(text, f) => {};
    const trainingPointsDefault = 12;

    
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

    // extendend logs are arrays of the form [logTeam0, logTeam1, event0, event1, event2, ...]
    function extractMatchLogs(extendedLog) {
        return [extendedLog[0], extendedLog[1]]
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
        pSkills = await assets.encodePlayerSkills(forceSkills, dayOfBirth21,  gen = 0, playerId + p, [pot, fwd442[p], left442[p], aggr],
                alignedEndOfLastHalfTwoVec[1], redCardLastGame, gamesNonStopping, 
                injuryWeeksLeft, subLastHalf, sumSkills).should.be.fulfilled 
        for (p = 11; p < PLAYERS_PER_TEAM_MAX; p++) {
            teamState.push(pSkills)
        }        
        return teamState;
    };

    const createTeamStateFromSinglePlayer = async (skills, engine, forwardness = 3, leftishness = 2, alignedEndOfLastHalfTwoVec = [false, false], aggr = 0, withGK = false) => {
        teamState = []
        sumSkills = skills.reduce((a, b) => a + b, 0);
        var playerStateTemp = await assets.encodePlayerSkills(
            skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr],
            alignedEndOfLastHalfTwoVec[0], redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills
        ).should.be.fulfilled;
        for (player = 0; player < 11; player++) {
            teamState.push(playerStateTemp)
        }

        if (withGK) {
            var playerStateTemp = await assets.encodePlayerSkills(
                skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, fwd = 0, left = 0, aggr],
                alignedEndOfLastHalfTwoVec[0], redCardLastGame = false, gamesNonStopping = 0, 
                injuryWeeksLeft = 0, subLastHalf, sumSkills
            ).should.be.fulfilled;            
            teamState[0] = playerStateTemp;
        }

        playerStateTemp = await assets.encodePlayerSkills(
            skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr],
            alignedEndOfLastHalfTwoVec[1], redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills
        ).should.be.fulfilled;
        for (player = 11; player < PLAYERS_PER_TEAM_MAX; player++) {
            teamState.push(playerStateTemp)
        }



        return teamState;
    };

    beforeEach(async () => {
        encodingSet = await EncodingSkillsSetters.new().should.be.fulfilled;
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

        encodingLog = await EncodingMatchLog.new().should.be.fulfilled;
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
        MAX_GOALS_IN_MATCH = await engine.MAX_GOALS_IN_MATCH().should.be.fulfilled;
        MAX_GOALS_IN_MATCH = MAX_GOALS_IN_MATCH.toNumber();
        kMaxRndNumHalf = Math.floor(MAX_RND/2)-200; 
        events1Half = Array.from(new Array(7), (x,i) => 0);
        events1Half = [events1Half,events1Half];
    });

    it('check frequency of penalties', async () => {
        teamStateAll1000Half1 = await createTeamStateFromSinglePlayer(
            [1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false], agr = 2, withGK = true
        ).should.be.fulfilled;
        nMatches = 40;
        totPens = 0;
        totPensFailed = 0;
        totGoals = 0;
        tactics1GKonly = await engine.encodeTactics(noSubstitutions, subsRounds, setNoSubstInLineUp(lineup1, noSubstitutions), 
            extraAttackNull, tacticId442).should.be.fulfilled
        for (p = 0; p < nMatches; p++) {
            sed = web3.utils.toBN(web3.utils.keccak256(p.toString()));
            var {0: log, 1: err} = await engine.playHalfMatch(sed, now, [teamStateAll1000Half1, teamStateAll1000Half1], [tactics1GKonly, tactics1GKonly], [0, 0], [is2nd = false, isHomeStadium,  playoff = false, isBotHome, isBotAway]).should.be.fulfilled;
            (err.toNumber() == 0).should.be.equal(true);
            pens = 0;
            pensFailed = 0;
            goals = 0;
            shooters = [];
            for (e = 0; e < 12; e++) {
                if (100 == log[6+5*e].toNumber()) {
                    pens++;
                    if (0 == log[5+5*e].toNumber()) { pensFailed++; }
                    shooters.push(log[4+5*e].toNumber())
                }
                if (1 == log[5+5*e].toNumber()) goals++;
            }
            // console.log("pens: ", pens, "goals: ", goals, "pensFailed: ", pensFailed, "shooters: ", shooters);
            totPens += pens;
            totGoals += goals;
            totPensFailed += pensFailed;
        }
        penaltiesPerMatch = 2 * totPens/nMatches;
        penaltiesFailedFreq = totPensFailed/totPens;
        (Math.abs(penaltiesPerMatch - 0.4) < 0.03).should.be.equal(true);
        (Math.abs(penaltiesFailedFreq - 0.25) < 0.03).should.be.equal(true);
    });

    it('create 442 team', async () => {
        teamState = await createTeamState442(engine, forceSkills= [1000,1000,1000,1000,1000]).should.be.fulfilled;
        var result = JSON.stringify(teamState);
        var fs = require('fs');
        var expected;
        var expectedFile = 'test/testdata/team442.json'
        fs.readFile(expectedFile, 'utf8', function (err, data) {
            if (err) throw err;
            try {
                expected = JSON.stringify(JSON.parse(data));
                if (expected != result) {
                    console.log("team442 state! Please enable the next lines to overwrite hardcoded file");
                    // fs.writeFile(expectedFile, result, function(err) {
                    //     if (err) {
                    //         console.log(err);
                    //     }
                    // });
                }
            } catch (e) {
                console.error( e );
            }
        });
    });
    
    it('test apply boosters', async () => {
        tact = await applyBoosters.setItemId(tacticId442, itemId = 1).should.be.fulfilled;
        encodedBoost = await applyBoosters.encodeBoosts(boost = [10,15,20,25,30,1]).should.be.fulfilled;
        tact = await applyBoosters.setItemBoost(tact, encodedBoost).should.be.fulfilled;
        newSkills = await applyBoosters.applyItemBoost(teamStateAll50Half1, tact).should.be.fulfilled;
        initSkill = 50;
        for (p = 0; p < 5; p++) {
            for (sk = 0; sk < 5; sk++) {
                // shoot, speed, pass, defence, endurance
                playerSkills = await assets.getSkill(newSkills[p], sk).should.be.fulfilled;
                expected = Math.floor(initSkill * (boost[sk]+100)/100);
                playerSkills.toNumber().should.be.equal(expected);
            }
        }
    });
    
    it('wasPlayerAlignedEndOfLastHalf', async () => {
        for (p = 92; p < 92+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
            substis = [2, 4, 1];
            rounds = [4, 2, 6];
            
            // as seen in a test below, there is a red card for player 2 at round 3, so he cannot be substituted
            tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0).should.be.fulfilled;
            var {0: newLog, 1: err} = await engine.playHalfMatch(seedForRedCard, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics, tactics], [0, 0], [is2nd = false, isHomeStadium,  playoff = false, isBotHome, isBotAway]).should.be.fulfilled;

            verbose = false;
            if (verbose) {
                typeOf = await precomp.getOutOfGameType(newLog[0], is2nd = false).should.be.fulfilled;
                player = await precomp.getOutOfGamePlayer(newLog[0], is2nd = false).should.be.fulfilled;
                round = await precomp.getOutOfGameRound(newLog[0], is2nd = false).should.be.fulfilled;
                console.log(p, typeOf.toNumber(), player.toNumber(), round.toNumber());
            }
        }
        // checking that the red card is as described above:
        expectedOut = [2, 0];
        expectedOutRounds = [2, 0]; // note that this 1 would be 9 otherwise
        expectedYellows1 = [5, 13];
        expectedYellows2 = [0, 0];
        expectedType = [3, 0]; // 0 = no event, 2 = soft, 3 = redCard
        expectedInGameSubs1 = [2, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled

        await logUtils.checkExpectedLog(encodingLog, newLog[0], nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt = UNDEF, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF, nTot2 = UNDEF, winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);

        // check that the 2nd team does not have an identical set of injuries+redcards
        var {0: sumSkills0 , 1: winner0, 2: nGoals0, 3: TPs0, 4: outPlayer0, 5: typeOut0, 6: outRounds0, 7: yellow10, 8: yellow20, 9: subs10, 10: subs20, 11: subs30 } = await utils.fullDecodeMatchLog(newLog[0], is2nd = false).should.be.fulfilled;
        var {0: sumSkills1 , 1: winner1, 2: nGoals1, 3: TPs1, 4: outPlayer1, 5: typeOut1, 6: outRounds1, 7: yellow11, 8: yellow21, 9: subs11, 10: subs21, 11: subs31 } = await utils.fullDecodeMatchLog(newLog[1], is2nd = false).should.be.fulfilled;
        outPlayer0.should.not.be.bignumber.equal(outPlayer1);
        yellow20.should.not.be.bignumber.equal(yellow21);

        // for each event: 0: teamThatAttacks, 1: managesToShoot, 2: shooter, 3: isGoal, 4: assister
        expected = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 7, 1, 6, 1, 1, 5, 1, 7, 0, 1, 10, 1, 10, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        debug.compareArrays(newLog.slice(2), expected, toNum = true);
    });
    
    it('outOfGame and yellows are absent for Bots', async () => {
        seedForRedCard = seed + 83;
        substis = [2, 9, 1];
        rounds = [4, 2, 6];
        
        // as seen in a test below, there is a redCard for player 9 at round 1
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0).should.be.fulfilled;
        var {0: newLog, 1: err} = await engine.playHalfMatch(seedForRedCard, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics, tactics], [0, 0], [is2nd = false, isHomeStadium,  playoff = false, isBot = true, isBot = true]).should.be.fulfilled;
        
        expectedOut = [14, 0];
        expectedOutRounds = [0, 0]; 
        expectedYellows1 = [14, 14];
        expectedYellows2 = [0, 0];
        expectedType = [0, 0]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled

        await logUtils.checkExpectedLog(encodingLog, newLog[0], nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt = UNDEF, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF, nTot2 = UNDEF, winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
    });
    
    
    it('computeExceptionalEvents shows no goalies with redcards', async () => {
        // this choice of seed used to lead to a GK with redcard, now forbidden
        RED = 3;
        skills = [1000, 1000, 1000, 1000, 1000];
        sumSkills = skills.reduce((a, b) => a + b, 0);
        agressiveGK = await assets.encodePlayerSkills(
            skills, dayOfBirth21, gen = 0, playerId = 2132321, [potential = 3, forwardness, leftishness, aggr = 7],
            alignedEndOfLast = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeks = 0, subLast = false, sumSkills
        ).should.be.fulfilled;
        teamStateAll50Half1[0] = agressiveGK;
        for (t = 7; t <= 7; t++) {
            seedRed = web3.utils.toBN(web3.utils.keccak256(t.toString()));
            log = await precomp.computeExceptionalEvents(log0 = 0, teamStateAll50Half1, tactics442NoChanges, is2nd = false, isBotHome, seedRed).should.be.fulfilled;
            typeOf = await precomp.getOutOfGameType(log, is2nd = false).should.be.fulfilled;
            player = await precomp.getOutOfGamePlayer(log, is2nd = false).should.be.fulfilled;
            assert.equal( (typeOf.toNumber() == RED && player.toNumber() == 0), false, "GK saw a redcard")
        }
    });


    it('computeExceptionalEvents no clashes with redcards', async () => {
        // there is a red card with this seed, to player 2, but he's not involved in any change
        for (p = 92; p < 92+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [9, 6, 1];
        rounds = [4, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half2, tactics, is2nd = true, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [0, 2];
        expectedOutRounds = [0, 4];
        expectedYellows1 = [0, 0];
        expectedYellows2 = [5, 13];
        expectedType = [0, 3]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [1, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF, nTot2 = UNDEF, winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
    });

    
    it('computeExceptionalEvents clashing with redcards before changing player', async () => {
        // there is a red card with this seed, to player 2. Since he's involved in a change, 
        // the round for which he saw the card should be before the proposed change round (2) 
        for (p = 92; p < 92+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [2, 9, 1];
        rounds = [2, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half2, tactics, is2nd = true, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [0, 2];
        expectedOutRounds = [0, 1]; // note that this 1 would be 9 otherwise
        expectedYellows1 = [0, 0,];
        expectedYellows2 = [5, 13];
        expectedType = [0, 3]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [2, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF, winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
    });

    it('computeExceptionalEvents clashing with redcards after changing player', async () => {
        // there is a red card with this seed, to player 11, which is by definition one of the players to join during the game. 
        // the round for which he saw the card (6) should be after the proposed change round (9) 
        for (p = 71; p < 71+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [2, 9, 1];
        rounds = [6, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half2, tactics, is2nd = true, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [0, 11];
        expectedOutRounds = [0, 9]; // note that it'd be 0, 9 otherwise
        expectedYellows1 = [0, 0];
        expectedYellows2 = [11, 14];
        expectedType = [0, 3]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [1, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
    });

    it('computeExceptionalEvents clashing with redcards after changing player forcing last minute', async () => {
        // note that in the first half, player 11 joined, and saw a red card 
        // same as previous but pushing it to the limit, so that the round is 11
        for (p = 71; p < 71+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [2, 9, 1];
        rounds = [10, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half2, tactics, is2nd = true, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [0, 11];
        expectedOutRounds = [0, 11]; 
        expectedYellows1 = [0, 0];
        expectedYellows2 = [11, 14];
        expectedType = [0, 3]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [1, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled

        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
    });

    it('computeExceptionalEvents clashing with redcards after changing player forcing last minute (first half)', async () => {
        // first half version of the previous
        // note that in the first half, player 13 joined, and saw both a yellow and a red card (!!)
        // same as previous but pushing it to the limit, so that the round is 11
        for (p = 71; p < 71+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [2, 9, 1];
        rounds = [10, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half1, tactics, is2nd = false, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [11, 0];
        expectedOutRounds = [11, 0];
        expectedYellows1 = [11, 14];
        expectedYellows2 = [0, 0];
        expectedType = [3, 0]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [1, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
    });
    
    it('check that nDefs is reduced by one when a defender misses in the 2nd half', async () => {
        // note that in the first half, player 11 joined, and saw both a red card
        // same as previous but pushing it to the limit, so that the round is 10
        for (p = 71; p < 71+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [2, 9, 1];
        rounds = [10, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half1, tactics, is2nd = false, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [11, 0];
        expectedOutRounds = [11, 0];
        expectedYellows1 = [11, 14];
        expectedYellows2 = [0, 0];
        expectedType = [3, 0]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [1, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
           
        // the player with shirt = 1 was substituted by player 11, who was red-carded
        // in the 2nd half there is a defender less than usual
        teamStateAll50Half2[1] = 0;
        seedDraw = 12;
        var {0: log2, 1: err} = await engine.playHalfMatch(seedDraw, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442NoChanges, tactics442NoChanges], [newLog, newLog], [is2nd = true, isHomeStadium,  playoff = false, isBotHome, isBotAway]).should.be.fulfilled;
        for (team = 0; team < 2; team++){
            nDefs = await encodingLog.getNGKAndDefs(log2[team], is2nd = false);
            nDefs.toNumber().should.be.equal(0); // 0 because we did not playHalfMatch in 1st half
            nDefs = await encodingLog.getNGKAndDefs(log2[team], is2nd = true);
            nDefs.toNumber().should.be.equal(4); // 4 = 1 GK + 3 def, because it's 1 less than in a 442 tactics
        }   
    });
    
    it('computeExceptionalEvents clashing 2nd against 1st', async () => {
        // first half:
        //      - there is a red card with this seed, to player 2 at round 2. 
        //      - there are two yellow cards, for player 5, and for subtituted 13.
        for (p = 92; p < 92+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [2, 9, 1];
        rounds = [4, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half1, tactics, is2nd = false, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [2, 0];
        expectedOutRounds = [2, 0]; // note that this 1 would be 9 otherwise
        expectedYellows1 = [5, 13];
        expectedYellows2 = [0, 0];
        expectedType = [3, 0]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [2, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);

        // second half
        // note that since we have not replaced player 9, and the seed is the same, we get the very same results! 
        // except for the different substis used
        tactics = await engine.encodeTactics(substis = [0,0,0], rounds = [0,0,0], lineupConsecutive, extraAttackNull, tacticsId = 0);
        finalLog = await precomp.computeExceptionalEvents(newLog, teamStateAll50Half2, tactics, is2nd = true, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [2, 2]; 
        expectedOutRounds = [2, 4]; // note that this 4 would be 2 otherwise
        expectedYellows1 = [5, 13]; 
        expectedYellows2 = [5, 13]; 
        expectedType = [3, 3]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [2, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [1, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, finalLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);

    });
    
    it('computeExceptionalEvents clashing 2nd against 1st, with no substitution in the middle', async () => {
        // first half:
        //      - there is a red card with this seed, to player 2 at round 2. 
        //      - there are two yellow cards, for player 5, and for subtituted 13.
        for (p = 92; p < 92+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        substis = [2, 3, 4];
        rounds = [4, 2, 6];
        tactics = await engine.encodeTactics(substis, rounds, lineupConsecutive, extraAttackNull, tacticsId = 0);
        newLog = await precomp.computeExceptionalEvents(log = 0, teamStateAll50Half1, tactics, is2nd = false, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [2, 0];
        expectedOutRounds = [2, 0]; 
        expectedYellows1 = [5, 13];
        expectedYellows2 = [0, 0];
        expectedType = [3, 0]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [2, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, newLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);

        // second half
        tactics = await engine.encodeTactics(substis = [0,0,0], rounds = [0,0,0], lineupConsecutive, extraAttackNull, tacticsId = 0);
        finalLog = await precomp.computeExceptionalEvents(newLog, teamStateAll50Half2, tactics, is2nd = true, isBotHome, seedForRedCard).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [2, 2]; // note that the red card comes from two yellows.
        expectedOutRounds = [2, 4]; 
        expectedYellows1 = [5, 13]; // note that he'd like to yellow card [1,12] again, but the 1 goes immediately to redCard above.
        expectedYellows2 = [5, 13]; // note that he'd like to yellow card [1,12] again, but the 1 goes immediately to redCard above.
        expectedType = [3, 3]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [2, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [1, 1, 1]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, finalLog, nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF,  nTot2 = UNDEF,winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
    });    

    it('play a match with a special playerId that made it fail before fixing a bug', async () => {
        playerId = 274877907169;
        skills = await assets.getPlayerSkillsAtBirth(playerId).should.be.fulfilled;
        for (i = 0; i< PLAYERS_PER_TEAM_MAX; i++) teamStateAll50Half1[i] = skills;
        var {0: result, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics0], firstHalfLog, matchBools).should.be.fulfilled;
    });


    it('check positive effect of changes in half time by playing matches', async () => {
        tactics1NoChanges = await engine.encodeTactics(noSubstitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, noSubstitutions), 
            extraAttackNull, tacticId433).should.be.fulfilled;
        lineUp3Changes = [0,1,2,3,4,5,6,7,11,12,13]
        tactics3Changes = await engine.encodeTactics(noSubstitutions, subsRounds, setNoSubstInLineUp(lineUp3Changes, noSubstitutions), 
            extraAttackNull, tacticId433).should.be.fulfilled;
        teamStateAll1000Half2 = await createTeamStateFromSinglePlayer([1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [true, false]).should.be.fulfilled;

        nGoalsTotal = [0,0];
        nGoalsTotalb = [0,0];
        // play several matches, for each, making 0 changes at halftime, and again, making 3 changes instead
        // - for each, check that the team doing the changes scores equal or more goals
        // - for each, check that the team not doing the changes scores equal or less goals
        // - at the end, add all goals, and check that the inequalities are strictly less and more, not equal.
        for (i = 1; i < 5; i++) {
            sed = web3.utils.toBN(web3.utils.keccak256(i.toString()));
            var {0: log2, 1: err} = await engine.playHalfMatch(sed, now, [teamStateAll1000Half2, teamStateAll1000Half2], [tactics1NoChanges, tactics1NoChanges], [0, 0], [is2nd = true, isHomeStadium,  playoff = false, isBotHome, isBotAway]).should.be.fulfilled;
            nGoals0 = await encodingLog.getNGoals(log2[0]).should.be.fulfilled;
            nGoals1 = await encodingLog.getNGoals(log2[1]).should.be.fulfilled;
            nChangesHalfTime = await encodingLog.getChangesAtHalfTime(log2[1]);
            nChangesHalfTime.toNumber().should.be.equal(0);
            nGoalsTotal[0] += nGoals0.toNumber();
            nGoalsTotal[1] += nGoals1.toNumber();

            var {0: log2, 1: err} = await engine.playHalfMatch(sed, now, [teamStateAll1000Half2, teamStateAll1000Half2], [tactics1NoChanges, tactics3Changes], [0, 0], [is2nd = true, isHomeStadium,  playoff = false, isBotHome, isBotAway]).should.be.fulfilled;
            nGoals0b = await encodingLog.getNGoals(log2[0]).should.be.fulfilled;
            nGoals1b = await encodingLog.getNGoals(log2[1]).should.be.fulfilled;
            nChangesHalfTime = await encodingLog.getChangesAtHalfTime(log2[1]);
            nChangesHalfTime.toNumber().should.be.equal(3);
            nGoalsTotalb[0] += nGoals0b.toNumber();
            nGoalsTotalb[1] += nGoals1b.toNumber();
            (nGoals0b.toNumber() <= nGoals0.toNumber()).should.be.equal(true);
            (nGoals1b.toNumber() >= nGoals1b.toNumber()).should.be.equal(true);
        }
        (nGoalsTotalb[0] < nGoalsTotal[0]).should.be.equal(true);
        (nGoalsTotalb[1] > nGoalsTotal[1]).should.be.equal(true);
    });

    it('check that penalties are played in playoff games and excluding redcarded players', async () => {
        // cook data so that the first half ended up in a way that:
        //  - there are red cards
        //  - there are the right goals to, then, in 2nd half, end up in draw.
        assistersIdx = Array.from(new Array(MAX_GOALS_IN_HALF), (x,i) => i);
        shootersIdx  = Array.from(new Array(MAX_GOALS_IN_HALF), (x,i) => 1);
        shooterForwardPos  = Array.from(new Array(MAX_GOALS_IN_HALF), (x,i) => 1);
        penalties  = Array.from(new Array(7), (x,i) => false);
        typesOutOfGames = [3, 0];
        outOfGameRounds = [7, 0];
        ingameSubs1 = [0, 0, 0]
        ingameSubs2 = [0, 0, 0]
        outOfGames = [9, 14]
        yellowCards1 = [14, 0]
        yellowCards2 = [0, 0]
        halfTimeSubstitutions = [14, 14, 14]
        nGKAndDefs1 = 4; 
        nGKAndDefs2 = 0; 
        nTot1 = 10; 
        nTot2 = 10; 
        winner = 0; 
        
        log0 = await logUtils.encodeLog(encodingLog, nGoals = 3, assistersIdx, shootersIdx, shooterForwardPos, penalties,
            outOfGames, outOfGameRounds, typesOutOfGames, 
            isHomeStadium, ingameSubs1, ingameSubs2, yellowCards1, yellowCards2, 
            halfTimeSubstitutions, nGKAndDefs1, nGKAndDefs2, nTot1, nTot2, winner, teamSumSkillsDefault, trainingPointsDefault);
        
        teamStateAll50Half2[9] = 0; 
        for (i = 1; i < 2; i++) {
            seedDraw = web3.utils.toBN(web3.utils.keccak256(i.toString()));
            var {0: log2, 1: err} = await engine.playHalfMatch(seedDraw, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442, tactics1], [log0, log0], [is2nd = true, isHomeStadium,  playoff = true, isBotHome, isBotAway]).should.be.fulfilled;
            nGoals0 = await encodingLog.getNGoals(log2[0]).should.be.fulfilled;
            nGoals1 = await encodingLog.getNGoals(log2[1]).should.be.fulfilled;
            nGoals0.toNumber().should.be.equal(nGoals1.toNumber());
        }
        expected1 = [ true, true, true, true, true, true, false ];
        expected2 = [ true, true, true, true, true, true, true ];

        pen1 = [];
        pen2 = [];
        for (i = 0; i < 7; i++) {
            pen = await encodingLog.getPenalty(log2[0], i).should.be.fulfilled;
            pen1.push(pen);
            pen = await encodingLog.getPenalty(log2[1], i).should.be.fulfilled;
            pen2.push(pen);
        }
        debug.compareArrays(pen1, expected1, toNum = false);
        debug.compareArrays(pen2, expected2, toNum = false);

        for (team = 0; team < 2; team++){
            win = await encodingLog.getWinner(log2[team]).should.be.fulfilled;
            win.toNumber().should.be.equal(1);
            // in first half we hardcoded 4
            nDefs = await encodingLog.getNGKAndDefs(log2[team], is2nd = false);
            nDefs.toNumber().should.be.equal(4);
            // in 2nd half he computed it, and since its 442 => nGK+nDef = 5
            nDefs = await encodingLog.getNGKAndDefs(log2[team], is2nd = true);
            nDefs.toNumber().should.be.equal(5);
        }   
    });
    
    it('computePenalties', async () => {
        // one team much better than the other:
        log = await precomp.computePenalties(log = [0,0], [teamStateAll50Half2, teamStateAll1Half2], 50, 1, seed);
        expected = [true, true, true, true, true, false, false]
        for (i = 0; i < 7; i++) {
            pen = await encodingLog.getPenalty(log[team = 0], i).should.be.fulfilled;
            pen.should.be.equal(expected[i]);
        }
        expected = [false, false, false, false, false, false, false]
        for (i = 0; i < 7; i++) {
            pen = await encodingLog.getPenalty(log[team = 1], i).should.be.fulfilled;
            pen.should.be.equal(expected[i]);
        }
        for (team = 0; team < 2; team++){
            win = await encodingLog.getWinner(log[team]).should.be.fulfilled;
            win.toNumber().should.be.equal(0);
        }   

        // both teams similar:
        log = await precomp.computePenalties(log = [0,0], [teamStateAll50Half2, teamStateAll50Half2], 50, 50, seed);
        expected = [false, true, true, true, true, false, false]
        for (i = 0; i < 7; i++) {
            pen = await encodingLog.getPenalty(log[team = 0], i).should.be.fulfilled;
            pen.should.be.equal(expected[i]);
        }
        expected = [true, true, true, true, true, false, false]
        for (i = 0; i < 7; i++) {
            pen = await encodingLog.getPenalty(log[team = 1], i).should.be.fulfilled;
            pen.should.be.equal(expected[i]);
        }
        for (team = 0; team < 2; team++){
            win = await encodingLog.getWinner(log[team]).should.be.fulfilled;
            win.toNumber().should.be.equal(1);
        }   

        // both teams really incredible goalkeepers:
        log = await precomp.computePenalties(log = [0,0], [teamStateAll50Half2, teamStateAll50Half2], 5000000, 5000000, seed);
        expected = [false, false, false, false, false, false, false]
        for (i = 0; i < 7; i++) {
            pen = await encodingLog.getPenalty(log[team = 0], i).should.be.fulfilled;
            pen.should.be.equal(expected[i]);
        }
        expected = [false, false, false, false, false, false, true]
        for (i = 0; i < 7; i++) {
            pen = await encodingLog.getPenalty(log[team = 1], i).should.be.fulfilled;
            pen.should.be.equal(expected[i]);
        }
        for (team = 0; team < 2; team++){
            win = await encodingLog.getWinner(log[team]).should.be.fulfilled;
            win.toNumber().should.be.equal(1);
        }   
    });

    it('playmatch now returns 0 teamSumSkills', async () => {
        seedDraw = 12;
        subs = [3,1,11];
        tactics442TwoChanges = await engine.encodeTactics(subs, subsRounds, setNoSubstInLineUp(lineupConsecutive, subs), 
            extraAttackNull, tacticId442).should.be.fulfilled;
        subs = [11,11,11];
        tactics442WithNoChanges = await engine.encodeTactics(subs, subsRounds, setNoSubstInLineUp(lineupConsecutive, subs), 
            extraAttackNull, tacticId442).should.be.fulfilled;
        var {0: log0, 1: err} =  await engine.playHalfMatch(seedDraw,  now, [teamStateAll50Half1, teamStateAll50Half1], [tactics442TwoChanges, tactics442WithNoChanges], log = [0, 0], [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expected = [0, 0];
        for (team = 0; team < 2; team++) {
            teamSkills = await encodingLog.getTeamSumSkills(log0[team]).should.be.fulfilled;
            teamSkills.toNumber().should.be.equal(expected[team]);
        }
        subs = [3,11,11];
        tactics442OneChange = await engine.encodeTactics(subs, subsRounds, setNoSubstInLineUp(lineupConsecutive, subs), 
            extraAttackNull, tacticId442).should.be.fulfilled;
        var {0: log12, 1: err}  = await engine.playHalfMatch(seedDraw,  now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442OneChange, tactics442WithNoChanges], extractMatchLogs(log0), [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expected = [0, 0];
        for (team = 0; team < 2; team++) {
            teamSkills = await encodingLog.getTeamSumSkills(log12[team]).should.be.fulfilled;
            teamSkills.toNumber().should.be.equal(expected[team]);
        }
    });

    it('find goals from 1st half are added in the 2nd half', async () => {
        seedDraw = 13;
        // log0 = log after playing 1st half
        // log1 = log after playing 2nd half without any log from 1st half
        // log12 = log after playing 2nd half with log0 from 1st half5
        // note that 2nd half tactics have changes during the game, so they affect the glob stamina
        var {0: log0, 1: err} =  await engine.playHalfMatch(seedDraw,  now, [teamStateAll50Half1, teamStateAll50Half1], [tactics442NoChanges, tactics1NoChanges], log = [0, 0], [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(0);
        var {0: log1, 1: err} = await engine.playHalfMatch(seedDraw,  now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442, tactics1], log = [0, 0], [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(0);
        var {0: log12, 1: err} = await engine.playHalfMatch(seedDraw,  now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442, tactics1], extractMatchLogs(log0), [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(0);
        expected1 = [1, 2];
        expected2 = [1, 2];
        goals1 = [];
        goals2 = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log0[team]);
            goals1.push(nGoals)
            nGoals = await encodingLog.getNGoals(log1[team]);
            goals2.push(nGoals)
        }
        debug.compareArrays(goals1, expected1, toNum = true);
        debug.compareArrays(goals2, expected2, toNum = true);

        expected = [2, 4];
        goals = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log12[team]);
            goals.push(nGoals)
            winner = await encodingLog.getWinner(log12[team]);
            winner.toNumber().should.be.equal(WINNER_AWAY);
            nDefs = await encodingLog.getNGKAndDefs(log12[team], is2nd = false);
            nDefs.toNumber().should.be.equal(5);
            nDefs = await encodingLog.getNGKAndDefs(log12[team], is2nd = true);
            nDefs.toNumber().should.be.equal(5);
            nChangesHalfTime = await encodingLog.getChangesAtHalfTime(log12[team]);
            nChangesHalfTime.toNumber().should.be.equal(3);
        }
        debug.compareArrays(goals, expected, toNum = true);
    });

    it('red cards in first half force lineups of 10 players in 2nd half', async () => {
        // choose a seed that gives a red card for player 2.
        for (p = 92; p < 92+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        var {0: log0, 1: err} =  await engine.playHalfMatch(seedForRedCard,  now, [teamStateAll50Half1, teamStateAll50Half1], [tactics442NoChanges, tactics1NoChanges], log = [0, 0], [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        isHomeSt = false;
        expectedOut = [2, 0];
        expectedOutRounds = [4, 0]; 
        expectedYellows1 = [4, 14];
        expectedYellows2 = [0, 0];
        expectedType = [3, 0]; // 0 = no event, 3 = redCard
        expectedInGameSubs1 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        expectedInGameSubs2 = [0, 0, 0]; // 0: no subs requested, 1: change takes place, 2: change cancelled
        await logUtils.checkExpectedLog(encodingLog, log0[0], nGoals = UNDEF, ass = UNDEF, sho = UNDEF, fwdPos = UNDEF, penalties = UNDEF,
            expectedOut, expectedOutRounds, expectedType, 
            isHomeSt, expectedInGameSubs1, expectedInGameSubs2, expectedYellows1, expectedYellows2, 
            halfTimeSubstitutions = UNDEF, nGKAndDefs1 = UNDEF, nGKAndDefs2 = UNDEF, nTot1 = UNDEF, nTot2 = UNDEF, winner = UNDEF, teamSumSkills = UNDEF, trainPo = UNDEF);
        
        teamStateAll50Half2[9] = await encodingSet.setRedCardLastGame(teamStateAll50Half2[9], true);    
        result = await precomp.verifyCanPlay(linedUp = 9, teamStateAll50Half2[9], is2nd = true, isSubst = false).should.be.fulfilled;
        result.should.be.bignumber.equal('0');
        // tactics442 and tactics1 are based on "substitutions" = [6, 10, 0]
        // so, since player 9 was red carded, he's still in the field, they are basically playing with 10 players.
        var {0: log2, 1: err} = await engine.playHalfMatch(seedForRedCard, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442, tactics1], extractMatchLogs(log0), [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        for (team = 0; team < 2; team++) {
            nDefs = await encodingLog.getNGKAndDefs(log2[team], is2nd = false);
            nDefs.toNumber().should.be.equal(5);
            nDefs = await encodingLog.getNGKAndDefs(log2[team], is2nd = true);
            nDefs.toNumber().should.be.equal(5);
            teamSkills = await encodingLog.getTeamSumSkills(log2[team]).should.be.fulfilled;
            teamSkills.toNumber().should.be.equal(0);
        }
    });
    
    
    it('from the field: used to lead to player > 14 => bad encoding => round = 15', async () => {
        // to see this test failing in the past, set:
        //   weights[NO_OUT_OF_GAME_PLAYER] = 1;
        //   weights[0] = 2000;
        for (n = 0; n < 3; n++) {
            RED = 3;
            sed = web3.utils.toBN(web3.utils.keccak256(n.toString()));
            var {0: log0, 1: err} =  await engine.playHalfMatch(sed,  now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442NoChanges, tactics1NoChanges], log = [0, 0], [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
            player = await encodingLog.getOutOfGamePlayer(log0[0], is2nd).should.be.fulfilled;
            typeOf = await encodingLog.getOutOfGameType(log0[0], is2nd).should.be.fulfilled;
            round = await encodingLog.getOutOfGameRound(log0[0], is2nd).should.be.fulfilled;
            // console.log(round.toNumber(), player.toNumber(), typeOf.toNumber(), round.toNumber(), n);
            (round.toNumber() < 13).should.be.equal(true);
            if (player.toNumber() == 14) {
                round.toNumber().should.be.equal(0);
                typeOf.toNumber().should.be.equal(0);
            } else {
                (typeOf.toNumber() > 0).should.be.equal(true);
            }
        }
    });

    it('our of games affect the result negatively', async () => {
        // We play one half twice. The only difference is that, in the 2nd attempt, one of the teams has max aggressiveness
        // In this 2nd attempt, it sees a red card in round 0. 
        RED = 3;
        INJURY_HARD = 2;
        teamNormal = await createTeamStateFromSinglePlayer([1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [true, false], ag = 0).should.be.fulfilled;
        teamAggr = await createTeamStateFromSinglePlayer([1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [true, false], ag = 3).should.be.fulfilled;
        for (p = 159; p < 159+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
            var {0: log0, 1: err} =  await engine.playHalfMatch(seedForRedCard,  now, [teamNormal, teamNormal], [tactics442NoChanges, tactics1NoChanges], log = [0, 0], [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
            goals = [];
            expectedGoals = [3,2];
            for (team = 0; team < 2; team++) {
                nGoals = await encodingLog.getNGoals(log0[team]).should.be.fulfilled;
                goals.push(nGoals.toNumber());
            }
            typeOf = await encodingLog.getOutOfGameType(log0[0], is2nd = false).should.be.fulfilled;
            round = await encodingLog.getOutOfGameRound(log0[0], is2nd = false).should.be.fulfilled;
            player = await encodingLog.getOutOfGamePlayer(log0[0], is2nd = false).should.be.fulfilled;
            // console.log(p, goals, typeOf.toNumber(), round.toNumber(), player.toNumber(), err.toNumber())
            typeOf.toNumber().should.be.equal(0);
            debug.compareArrays(goals, expectedGoals, toNum = false);

            var {0: log0, 1: err} =  await engine.playHalfMatch(seedForRedCard,  now, [teamAggr, teamNormal], [tactics442NoChanges, tactics1NoChanges], log = [0, 0], [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
            goals2 = [];
            expectedGoals = [2,2];
            for (team = 0; team < 2; team++) {
                nGoals = await encodingLog.getNGoals(log0[team]).should.be.fulfilled;
                goals2.push(nGoals.toNumber());
            }
            typeOf = await encodingLog.getOutOfGameType(log0[0], is2nd = false).should.be.fulfilled;
            round = await encodingLog.getOutOfGameRound(log0[0], is2nd = false).should.be.fulfilled;
            player = await encodingLog.getOutOfGamePlayer(log0[0], is2nd = false).should.be.fulfilled;
            // console.log(p, goals2, typeOf.toNumber(), round.toNumber(), player.toNumber(), err.toNumber())
            typeOf.toNumber().should.be.equal(INJURY_HARD);
            round.toNumber().should.be.equal(7);
            debug.compareArrays(goals2, expectedGoals, toNum = false);
        }
    });
    
    it('red cards cannot be changed and continue having 11 players', async () => {
        // choose a seed that gives a red card for player 2.
        RED = 3;
        RED_CARDED_PLAYER = 2;
        for (p = 92; p < 92+1; p++) {
            seedForRedCard = web3.utils.toBN(web3.utils.keccak256(p.toString()));
        }
        var {0: log0, 1: err} =  await engine.playHalfMatch(seedForRedCard,  now, [teamStateAll50Half1, teamStateAll50Half1], [tactics442NoChanges, tactics1NoChanges], log = [0, 0], [is2nd = false, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        player = await encodingLog.getOutOfGamePlayer(log0[0], is2nd = false).should.be.fulfilled;
        typeOf = await encodingLog.getOutOfGameType(log0[0], is2nd = false).should.be.fulfilled;
        player.toNumber().should.be.equal(2);
        typeOf.toNumber().should.be.equal(RED);

        // play with the same players as in 1st half, including the red carded, and without having set redcard = true => fails as it believes there are 11 players playing
        var {0: log2, 1: err} = await engine.playHalfMatch(seedForRedCard, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442NoChanges, tactics442NoChanges], extractMatchLogs(log0), [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_TOO_MANY_LINEDUP);
        
        // if we correctly set the redcard flag => it understands there are only 10 players playing.
        teamStateAll50Half2[RED_CARDED_PLAYER] = await encodingSet.setRedCardLastGame(teamStateAll50Half2[RED_CARDED_PLAYER], true);    
        var {0: log2, 1: err} = await engine.playHalfMatch(seedForRedCard, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442NoChanges, tactics442NoChanges], extractMatchLogs(log0), [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        // play with the same players as in 1st half, substituting the red carded => fails
        teamStateAll50Half2[RED_CARDED_PLAYER] = teamStateAll50Half1[RED_CARDED_PLAYER];
        var {0: log2, 1: err} = await engine.playHalfMatch(seedForRedCard, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442NoChanges, tactics442NoChanges], extractMatchLogs(log0), [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_TOO_MANY_LINEDUP);
        
        // play with the same players as in 1st half, substituting any player => fails
        teamStateAll50Half2[RED_CARDED_PLAYER] = teamStateAll50Half2[10];
        teamStateAll50Half2[2] = teamStateAll50Half1[RED_CARDED_PLAYER];
        var {0: log2, 1: err} = await engine.playHalfMatch(seedForRedCard, now, [teamStateAll50Half2, teamStateAll50Half2], [tactics442NoChanges, tactics442NoChanges], extractMatchLogs(log0), [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_TOO_MANY_LINEDUP);
    });
        
    it('play 2nd half with 3 changes is OK, but more than 3 is rejected, by lying in the team-states', async () => {
        // create a 2nd half using 3 players that already played in the 1st half... should work
        messi = await assets.encodePlayerSkills([50,50,50,50,50], dayOfBirth21, gen = 0, id = 1123, [pot = 3, fwd = 3, left = 7, aggr = 0], 
            alignedEndOfLastHalf = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 250).should.be.fulfilled;            
        for (p = 0; p < 3; p++) teamStateAll50Half2[p] = messi; 
        var {0: result, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half2, teamStateAll1Half2], [tactics442NoChanges, tactics442NoChanges], firstHalfLog, [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        // create a 2nd half using 4 players that already played in the 1st half... should fail
        half2states = [...teamStateAll50Half2]    
        half2states[5] = messi; 
        var {0: result, 1: err} = await engine.playHalfMatch(seed, now, [half2states, teamStateAll1Half2], [tactics442NoChanges, tactics442NoChanges], firstHalfLog, [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_HALFCHANGES);
        
        // try to lie by including it in a new lineup
        lineUp1change = [...lineupConsecutive];
        lineUp1change[6] = 16;
        tactics4421change = await engine.encodeTactics(noSubstitutions, subsRounds, setNoSubstInLineUp(lineUp1change, noSubstitutions), 
            extraAttackNull, tacticId442).should.be.fulfilled;
        var {0: result, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half2, teamStateAll1Half2], [tactics4421change, tactics442NoChanges], firstHalfLog, [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_HALFCHANGES);
    });

    it('play 2nd half with 3 changes is OK, but more than 3 is rejected, by lying in the substitutions', async () => {
        // create a 2nd half using 1 players that already played in the 1st half, and 2 changes only... should work
        messi = await assets.encodePlayerSkills([50,50,50,50,50], dayOfBirth21, gen = 0, id = 1123, [pot = 3, fwd = 3, left = 7, aggr = 0], 
            alignedEndOfLastHalf = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 250).should.be.fulfilled;            
        teamStateAll50Half2[lineupConsecutive[1]] = messi; 
        subst = [3,1,11];
        tactics442TwoChanges = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineupConsecutive, subst),
            extraAttackNull, tacticId442).should.be.fulfilled;
        var {0: result, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half2, teamStateAll1Half2], [tactics442TwoChanges, tactics442NoChanges], firstHalfLog, 
            [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        // create a 2nd half using 1 players that already played in the 1st half, and 3 changes... should fail
        subst = [3,1,5];
        tactics442ThreeChanges = await engine.encodeTactics(subst, subsRounds, setNoSubstInLineUp(lineupConsecutive, subst),
            extraAttackNull, tacticId442).should.be.fulfilled;
        var {0: result, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half2, teamStateAll1Half2], [tactics442ThreeChanges, tactics442NoChanges], firstHalfLog, 
            [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_HALFCHANGES);
    });

    it('play with an injured / red carded / free-slot player', async () => {
        // legit works:
        var {0: result, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half2, teamStateAll1Half2], [tactics442, tactics1], firstHalfLog, [is2nd = true, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        // red card fails:
        teamStateAll50Half2[5] = await assets.encodePlayerSkills([50,50,50,50,50], dayOfBirth21, gen = 0, id = 1123, [pot = 3, fwd = 3, left = 7, aggr = 0],
            alignedEndOfLastHalf = false, redCardLastGame = true, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 250).should.be.fulfilled;    

        result = await precomp.verifyCanPlay(linedUp = 9, teamStateAll50Half2[9], is2nd = true, isSubst = false).should.be.fulfilled;
        result.should.not.be.bignumber.equal('0');
        result = await precomp.verifyCanPlay(linedUp = 5, teamStateAll50Half2[5], is2nd = true, isSubst = false).should.be.fulfilled;
        result.should.be.bignumber.equal('0');

        result = await precomp.verifyCanPlay(linedUp = 5, teamStateAll50Half2[5], is2nd = true, isSubst = false).should.be.fulfilled;
        result.should.be.bignumber.equal('0');

        // injured fails
        teamStateAll50Half2[5] = await assets.encodePlayerSkills([50,50,50,50,50], dayOfBirth21, gen = 0, id = 1123, [pot = 3, fwd = 3, left = 7, aggr = 0],
            alignedEndOfLastHalf = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 2, subLastHalf, sumSkills = 250).should.be.fulfilled;            
        result = await precomp.verifyCanPlay(linedUp = 5, teamStateAll50Half2[5], is2nd = true, isSubst = false).should.be.fulfilled;
        result.should.be.bignumber.equal('0');
        });

    it('computeModifierBadPositionAndCondition for GK ', async () => {
        playerSkills= await assets.encodePlayerSkills(skills = [1,1,1,1,1], monthOfBirth = 0, gen = 0,  playerId = 232131, [potential = 1,
            forwardness = 0, leftishness = 0, aggr = 0], 
            alignedEndOfLastHalf = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 5
        ).should.be.fulfilled; 
        // recall "penalty" large => good
        expected = [ 10000, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500 ];
        pen = [];
        for (p=0; p < 11; p++) {
            penalty = await precomp.computeModifierBadPositionAndCondition(p, playersPerZone442, playerSkills, isBotHome).should.be.fulfilled;
            pen.push(penalty);
            // penalty.toNumber().should.be.equal(10000 - expected[p]);
        }
        debug.compareArrays(pen, expected, toNum = true);
    });

    it('computeModifierBadPositionAndCondition for DL ', async () => {
            // for a DL:
        playerSkills= await assets.encodePlayerSkills(skills = [1,1,1,1,1], monthOfBirth = 0, gen = 0,  playerId = 312321, [potential = 1,
            forwardness = 1, leftishness = 4, aggr = 0], alignedEndOfLastHalf = false, 
            redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 5
        ).should.be.fulfilled;            
        expected442 = [MAX_PENALTY-500, 
            0, 1000, 1000, 2000, 
            1000, 2000, 2000, 3000, 
            3000, 3000 
        ];
        expected433 = [MAX_PENALTY-500, 
            0, 1000, 1000, 2000, 
            1000, 2000, 3000,  
            2000, 3000, 4000
        ];
        for (p=0; p < 11; p++) {
            penalty = await precomp.computeModifierBadPositionAndCondition(p, playersPerZone442, playerSkills, isBotHome).should.be.fulfilled;
            penalty.toNumber().should.be.equal(10000 - expected442[p]);
            penalty = await precomp.computeModifierBadPositionAndCondition(p, playersPerZone433, playerSkills, isBotHome).should.be.fulfilled;
            penalty.toNumber().should.be.equal(10000 - expected433[p]);
        }
    });

    it('computeModifierBadPositionAndCondition for DL with gamesNonStopping', async () => {
        // for a DL:
        expected442 = [MAX_PENALTY-500, 
            0, 1000, 1000, 2000, 
            1000, 2000, 2000, 3000, 
            3000, 3000 
        ];
        expected433 = [MAX_PENALTY-500, 
            0, 1000, 1000, 2000, 
            1000, 2000, 3000,  
            2000, 3000, 4000
        ];
        for (games = 1; games < 9; games+=2) {
            playerSkills= await assets.encodePlayerSkills(skills = [1,1,1,1,1], monthOfBirth = 0, gen = 0,  playerId = 1323121, [potential = 1,
                forwardness = 1, leftishness = 4, aggr = 0], alignedEndOfLastHalf = false, 
                redCardLastGame = false, games, injuryWeeksLeft = 0, subLastHalf, sumSkills = 5
            ).should.be.fulfilled;            
            for (p=0; p < 11; p+=3) {
                penalty = await precomp.computeModifierBadPositionAndCondition(p, playersPerZone442, playerSkills, isBotHome).should.be.fulfilled;
                if (expected442[p] == MAX_PENALTY-500) {
                    penalty.toNumber().should.be.equal(500);
                } else {
                    penalty.toNumber().should.be.equal(10000 - Math.min(5000, games*1000) - expected442[p]);
                }
            }
        }
    });


    it('computeModifierBadPositionAndCondition for MFLCR ', async () => {
        // for a DL:
        playerSkills= await assets.encodePlayerSkills(skills = [1,1,1,1,1], monthOfBirth = 0, gen = 0,  playerId = 312321, [potential = 1,
            forwardness = 5, leftishness = 7, aggr = 0], alignedEndOfLastHalf = false, 
            redCardLastGame = false, gamesNonStopping = 0, injuryWeeksLeft = 0, subLastHalf, sumSkills = 5
        ).should.be.fulfilled;            
        expected442 = [MAX_PENALTY-500, 
            1000, 1000, 1000, 1000, 
            0, 0, 0, 0, 
            0, 0 
        ];
        expected433 = expected442;
        for (p=0; p < 11; p++) {
            penalty = await precomp.computeModifierBadPositionAndCondition(p, playersPerZone442, playerSkills, isBotHome).should.be.fulfilled;
            penalty.toNumber().should.be.equal(10000 - expected442[p]);
            penalty = await precomp.computeModifierBadPositionAndCondition(p, playersPerZone433, playerSkills, isBotHome).should.be.fulfilled;
            penalty.toNumber().should.be.equal(10000 - expected433[p]);
        }
    });
    
    it('teams get tired', async () => {
        logs = [0, 0];
        const result = await engine.teamsGetTired([10,20,30,40,100], [20,40,60,80,50], logs).should.be.fulfilled;
        result[0][0].toNumber().should.be.equal(10);
        result[0][1].toNumber().should.be.equal(20);
        result[0][2].toNumber().should.be.equal(30);
        result[0][3].toNumber().should.be.equal(40);
        result[0][4].toNumber().should.be.equal(100);
        result[1][0].toNumber().should.be.equal(10);
        result[1][1].toNumber().should.be.equal(20);
        result[1][2].toNumber().should.be.equal(30);
        result[1][3].toNumber().should.be.equal(40);
        result[1][4].toNumber().should.be.equal(50);
    });

    it('teams get less tired with changes during half time', async () => {
        logA = await engine.setChangesAtHalfTime(0, 1).should.be.fulfilled;
        logB = await engine.setChangesAtHalfTime(0, 2).should.be.fulfilled;
        globSkills = [10000,20000,30000,40000,80];

        var result = await engine.teamsGetTired(globSkills, globSkills, [0, 0]).should.be.fulfilled;
        expected = [ 8000, 8000*2, 8000*3, 8000*4, 80 ];
        debug.compareArrays(result[0], expected, toNum = true);

        var result = await engine.teamsGetTired(globSkills, globSkills, [logA, logB]).should.be.fulfilled;
        expected = [ 8285, 16571, 24857, 33142, 80 ];
        debug.compareArrays(result[0], expected, toNum = true);
        expected = [ 8571, 17142, 25714, 34285, 80 ];
        debug.compareArrays(result[1], expected, toNum = true);

        logB = await engine.setChangesAtHalfTime(0, 3).should.be.fulfilled;
        var result = await engine.teamsGetTired(globSkills, globSkills, [logA, logB]).should.be.fulfilled;
        expected = [ 8857, 17714, 26571, 35428, 80 ];
        debug.compareArrays(result[1], expected, toNum = true);

    });
    
    it('play a match in home stadium, check that max goals is applied', async () => {
        // note: the home team is much better than the away team
        var {0: log, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half1, teamStateAll1Half1], [tactics0, tactics1], firstHalfLog, [is2nd = false, isHome = true, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expected = [10, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expected[team]);
        }
        var {0: log, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half2, teamStateAll1Half2], [tactics0, tactics1], extractMatchLogs(log), [is2nd = false, isHome = true, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expected = [MAX_GOALS_IN_MATCH, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expected[team]);
        }
    });
    
    it('play a match', async () => {
        var {0: log, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half1, teamStateAll1Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expected = [10, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expected[team]);
        }
    });

    it('manages to score with a really old player vs a young one', async () => {
        // a Young Messi manages to score:
        teamState = await createTeamState442(engine, forceSkills= [20,20,20,20,20]).should.be.fulfilled;
        messi = await assets.encodePlayerSkills([100,100,100,100,100], dayOfBirth21, gen = 0, id = 1123, [pot = 3, fwd = 3, left = 7, aggr = 0], 
            alignedEndOfLastHalf = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 5
        ).should.be.fulfilled;            
        teamState[10] = messi;
        teamThatAttacks = 0;
        log = [0, 0]
        scoreData = await engine.managesToScore(0, teamState, playersPerZone442, extraAttackNull, blockShoot = 20, isPen = false, [kMaxRndNumHalf, kMaxRndNumHalf, kMaxRndNumHalf]).should.be.fulfilled;
        log[teamThatAttacks] = scoreData[0];
        expectedGoals       = [1, 0];
        expectedShooters    = [10, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expectedGoals[team]);
            sho = await encodingLog.getShooter(log[team], 0).should.be.fulfilled;
            sho.toNumber().should.be.equal(expectedShooters[team]);
        }
        // an old Messi does identically:
        oldMessi = await assets.encodePlayerSkills([100,100,100,100,100], dayOfBirthOld, gen = 0, id = 1123, [pot = 3, fwd = 3, left = 7, aggr = 0], 
            alignedEndOfLastHalf = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 5
        ).should.be.fulfilled;            
        teamState[10] = oldMessi;
        teamThatAttacks = 0;
        log = [0, 0]
        scoreData = await engine.managesToScore(0, teamState, playersPerZone442, extraAttackNull, blockShoot = 20,  isPen = false,[kMaxRndNumHalf, kMaxRndNumHalf, kMaxRndNumHalf]).should.be.fulfilled;
        log[teamThatAttacks] = scoreData[0];
        log = extractMatchLogs(log);
        // for this case, there should be a goal, so: 1-0    
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expectedGoals[team]);
            sho = await encodingLog.getShooter(log[team], 0).should.be.fulfilled;
            sho.toNumber().should.be.equal(expectedShooters[team]);
        }
    });
    
    it('manages to score with select shooter without modifiers', async () => {
        // lets put a Messi and check that it surely scores:
        teamState = await createTeamState442(engine, forceSkills= [1,1,1,1,1]).should.be.fulfilled;
        messi = await assets.encodePlayerSkills([100,100,100,100,100], dayOfBirth21, gen = 0, id = 1123, [pot = 3, fwd = 3, left = 7, aggr = 0], 
            alignedEndOfLastHalf = false, redCardLastGame = false, gamesNonStopping = 0, 
            injuryWeeksLeft = 0, subLastHalf, sumSkills = 5
        ).should.be.fulfilled;            
        teamState[10] = messi;
        result = await engine.selectShooter(teamState, playersPerZone442, extraAttackNull, kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(10);
        teamThatAttacks = 0;
        log = [0, 0]
        scoreData = await engine.managesToScore(0, teamState, playersPerZone442, extraAttackNull, blockShoot = 1, isPen = false, [kMaxRndNumHalf, kMaxRndNumHalf, kMaxRndNumHalf]).should.be.fulfilled;
        log[teamThatAttacks] = scoreData[0];
        // for this case, there should be a goal, so: 1-0    
        expectedGoals       = [1, 0];
        expectedShooters    = [10, 0];
        expectedAssisters   = [10, 0];
        expectedFwd         = [3, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expectedGoals[team]);
            ass = await encodingLog.getAssister(log[team], 0).should.be.fulfilled;
            sho = await encodingLog.getShooter(log[team], 0).should.be.fulfilled;
            fwd = await encodingLog.getForwardPos(log[team], 0).should.be.fulfilled;
            ass.toNumber().should.be.equal(expectedAssisters[team]);
            sho.toNumber().should.be.equal(expectedShooters[team]);
            fwd.toNumber().should.be.equal(expectedFwd[team]);
        }
        // let's put a radically good GK, and check that it doesn't score
        log = [0, 0]
        teamThatAttacks = 0;
        scoreData = await engine.managesToScore(0, teamState, playersPerZone442, extraAttackNull, blockShoot = 1000, isPen = false, [kMaxRndNumHalf, kMaxRndNumHalf, kMaxRndNumHalf]).should.be.fulfilled;
        log[teamThatAttacks] = scoreData[0];
        expectedGoals       = [0, 0];
        expectedShooters    = [0, 0];
        expectedAssisters   = [0, 0];
        expectedFwd         = [0, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expectedGoals[team]);
            ass = await encodingLog.getAssister(log[team], 0).should.be.fulfilled;
            sho = await encodingLog.getShooter(log[team], 0).should.be.fulfilled;
            fwd = await encodingLog.getForwardPos(log[team], 0).should.be.fulfilled;
            ass.toNumber().should.be.equal(expectedAssisters[team]);
            sho.toNumber().should.be.equal(expectedShooters[team]);
            fwd.toNumber().should.be.equal(expectedFwd[team]);
        }
        // Finally, check that even with a super-goalkeeper, there are chances of scoring (e.g. if the rnd is super small, in this case)
        log = [0, 0]
        scoreData = await engine.managesToScore(0, teamState, playersPerZone442, extraAttackNull, blockShoot = 1000, isPen = false, [kMaxRndNumHalf, 1, kMaxRndNumHalf]).should.be.fulfilled;
        log[teamThatAttacks] = scoreData[0];
        expectedGoals       = [1, 0];
        expectedShooters    = [10, 0];
        expectedAssisters   = [10, 0];
        expectedFwd         = [3, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(log[team]);
            nGoals.toNumber().should.be.equal(expectedGoals[team]);
            ass = await encodingLog.getAssister(log[team], 0).should.be.fulfilled;
            sho = await encodingLog.getShooter(log[team], 0).should.be.fulfilled;
            fwd = await encodingLog.getForwardPos(log[team], 0).should.be.fulfilled;
            ass.toNumber().should.be.equal(expectedAssisters[team]);
            sho.toNumber().should.be.equal(expectedShooters[team]);
            fwd.toNumber().should.be.equal(expectedFwd[team]);
        }
    });

    it('select shooter with modifiers', async () => {
        teamState = await createTeamState442(engine, forceSkills= [1,1,1,1,1]).should.be.fulfilled;
        extraAttack = [
            true, false, false, true,
            false, true, true, false,
            true, false,
        ];
        expectedRatios = [1,
            15000, 5000, 5000, 15000,
            25000, 50000, 50000, 25000,
            75000, 75000
        ]
        sum = expectedRatios.reduce((a,b) => a + b, 0)
        k = 0;
        for (p = 0; p < 11; p++) {
            k += Math.floor(MAX_RND*expectedRatios[p]/sum);
            result = await engine.selectShooter(teamState, playersPerZone442, extraAttack, k).should.be.fulfilled;
            result.toNumber().should.be.equal(p);
            if (p < 10) {
                result = await engine.selectShooter(teamState, playersPerZone442, extraAttack, k + p + 1).should.be.fulfilled;
                result.toNumber().should.be.equal(p+1);
            }
        }
    });
    
    it('select assister with modifiers', async () => {
        console.log("warning: This test takes a few secs...")
        teamState = await createTeamState442(engine, forceSkills= [1,1,1,1,1]).should.be.fulfilled;
        extraAttack = [
            true, false, false, true,
            false, true, true, false,
            true, false,
        ];
        nPartitions = 200;
        expectedTrans = [ 5, 65, 15, 20, 65, 80, 115, 110, 220, 155, 150 ];
        transtions = [];
        t=0;
        rndOld = 0; 
        result = await engine.selectAssister(teamState, playersPerZone442, extraAttack, shooter = 8, rnd = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        prev = result.toNumber();
        for (p = 0; p < nPartitions; p++) {
            rnd = Math.floor(p * MAX_RND/ nPartitions);
            result = await engine.selectAssister(teamState, playersPerZone442, extraAttack, shooter = 8, rnd).should.be.fulfilled;
            if (result.toNumber() != prev) {
                percentageForPrevPlayer = Math.round((rnd-rndOld)/MAX_RND*1000);
                transtions.push(percentageForPrevPlayer);
                prev = result.toNumber();
                t++;
                rndOld = rnd;
            }
        }
        percentageForPrevPlayer = Math.round((MAX_RND-rndOld)/MAX_RND*1000);
        transtions.push(percentageForPrevPlayer);
        for (t = 0; t < expectedTrans.length; t++) {
            (result.toNumber()*0 + transtions[t]).should.be.equal(expectedTrans[t]);
        }
    });

    it('select assister with modifiers and one Messi', async () => {
        console.log("warning: This test takes a few secs...")
        teamState = await createTeamState442(engine, forceSkills= [1,1,1,1,1]).should.be.fulfilled;
        messi = await assets.encodePlayerSkills([2,2,2,2,2], dayOfBirth21, gen = 0, id = 1323121, [pot = 3, fwd = 3, left = 7, aggr = 0],
            alignedEndOfLastHalf = false, redCardLastGame = false, 
            gamesNonStopping = 0, injuryWeeksLeft = 0, subLastHalf, sumSkills = 10).should.be.fulfilled;            
        teamState[8] = messi;
        extraAttack = [
            true, false, false, true,
            false, true, true, false,
            true, false,
        ];
        nPartitions = 200;
        expectedTrans = [ 5, 40, 10, 10, 40, 45, 70, 70, 530, 90, 90 ];
        transtions = [];
        t=0;
        rndOld = 0;
        result = await engine.selectAssister(teamState, playersPerZone442, extraAttack, shooter = 8, rnd = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        prev = result.toNumber();
        for (p = 0; p < nPartitions; p++) {
            rnd = Math.floor(p * MAX_RND/ nPartitions);
            result = await engine.selectAssister(teamState, playersPerZone442, extraAttack, shooter = 8, rnd).should.be.fulfilled;
            if (result.toNumber() != prev) {
                percentageForPrevPlayer = Math.round((rnd-rndOld)/MAX_RND*1000);
                // console.log(prev, percentageForPrevPlayer);
                transtions.push(percentageForPrevPlayer);
                prev = result.toNumber();
                t++;
                rndOld = rnd;
            }
        }
        percentageForPrevPlayer = Math.round((MAX_RND-rndOld)/MAX_RND*1000);
        transtions.push(percentageForPrevPlayer);
        for (t = 0; t < expectedTrans.length; t++) {
            (result.toNumber()*0 + transtions[t]).should.be.equal(expectedTrans[t]);
        }
    });

    it('throws dice array11 fine grained testing', async () => {
        // interface: throwDiceArray(uint[11] memory weights, uint rndNum)
        weights = Array.from(new Array(11), (x,i) => 100);
        r0 = 0;
        step = MAX_RND/11;
        for (p = 0; p < 11; p++) {
            r0 = Math.floor((p+1) * step);
            if (r0 > MAX_RND) r0 = MAX_RND;
            result = await engine.throwDiceArray(weights, r0).should.be.fulfilled;
            result.toNumber().should.be.equal(p);
            if (p < 10) {
                // we must be very close to the edge to get the next value, but there's always a +/- 1 indeterminacy due to rounding => add +2 to make sure
                result = await engine.throwDiceArray(weights, r0+2).should.be.fulfilled;
                result.toNumber().should.be.equal(p+1);
            }
        }
    });

    it('throws dice array11 fine grained testing for null weights', async () => {
        // when all weights are null, we expect random results
        weightsNull = Array.from(new Array(11), (x,i) => 0);
        nThrows = 10;
        expected = [ 0, 8, 6, 3, 1, 9, 7, 4, 2, 10 ];
        results = [];
        for (p = 0; p < nThrows; p++) {
            r0 = Math.floor(p*MAX_RND/nThrows);
            result = await engine.throwDiceArray(weightsNull, r0).should.be.fulfilled;
            results.push(result)//.toNumber().should.be.equal(p);
        }
        debug.compareArrays(results, expected, toNum = true);
    });

    it('throws dice array11', async () => {
        // interface: throwDiceArray(uint[11] memory weights, uint rndNum)
        weights = Array.from(new Array(11), (x,i) => 1);
        weights[8] = 1000;
        let result = await engine.throwDiceArray(weights, kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(8);
        weights[8] = 1;
        weights[9] = 1000;
        result = await engine.throwDiceArray(weights, kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(9);
        weights[9] = 1;
        weights[10] = 1000;
        result = await engine.throwDiceArray(weights, kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(10);
    });
    
    it('manages to shoot', async () => {
        // interface: managesToShoot(uint256[2] matchLogs, uint8 teamThatAttacks, uint[5][2] globSkills, uint rndNum)
        let globSkills = [[100,100,100,100,100], [1,1,1,1,1]];
        const matchLogs = [0, 0];
        let result = await engine.managesToShoot(matchLogs, 0, globSkills, kMaxRndNumHalf).should.be.fulfilled;
        result.should.be.equal(true);
        result = await engine.managesToShoot(matchLogs, 1, globSkills, kMaxRndNumHalf).should.be.fulfilled;
        result.should.be.equal(false);
        globSkills = [[1,1,1,1,1], [100,100,100,100,100]];
        result = await engine.managesToShoot(matchLogs, 0, globSkills, kMaxRndNumHalf).should.be.fulfilled;
        result.should.be.equal(false);
        result = await engine.managesToShoot(matchLogs, 1, globSkills, kMaxRndNumHalf).should.be.fulfilled;
        result.should.be.equal(true);
    });

    it('effect of masacre in manages to shoot', async () => {
        // interface: managesToShoot(uint256[2] matchLogs, uint8 teamThatAttacks, uint[5][2] globSkills, uint rndNum)
        globSkills = [[1000,1000,1000,1000,1000], [1000,1000,1000,1000,1000]];
        rnd = Math.floor(MAX_RND * 0.7);
        result = await engine.managesToShoot(logs = [0, 0], teamThatAttacks = 0, globSkills, rnd).should.be.fulfilled;
        result.should.be.equal(true);
        logMasacre = await precomp.addNGoals(log = 0, nGoals = 2).should.be.fulfilled;
        result = await engine.managesToShoot(logs = [logMasacre, 0], teamThatAttacks = 0, globSkills, rnd).should.be.fulfilled;
        result.should.be.equal(false);
        logMasacre = await precomp.addNGoals(log = 0, nGoals = 3).should.be.fulfilled;
        result = await engine.managesToShoot(logs = [logMasacre, 0], teamThatAttacks = 0, globSkills, rnd).should.be.fulfilled;
        result.should.be.equal(false);
        logMasacre = await precomp.addNGoals(log = 0, nGoals = 15).should.be.fulfilled;
        result = await engine.managesToShoot(logs = [logMasacre, 0], teamThatAttacks = 0, globSkills, rnd).should.be.fulfilled;
        result.should.be.equal(false);
    });


    it('throws dice', async () => {
        // interface: throwDice(uint weight1, uint weight2, uint rndNum)
        let result = await engine.throwDice(1,10,kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        result = await engine.throwDice(10,1,kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        result = await engine.throwDice(10,10,kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        result = await engine.throwDice(10,10,2*kMaxRndNumHalf).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
    });


    it('gets n rands from a seed', async () => {
        ROUNDS_PER_MATCH = await engine.ROUNDS_PER_MATCH().should.be.fulfilled
        const result = await engine.getNRandsFromSeed(seed, 4*ROUNDS_PER_MATCH).should.be.fulfilled;
        expectLen = 4*ROUNDS_PER_MATCH.toNumber();
        result.length.should.be.equal(expectLen);
        prevRnds = [];
        // checks that all rnds are actually different:
        for (r = 0; r < result.length; r++) {
            for (prev = 0; prev < prevRnds.length; prev++){
                result[r].should.be.bignumber.not.equal(prevRnds[prev]);
            }
            prevRnds.push(result[r]);
        }
        result[0].should.be.bignumber.equal("32690506113");
        result[expectLen-1].should.be.bignumber.equal("62760289461");
    });

    it('computes team global skills by aggregating across all players in team', async () => {
        // If all skills where 1 for all players, and tactics = 442 =>
        // 0. move2attack =    defence(defenders + 2*midfields + attackers) +
        //                      speed(defenders + 2*midfields) +
        //                      pass(2*defenders + 3*midfields + 1/3*GK)
        //                =     14 + 12 + 20 = 46 =   4 * nDefs + 7 * nMid + nAtt + 1/3
        // 1. createShoot =    speed(attackers + 1/5 mids) + pass(attackers + 1/5 mids)  = 2 * nAtt + 2/5 nMids
        // 2. defendShoot =    speed(defenders + 1/5 mids + 1/3) + defence(defenders +1/5 mids) = 4 + 4 = 2 * nDef + 2/5 nMids + 1/3
        // 3. blockShoot  =    shoot(keeper); 1
        // 4. endurance   =    70;
        // attackersSpeed = [1,1]
        // attackersShoot = [1,1]
        
        nDef = 4;
        nMid = 4;
        nAtt = 2;
        teamState442 = await createTeamState442(engine, forceSkills= [1,1,1,1,1]).should.be.fulfilled;
        globSkills = await precomp.getTeamGlobSkills(teamState442,  tactics442, isBotHome).should.be.fulfilled;
        expectedGlob =[ 
            4 * nDef + 7 * nMid + nAtt, 
            2 * nAtt, 
            2 * nDef, 
            1, 
            1
        ];
        debug.compareArrays(globSkills, expectedGlob, toNum = true);

        // // show that GKs contribute 1/3 extra to move2attack and defendShoot, only when int division by 3 is not zero :-)
        teamState442 = await createTeamState442(engine, forceSkills= [3,3,3,3,3]).should.be.fulfilled;
        globSkills = await precomp.getTeamGlobSkills(teamState442, tactics442, isBotHome).should.be.fulfilled;
        expectedGlob =[ 
            3 * (4 * nDef + 7 * nMid + nAtt) + 1, // adding 3/3 from GK 
            3 * (2 * nAtt) + 4,   // adding (3*2*nMids)/5
            3 * (2 * nDef) + 1 + 4,   // adding 3/3 from GK + (3*2*nMids)/5
            3 * 1, 
            1
        ];
        debug.compareArrays(globSkills, expectedGlob, toNum = true);

        teamState442 = await createTeamState442(engine, forceSkills= [1,1,1,1,1000-1]).should.be.fulfilled;
        globSkills = await precomp.getTeamGlobSkills(teamState442, tactics442, isBotHome).should.be.fulfilled;
        expectedGlob = [46, 4, 8, 1, 65];
        debug.compareArrays(globSkills, expectedGlob, toNum = true);

        teamState442 = await createTeamState442(engine, forceSkills= [1,1,1,1,1000]).should.be.fulfilled;
        globSkills = await precomp.getTeamGlobSkills(teamState442, tactics442, isBotHome).should.be.fulfilled;
        expectedGlob = [46, 4, 8, 1, 65];
        debug.compareArrays(globSkills, expectedGlob, toNum = true);

        teamState442 = await createTeamState442(engine, forceSkills= [1,1,1,1,20000-1]).should.be.fulfilled;
        globSkills = await precomp.getTeamGlobSkills(teamState442, tactics442, isBotHome).should.be.fulfilled;
        expectedGlob = [46, 4, 8, 1, 100];
        debug.compareArrays(globSkills, expectedGlob, toNum = true);

    });

    it('getLinedUpSkillsAndOutOfGames', async () => {
        teamState442 = await createTeamState442(engine, forceSkills= [1,1,1,1,1]).should.be.fulfilled;
        result = await engine.getLinedUpSkillsAndOutOfGames(teamState442, tactics1, is2ndHalf, log = [0,0], seed, isBotHome).should.be.fulfilled;
        let {0: matchLog, 1: states} = result;
        for (p = 0; p < 11; p++) states[p].should.be.bignumber.equal(teamState442[lineupConsecutive[p]]);
    });

    it('play match with wrong tactic', async () => {
        tacticsWrong = await engine.encodeTactics(substitutions, subsRounds, lineup1, extraAttackNull, tacticIdTooLarge = 6);
        await engine.playHalfMatch(seed, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics1, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        var {0: log, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half1, teamStateAll50Half1], [tacticsWrong, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        err.toNumber().should.be.equal(Err.ERR_PLAYHALF_PLAYER_TWICE);
    });

    it('play match with no players at all in one team', async () => {
        // when a team has no players it should lose by the max amount possible (= 12 ROUNDS)
        states = Array.from(new Array(PLAYERS_PER_TEAM_MAX), (x,i) => 0); 
        var {0: matchLog, 1: err} = await engine.playHalfMatch(seed, now, [states, teamStateAll50Half1], [tactics1, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expectedResult = [0, 12];
        result = []
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        // and viceversa:
        debug.compareArrays(result, expectedResult, toNum = true);
        var {0: matchLog, 1: err} = await engine.playHalfMatch(seed, now, [teamStateAll50Half1, states], [tactics1, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expectedResult = [12, 0];
        result = []
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);
    });


    it('different team state => different result', async () => {
        var {0: matchLog, 1: err} = await engine.playHalfMatch(123456, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expectedResult = [2, 2];
        result = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);

        var {0: matchLog, 1: err} = await engine.playHalfMatch(123456, now, [teamStateAll50Half1, teamStateAll1Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expectedResult = [11, 0];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            nGoals.toNumber().should.be.equal(expectedResult[team]);
        }
    });
    
    it('effect of isBot on results', async () => {
        // bots typically play 541
        teamStateAll1000Half1 = await createTeamStateFromSinglePlayer([1000, 1000, 1000, 1000, 1000], engine, forwardness = 3, leftishness = 2, aligned = [false, false]).should.be.fulfilled;
        tactics541 = await engine.encodeTactics(substitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, substitutions), 
            extraAttackNull, tact = 1).should.be.fulfilled;

        totalGoals = [0,0];
        expectedTotal = [10,5];
        for (p = 0; p < 5; p++) {
            sed = web3.utils.toBN(web3.utils.keccak256("32123" + p));
            var {0: matchLog, 1: err} = await engine.playHalfMatch(sed, now, [teamStateAll1000Half1, teamStateAll1000Half1], [tactics0, tactics541], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, false, true]).should.be.fulfilled;
            for (team = 0; team < 2; team++) {
                nGoals = await encodingLog.getNGoals(matchLog[team]);
                totalGoals[team] += nGoals.toNumber();
            }
        }
        debug.compareArrays(totalGoals, expectedTotal, toNum = false);
    });
    
    it('if both teams are bots, or humans, results are the same; if they are different, results change', async () => {
        // both humans
        var {0: matchLog, 1: err} = await engine.playHalfMatch(123456, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, false, false]).should.be.fulfilled;
        expectedResult = [2, 2];
        result = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);

        // both bots
        var {0: matchLog, 1: err} = await engine.playHalfMatch(123456, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, true, true]).should.be.fulfilled;
        expectedResult = [2, 2];
        result = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);

        // bot vs human
        var {0: matchLog, 1: err} = await engine.playHalfMatch(123456, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, true, false]).should.be.fulfilled;
        expectedResult = [1, 2];
        result = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);

        // human vs bot
        var {0: matchLog, 1: err} = await engine.playHalfMatch(123456, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, false, true]).should.be.fulfilled;
        expectedResult = [3, 1];
        result = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);
        

    });

    it('different seeds => different result', async () => {
        var {0: matchLog, 1: err} = await engine.playHalfMatch(123456, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expectedResult = [2, 2];
        result = [];
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);

        var {0: matchLog, 1: err} = await engine.playHalfMatch(654322, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
        expectedResult = [2, 3];
        result = []
        for (team = 0; team < 2; team++) {
            nGoals = await encodingLog.getNGoals(matchLog[team]);
            result.push(nGoals);
        }
        debug.compareArrays(result, expectedResult, toNum = true);
        // for each event: 0: teamThatAttacks, 1: managesToShoot, 2: shooter, 3: isGoal, 4: assister
        expected = [ 
            1, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 
            1, 1, 7, 1, 9, 
            0, 0, 0, 0, 0, 
            0, 1, 8, 1, 5, 
            1, 0, 0, 0, 0, 
            0, 1, 10, 1, 10, 
            1, 0, 0, 0, 0, 
            1, 0, 0, 0, 0, 
            1, 1, 8, 1, 8, 
            1, 1, 10, 1, 6, 
            1, 0, 0, 0, 0 
        ];
        goals = [0,0];
        for (i=0;i< expected.length/5;i++) goals[expected[5*i]] += expected[5*i+3] + 0*result[0] ;
        debug.compareArrays(matchLog.slice(2), expected, toNum = true);
        debug.compareArrays(goals, expectedResult, toNum = false);
    });
    
    
    it('extra attack influence', async () => {
        const extraAttackFull =  Array.from(new Array(10), (x,i) => true);
        tactics0Attack = await engine.encodeTactics(substitutions, subsRounds, setNoSubstInLineUp(lineupConsecutive, substitutions), 
            extraAttackFull, tacticId442).should.be.fulfilled;
        resultsNoExtra = [];
        resultsExtra = [];
        for (n = 0; n < 10; n++) {
            sed = web3.utils.toBN(web3.utils.keccak256("32123" + n));
            var {0: matchLogNoExtra, 1: err} = await engine.playHalfMatch(sed, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
            for (team = 0; team < 2; team++) {
                nGoals = await encodingLog.getNGoals(matchLogNoExtra[team]);
                resultsNoExtra.push(nGoals.toNumber());
            }
            var {0: matchLogExtra, 1: err} = await engine.playHalfMatch(sed, now, [teamStateAll50Half1, teamStateAll50Half1], [tactics0Attack, tactics1], firstHalfLog, [is2ndHalf, isHomeStadium, isPlayoff, isBotHome, isBotAway]).should.be.fulfilled;
            for (team = 0; team < 2; team++) {
                nGoals = await encodingLog.getNGoals(matchLogExtra[team]);
                resultsExtra.push(nGoals.toNumber());
            }
        }
        expectedNoExtra = [ 2, 2, 3, 3, 0, 2, 0, 4, 0, 0, 2, 3, 3, 1, 3, 1, 0, 2, 2, 3 ];
        expectedExtra = [3, 3, 3, 3, 0, 3, 0, 4, 2, 0, 2, 3, 3, 2, 3, 1, 1, 3, 3, 2];
        debug.compareArrays(resultsNoExtra, expectedNoExtra, toNum = false);
        debug.compareArrays(resultsExtra, expectedExtra, toNum = false);
        
        // note that these two are different:
        expectedExtra   = [ 1, 0, 0, 0, 0, 0, 1, 9, 1, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 7, 1, 10, 0, 0, 0, 0, 0, 1, 1, 8, 1, 8, 0, 1, 9, 1, 2, 0, 1, 8, 1, 5 ];
        expectedNoExtra = [ 1, 0, 0, 0, 0, 0, 1, 9, 1, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 7, 1, 10, 0, 0, 0, 0, 0, 1, 1, 8, 1, 8, 0, 1, 10, 1, 5, 1, 1, 9, 1, 8 ];   
        debug.compareArrays(matchLogExtra.slice(2), expectedExtra, toNum = true);
        debug.compareArrays(matchLogNoExtra.slice(2), expectedNoExtra, toNum = true);
    });
});