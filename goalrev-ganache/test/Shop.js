/*
 Tests for all functions in Shop.sol
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();
const truffleAssert = require('truffle-assertions');
const debug = require('../utils/debugUtils.js');
const deployUtils = require('../utils/deployUtils.js');

const Proxy = artifacts.require('Proxy');
const Assets = artifacts.require('Assets');
const Market = artifacts.require('Market');
const Updates = artifacts.require('Updates');
const Challenges = artifacts.require('Challenges');
const Shop = artifacts.require('Shop');
const EncodingTactics = artifacts.require('EncodingTactics');
const Utils = artifacts.require('Utils');

const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');
const UpdatesBase = artifacts.require('UpdatesBase');

// in test mode, we place a test item in contruction (with itemId = 1)
// (recall that itemId = 0 is NULL)
// so a new item will be assigned itemId = 2
const expectedNewItemId = 2;

contract('Shop', (accounts) => {
    const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
    const ALICE = accounts[1];
    const BOB = accounts[2];
    const CAROL = accounts[3];

    const it2 = async(text, f) => {};

    beforeEach(async () => {
        defaultSetup = deployUtils.getDefaultSetup(accounts);
        owners = defaultSetup.owners;
        depl = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
        [proxy, assets, market, updates] = depl;
        await deployUtils.setProxyContractOwners(proxy, assets, owners, owners.company).should.be.fulfilled;

        shop = await Shop.new(assets.address).should.be.fulfilled;
        encTactics = await EncodingTactics.new().should.be.fulfilled;
        utils = await Utils.new().should.be.fulfilled;
        
    });

    
    it('encode - decode boosts', async () => {
        boosts = [62,60,19,1,23,2];
        encoded = await shop.encodeBoosts(boosts).should.be.fulfilled;
        decoded = await shop.decodeBoosts(encoded).should.be.fulfilled;
        debug.compareArrays(decoded, boosts, toNum = true, isBigNumber = false);
    });
    
    it('offer item', async () => {
        tx = await shop.offerItem(
            boosts = [62,60,19,1,23,1],
            countriesRoot = 0,
            championshipsRoot = 0,
            teamsRoot = 0,
            itemsRemaining = 5432,
            matchesDuration = 7,
            onlyTopInChampioniship = 3,
            uri =  "https://www.freeverse.io",
            {from: owners.COO}
        ).should.be.rejected;

        tx = await shop.offerItem(
            boosts = [32,30,19,1,23,1],
            countriesRoot = 0,
            championshipsRoot = 0,
            teamsRoot = 0,
            itemsRemaining = 5432,
            matchesDuration = 7,
            onlyTopInChampioniship = 3,
            uri =  "https://www.freeverse.io",
            {from: owners.superuser}
        ).should.be.rejected;

        tx = await shop.offerItem(
            boosts = [32,30,19,1,23,1],
            countriesRoot = 0,
            championshipsRoot = 0,
            teamsRoot = 0,
            itemsRemaining = 5432,
            matchesDuration = 7,
            onlyTopInChampioniship = 3,
            uri =  "https://www.freeverse.io",
            {from: owners.COO}
        ).should.be.fulfilled;

        encodedBoost = await shop.encodeBoosts(boosts).should.be.fulfilled;
        
        truffleAssert.eventEmitted(tx, "ItemOffered", (event) => {
            return event.itemId.toNumber() === expectedNewItemId && 
                event.encodedBoost.toNumber() == encodedBoost &&
                event.countriesRoot.toNumber() === countriesRoot &&
                event.championshipsRoot.toNumber() === championshipsRoot &&
                event.teamsRoot.toNumber() === teamsRoot &&
                event.itemsRemaining.toNumber() === itemsRemaining &&
                event.matchesDuration.toNumber() === matchesDuration &&
                event.onlyTopInChampioniship.toNumber() === onlyTopInChampioniship &&
                event.uri === uri;
        }, "correct");
        
        await shop.reduceItemsRemaining(itemId = expectedNewItemId, itemsRemaining - 3, {from: owners.superuser}).should.be.rejected;
        await shop.reduceItemsRemaining(itemId = expectedNewItemId, itemsRemaining - 3, {from: owners.COO}).should.be.fulfilled;
        result = await shop.getItemsRemaining(itemId).should.be.fulfilled;
        result.toNumber().should.be.equal(itemsRemaining - 3);
    });
    
    it('add items to tactics', async () => {
        tx = await shop.offerItem(
            boosts = [32,30,19,1,23,1],
            countriesRoot = 0,
            championshipsRoot = 0,
            teamsRoot = 0,
            itemsRemaining = 5432,
            matchesDuration = 7,
            onlyTopInChampioniship = 3,
            uri =  "https://www.freeverse.io",
            {from: owners.COO}
        ).should.be.fulfilled;
        encodedBoost = await shop.encodeBoosts(boosts).should.be.fulfilled;
        
        const lineupConsecutive = Array.from(new Array(14), (x,i) => i); 
        const extraAttackNull =  Array.from(new Array(10), (x,i) => false);
        tactics = await encTactics.encodeTactics(substitutions = [3,4,5], subsRounds = [6,7,8], lineupConsecutive, 
            extraAttackNull, tacticsId = 2).should.be.fulfilled;
        
        // add item effect to tactics
        // stamina recovery items:
        PLAYERS_PER_TEAM_MAX = 25;
        staminas = Array.from(new Array(PLAYERS_PER_TEAM_MAX), (x,i) => i % 4); 
        // shop items:
        tactics2 = await shop.addItemsToTactics(tactics, itemId = expectedNewItemId, staminas).should.be.fulfilled;
        const {0: stamina, 1: id, 2: boost} = await shop.getItemsData(tactics2).should.be.fulfilled;
        debug.compareArrays(stamina, staminas, toNum = true, isBigNumber = false);
        id.toNumber().should.be.equal(itemId);
        boost.should.be.bignumber.equal(encodedBoost);
        
        // check that previous tactics remain as expected
        decoded = await utils.decodeTactics(tactics2).should.be.fulfilled;

        let {0: subs, 1: roun, 2: line, 3: attk, 4: tact} = decoded;
        tact.toNumber().should.be.equal(tacticsId);
        for (p = 0; p < 14; p++) {
            line[p].toNumber().should.be.equal(lineupConsecutive[p]);
        }
        for (p = 0; p < 10; p++) {
            attk[p].should.be.equal(extraAttackNull[p]);
        }
        for (p = 0; p < 3; p++) {
            subs[p].toNumber().should.be.equal(substitutions[p]);
            roun[p].toNumber().should.be.equal(subsRounds[p]);
        }
        
    });

});