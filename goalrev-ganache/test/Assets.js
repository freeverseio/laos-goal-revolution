/*
 Tests for all functions in Assets.sol and contracts inherited by it
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();


const { Signer } = require('../utils/MarketSigner.js');
const signer = new Signer(web3);
const truffleAssert = require('truffle-assertions');
const debug = require('../utils/debugUtils.js');
const deployUtils = require('../utils/deployUtils.js');
const marketUtils = require('../utils/marketUtils.js');
const timeTravel = require('../utils/TimeTravel.js');
const { assert } = require('chai');

const ConstantsGetters = artifacts.require('ConstantsGetters');
const Proxy = artifacts.require('Proxy');
const Assets = artifacts.require('Assets');
const Market = artifacts.require('Market');
const Updates = artifacts.require('Updates');
const Challenges = artifacts.require('Challenges');
const EncodingSet = artifacts.require('EncodingSkillsSetters');

const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');
const UpdatesBase = artifacts.require('UpdatesBase');
const Utils = artifacts.require('Utils');
const Stakers = artifacts.require("Stakers")

contract('Assets', (accounts) => {
    const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
    const ALICE_ACC = web3.eth.accounts.create("alice");
    const BOB_ACC   = web3.eth.accounts.create("bob");
    const CAROL_ACC = web3.eth.accounts.create("carol");

    const ALICE = ALICE_ACC.address;
    const BOB   = BOB_ACC.address;
    const CAROL = CAROL_ACC.address;
    
    const N_SKILLS = 5;
    let N_DIVS_AT_START;
    let initTx = null;
    let N_TEAMS_AT_START;
    
    // Skills: shoot, speed, pass, defence, endurance
    const SK_SHO = 0;
    const SK_SPE = 1;
    const SK_PAS = 2;
    const SK_DEF = 3;
    const SK_END = 4;
    const nullHash = web3.eth.abi.encodeParameter('bytes32','0x0');

    // var assets;
    // var market;
    
    const it2 = async(text, f) => {};
    function toBytes32(name) { return web3.utils.utf8ToHex(name); }


    async function deployAndConfigureStakers(Stakers, updates, setup) {
        const { singleTimezone, owners, requiredStake } = setup;
        const stakers  = await Stakers.new(updates.address, requiredStake).should.be.fulfilled;

        for (trustedParty of owners.trustedParties) {
            await stakers.addTrustedParty(trustedParty, {from: owners.COO}).should.be.fulfilled;
        }
        for (trustedParty of owners.trustedParties) {
            await stakers.enrol({from:trustedParty, value: requiredStake}).should.be.fulfilled;
        }
        return stakers;
    }

    beforeEach(async () => {
        defaultSetup = deployUtils.getDefaultSetup(accounts);
        owners = defaultSetup.owners;
        depl = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
        [proxy, assets, market, updates] = depl;
        await deployUtils.setProxyContractOwners(proxy, assets, owners, owners.company).should.be.fulfilled;
        constants = await ConstantsGetters.new().should.be.fulfilled;
        blockChainTimeSec = Math.floor(Date.now()/1000);
        initTx = await assets.initTZs(blockChainTimeSec, {from: owners.COO}).should.be.fulfilled;

        sellerTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry1 = 0);
        buyerTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);
        
        PLAYERS_PER_TEAM_INIT = await constants.get_PLAYERS_PER_TEAM_INIT().should.be.fulfilled;
        PLAYERS_PER_TEAM_MAX = await constants.get_PLAYERS_PER_TEAM_MAX().should.be.fulfilled;
        LEAGUES_PER_DIV = await constants.get_LEAGUES_PER_DIV().should.be.fulfilled;
        TEAMS_PER_LEAGUE = await constants.get_TEAMS_PER_LEAGUE().should.be.fulfilled;
        FREE_PLAYER_ID = await constants.get_FREE_PLAYER_ID().should.be.fulfilled;
        NULL_ADDR = await constants.get_NULL_ADDR().should.be.fulfilled;
        INGAMETIME_VS_REALTIME = await constants.get_INGAMETIME_VS_REALTIME().should.be.fulfilled;
        INGAMETIME_VS_REALTIME = INGAMETIME_VS_REALTIME.toNumber();
        PLAYERS_PER_TEAM_INIT = PLAYERS_PER_TEAM_INIT.toNumber();
        PLAYERS_PER_TEAM_MAX = PLAYERS_PER_TEAM_MAX.toNumber();
        LEAGUES_PER_DIV = LEAGUES_PER_DIV.toNumber();
        TEAMS_PER_LEAGUE = TEAMS_PER_LEAGUE.toNumber();
        
        N_DIVS_AT_START = await assets.getNDivisionsInCountry(1,0).should.be.fulfilled;;
        N_DIVS_AT_START = N_DIVS_AT_START.toNumber();
        N_TEAMS_AT_START = N_DIVS_AT_START * LEAGUES_PER_DIV * TEAMS_PER_LEAGUE;
    });
    


    it('test from the field', async () => {
        currencyId = 1;
        price = 100;
        rnd = 1597206901;
        validUntil = 1601298513;
        offerValidUntil = 1601298406;
        playerId = 2748779076742;
        seller = "0xaC347a9Fa330c6c23136F1460086D436ed55a3f8";
        signature = "c0e41caec64adca10fe20063f67d45c7de48d8d1fec80175988a34b57a4cc6fe66a3bd9bda90280e5a6194b06e24e5c3679cf429527a40b3cfda9ce1e3fe90921b";
        encryptedPrivKey = "lFHM/DuF/b9KGSba8makQ3uG85YCIMS+egCfAKqrOmZ9dXxC++fAa+63XZWgp7XTGbgTMwXFNDGyVXDL+oQUuKzLi+4z2HolcmY9TTKhsiOrf4q1x2dY9RmM2p51FnW4";
        privKey = "0x473a556049fb15974a76d52783957804f33fe6987d8cb2f503553cdd1a421eaa";
        hash = signer.computePutAssetForSaleDigestNoPrefix(currencyId, price, rnd, validUntil, offerValidUntil, playerId);

        const sellAccount = web3.eth.accounts.privateKeyToAccount(privKey);
        sig = signer.signAcceptPlayerOffer(currencyId, price, rnd, validUntil, offerValidUntil, playerId, sellAccount);
        assert.equal(sig.signature, '0x'+signature);
        assert.equal(sellAccount.address, seller);
    });

    it('addDivisions and addCountries', async () => {
        result = await assets.countCountries(tz).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        result = await assets.getNDivisionsInCountry(tz, countryIdx = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        result = await assets.getNLeaguesInCountry(tz, countryIdx = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(16);
        result = await assets.getNTeamsInCountry(tz, countryIdx = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(16*8);
        result = await assets.countryInTZExists(tz, countryIdx = 0).should.be.fulfilled;
        result.should.be.equal(true);
        divId = await assets.encodeTZCountryAndVal(tz, 0, 0).should.be.fulfilled;
        result = await assets.divisionIdToRound(divId).should.be.fulfilled;
        result.toNumber().should.be.equal(1);

        tx = await assets.addDivisionManually(tz, 0).should.be.rejected;
        tx = await assets.addDivisionManually(tz, 0, {from: owners.COO}).should.be.fulfilled;
        truffleAssert.eventEmitted(tx, "DivisionCreation", (event) => {
            return event.timezone.toString() === tz.toString() && event.countryIdxInTZ.toString() === '0' && event.divisionIdxInCountry.toString() === '1';
        });
        
        result = await assets.countCountries(tz).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        result = await assets.getNDivisionsInCountry(tz, countryIdx = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(2);
        result = await assets.getNLeaguesInCountry(tz, countryIdx = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(2*16);
        result = await assets.getNTeamsInCountry(tz, countryIdx = 0).should.be.fulfilled;
        result.toNumber().should.be.equal(2*16*8);
        divId = await assets.encodeTZCountryAndVal(tz, 0, 0).should.be.fulfilled;
        result = await assets.divisionIdToRound(divId).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        divId = await assets.encodeTZCountryAndVal(tz, 0, 1).should.be.fulfilled;
        result = await assets.divisionIdToRound(divId).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        
        tx = await assets.addCountryManually(tz).should.be.rejected;
        tx = await assets.addCountryManually(tz, {from: owners.COO}).should.be.fulfilled;
        truffleAssert.eventEmitted(tx, "DivisionCreation", (event) => {
            return event.timezone.toString() === tz.toString() && event.countryIdxInTZ.toString() === '1' && event.divisionIdxInCountry.toString() === '0';
        });

        result = await assets.countCountries(tz).should.be.fulfilled;
        result.toNumber().should.be.equal(2);
        result = await assets.getNDivisionsInCountry(tz, countryIdx = 1).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        result = await assets.getNLeaguesInCountry(tz, countryIdx = 1).should.be.fulfilled;
        result.toNumber().should.be.equal(16);
        result = await assets.getNTeamsInCountry(tz, countryIdx = 1).should.be.fulfilled;
        result.toNumber().should.be.equal(16*8);
        divId = await assets.encodeTZCountryAndVal(tz, 1, 0).should.be.fulfilled;
        result = await assets.divisionIdToRound(divId).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        divId = await assets.encodeTZCountryAndVal(tz, 1, 1).should.be.fulfilled;
        result = await assets.divisionIdToRound(divId).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
    });

    
    it('addDivision fails at half time', async () => {
        // normal addDivision works, because on deploy, we always have nextTZToUpdate with turnInDay = 0
        tx = await assets.addDivisionManually(tz, 0, {from: owners.COO}).should.be.fulfilled;

        // let's try to addDivision to the tz that is about to play 2nd half: 
        var {0: tzToUpdate, 1: day, 2: turn} = await assets.nextTimeZoneToUpdate().should.be.fulfilled;
        turn.toNumber().should.be.equal(0);

        await updates.submitActionsRoot(actionsRoot = web3.utils.keccak256("hiboys"), nullHash, nullHash, 2, nullHash, {from: owners.relay}).should.be.fulfilled;
        var {0: tzToUpdate, 1: day, 2: turn} = await assets.nextTimeZoneToUpdate().should.be.fulfilled;
        turn.toNumber().should.be.equal(1);

        // it should fail:
        tx = await assets.addDivisionManually(tzToUpdate, 0, {from: owners.COO}).should.be.rejected;
    });
    
    it('transferBot fails because addDivision fails at half time', async () => {
        // let's try to addDivision to the tz that is about to play 2nd half: 
        var {0: tzToUpdate, 1: day, 2: turn} = await assets.nextTimeZoneToUpdate().should.be.fulfilled;
        turn.toNumber().should.be.equal(0);

        await updates.submitActionsRoot(actionsRoot = web3.utils.keccak256("hiboys"), nullHash, nullHash, 2, nullHash, {from: owners.relay}).should.be.fulfilled;

        var {0: tzToUpdate, 1: day, 2: turn} = await assets.nextTimeZoneToUpdate().should.be.fulfilled;
        turn.toNumber().should.be.equal(1);

        // we can transfer bots up until bot 127, which fails because it really needs another division to be created:
        result = await assets.getNHumansInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        for (bot = 0; bot < 127; bot++) {
            tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        }
        nTeams = await assets.getNHumansInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
        nTeams.toNumber().should.be.equal(127);
        // fail to transfer another bot
        tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.rejected;

        // there have been a total of attempts:
        past = await assets.getPastEvents( 'DivisionCreationFailed', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
        assert.equal(past.length, 14, "attemps to create division not as expected");
        for (i = 0; i < past.length; i++){ 
            past[i].args.timezone.toNumber().should.be.equal(tzToUpdate.toNumber());
            past[i].args.countryIdxInTZ.toNumber().should.be.equal(0);
        }

        nDivs = await assets.getNDivisionsInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
        nDivs.toNumber().should.be.equal(1); // only 1 div created so far

        // one more assignment, and it fails:
        tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.rejected;
        // until we move away from half time:
        // - first prepare the stakers contract 
        const [owner, gameAddr, alice, bob, carol, dummy, dave, erin, frank] = accounts;
        parties = [alice, bob, carol, dave, erin, frank];
        stakers = await deployAndConfigureStakers(Stakers, updates, defaultSetup);
        await updates.setStakersAddress(stakers.address, {from: owners.superuser}).should.be.fulfilled;
        await stakers.setGameOwner(updates.address, {from:owners.COO}).should.be.fulfilled;
        await deployUtils.addTrustedParties(stakers, owners.COO, parties);
        await deployUtils.enrol(stakers, defaultSetup.requiredStake, parties);

        // - second, update the verse, and move to next
        await updates.updateTZ(verse = 1, nullHash, {from:alice}).should.be.fulfilled;
        await timeTravel.advanceTimeAndBlock(3600);
        await updates.submitActionsRoot(actionsRoot = web3.utils.keccak256("hiboys"), nullHash, nullHash, 2, nullHash, {from: owners.relay}).should.be.fulfilled;
        // - finally, retry assigning new bot
        tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        nDivs = await assets.getNDivisionsInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
        nDivs.toNumber().should.be.equal(2); // a new div was created
    });

    it('transferBot creates 1 div only when required', async () => {
        // make sure we are in before the 1st half, so we can calmly assign bots to users
        var {0: tzToUpdate, 1: day, 2: turn} = await assets.nextTimeZoneToUpdate().should.be.fulfilled;
        turn.toNumber().should.be.equal(0);

        // we can transfer bots up until bot 113, which fails because it really needs another division to be created:
        for (bot = 0; bot < 113; bot++) {
            tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
            result = await assets.getNHumansInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
            result.toNumber().should.be.equal(bot+1);
            nDivs = await assets.getNDivisionsInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
            nDivs.toNumber().should.be.equal(1); // only 1 div created so far
        }
        // the next transfer requires create division:
        tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        nDivs = await assets.getNDivisionsInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
        nDivs.toNumber().should.be.equal(2); 
        // the next 127 transfers do not require create division (we will end up with 113+128 teams after the loop)
        for (bot = 0; bot < 127; bot++) {
            tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
            nDivs = await assets.getNDivisionsInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
            nDivs.toNumber().should.be.equal(2); // only 1 div created so far
        }
        // the next transfer requires create division:
        tx = await assets.transferFirstBotToAddr(tzToUpdate, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        nDivs = await assets.getNDivisionsInCountry(tzToUpdate, countryIdxInTZ).should.be.fulfilled;
        nDivs.toNumber().should.be.equal(3); 
    });

    it('createCountry cannot create division immediately, but it can when possible', async () => {
        // let's try to create a country in a tz that is about to play 2nd half, and see what happens
        // first show that when it's not half time yet, we can create as usual. 
        var {0: tzToUpdate, 1: day, 2: turn} = await assets.nextTimeZoneToUpdate().should.be.fulfilled;
        turn.toNumber().should.be.equal(0);
        tx = await assets.addCountryManually(tzToUpdate, {from: owners.COO}).should.be.fulfilled;
        // it worked: there is 1 division, and no events of DivisionCreationFailed
        result = await assets.getNDivisionsInCountry(tzToUpdate, countr = 1).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
        past = await assets.getPastEvents( 'DivisionCreationFailed', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
        assert.equal(past.length, 0, "attemps to create division not as expected");

        // now move to half time
        await updates.submitActionsRoot(actionsRoot = web3.utils.keccak256("hiboys"), nullHash, nullHash, 2, nullHash, {from: owners.relay}).should.be.fulfilled;
        var {0: tzToUpdate, 1: day, 2: turn} = await assets.nextTimeZoneToUpdate().should.be.fulfilled;
        turn.toNumber().should.be.equal(1);

        // when adding a country now, the country is created without divisions, and broadcasting a divisionFailed event
        tx = await assets.addCountryManually(tzToUpdate, {from: owners.COO}).should.be.fulfilled;
        result = await assets.getNDivisionsInCountry(tzToUpdate, newCountryIdx = 2).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        past = await assets.getPastEvents( 'DivisionCreationFailed', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
        assert.equal(past.length, 1, "attemps to create division not as expected");
        for (i = 0; i < past.length; i++){ 
            past[i].args.timezone.toNumber().should.be.equal(tzToUpdate.toNumber());
            past[i].args.countryIdxInTZ.toNumber().should.be.equal(newCountryIdx);
        }
        // we would not be able to add manually either:
        tx = await assets.addDivisionManually(tzToUpdate, newCountryIdx, {from: owners.COO}).should.be.rejected;

        // when we move to next verse, we can finally add the division:
        const [owner, gameAddr, alice, bob, carol, dummy, dave, erin, frank] = accounts;
        parties = [alice, bob, carol, dave, erin, frank];
        stakers = await deployAndConfigureStakers(Stakers, updates, defaultSetup);
        await updates.setStakersAddress(stakers.address, {from: owners.superuser}).should.be.fulfilled;
        await stakers.setGameOwner(updates.address, {from:owners.COO}).should.be.fulfilled;
        await deployUtils.addTrustedParties(stakers, owners.COO, parties);
        await deployUtils.enrol(stakers, defaultSetup.requiredStake, parties);

        // - seconds, update the verse, and move to next
        await updates.updateTZ(verse = 1, nullHash, {from:alice}).should.be.fulfilled;
        await timeTravel.advanceTimeAndBlock(3600);
        await updates.submitActionsRoot(actionsRoot = web3.utils.keccak256("hiboys"), nullHash, nullHash, 2, nullHash, {from: owners.relay}).should.be.fulfilled;
     
        tx = await assets.addDivisionManually(tzToUpdate, newCountryIdx, {from: owners.COO}).should.be.fulfilled;
        result = await assets.getNDivisionsInCountry(tzToUpdate, newCountryIdx).should.be.fulfilled;
        result.toNumber().should.be.equal(1);
    });

    it('create special players', async () => {
        sk = [16383, 13, 4, 56, 456]
        sumSkills = sk.reduce((a, b) => a + b, 0);
        specialPlayerId = await assets.encodePlayerSkills(
            sk,
            dayOfBirth = 4*365, 
            generation = 0,
            playerId = 144321433,
            [potential = 5,
            forwardness = 3,
            leftishness = 4,
            aggressiveness = 1],
            alignedEndOfLastHalf = true,
            redCardLastGame = true,
            gamesNonStopping = 2,
            injuryWeeksLeft = 6,
            substitutedLastHalf = true,
            sumSkills
        ).should.be.fulfilled;
        result = await assets.getPlayerSkillsAtBirth(specialPlayerId).should.be.fulfilled;
        result.toNumber().should.be.equal(0);
        
        encodingSet = await EncodingSet.new().should.be.fulfilled;
        specialPlayerId = await encodingSet.addIsSpecial(specialPlayerId).should.be.fulfilled;
        skills = await assets.getPlayerSkillsAtBirth(specialPlayerId).should.be.fulfilled;
        result = await assets.getSkill(skills, SK_SHO).should.be.fulfilled;
        result.toNumber().should.be.equal(sk[0]);        
    });

   it('check DivisionCreation event on initTZs', async () => {
        let timezone = 0;
        truffleAssert.eventEmitted(initTx, "DivisionCreation", (event) => {
            timezone++;
            return event.timezone.toString() === timezone.toString() && event.countryIdxInTZ.toString() === '0' && event.divisionIdxInCountry.toString() === '0';
        });
    });

    it('check DivisionCreation event on initSingleTz', async () => {
        defaultSetup = deployUtils.getDefaultSetup(accounts);
        defaultSetup.singleTimezone = 4;
        depl2 = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
        assets2 = depl2[1];
        await assets2.setCOO(owners.COO, {from: owners.superuser}).should.be.fulfilled;
        tx = await assets2.initSingleTZ(tz = defaultSetup.singleTimezone, blockChainTimeSec, {from: owners.COO}).should.be.fulfilled;
        truffleAssert.eventEmitted(tx, "DivisionCreation", (event) => {
            return event.timezone.toString() === tz.toString() && event.countryIdxInTZ.toString() === '0' && event.divisionIdxInCountry.toString() === '0';
        });
    });
    
    
    it('check cannot initialize contract twice', async () => {
        await assets.initTZs(123342123423).should.be.rejected;
    });

    it('emit event upon initTZs of the Assets contract', async () => {
        past = await assets.getPastEvents( 'AssetsInit', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
        past[0].args.creatorAddr.should.be.equal(owners.superuser);
    });

   it('check initial and max number of players per team', async () =>  {
        PLAYERS_PER_TEAM_INIT.should.be.equal(18);
        PLAYERS_PER_TEAM_MAX.should.be.equal(25);
        LEAGUES_PER_DIV.should.be.equal(16);
        TEAMS_PER_LEAGUE.should.be.equal(8);
    });

   it('check initial setup of timeZones', async () =>  {
        nCountries = await assets.countCountries(0).should.be.fulfilled;
        nCountries.toNumber().should.be.equal(0);
        nCountries = await assets.countCountries(25).should.be.fulfilled;
        nCountries.toNumber().should.be.equal(0);
        for (tz = 1; tz<25; tz++) {
            nCountries = await assets.countCountries(tz).should.be.fulfilled;
            nCountries.toNumber().should.be.equal(1);
            nDivs = await assets.getNDivisionsInCountry(tz, countryIdxInTZ = 0).should.be.fulfilled;
            nDivs.toNumber().should.be.equal(N_DIVS_AT_START);
            nLeagues = await assets.getNLeaguesInCountry(tz, countryIdxInTZ).should.be.fulfilled;
            nLeagues.toNumber().should.be.equal(N_DIVS_AT_START*LEAGUES_PER_DIV);
            nTeams = await assets.getNTeamsInCountry(tz, countryIdxInTZ).should.be.fulfilled;
            nTeams.toNumber().should.be.equal(N_DIVS_AT_START*LEAGUES_PER_DIV * TEAMS_PER_LEAGUE);
        }
    });

   it('check wasTeamCreatedVirtually for existing teams', async () =>  {
        countryIdxInTZ = 0;
        teamIdxInCountry = N_TEAMS_AT_START - 1;
        for (tz = 1; tz<25; tz++) {
            wasTeamCreatedVirtually = await assets.teamExistsInCountry(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled;
            teamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry);
            teamExists2 = await market.wasTeamCreatedVirtually(teamId).should.be.fulfilled;
            wasTeamCreatedVirtually.should.be.equal(true);            
            teamExists2.should.be.equal(true); 
        }
    });
    
   it('check wasTeamCreatedVirtually for not-created teams', async () =>  {
        countryIdxInTZ = 0;
        teamIdxInCountry = N_TEAMS_AT_START;
        for (tz = 1; tz<25; tz++) {
            wasTeamCreatedVirtually = await assets.teamExistsInCountry(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled;
            teamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry);
            teamExists2 = await market.wasTeamCreatedVirtually(teamId).should.be.fulfilled;
            wasTeamCreatedVirtually.should.be.equal(false);            
            teamExists2.should.be.equal(false); 
        }
    });
    
   it('check wasTeamCreatedVirtually for non-existing countries', async () =>  {
        countryIdxInTZ = 1;
        teamIdxInCountry = N_TEAMS_AT_START;
        for (tz = 1; tz<25; tz++) {
            wasTeamCreatedVirtually = await assets.teamExistsInCountry(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled;
            wasTeamCreatedVirtually.should.be.equal(false);
            teamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry);
            teamExists2 = await market.wasTeamCreatedVirtually(teamId).should.be.fulfilled;
            teamExists2.should.be.equal(false);
        }
    });

   it('check wasPlayerCreatedVirtually', async () =>  {
        countryIdxInTZ = 0;
        teamIdxInCountry = N_TEAMS_AT_START;
        playerIdxInCountry = teamIdxInCountry * PLAYERS_PER_TEAM_INIT - 1;
        for (tz = 1; tz<25; tz++) {
            playerId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, playerIdxInCountry);
            wasPlayerCreatedVirtually = await assets.wasPlayerCreatedVirtually(playerId).should.be.fulfilled;
            wasPlayerCreatedVirtually.should.be.equal(true);            
            playerId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, playerIdxInCountry+1);
            wasPlayerCreatedVirtually = await assets.wasPlayerCreatedVirtually(playerId).should.be.fulfilled;
            wasPlayerCreatedVirtually.should.be.equal(false);            
        }
    });

   it('isBot teams', async () =>  {
        tz = 1;
        countryIdxInTZ = 0;
        teamIdxInCountry = 0;
        isBot = await assets.isBotTeamInCountry(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled;
        isBot.should.be.equal(true);            
    });

   it('transfer first bot to address', async () => {
        const tz = 1;
        const countryIdxInTZ = 0;
        const tx = await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        truffleAssert.eventEmitted(tx, "TeamTransfer", (event) => {
            return event.teamId.should.be.bignumber.equal('274877906944') && event.to.should.be.equal(ALICE);
        });
    });

    it('transfer bot fails if country does not exist', async () => {
        const tz = 1;
        countryIdxInTZ = 0;
        tx = await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        countryIdxInTZ = 100;
        tx = await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.rejected;
    });

   it('add users until you need a new division (it can take several seconds)', async () => {
        const tz = 1;
        const countryIdxInTZ = 0;
        nTeamsPerDiv = 128
        // the new division is triggered when 16 teams remain to fill the current division
        for (user = 0; user < (nTeamsPerDiv - 15); user++) {
            await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        }
        tx = await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        truffleAssert.eventEmitted(tx, "DivisionCreation", (event) => {
            return event.timezone.toString() === tz.toString() && event.countryIdxInTZ.toString() === countryIdxInTZ.toString() && event.divisionIdxInCountry.toString() === '1';
        });

    });


   it('transfer 2 bots to address to estimate cost', async () => {
        const tz = 1;
        const countryIdxInTZ = 0;
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, BOB, {from: owners.relay}).should.be.fulfilled;
    });



   it('transfer of bot teams', async () =>  {
        tz = 1;
        countryIdxInTZ = 0;
        teamIdxInCountry1 = 0;
        teamIdxInCountry2 = 1;
        teamId1 = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry1);
        teamId2 = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry2);
        addresses = [ALICE, BOB];
        teamIds = [teamId1, teamId2];
        await assets.setRelay(owners.relay, {from: owners.superuser}).should.be.fulfilled;
        tx = await assets.transferFirstBotsToAddresses([tz, tz], [countryIdxInTZ, countryIdxInTZ], addresses, {from: owners.relay}).should.be.fulfilled;
        let count = -1;
        truffleAssert.eventEmitted(tx, "TeamTransfer", (event) => {
            count++;
            return event.teamId.toNumber() == teamIds[count] && event.to == addresses[count];
        });
        isBot = await assets.isBotTeamInCountry(tz, countryIdxInTZ, teamIdxInCountry1).should.be.fulfilled;
        isBot.should.be.equal(false);
        isBot = await market.isBotTeam(teamId2).should.be.fulfilled;
        isBot.should.be.equal(false);
        owner = await assets.getOwnerTeamInCountry(tz, countryIdxInTZ, teamIdxInCountry1).should.be.fulfilled;
        owner.should.be.equal(ALICE);
        owner = await market.getOwnerTeam(teamId2).should.be.fulfilled;
        owner.should.be.equal(BOB);
    });

   it('get team player ids', async () => {
        // for the first team we should find playerIdx = [0, 1,...,17, FREE, FREE, ...]
        teamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0);
        let ids = await market.getPlayerIdsInTeam(teamId).should.be.fulfilled;
        ids.length.should.be.equal(PLAYERS_PER_TEAM_MAX);
        for (shirtNum = 0; shirtNum < PLAYERS_PER_TEAM_MAX; shirtNum++) {
            if (shirtNum >= PLAYERS_PER_TEAM_INIT) {
                ids[shirtNum].toNumber().should.be.equal(0);
            } else {
                decoded = await assets.decodeTZCountryAndVal(ids[shirtNum]).should.be.fulfilled;
                const {0: timeZone, 1: country, 2: playerIdxInCountry} = decoded;
                playerIdxInCountry.toNumber().should.be.equal(shirtNum);
            }
        }
        // for the first team we should find playerIdx = [18, 19,..., FREE, FREE, ...]
        teamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 1);
        ids = await market.getPlayerIdsInTeam(teamId).should.be.fulfilled;
        ids.length.should.be.equal(PLAYERS_PER_TEAM_MAX);
        for (shirtNum = 0; shirtNum < PLAYERS_PER_TEAM_MAX; shirtNum++) {
            if (shirtNum >= PLAYERS_PER_TEAM_INIT) {
                ids[shirtNum].toNumber().should.be.equal(0);
            } else {
                decoded = await assets.decodeTZCountryAndVal(ids[shirtNum]).should.be.fulfilled;
                const {0: timeZone, 1: country, 2: playerIdxInCountry} = decoded;
                playerIdxInCountry.toNumber().should.be.equal(shirtNum + PLAYERS_PER_TEAM_INIT);
            }
        }
    });

   it('gameDeployDay', async () => {
        // upon deploy, we fixed the "deploy time" to be = blockChainTimeSec 
        const gameDeployDay =  await assets.gameDeployDay().should.be.fulfilled;
        gameDeployDay.toNumber().should.be.equal(Math.floor(blockChainTimeSec/(3600*24)));
    });

   it('get skills of a GoalKeeper on creation', async () => {
        tz = 1;
        countryIdxInTZ = 0;
        playerIdxInCountry = 1;
        teamIdxInCountry = 2;
        playerCreationDay = Math.floor(1596637573/(3600*24)); // August 5, 2020
        shirtNum = 1;

        playerId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, playerIdxInCountry).should.be.fulfilled; 
        teamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled; 
        var {0: bday, 1: pot} = await assets.computeBirthDayAndPotential(teamId, playerCreationDay, shirtNum).should.be.fulfilled;
        bday.toNumber().should.be.equal(17669);
        pot.toNumber().should.be.equal(4);
        var {0: skillsVec, 1: traits, 2: sumSkills} = await assets.computeSkills(teamId, shirtNum, pot.toNumber());
        expectedSkills = [ 1555, 634, 848, 841, 1121 ];
        expectedTraits = [ 4, 0, 0, 2];
        debug.compareArrays(skillsVec, expectedSkills, toNum = true);
        debug.compareArrays(traits, expectedTraits, toNum = true);
        const sum = skillsVec.reduce((a, b) => a + b.toNumber(), 0);
        sumSkills.toNumber().should.be.equal(sum);
    });

    it('get state of player on creation', async () => {
        tz = 1;
        countryIdxInTZ = 0;
        // test for players on the first team
        playerIdxInCountry = 1;
        teamIdxInCountry = Math.floor(playerIdxInCountry / PLAYERS_PER_TEAM_INIT);
        teamIdxInCountry.should.be.equal(0);
        playerId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, playerIdxInCountry).should.be.fulfilled; 
        state = await market.getPlayerState(playerId).should.be.fulfilled;
        expectedTeamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled; 
        teamId =  await assets.getCurrentTeamIdFromPlayerState(state).should.be.fulfilled; 
        teamId.should.be.bignumber.equal(expectedTeamId);
        shirtNum =  await assets.getCurrentShirtNum(state).should.be.fulfilled; 
        shirtNum.toNumber().should.be.equal(1);
        // test for players on the second team
        playerIdxInCountry = 18;
        teamIdxInCountry = Math.floor(playerIdxInCountry / PLAYERS_PER_TEAM_INIT);
        teamIdxInCountry.should.be.equal(1);
        playerId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, playerIdxInCountry).should.be.fulfilled; 
        state = await market.getPlayerState(playerId).should.be.fulfilled;
        expectedTeamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled; 
        teamId =  await assets.getCurrentTeamIdFromPlayerState(state).should.be.fulfilled; 
        teamId.should.be.bignumber.equal(expectedTeamId);
        shirtNum =  await assets.getCurrentShirtNum(state).should.be.fulfilled; 
        shirtNum.toNumber().should.be.equal(0);
    });

   it('isFreeShirt', async () => {
        tz = 1;
        countryIdxInTZ = 0;
        teamIdxInCountry = 0; 
        teamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled;
        let ids = await market.getPlayerIdsInTeam(teamId).should.be.fulfilled;
        shirtNum = 3;
        isFree = await market.isFreeShirt(ids[shirtNum], shirtNum = 18).should.be.fulfilled
        isFree.should.be.equal(false);
        shirtNum = 18;
        isFree = await market.isFreeShirt(ids[shirtNum], shirtNum = 18).should.be.fulfilled
        isFree.should.be.equal(true);
    });

   it('getFreeShirt', async () => {
        tz = 1;
        countryIdxInTZ = 0;
        teamIdxInCountry = 0; 
        teamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry).should.be.fulfilled; 
        shirtNum = await market.getFreeShirt(teamId).should.be.fulfilled
        shirtNum.toNumber().should.be.equal(PLAYERS_PER_TEAM_MAX - 1);
    });

    it("computePutAssetForSaleDigest and computeAuctionId (ref XX1)", async () => {
        currencyId = 1;
        playerId = 11114324213423;
        price = 345;
        rnd = 1234;
        validUntil = 235985749;
        offerValidUntil = 4358487;
        sellerHiddenPrice = signer.hideSellerPrice(currencyId, price, rnd);

        digest_JS = await marketUtils.computePutAssetForSaleDigest(currencyId, price, rnd, validUntil, offerValidUntil, playerId);
        digest_BC = await market.computePutAssetForSaleDigest(sellerHiddenPrice, playerId, validUntil, offerValidUntil);
        digest_BC.toString().should.be.equal(digest_JS.toString());
        digest_BC.toString().should.be.equal('0x376b87a3db2c3ef6e1189a96303454a32fd8bf21bfe0a470e68be98e57d36495');
    
        digestNoPrefix = await signer.computePutAssetForSaleDigestNoPrefix(currencyId, price, rnd, validUntil, offerValidUntil, playerId);
    
        const sellerAccount = web3.eth.accounts.privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
        const sigSeller = sellerAccount.sign(digestNoPrefix);
    
        digestNoPrefix.toString().should.be.equal(sigSeller.message);
    
        sigSeller.message.should.be.equal('0x4d87a039e857f2b3d2975a8b198fe0ff7b71a734347a612436e1190688d2bb69');
        sigSeller.messageHash.should.be.equal('0x376b87a3db2c3ef6e1189a96303454a32fd8bf21bfe0a470e68be98e57d36495');
        sigSeller.signature.should.be.equal('0xf0e4f8fe6502bb950fa45283832d117dda9876e1bf92c29808ab9072fd717cc3756ee55cd659cc33ed2d3d0aa6f290f3f583045e9b91c32cab64747b8b43c7701b');

        auctionId = await market.computeAuctionId(sellerHiddenPrice, playerId, validUntil, 0).should.be.fulfilled;
        auctionId_JS = await signer.computeAuctionId(currencyId, price, rnd, playerId, validUntil, 0);
        auctionId.toString().should.be.equal(auctionId_JS.toString());
        auctionId.toString().should.be.equal("0x03214d89eb62587cbb48c9056dba878f839a4ebad3ad75f8826d76c566e4acd0");

        auctionId = await market.computeAuctionId(sellerHiddenPrice, playerId, validUntil, offerValidUntil).should.be.fulfilled;
        auctionId_JS = await signer.computeAuctionId(currencyId, price, rnd, playerId, validUntil, offerValidUntil);
        auctionId.toString().should.be.equal(auctionId_JS.toString());
        auctionId.toString().should.be.equal("0xf06dfe068a4aa5621dddc8d424ca97c0bd6a2ef5e9af94ba6ba3550beb6e0438");

        auctionId = await market.computeAuctionId(sellerHiddenPrice, playerId, 0, offerValidUntil).should.be.fulfilled;
        auctionId_JS = await signer.computeAuctionId(currencyId, price, rnd, playerId, 0, offerValidUntil);
        auctionId.toString().should.be.equal(auctionId_JS.toString());
        auctionId.toString().should.be.equal("0xf06dfe068a4aa5621dddc8d424ca97c0bd6a2ef5e9af94ba6ba3550beb6e0438");
    });

    it('transferPlayer', async () => {
        playerId    = await assets.encodeTZCountryAndVal(tz1 = 1, countryIdxInTZ1 = 0, playerIdxInCountry1 = 3).should.be.fulfilled; 
        teamId1     = await assets.encodeTZCountryAndVal(tz1, countryIdxInTZ1, teamIdxInCountry = 0).should.be.fulfilled; 
        teamId2     = await assets.encodeTZCountryAndVal(tz2 = 2, countryIdxInTZ2 = 0, teamIdxInCountry = 0).should.be.fulfilled; 

        // state before selling:
        state = await market.getPlayerState(playerId).should.be.fulfilled;
        obtainedTeamId = await assets.getCurrentTeamIdFromPlayerState(state).should.be.fulfilled;
        obtainedTeamId.should.be.bignumber.equal(teamId1);
        shirt = await assets.getCurrentShirtNum(state).should.be.fulfilled;
        shirt.toNumber().should.be.equal(playerIdxInCountry1);        

        await assets.transferFirstBotToAddr(tz1, countryIdxInTZ1, ALICE, {from: owners.relay}).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz2, countryIdxInTZ2, BOB, {from: owners.relay}).should.be.fulfilled;
        await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, teamId2, ALICE_ACC, BOB_ACC).should.be.fulfilled;

        // state of player after selling:
        state = await market.getPlayerState(playerId).should.be.fulfilled;
        obtainedTeamId = await assets.getCurrentTeamIdFromPlayerState(state).should.be.fulfilled;
        obtainedTeamId.should.be.bignumber.equal(teamId2);
        shirt = await assets.getCurrentShirtNum(state).should.be.fulfilled;
        shirt.toNumber().should.be.equal(PLAYERS_PER_TEAM_MAX - 1);        

        // states of teams after selling
        let ids1 = await market.getPlayerIdsInTeam(teamId1).should.be.fulfilled;
        let ids2 = await market.getPlayerIdsInTeam(teamId2).should.be.fulfilled;
        
        shirtNum = playerIdxInCountry1;
        isFree = await market.isFreeShirt(ids1[shirtNum], shirtNum).should.be.fulfilled
        isFree.should.be.equal(true);
        shirtNum = PLAYERS_PER_TEAM_MAX - 1;
        isFree = await market.isFreeShirt(ids2[shirtNum], shirtNum).should.be.fulfilled
        isFree.should.be.equal(false);
        shirtNum = await market.getFreeShirt(teamId2).should.be.fulfilled
        shirtNum.toNumber().should.be.equal(PLAYERS_PER_TEAM_MAX - 2);
    });

   it('get owner of player', async () => {
        playerId    = await assets.encodeTZCountryAndVal(tz1 = 1, countryIdxInTZ1 = 0, playerIdxInCountry1 = 3).should.be.fulfilled; 
        teamId1     = await assets.encodeTZCountryAndVal(tz1, countryIdxInTZ1, teamIdxInCountry = 0).should.be.fulfilled; 
        teamId2     = await assets.encodeTZCountryAndVal(tz2 = 2, countryIdxInTZ2 = 0, teamIdxInCountry = 0).should.be.fulfilled; 

        // state before selling:
        owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
        owner.should.be.equal(NULL_ADDR);
        // state after acquiring bot:
        await assets.transferFirstBotToAddr(tz1, countryIdxInTZ1, ALICE, {from: owners.relay}).should.be.fulfilled;
        owner = await market.getOwnerPlayer(playerId).should.be.fulfilled
        owner.should.be.equal(ALICE);
        // state after selling player:
        await assets.transferFirstBotToAddr(tz2, countryIdxInTZ2, BOB, {from: owners.relay}).should.be.fulfilled;
        await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, teamId2, ALICE_ACC, BOB_ACC).should.be.fulfilled;
        
        owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
        owner.should.be.equal(BOB);
        // state after selling team:
        await marketUtils.transferTeamViaAuction(owners.market, market, teamId2, BOB_ACC, CAROL_ACC); 
        owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
        owner.should.be.equal(CAROL);
    });

   it('get owner invalid player', async () => {
        owner = await market.getOwnerPlayer(playerId = 3).should.be.fulfilled;
        owner.should.be.equal(NULL_ADDR);
    });

   it('transferPlayer different team works', async () => {
        playerId    = await assets.encodeTZCountryAndVal(tz1 = 1, countryIdxInTZ1 = 0, playerIdxInCountry1 = 3).should.be.fulfilled; 
        teamId1     = await assets.encodeTZCountryAndVal(tz1, countryIdxInTZ1, teamIdxInCountry = 0).should.be.fulfilled; 
        teamId2     = await assets.encodeTZCountryAndVal(tz2 = 2, countryIdxInTZ2 = 0, teamIdxInCountry = 0).should.be.fulfilled; 
        await assets.transferFirstBotToAddr(tz1, countryIdxInTZ1, ALICE, {from: owners.relay}).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz2, countryIdxInTZ2, ALICE, {from: owners.relay}).should.be.fulfilled;
        await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, teamId2, ALICE_ACC, ALICE_ACC).should.be.fulfilled;
    });

   it('transferPlayer same team fails', async () => {
        playerId    = await assets.encodeTZCountryAndVal(tz1 = 1, countryIdxInTZ1 = 0, playerIdxInCountry1 = 3).should.be.fulfilled; 
        teamId1     = await assets.encodeTZCountryAndVal(tz1, countryIdxInTZ1, teamIdxInCountry = 0).should.be.fulfilled; 
        await assets.transferFirstBotToAddr(tz1, countryIdxInTZ1, ALICE, {from: owners.relay}).should.be.fulfilled;
        await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, teamId1, ALICE_ACC, ALICE_ACC).should.be.rejected;
    });

   it('transferPlayer to already full team', async () => {
        teamId     = await assets.encodeTZCountryAndVal(tz2, countryIdxInTZ2, teamIdxInCountry = 0).should.be.fulfilled; 
        for (playerIdxInCountry = 0; playerId < PLAYERS_PER_TEAM_MAX-PLAYERS_PER_TEAM_INIT; playerId++) {
            playerId   = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry).should.be.fulfilled; 
            await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, teamId, ALICE_ACC, ALICE_ACC).should.be.fulfilled;
        }
        playerId   = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry+1).should.be.fulfilled; 
        await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, teamId, ALICE_ACC, ALICE_ACC).should.be.rejected;
    });

   it('team exists', async () => {
        teamId     = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0).should.be.fulfilled; 
        result = await market.wasTeamCreatedVirtually(teamId).should.be.fulfilled;
        result.should.be.equal(true);
        teamId     = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = N_DIVS_AT_START * TEAMS_PER_LEAGUE * LEAGUES_PER_DIV - 1).should.be.fulfilled; 
        result = await market.wasTeamCreatedVirtually(teamId).should.be.fulfilled;
        result.should.be.equal(true);
        teamId     = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = N_DIVS_AT_START * TEAMS_PER_LEAGUE * LEAGUES_PER_DIV).should.be.fulfilled; 
        result = await market.wasTeamCreatedVirtually(teamId).should.be.fulfilled;
        result.should.be.equal(false);
        teamId     = await assets.encodeTZCountryAndVal(tz = 0, countryIdxInTZ = 0, teamIdxInCountry = 0).should.be.fulfilled; 
        result = await market.wasTeamCreatedVirtually(teamId).should.be.fulfilled;
        result.should.be.equal(false);
    });

   it('initial number of countries', async () => {
        const count = await assets.countCountries(tz = 1).should.be.fulfilled;
        count.toNumber().should.be.equal(1);
    });

   it('initial number of teams', async () => {
        const count = await assets.getNTeamsInCountry(tz = 1, countryIdxInTZ = 0).should.be.fulfilled;
        count.toNumber().should.be.equal(N_DIVS_AT_START * TEAMS_PER_LEAGUE * LEAGUES_PER_DIV);
    });

   it('existence of null player', async () => {
        const exists = await assets.wasPlayerCreatedVirtually(playerId = 0).should.be.fulfilled;
        exists.should.be.equal(false);
    });

   it('getOwner after sale', async () => {
        playerId    = await assets.encodeTZCountryAndVal(tz1 = 1, countryIdxInTZ1 = 0, playerIdxInCountry1 = 3).should.be.fulfilled; 
        teamId1     = await assets.encodeTZCountryAndVal(tz1, countryIdxInTZ1, teamIdxInCountry = 0).should.be.fulfilled; 
        teamId2     = await assets.encodeTZCountryAndVal(tz2 = 2, countryIdxInTZ2 = 0, teamIdxInCountry = 0).should.be.fulfilled; 
        owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
        owner.should.be.equal(NULL_ADDR); // NULL, since AcademyAddr is not yet set
        await assets.transferFirstBotToAddr(tz1, countryIdxInTZ1, ALICE, {from: owners.relay}).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz2, countryIdxInTZ2, ALICE, {from: owners.relay}).should.be.fulfilled;
        owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
        owner.should.be.equal(ALICE); 
        await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, teamId2, ALICE_ACC, ALICE_ACC).should.be.fulfilled;
        owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
        owner.should.be.equal(ALICE);
    });

   it('test that goal keepers have great shoot=block skills', async () => {
        skillsAvg = [0,0,0,0,0];
        nTrials = 100;
        for (n = 0; n < nTrials; n++) {
            seed = web3.utils.toBN(web3.utils.keccak256("32123" + n));
            var {0: skills, 1: birthTraits} = await assets.computeSkills(seed , shirtNum = 0, pot = 0).should.be.fulfilled;
            for (sk=0; sk < 5; sk++) skillsAvg[sk] += skills[sk].toNumber();
        }
        for (sk=0; sk < 5; sk++) skillsAvg[sk] = Math.floor(skillsAvg[sk]/nTrials);
        expected = [ 1176, 1029, 822, 984, 985 ];
        debug.compareArrays(skillsAvg, expected, toNum = false);
    });

   it('test that forwards have great shoot skills', async () => {
        skillsAvg = [0,0,0,0,0];
        nTrials = 100;
        for (n = 0; n < nTrials; n++) {
            seed = web3.utils.toBN(web3.utils.keccak256("32123" + n));
            var {0: skills, 1: birthTraits} = await assets.computeSkills(seed , shirtNum = 16, pot = 0).should.be.fulfilled;
            for (sk=0; sk < 5; sk++) skillsAvg[sk] += skills[sk].toNumber();
        }
        for (sk=0; sk < 5; sk++) skillsAvg[sk] = Math.floor(skillsAvg[sk]/nTrials);
        expected = [ 1213, 974, 992, 816, 1001 ];
        debug.compareArrays(skillsAvg, expected, toNum = false);
    });
    
    it('check averages of ages and potentials', async () => {
        // both arrays are = real values x 100
                          [ 2521, 2401, 2814, 2492, 2183 ]
        avgAgesExpected = [ 2520, 2401, 2814, 2492, 2182 ]; // age should have avg of 2600 (26 years x 100), with quite some variability
        avgPotsExpected = [ 416, 427, 427, 427, 427 ]; // potential should always be close to 4.25 => x100 = 425, with very low variability
        avgAges = [];
        avgPots = [];
        for (t = 0; t < 5; t++) {
            sumPot = 0;
            sumAge = 0;
            for (shirtNum = t * PLAYERS_PER_TEAM_INIT; shirtNum < (t+1)*PLAYERS_PER_TEAM_INIT; shirtNum++) {
                playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdx = 0, shirtNum).should.be.fulfilled;
                skills = await assets.getPlayerSkillsAtBirth(playerId).should.be.fulfilled;
                pot = await assets.getPotential(skills).should.be.fulfilled;
                age = await assets.getPlayerAgeInDays(playerId).should.be.fulfilled;
                sumPot += pot.toNumber();
                sumAge += age.toNumber()/365;
            }
            avgAges.push(Math.floor(sumAge/PLAYERS_PER_TEAM_INIT*100))
            avgPots.push(Math.floor(sumPot/PLAYERS_PER_TEAM_INIT*100))
        }
        for (i = 0; i < avgAges; i++) {
            assert.equal( Math.abs(avgAges[i]-avgAgesExpected[i]) < 50, true, "age deviates too much, even accounting for deploy time rounding");
        }
        debug.compareArrays(avgPots, avgPotsExpected, toNum = false);
    });


   it('computed prefPos gives correct number of defenders, mids, etc', async () => {
        expectedPos = [ 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 5, 5, 3, 3, 3, 3 ];
        for (let shirtNum = 0; shirtNum < PLAYERS_PER_TEAM_INIT; shirtNum++) {
            seed = web3.utils.toBN(web3.utils.keccak256("32123" + shirtNum));
            computedSkills = await assets.computeSkills(seed, shirtNum, pot = 0).should.be.fulfilled;
            birthTraits = computedSkills[1];
            birthTraits[1].toNumber().should.be.equal(expectedPos[shirtNum]);
        }
    });

   it('testing aggressiveness', async () => { 
        expectedAggr = [ 3, 0, 2, 1, 2, 1, 2, 0, 2, 1, 0, 3, 2, 3, 3, 2, 2, 2 ];
        resultAggr = []
        for (let shirtNum = 0; shirtNum < PLAYERS_PER_TEAM_INIT; shirtNum++) {
            seed = web3.utils.toBN(web3.utils.keccak256("32123" + shirtNum));
            computedSkills = await assets.computeSkills(seed, shirtNum, pot = 0).should.be.fulfilled;
            birthTraits = computedSkills[1];
            resultAggr.push(birthTraits[3])
        }
        debug.compareArrays(resultAggr, expectedAggr, toNum = true);
    });

   it('sum of computed skills is close to 5000', async () => {
        for (let i = 0; i < 10; i++) {
            seed = web3.utils.toBN(web3.utils.keccak256("32123" + i));
            shirtNum = 3 + (seed % 15); // avoid goalkeepers
            computedSkills = await assets.computeSkills(seed, shirtNum, pot = 0).should.be.fulfilled;
            skills = computedSkills[0];
            const sum = skills.reduce((a, b) => a + b.toNumber(), 0);
            (Math.abs(sum - 5000) < 5).should.be.equal(true);
        }
    });

   it('get shirtNum in team for many players in a country', async () => {
        tz = 1;
        countryIdxInTZ = 0;
        playersInCountry = LEAGUES_PER_DIV * TEAMS_PER_LEAGUE * PLAYERS_PER_TEAM_INIT
        for (let playerIdxInCountry = 0; playerIdxInCountry < playersInCountry ; playerIdxInCountry += 77){
            playerId    = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, playerIdxInCountry).should.be.fulfilled; 
            const playerState = await market.getPlayerState(playerId).should.be.fulfilled;
            const shirtNum = await assets.getCurrentShirtNum(playerState).should.be.fulfilled;
            shirtNum.toNumber().should.be.equal(playerIdxInCountry % PLAYERS_PER_TEAM_INIT);
        }
    })

   it('transfer team', async () => {
        teamId     = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}); 
        currentOwner = await market.getOwnerTeam(teamId).should.be.fulfilled;
        currentOwner.should.be.equal(ALICE);
        tx = await marketUtils.transferTeamViaAuction(owners.market, market, teamId, ALICE_ACC, BOB_ACC); 

        newOwner = await market.getOwnerTeam(teamId).should.be.fulfilled;
        newOwner.should.be.equal(BOB);
        truffleAssert.eventEmitted(tx, "TeamTransfer", (event) => {
            return event.teamId.toNumber() == teamId && event.to == BOB;
        });
    });

   it('transfer invalid team 0', async () => {
        await marketUtils.transferTeamViaAuction(owners.market, market, teamId = 0, ALICE_ACC, BOB_ACC).should.be.rejected; 
    });

   it('transfer bot from a not-initialized tz', async () => {
        teamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.fulfilled; 
        teamId = await assets.encodeTZCountryAndVal(tz = 26, countryIdxInTZ = 0, teamIdxInCountry = 0).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}).should.be.rejected; 
    });

   it('transfer fails when team is a bot', async () => {
        teamId     = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0).should.be.fulfilled;
        await assets.setMarket(ALICE, {from: owners.superuser}).should.be.fulfilled;
        await marketUtils.transferTeamViaAuction(ALICE, market, teamId, ALICE_ACC, BOB_ACC).should.be.rejected; 
        // Alice is the new market owner, so she should sign the next TX:
        // Cannot test this until we can sign and operate with same account
        // await assets.transferFirstBotToAddr(tz,countryIdxInTZ, ALICE, {from: ALICE}); 
        // await marketUtils.transferTeamViaAuction(ALICE, market, teamId, ALICE_ACC, BOB_ACC).should.be.fulfilled; 
    });

   it('transfer team accross same owner should fail', async () => {
        teamId     = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, ALICE, {from: owners.relay}); 
        await marketUtils.transferTeamViaAuction(owners.market, market, teamId, ALICE_ACC, ALICE_ACC).should.be.rejected; 
    });
});