/*
 Tests for all functions in Privileged.sol
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();
const Privileged = artifacts.require('Privileged');
const Utils = artifacts.require('Utils');
const debug = require('../utils/debugUtils.js');
const { isBigNumber } = require('web3-utils');


function getLevel(skills) {
    var level = 0;
    for (sk of skills) {
        level += Math.ceil(sk.toNumber()/1000);
    }
    return level;
}

contract('Privileged', (accounts) => {
    let privileged = null;
    const epochInDays = 18387; // May 5th 2020
    const tz = 1;
    const countryIdxInTz = 1;

    const it2 = async(text, f) => {};

    function secsToDays(secs) {
        return secs/ (24 * 3600);
    }
    
    function dayOfBirthToAgeYears(dayOfBirth, nowInDays){ 
        ageYears = (nowInDays - dayOfBirth)*14/365;
        return ageYears;
    }
    
    beforeEach(async () => {
        privileged = await Privileged.new().should.be.fulfilled;
        utils = await Utils.new().should.be.fulfilled;
    });

    it('create batch of world players', async () => {
        const playerValue = 3000;
        const seed = 4;
        const nPlayersPerForwardPos = [1, 2, 3, 4];
        const epochDays = Math.floor(1588668910 / (3600 * 24));
        const timezone = 1;
        const countryIdxInTz = 0;
        const maxPotential = 9;
        await privileged.createBuyNowPlayerIdBatch(
            playerValue,
            maxPotential,
            seed,
            nPlayersPerForwardPos,
            epochDays,
            timezone,
            countryIdxInTz,
        ).should.be.fulfilled;
    });
    
    it('creating buyNow players: ageModifier', async () =>  {
        mods = [];
        for (age = 16; age < 38; age += 3) {
            mod = await privileged.ageModifier(age).should.be.fulfilled;
            mods.push(mod);
        }
        expectedMods = [ 17000, 15602, 14204, 12806, 11408, 10000, 7600, 5200 ];
        debug.compareArrays(mods, expectedMods, toNum = true);
    });

    it('creating buyNow players: potentialModifier', async () =>  {
        mods = [];
        for (pot = 0; pot < 10; pot++) {
            mod = await privileged.potentialModifier(pot).should.be.fulfilled;
            mods.push(mod);
        }
        expectedMods = [ 5000, 6200, 7400, 8600, 9800, 11000, 12200, 13400, 14600, 15800 ];
        debug.compareArrays(mods, expectedMods, toNum = true);
    });
    
    it('creating one buyNow player', async () =>  {
        expectedSkills = [ 2325, 1468, 1646, 1333, 2358 ];
        expectedTraits = [0, 3, 6, 2];
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        var {0: skills, 1: ageYears, 2: traits, 3: internalId} = await privileged.createBuyNowPlayerIdPure(playerValue = 1000, maxPot = 9, seed, forwardPos = 3, tz, countryIdxInTz).should.be.fulfilled;
        // compare actual values
        debug.compareArrays(skills, expectedSkills, toNum = true);
        ageYears.toNumber().should.be.equal(29);
        debug.compareArrays(traits, expectedTraits, toNum = true);
        internalId.should.be.bignumber.equal("275260863937");
        // check that the average skill is as expected:
        expectedAvgSkill = await privileged.computeAvgSkills(playerValue, ageYears, traits[0]).should.be.fulfilled;
        sumSkills = expectedSkills.reduce((a, b) => a + b, 0);
        (Math.abs(expectedAvgSkill.toNumber() - sumSkills/5) < 20).should.be.equal(true);
        
        // test that you get the same via the non-pure function:
        var {0: finalId, 1: skills2, 2: dayOfBirth, 3: traits2, 4: internalId2} = await privileged.createBuyNowPlayerId(playerValue = 1000, maxPot = 9, seed, forwardPos = 3, epochInDays, tz, countryIdxInTz).should.be.fulfilled;
        debug.compareArrays(skills2, expectedSkills, toNum = true);
        debug.compareArrays(traits2, expectedTraits, toNum = true);
        internalId2.should.be.bignumber.equal(internalId);
        now = epochInDays*24*3600;
        expectedDayOfBirth = Math.floor(secsToDays(now) - ageYears*365/14);
        (Math.abs(dayOfBirth.toNumber() - expectedDayOfBirth) < 14).should.be.equal(true);
        
    });

    it('creating buyNow players scales linearly with value, while other data remains the same', async () =>  {
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        var {0: skills, 1: ageYears, 2: traits, 3: internalId} = await privileged.createBuyNowPlayerIdPure(playerValue = 1000, maxPot = 9, seed, forwardPos = 3, tz, countryIdxInTz).should.be.fulfilled;
        var {0: skills2, 1: ageYears2, 2: traits2, 3: internalId2} = await privileged.createBuyNowPlayerIdPure(playerValue = 2000, maxPot = 9, seed, forwardPos = 3, tz, countryIdxInTz).should.be.fulfilled;
        for (s = 0; s < skills.length; s++) {
            (Math.abs(skills2[s].toNumber() - 2*skills[s].toNumber()) < 20).should.be.equal(true);
        }
        for (t = 0; t < traits.length; t++) {
            traits2[t].toNumber().should.be.equal(traits[t].toNumber());
        }
        internalId2.should.be.bignumber.equal(internalId);
        ageYears.should.be.bignumber.equal(ageYears2);
    });

    it('creating a batch of buyNow players', async () =>  {
        expectedSkills = [ 665, 912, 1048, 615, 848 ];
        expectedTraits = [ 3, 3, 3, 1 ];
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        const nPlayersPerForwardPos = [0,0,0,2];
        var {0: playerIdArray, 1: skillsArray, 2: dayOfBirthArray, 3: traitsArray, 4: internalIdArray} = await privileged.createBuyNowPlayerIdBatch(
            playerValue = 1000, maxPot = 9, seed, nPlayersPerForwardPos, epochInDays, tz, countryIdxInTz
        ).should.be.fulfilled;

        // checking that the values of the player props can be extracted from playerId only
        for (p = 0; p < playerIdArray.length; p++) {
            var {0: _skills, 1: _day, 2: _traits, 3: _playerId, 4: _alignedSubstRed, 5: _genNonstopInj} = await utils.fullDecodeSkills(playerIdArray[p]).should.be.fulfilled     
            _day.should.be.bignumber.equal(dayOfBirthArray[p]);
            debug.compareArrays(skillsArray[p], _skills, toNum = false, isBig = true);
            debug.compareArrays(traitsArray[p], _traits, toNum = false, isBig = true);
            debug.compareArrays([false, false, false, false, false], _alignedSubstRed, toNum = false);
            for (i = 0; i < _genNonstopInj.length; i++) { _genNonstopInj[i].toNumber().should.be.equal(0); }
        }

        // compare actual values
        debug.compareArrays(skillsArray[0], expectedSkills, toNum = true);
        debug.compareArrays(traitsArray[0], expectedTraits, toNum = true);
        internalIdArray[0].should.be.bignumber.equal("275195391431");
        internalIdArray[1].should.not.be.bignumber.equal("275195391431");
      
        // testing that they are created with the expected country and tz:
        var {0: tz2, 1: countryIdxInTz2} = await privileged.getTZandCountryIdxFromPlayerId(playerIdArray[0]).should.be.fulfilled;
        tz2.toNumber().should.be.equal(tz);
        countryIdxInTz2.toNumber().should.be.equal(countryIdxInTz);
    });
    
    it('creating a batch of buyNow players with less maxPotential', async () =>  {
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        const nPlayersPerForwardPos = [0,0,0,2];
        var {0: playerIdArray, 1: skillsArray, 2: dayOfBirthArray, 3: traitsArray, 4: internalIdArray} = await privileged.createBuyNowPlayerIdBatch(
            playerValue = 1000, maxPot = 4, seed, nPlayersPerForwardPos, epochInDays, tz, countryIdxInTz
        ).should.be.fulfilled;
        
        for (const trait of traitsArray) {
            (trait[0].toNumber() <= maxPot).should.be.equal(true);
        }
    });
    
    it('creating a batch of buyNow players and displaying', async () =>  {
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        const nPlayersPerForwardPos = [10,10,10,10];
        var {0: playerIdArray, 1: skillsArray, 2: dayOfBirthArray, 3: traitsArray, 4: internalIdArray} = await privileged.createBuyNowPlayerIdBatch(
            playerValue = 1800, maxPot = 9, seed, nPlayersPerForwardPos, epochInDays, tz, countryIdxInTz
        ).should.be.fulfilled;
        h = web3.utils.keccak256(JSON.stringify(skillsArray) + JSON.stringify(traitsArray));
        assert.equal(h, '0xc70729c165b3f583cf654dbab489dab5fb5d21ff63e22d30704ad5bcdc01cedf', "createBuyNowPlayerIdBatch not as expected");

        if (false) {
            // traits: shoot, speed, pass, defence, endurance
            labels = ["GoalKeepers", "Defenders", "Midfielders", "Attackers"];
            st = "";
            st2 = "";
            counter = 0;
            for (pos = 0; pos < nPlayersPerForwardPos.length; pos++) {
                st += labels[pos];
                for (p = 0; p < nPlayersPerForwardPos[pos]; p++) {
                    st += "\nPot: " + traitsArray[counter][0];
                    st += " | Age: " + Math.floor(dayOfBirthToAgeYears(dayOfBirthArray[counter].toNumber(), epochInDays));
                    st += " | Shoot: " + skillsArray[counter][0];
                    st += " | Speed: " + skillsArray[counter][1];
                    st += " | Pass: " + skillsArray[counter][2];
                    st += " | Defence: " + skillsArray[counter][3];
                    st += " | Endurance: " + skillsArray[counter][4];
                    counter++;
                }
                st += "\n"
            }
            console.log(st);
        }
    });
    
    // Version 2 of tiers:

    it('testing distribution of weights (v2)', async () => {
        const seed = 4;
        const nPlayers = 80;
        const nPlayersPerForwardPos = [nPlayers, 0, 0, 0];
        const epochDays = Math.floor(1588668910 / (3600 * 24));
        const timezone = 1;
        const countryIdxInTz = 0;
        const levelRanges = [30, 40];
        const potentialWeights = [1, 2, 3, 4, 5, 0, 7, 8 ,9 ,10];
        var {0: playerIdArray, 1: skillsArray, 2: dayOfBirthArray, 3: traitsArray, 4: internalIdArray} = await privileged.createBuyNowPlayerIdBatchV2(
            levelRanges, potentialWeights, seed, nPlayersPerForwardPos, epochInDays, tz, countryIdxInTz
        ).should.be.fulfilled;
        // build a historgram and check that it resembles the potentialWeights distribution
        const hist = Array.from(new Array(10), (x,i) => 0);
        for (trait of traitsArray) {
            hist[trait[0]] += 1
        }
        const sumPots = potentialWeights.reduce((a, b) => a + b, 0);
        // normalize so that the largest number coincides
        const factor = potentialWeights[potentialWeights.length-1]/hist[hist.length-1];
        const histNorm = Array.from(hist, (x,i) => Math.round(x*factor));
        assert.deepEqual(histNorm, [ 1, 1, 3, 4, 2, 0, 4, 6, 6, 10 ]); // not too bad, quite close to potentialWeights
        assert.equal(histNorm[5], 0);
    });

    it('create batch of world players (v2)', async () => {
        const seed = 4;
        const nPlayersPerForwardPos = [1, 2, 3, 4];
        const epochDays = Math.floor(1588668910 / (3600 * 24));
        const timezone = 1;
        const countryIdxInTz = 0;
        const levelRanges = [30, 40];
        const potentialWeights = [1, 1, 1, 1, 1, 1, 1, 1 ,1 ,1];
        await privileged.createBuyNowPlayerIdBatchV2(
            levelRanges,
            potentialWeights,
            seed,
            nPlayersPerForwardPos,
            epochDays,
            timezone,
            countryIdxInTz,
        ).should.be.fulfilled;
    });

    it('creating one buyNow player (v2)', async () =>  {
        const levelRanges = [30, 40];
        const potentialWeights = [1, 1, 1, 1, 1, 1, 1, 1 ,1 ,1];
        
        expectedSkills = [ 9167, 5789, 5488, 4257, 8297 ];
        expectedTraits = [ 7, 3, 6, 2 ];
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        var {0: skills, 1: ageYears, 2: traits, 3: internalId} = await privileged.createBuyNowPlayerIdPureV2(levelRanges, potentialWeights, seed, forwardPos = 3, tz, countryIdxInTz).should.be.fulfilled;
        // compare actual values
        debug.compareArrays(skills, expectedSkills, toNum = true);
        ageYears.toNumber().should.be.equal(29);
        debug.compareArrays(traits, expectedTraits, toNum = true);
        internalId.should.be.bignumber.equal("275260863937");
        // check that the average skill is as expected:
        level = expectedSkills.reduce((a, b) => a + Math.floor(b/1000), 0);
        assert.equal((level >= levelRanges[0]) && (level <= levelRanges[1]), true);
        
        // test that you get the same via the non-pure function:
        var {0: finalId, 1: skills2, 2: dayOfBirth, 3: traits2, 4: internalId2} = await privileged.createBuyNowPlayerIdV2(levelRanges, potentialWeights, seed, forwardPos = 3, epochInDays, tz, countryIdxInTz).should.be.fulfilled;
        debug.compareArrays(skills2, expectedSkills, toNum = true);
        debug.compareArrays(traits2, expectedTraits, toNum = true);
        internalId2.should.be.bignumber.equal(internalId);
        now = epochInDays*24*3600;
        expectedDayOfBirth = Math.floor(secsToDays(now) - ageYears*365/14);
        (Math.abs(dayOfBirth.toNumber() - expectedDayOfBirth) < 14).should.be.equal(true);
        
    });

    it('creating buyNow players scales linearly with value, while other data remains the same (v2)', async () =>  {
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        const levelRanges = [30, 30];
        const levelRanges2 = [60, 60];
        const potentialWeights = [1, 1, 1, 1, 1, 1, 1, 1 ,1 ,1];
        
        var {0: skills, 1: ageYears, 2: traits, 3: internalId} = await privileged.createBuyNowPlayerIdPureV2(levelRanges, potentialWeights, seed, forwardPos = 3, tz, countryIdxInTz).should.be.fulfilled;
        var {0: skills2, 1: ageYears2, 2: traits2, 3: internalId2} = await privileged.createBuyNowPlayerIdPureV2(levelRanges2, potentialWeights, seed, forwardPos = 3, tz, countryIdxInTz).should.be.fulfilled;
        level = skills.reduce((a, b) => a + Math.ceil(Number(b)/1000), 0);
        level2 = skills2.reduce((a, b) => a + Math.ceil(Number(b)/1000), 0);
        assert.equal(level2, 2 * level);
        skillsOK = 0;
        for (s = 0; s < skills.length; s++) {
            if (Math.abs(skills2[s].toNumber() - 2*skills[s].toNumber()) < 20) { skillsOK++; }
        }
        assert.equal(skillsOK >= 3, true);
       
        for (t = 0; t < traits.length; t++) {
            traits2[t].toNumber().should.be.equal(traits[t].toNumber());
        }
        internalId2.should.be.bignumber.equal(internalId);
        ageYears.should.be.bignumber.equal(ageYears2);
    });

    it('creating a batch of buyNow players (v2)', async () =>  {
        const levelRanges = [10, 20];
        const potentialWeights = [1, 1, 1, 1, 1, 1, 1, 1 ,1 ,1];
        expectedSkills = [ 2602, 2568, 3103, 1406, 3319 ];
        expectedTraits = [ 6, 3, 3, 1 ];
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        const nPlayersPerForwardPos = [0,0,0,2];
        var {0: playerIdArray, 1: skillsArray, 2: dayOfBirthArray, 3: traitsArray, 4: internalIdArray} = await privileged.createBuyNowPlayerIdBatchV2(
            levelRanges, potentialWeights, seed, nPlayersPerForwardPos, epochInDays, tz, countryIdxInTz
        ).should.be.fulfilled;

        // checking that the values of the player props can be extracted from playerId only
        for (p = 0; p < playerIdArray.length; p++) {
            var {0: _skills, 1: _day, 2: _traits, 3: _playerId, 4: _alignedSubstRed, 5: _genNonstopInj} = await utils.fullDecodeSkills(playerIdArray[p]).should.be.fulfilled     
            _day.should.be.bignumber.equal(dayOfBirthArray[p]);
            debug.compareArrays(skillsArray[p], _skills, toNum = false, isBig = true);
            debug.compareArrays(traitsArray[p], _traits, toNum = false, isBig = true);
            debug.compareArrays([false, false, false, false, false], _alignedSubstRed, toNum = false);
            for (i = 0; i < _genNonstopInj.length; i++) { _genNonstopInj[i].toNumber().should.be.equal(0); }
        }

        // compare actual values
        debug.compareArrays(skillsArray[0], expectedSkills, toNum = true);
        debug.compareArrays(traitsArray[0], expectedTraits, toNum = true);
        internalIdArray[0].should.be.bignumber.equal("275195391431");
        internalIdArray[1].should.not.be.bignumber.equal("275195391431");
      
        // testing that they are created with the expected country and tz:
        var {0: tz2, 1: countryIdxInTz2} = await privileged.getTZandCountryIdxFromPlayerId(playerIdArray[0]).should.be.fulfilled;
        tz2.toNumber().should.be.equal(tz);
        countryIdxInTz2.toNumber().should.be.equal(countryIdxInTz);
    });
    
    it('creating a batch of buyNow players with restricted potential ranges (v2)', async () =>  {
        const levelRanges = [10, 20];
        const minPot = 3;
        const maxPot = 4;
        const potentialWeights = [0, 0, 0, 1, 1, 0, 0, 0 ,0 ,0];
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        const nPlayersPerForwardPos = [0,0,0,20];
        var {0: playerIdArray, 1: skillsArray, 2: dayOfBirthArray, 3: traitsArray, 4: internalIdArray} = await privileged.createBuyNowPlayerIdBatchV2(
            levelRanges, potentialWeights, seed, nPlayersPerForwardPos, epochInDays, tz, countryIdxInTz
        ).should.be.fulfilled;
        
        for (const trait of traitsArray) {
            (trait[0].toNumber() <= maxPot).should.be.equal(true);
            (trait[0].toNumber() >= minPot).should.be.equal(true);
        }
    });
    
    it('creating a batch of buyNow players and displaying (v2)', async () =>  {
        const levelRanges = [10, 20];
        const potentialWeights = [0, 1, 2, 4, 8, 10, 8, 4, 2 , 1];
        const seed = web3.utils.toBN(web3.utils.keccak256("32123"));
        const nPlayersPerForwardPos = [10,10,10,10];
        var {0: playerIdArray, 1: skillsArray, 2: dayOfBirthArray, 3: traitsArray, 4: internalIdArray} = await privileged.createBuyNowPlayerIdBatchV2(
            levs = [5,10], potentialWeights, seed, nPlayersPerForwardPos, epochInDays, tz, countryIdxInTz
        ).should.be.fulfilled;
        h = web3.utils.keccak256(JSON.stringify(skillsArray) + JSON.stringify(traitsArray));
        assert.equal(h, '0x79951785d3a3ce9ad3e441ada4293c37a13d3d970557275c53e78f892767f9db', "createBuyNowPlayerIdBatchV2 not as expected");

        if (false) {
            // traits: shoot, speed, pass, defence, endurance
            labels = ["GoalKeepers", "Defenders", "Midfielders", "Attackers"];
            st = "";
            st2 = "";
            counter = 0;
            for (pos = 0; pos < nPlayersPerForwardPos.length; pos++) {
                st += labels[pos];
                for (p = 0; p < nPlayersPerForwardPos[pos]; p++) {
                    st += "\nPot: " + traitsArray[counter][0];
                    st += " | Age: " + Math.floor(dayOfBirthToAgeYears(dayOfBirthArray[counter].toNumber(), epochInDays));
                    st += " | Shoot: " + skillsArray[counter][0];
                    st += " | Speed: " + skillsArray[counter][1];
                    st += " | Pass: " + skillsArray[counter][2];
                    st += " | Defence: " + skillsArray[counter][3];
                    st += " | Endurance: " + skillsArray[counter][4];
                    st += " | Level: " + getLevel([...skillsArray[counter]]);
                    counter++;
                }
                st += "\n"
            }
            console.log(st);
        }
    });
    
})