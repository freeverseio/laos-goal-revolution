/*
 Tests for all functions in EncodingSkills.sol and contracts inherited by it
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();

const fs = require('fs');
const debug = require('../utils/debugUtils.js');

const ConstantsGetters = artifacts.require('ConstantsGetters');
const Encoding = artifacts.require('EncodingSkills');
const EncodingTact = artifacts.require('EncodingTactics');
const EncodingSet = artifacts.require('EncodingSkillsSetters');
const EncodingGet = artifacts.require('EncodingSkillsGetters');
const Utils = artifacts.require('Utils');

async function skillsWrapper(skills) {
    var result = {
        encodedSkills: skills.toString(),
        skills: [],
        birthday: 0,
        isSpecial: false,
        playerIdFromSkills: "",
        internalPlayerId: "",
        potential: 0,
        forwardness: 0,
        leftishness: 0,
        aggressiveness: 0,
        alignedEndOfFirstHalf: false,
        redCardLastGame: false,
        gamesNonStopping: 0,
        injuryWeeksLeft: 0,
        substitutedFirstHalf: false,
        sumOfSkills: 0,
        generation: 0,
        outOfGameFirstHalf: false,
        yellowCardFirstHalf: false
    }
    for (sk = 0; sk < 5; sk++) {result.skills[sk] = Number(await encodingGet.getSkill(skills, sk).should.be.fulfilled);}
    result.birthday = Number(await encodingGet.getBirthDay(skills).should.be.fulfilled);
    result.isSpecial = await encodingGet.getIsSpecial(skills).should.be.fulfilled;
    result.playerIdFromSkills = String(await encodingGet.getPlayerIdFromSkills(skills).should.be.fulfilled);
    result.internalPlayerId = String(await encodingGet.getInternalPlayerId(skills).should.be.fulfilled);
    result.potential = Number(await encodingGet.getPotential(skills).should.be.fulfilled);
    result.forwardness = Number(await encodingGet.getForwardness(skills).should.be.fulfilled);
    result.leftishness = Number(await encodingGet.getLeftishness(skills).should.be.fulfilled);
    result.aggressiveness = Number(await encodingGet.getAggressiveness(skills).should.be.fulfilled);
    result.alignedEndOfFirstHalf = await encodingGet.getAlignedEndOfFirstHalf(skills).should.be.fulfilled;
    result.redCardLastGame = await encodingGet.getRedCardLastGame(skills).should.be.fulfilled;
    result.gamesNonStopping = Number(await encodingGet.getGamesNonStopping(skills).should.be.fulfilled);
    result.injuryWeeksLeft = Number(await encodingGet.getInjuryWeeksLeft(skills).should.be.fulfilled);
    result.substitutedFirstHalf = await encodingGet.getSubstitutedFirstHalf(skills).should.be.fulfilled;
    result.sumOfSkills = Number(await encodingGet.getSumOfSkills(skills).should.be.fulfilled);
    result.generation = Number(await encodingGet.getGeneration(skills).should.be.fulfilled);
    result.outOfGameFirstHalf = await encodingGet.getOutOfGameFirstHalf(skills).should.be.fulfilled;
    result.yellowCardFirstHalf = await encodingGet.getYellowCardFirstHalf(skills).should.be.fulfilled;
    return result;
}

function BNArrayToNumber(BNArray) {
    numbers = [];
    for (big of BNArray) { numbers.push(Number(big))}
    return numbers;
}

async function tacticsWrapper(tactics) {
    const {0: subs, 1: roun, 2: line, 3: attk, 4: tact} = await utils.decodeTactics(encoded).should.be.fulfilled;

    const result = {
        encodedTactics: tactics.toString(),
        tacticsId: Number(tact),
        extraAttack: attk, // length 10
        substitution: BNArrayToNumber(subs), // length 3
        subsRound: BNArrayToNumber(roun), // length 3
        linedUp: BNArrayToNumber(line), // length 14
    }
    return result;
}

contract('EncodingSkills', (accounts) => {

    const it2 = async(text, f) => {};

    beforeEach(async () => {
        constants = await ConstantsGetters.new().should.be.fulfilled;
        encoding = await Encoding.new().should.be.fulfilled;
        utils = await Utils.new().should.be.fulfilled;
        encodingSet = await EncodingSet.new().should.be.fulfilled;
        encodingGet = await EncodingGet.new().should.be.fulfilled;
        encodingTact = await EncodingTact.new().should.be.fulfilled;
    });


    it('encodeTactics incorrect lineup', async () =>  {
        PLAYERS_PER_TEAM_MAX = await constants.get_PLAYERS_PER_TEAM_MAX().should.be.fulfilled;
        PLAYERS_PER_TEAM_MAX = PLAYERS_PER_TEAM_MAX.toNumber();
        lineup = Array.from(new Array(14), (x,i) => i);
        substitutions = [4,10,2];
        subsRounds = [3,7,1];
        extraAttack = Array.from(new Array(10), (x,i) => (i%2 == 1 ? true: false));
        encoded = await encodingTact.encodeTactics(substitutions, subsRounds, lineup, extraAttack, tacticsId = 2).should.be.fulfilled;
        lineup[0] = PLAYERS_PER_TEAM_MAX;
        encoded = await encodingTact.encodeTactics(substitutions, subsRounds, lineup, extraAttack, tacticsId = 2).should.be.fulfilled;
    })
    
    it('encodeTactics', async () =>  {
        toWrite = [];

        PLAYERS_PER_TEAM_MAX = await constants.get_PLAYERS_PER_TEAM_MAX().should.be.fulfilled;
        PLAYERS_PER_TEAM_MAX = PLAYERS_PER_TEAM_MAX.toNumber();
        lineup = Array.from(new Array(14), (x,i) => i);
        substitutions = [4,10,2];
        subsRounds = [3,7,1];
        extraAttack = Array.from(new Array(10), (x,i) => (i%2 == 1 ? true: false));
        encoded = await encodingTact.encodeTactics(substitutions, subsRounds, lineup, extraAttack, tacticsId = 2).should.be.fulfilled;
        
        await toWrite.push(await tacticsWrapper(encoded));

        decoded = await utils.decodeTactics(encoded).should.be.fulfilled;

        let {0: subs, 1: roun, 2: line, 3: attk, 4: tact} = decoded;
        tact.toNumber().should.be.equal(tacticsId);
        for (p = 0; p < 14; p++) {
            line[p].toNumber().should.be.equal(lineup[p]);
        }
        for (p = 0; p < 10; p++) {
            attk[p].should.be.equal(extraAttack[p]);
        }
        for (p = 0; p < 3; p++) {
            subs[p].toNumber().should.be.equal(substitutions[p]);
            roun[p].toNumber().should.be.equal(subsRounds[p]);
        }


        fs.writeFileSync('test/testdata/encodingTacticsTestData.json', JSON.stringify(toWrite), function(err) {
            if (err) {
                console.log(err);
            }
        });
        writtenData = fs.readFileSync('test/testdata/encodingTacticsTestData.json', 'utf8');
        assert.equal(
            web3.utils.keccak256(writtenData),
            "0x92085e7390d3d97bf5ab567bc5a4dd98c2350e04db22f11340f958e0239a7e58",
            "written testdata for encoding tactics does not match expected result"
        );
        
        // // try to provide a tacticsId beyond range
        encoded = await encodingTact.encodeTactics(substitutions, subsRounds, lineup, extraAttack, tacticsId = 64).should.be.rejected;
        // try to provide a lineup beyond range
        lineupWrong = lineup;
        lineupWrong[4] = PLAYERS_PER_TEAM_MAX + 1;
        encoded = await encodingTact.encodeTactics(substitutions, subsRounds, lineupWrong, extraAttack, tacticsId = 2).should.be.rejected;
    });

    it('encoding and decoding skills', async () => {
        const writeMode = false;
        toWrite = [];

        sk = [2**16 - 16383, 2**16 - 13, 2**16 - 4, 2**16 - 56, 2**16 - 456]
        sumSkills = sk.reduce((a, b) => a + b, 0);

        skills = await encoding.encodePlayerSkills(
            sk,
            dayOfBirth = 2**16-1, 
            generation = 2**8-1,
            playerId = 2**43-1,
            [potential = 9,
            forwardness = 5,
            leftishness = 7,
            aggressiveness = 7],
            alignedEndOfFirstHalf = true,
            redCardLastGame = true,
            gamesNonStopping = 6,
            injuryWeeksLeft = 6,
            substitutedFirstHalf = true,
            sumSkills
        ).should.be.fulfilled;

        skills.should.be.bignumber.equal('13113566945151332165817391379934887555794724631714026444777635841');

        N_SKILLS = 5;
        resultSkills = [];
        for (s = 0; s < N_SKILLS; s++) {
            result = await encodingGet.getSkill(skills, s).should.be.fulfilled;
            resultSkills.push(result);
        }
        debug.compareArrays(resultSkills, sk, toNum = true);

        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}

        result = await encodingGet.getBirthDay(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(dayOfBirth);
        result = await encodingGet.getPotential(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(potential);
        result = await encodingGet.getForwardness(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(forwardness);
        result = await encodingGet.getLeftishness(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(leftishness);
        result = await encodingGet.getAggressiveness(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(aggressiveness);
        result = await encodingGet.getPlayerIdFromSkills(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(playerId);
        result = await encodingGet.getAlignedEndOfFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(alignedEndOfFirstHalf);
        result = await encodingGet.getRedCardLastGame(skills).should.be.fulfilled;
        result.should.be.equal(redCardLastGame);

        result = await encodingGet.getGamesNonStopping(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(gamesNonStopping);
        gamesNonStopping = 7;        
        skills = await encodingSet.setGamesNonStopping(skills, gamesNonStopping).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getGamesNonStopping(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(gamesNonStopping);
        skillsdummy = await encodingSet.setGamesNonStopping(skills, 8).should.be.rejected;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}

        skills = await encodingSet.setPotential(skills, potential+1).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getPotential(skills).should.be.fulfilled;
        potential = potential + 1;
        result.toNumber().should.be.equal(potential);

        result = await encodingGet.getInjuryWeeksLeft(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(injuryWeeksLeft);

        result = await encodingGet.getSubstitutedFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(substitutedFirstHalf);
        substitutedFirstHalf = !substitutedFirstHalf;
        skills = await encodingSet.setSubstitutedFirstHalf(skills, substitutedFirstHalf).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getSubstitutedFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(substitutedFirstHalf);

        result = await encodingGet.getSumOfSkills(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(sumSkills);
        result = await encodingGet.getGeneration(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(generation);
        
        result =  await encodingGet.getIsSpecial(skills).should.be.fulfilled;
        result.should.be.equal(false);
        skills2 = await encodingSet.addIsSpecial(skills).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills2))}
        result =  await encodingGet.getIsSpecial(skills2).should.be.fulfilled;
        result.should.be.equal(true);
        
        sk = [2**16 - 43, 2**16 - 567, 0, 2**16 - 356, 2**16 - 4556]
        sumSkills = sk.reduce((a, b) => a + b, 0);
        for (s = 0; s < N_SKILLS; s++) {
            skills = await encodingSet.setSkill(skills, sk[s], s).should.be.fulfilled;
        }
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        resultSkills = [];
        for (s = 0; s < N_SKILLS; s++) {
            result = await encodingGet.getSkill(skills, s).should.be.fulfilled;
            resultSkills.push(result);
        }
        debug.compareArrays(resultSkills, sk, toNum = true);

        alignedEndOfFirstHalf = !alignedEndOfFirstHalf;
        skills = await encodingSet.setAlignedEndOfFirstHalf(skills, alignedEndOfFirstHalf).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getAlignedEndOfFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(alignedEndOfFirstHalf);

        alignedEndOfFirstHalf = !alignedEndOfFirstHalf;
        skills = await encodingSet.setAlignedEndOfFirstHalf(skills, alignedEndOfFirstHalf).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getAlignedEndOfFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(alignedEndOfFirstHalf);
        
        redCardLastGame = !redCardLastGame;
        skills = await encodingSet.setRedCardLastGame(skills, redCardLastGame).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getRedCardLastGame(skills).should.be.fulfilled;
        result.should.be.equal(redCardLastGame);

        redCardLastGame = !redCardLastGame;
        skills = await encodingSet.setRedCardLastGame(skills, redCardLastGame).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getRedCardLastGame(skills).should.be.fulfilled;
        result.should.be.equal(redCardLastGame);
        
        injuryWeeksLeft -= 2;
        skills = await encodingSet.setInjuryWeeksLeft(skills, injuryWeeksLeft).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getInjuryWeeksLeft(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(injuryWeeksLeft);

        injuryWeeksLeft += 1;
        skills = await encodingSet.setInjuryWeeksLeft(skills, injuryWeeksLeft).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getInjuryWeeksLeft(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(injuryWeeksLeft);

        skills = await encodingSet.setSumOfSkills(skills, sumSkills);
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getSumOfSkills(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(sumSkills);
        
        generation -= 2;
        skills = await encodingSet.setGeneration(skills, generation).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getGeneration(skills).should.be.fulfilled;
        result.toNumber().should.be.equal(generation);

        result = await encodingGet.getOutOfGameFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(false);
        skills = await encodingSet.setOutOfGameFirstHalf(skills, true).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getOutOfGameFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(true);
        skills = await encodingSet.setOutOfGameFirstHalf(skills, false).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getOutOfGameFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(false);
        outOfGameFirstHalf = true;
        skills = await encodingSet.setOutOfGameFirstHalf(skills, outOfGameFirstHalf).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        
        result = await encodingGet.getYellowCardFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(false);
        skills = await encodingSet.setYellowCardFirstHalf(skills, true).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getYellowCardFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(true);
        skills = await encodingSet.setYellowCardFirstHalf(skills, false).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        result = await encodingGet.getYellowCardFirstHalf(skills).should.be.fulfilled;
        result.should.be.equal(false);
        yellowCardFirstHalf = true;
        skills = await encodingSet.setYellowCardFirstHalf(skills, yellowCardFirstHalf).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await skillsWrapper(skills))}
        
        if (writeMode) {
            fs.writeFileSync('test/testdata/encodingSkillsTestData.json', JSON.stringify(toWrite), function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }             
        
        writtenData = fs.readFileSync('test/testdata/encodingSkillsTestData.json', 'utf8');
        assert.equal(
            web3.utils.keccak256(writtenData),
            "0xbd72acbf45e55931ee3847debd3ede92c6b68453c22e077786b7530f1528a8de",
            "written testdata for encoding skills does not match expected result"
        );
        

        // testing full decode
        const {0: _skills, 1: _day, 2: _traits, 3: _playerId, 4: _alignedSubstRed, 5: _genNonstopInj} = await utils.fullDecodeSkills(skills).should.be.fulfilled     
        _day.toNumber().should.be.equal(dayOfBirth);
        _playerId.toNumber().should.be.equal(playerId);
        debug.compareArrays(_skills, sk, toNum = true);
        expectedTraits = [potential, forwardness, leftishness, aggressiveness];
        debug.compareArrays(_traits, expectedTraits, toNum = true);
        expectedBools = [alignedEndOfFirstHalf, substitutedFirstHalf, redCardLastGame, outOfGameFirstHalf, yellowCardFirstHalf];
        debug.compareArrays(_alignedSubstRed, expectedBools, toNum = false);
        expectedGenGameInj = [generation, gamesNonStopping, injuryWeeksLeft];
        debug.compareArrays(_genNonstopInj, expectedGenGameInj, toNum = true);
    });

    it('encoding skills with wrong forwardness and leftishness', async () =>  {
        sk = [16383, 13, 4, 56, 456];
        dayOfBirth = 4;
        generation = 2;
        playerId = 143;
        potential = 5;
        aggr = 2;
        alignedEndOfFirstHalf = true;
        redCardLastGame = true;
        gamesNonStopping = 2;
        injuryWeeksLeft = 6;
        substitutedFirstHalf = true;
        sumSkills = sk.reduce((a, b) => a + b, 0);
        // leftishness = 0 only possible for goalkeepers:
        await encoding.encodePlayerSkills(sk, dayOfBirth, generation, playerId, [potential, forwardness = 0, leftishness = 0, aggr],
            alignedEndOfFirstHalf, redCardLastGame, gamesNonStopping, injuryWeeksLeft, substitutedFirstHalf, sumSkills).should.be.fulfilled;
        await encoding.encodePlayerSkills(sk, dayOfBirth, generation, playerId, [potential, forwardness = 1, leftishness = 0, aggr],
            alignedEndOfFirstHalf, redCardLastGame, gamesNonStopping, injuryWeeksLeft, substitutedFirstHalf, sumSkills).should.be.rejected;
        // forwardness is 5 at max:
        await encoding.encodePlayerSkills(sk, dayOfBirth, generation, playerId, [potential, forwardness = 5, leftishness = 1, aggr],
            alignedEndOfFirstHalf, redCardLastGame, gamesNonStopping, injuryWeeksLeft, substitutedFirstHalf, sumSkills).should.be.fulfilled;
        await encoding.encodePlayerSkills(sk, dayOfBirth, generation, playerId, [potential, forwardness = 6, leftishness = 1, aggr],
            alignedEndOfFirstHalf, redCardLastGame, gamesNonStopping, injuryWeeksLeft, substitutedFirstHalf, sumSkills).should.be.rejected;
        // leftishness is 7 at max:
        await encoding.encodePlayerSkills(sk, dayOfBirth, generation, playerId, [potential, forwardness = 5, leftishness = 7, aggr],
            alignedEndOfFirstHalf, redCardLastGame, gamesNonStopping, injuryWeeksLeft, substitutedFirstHalf, sumSkills).should.be.fulfilled;
        await encoding.encodePlayerSkills(sk, dayOfBirth, generation, playerId, [potential, forwardness = 5, leftishness = 8, aggr],
            alignedEndOfFirstHalf, redCardLastGame, gamesNonStopping, injuryWeeksLeft, substitutedFirstHalf, sumSkills).should.be.rejected;
    });
    
});