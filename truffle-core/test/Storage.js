/*
 Tests for all functions in
    Proxy.sol
    Storage.sol
*/
const BN = require('bn.js');
var fs = require('fs');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();
const truffleAssert = require('truffle-assertions');
const debug = require('../utils/debugUtils.js');
const deployUtils = require('../utils/deployUtils.js');
const NULL_ADDR = '0x0';

const Directory = artifacts.require('Directory');
const Proxy = artifacts.require('Proxy');
const Assets = artifacts.require('Assets');
const Market = artifacts.require('Market');
const Updates = artifacts.require('Updates');
const Challenges = artifacts.require('Challenges');

const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');
const UpdatesBase = artifacts.require('UpdatesBase');
const Utils = artifacts.require('Utils');

contract('Storage', (accounts) => {
    const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
    const [company, superuser, COO, market, relay, trustedParty] = accounts;
    
    const it2 = async(text, f) => {};

    function toBytes32(name) { return web3.utils.utf8ToHex(name); }
    function fromBytes32(name) { return web3.utils.hexToUtf8(name); }

    
    function getIdxInABI(abi, name) {
        for (i = 0; i < abi.length; i++) { 
            if (abi[i].name == name) {
                return i;
            }
        }    
    }
    
    beforeEach(async () => {
        defaultSetup = deployUtils.getDefaultSetup(accounts);
        owners = defaultSetup.owners;
        proxy = await Proxy.new(owners.company, owners.superuser, deployUtils.extractSelectorsFromAbi(Proxy.abi)).should.be.fulfilled;
        assets = await Assets.at(proxy.address).should.be.fulfilled;
        assetsAsLib = await Assets.new().should.be.fulfilled;
        selectors = deployUtils.extractSelectorsFromAbi(Assets.abi);
        nSelPerContract = [selectors.length];
        utils = await Utils.new().should.be.fulfilled;
        blockChainTimeSec = Math.floor(Date.now()/1000);
    });

    it('collisions with proxy should fail', async () => {
        // contract[0] is the NULL contract
        // proxy.address is the Proxy deployed at beforeEach, which we will leave with just the null contract
        // proxyV0 will be th newly deployed Proxy, which we will here be updating.
        const nContractsToProxy = 4;
        assert.equal(await proxy.countContracts(), '1', "wrong init number of contracts in proxy");
        result = await proxy.countSelectorsInContract(0).should.be.fulfilled;
        result.toNumber().should.be.equal(17);
        selectorsProxy = deployUtils.extractSelectorsFromAbi(Proxy.abi);
        selectorsBad = [...selectors]
        selectorsBad[6] = selectorsProxy[6];
        tx0 = await proxy.addContracts(contractIds = [1], [assetsAsLib.address], [selectors.length], selectorsBad, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;
        tx0 = await proxy.addContracts(contractIds = [2], [assetsAsLib.address], [selectors.length], selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;
        tx1 = await proxy.activateContracts([1], {from: superuser}).should.be.rejected;
        tx1 = await proxy.activateContracts([2], {from: superuser}).should.be.fulfilled;
    });
    
    it('fails when adding a contract to an address without contract', async () => {
        await proxy.addContracts(contractIds = [1], ['0x0'], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.rejected;
        await proxy.addContracts(contractIds = [1], ['0x32132'], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.rejected;
        await proxy.addContracts(contractIds = [1], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;
    });

    it('companyOwner: permissions check', async () => {
        await proxy.proposeCompany(COO, {from: superuser}).should.be.rejected;
        await proxy.proposeCompany(accounts[5], {from: company}).should.be.fulfilled;
        await proxy.proposeCompany(COO, {from: company}).should.be.fulfilled;
        await proxy.acceptCompany({from: company}).should.be.rejected;
        await proxy.acceptCompany({from: COO}).should.be.fulfilled;
        await proxy.proposeCompany(company, {from: company}).should.be.rejected;
        await proxy.proposeCompany(company, {from: COO}).should.be.fulfilled;
        await proxy.acceptCompany({from: company}).should.be.fulfilled;
    });

    it('superUser: permissions check', async () => {

        await proxy.setSuperUser(COO, {from: superuser}).should.be.rejected;
        await proxy.setSuperUser(COO, {from: company}).should.be.fulfilled;
        tx0 = await proxy.addContracts(contractIds = [1], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.rejected;
        tx0 = await proxy.addContracts(contractIds = [1], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: COO}).should.be.fulfilled;

        await proxy.setSuperUser(superuser, {from: company}).should.be.fulfilled;
        tx0 = await proxy.addContracts(contractIds = [2], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: COO}).should.be.rejected;
        tx0 = await proxy.addContracts(contractIds = [2], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;
    });
    
    it('full deploy should work', async () => {
        const {0: prox, 1: ass, 2: mkt, 3: updt, 4: chll} = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
    });
    
    it('Assets permissions check on full deploy', async () => {
        depl = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges,inheritedArtfcts);
        assets = depl[1]
        await assets.initTZs(blockChainTimeSec).should.be.rejected;
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.rejected;

        await assets.setCOO(COO, {from: COO}).should.be.rejected;
        await assets.setCOO(COO, {from: superuser}).should.be.fulfilled;
        
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.fulfilled;
        await assets.countCountries(tz = 1).should.be.fulfilled;
        tz = 1;
        countryIdxInTZ = 0;
        teamIdxInCountry = 0;
        teamId = await assets.encodeTZCountryAndVal(tz, countryIdxInTZ, teamIdxInCountry);
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, superuser, {from: superuser}).should.be.rejected;
        
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, superuser, {from: relay}).should.be.rejected;
        await assets.setRelay(relay, {from: COO}).should.be.rejected;
        await assets.setRelay(relay, {from: superuser}).should.be.fulfilled;
        await assets.transferFirstBotToAddr(tz, countryIdxInTZ, superuser, {from: relay}).should.be.fulfilled;
    });

    it('deploy storage by adding Assets selectors', async () => {
        // contact[0] is the NULL contract
        result = await proxy.countContracts().should.be.fulfilled;
        result.toNumber().should.be.equal(1);

        tx0 = await proxy.addContracts(contractIds = [0], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.rejected;
        tx0 = await proxy.addContracts(contractIds = [2], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.rejected;
        contractId = 1;
        contractIds = [contractId];
        tx0 = await proxy.addContracts(contractIds, [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;

        truffleAssert.eventEmitted(tx0, "ContractAdded", (event) => {
            ok = true;
            for (s = 0; s < selectors.length; s++) {
                ok = ok && (event.selectors[s] == selectors[s]);
            }
            return ok && event.contractId.toNumber().should.be.equal(contractId) && fromBytes32(event.name).should.be.equal("Assets");
        });

        var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxy.getContractInfo(contractId).should.be.fulfilled;
        isActive.should.be.equal(false);
        addr.should.be.equal(assetsAsLib.address);

        
        tx1 = await proxy.activateContracts(contractIds = [contractId], {from: superuser}).should.be.fulfilled;
        truffleAssert.eventEmitted(tx1, "ContractsActivated", (event) => { 
            return event.contractIds[0].toNumber().should.be.equal(contractId)
        });
        var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxy.getContractInfo(contractId).should.be.fulfilled;
        isActive.should.be.equal(true);

        result = await proxy.countContracts().should.be.fulfilled;
        result.toNumber().should.be.equal(2);
    });

    it('call initTZs() function inside Assets via delegate call from declaring ALL selectors in Assets', async () => {
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.rejected;
        await assets.setCOO(COO, {from: superuser}).should.be.rejected;

        // add function (still not enough to call assets):
        contractId = 1;
        contractIds = [contractId];
        tx0 = await proxy.addContracts(contractIds, [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.rejected;
        await assets.setCOO(COO, {from: superuser}).should.be.rejected;
        
        // activate function, now, enough to call assets:
        tx1 = await proxy.activateContracts(contractIds, {from: superuser}).should.be.fulfilled;
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.rejected;
        await assets.setCOO(COO, {from: superuser}).should.be.fulfilled;
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.fulfilled;
        result = await assets.countCountries(tz = 1).should.be.fulfilled;
        (result.toNumber() > 0).should.be.equal(true);

        // test that deactivateContracts destroys all calls to assets functions
        tx1 = await proxy.deactivateContracts(contractIds = [contractId], {from: superuser}).should.be.fulfilled;
        await assets.initTZs(blockChainTimeSec).should.be.rejected;
        result = await assets.countCountries(tz = 1).should.be.rejected;

        // I can re-activate, and, because storage is preserved, I cannot initTZs again, but nCountries is still OK
        contractId = 2;
        contractIds = [contractId];
        tx0 = await proxy.addContracts(contractIds, [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;
        tx1 = await proxy.activateContracts(contractIds , {from: superuser}).should.be.fulfilled;
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.rejected;
        result = await assets.countCountries(tz = 1).should.be.fulfilled;
        (result.toNumber() > 0).should.be.equal(true);
        var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxy.getContractInfo(contractId).should.be.fulfilled;
        isActive.should.be.equal(true);

        // I can do the same thing in one atomic TX:
        contractId = 3;
        tx0 = await proxy.addContracts([contractId], [assetsAsLib.address], nSelPerContract, selectors, names = [toBytes32("Assets")], {from: superuser}).should.be.fulfilled;
        tx1 = await proxy.upgrade(deactivate = [2], activate = [3], directoryDummyAddr = superuser, {from: superuser}).should.be.fulfilled;

        now = Math.floor(Date.now()/1000);
        truffleAssert.eventEmitted(tx1, "ContractsActivated", (event) => { 
            return event.contractIds[0].toNumber().should.be.equal(3) && (Math.abs(event.time.toNumber()-now) < 30).should.be.equal(true)
        });
        truffleAssert.eventEmitted(tx1, "ContractsDeactivated", (event) => { 
            return event.contractIds[0].toNumber().should.be.equal(2) && (Math.abs(event.time.toNumber()-now) < 30).should.be.equal(true)
        });
        truffleAssert.eventEmitted(tx1, "NewDirectory", (event) => { 
            return event.addr.should.be.equal(directoryDummyAddr)
        });

        var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxy.getContractInfo(2).should.be.fulfilled;
        isActive.should.be.equal(false);
        await assets.initTZs(blockChainTimeSec, {from: COO}).should.be.rejected;
        result = await assets.countCountries(tz = 1).should.be.fulfilled;
        (result.toNumber() > 0).should.be.equal(true);
    });
    
    it('deploy and redeploy', async () => {
        // contract[0] is the NULL contract
        // proxy.address is the Proxy deployed at beforeEach, which we will leave with just the null contract
        // proxyV0 will be th newly deployed Proxy, which we will here be updating.
        const nContractsToProxy = 4;
        assert.equal(await proxy.countContracts(), '1', "wrong init number of contracts in proxy");
        result = await proxy.countSelectorsInContract(0).should.be.fulfilled;
        result.toNumber().should.be.equal(17);
        const {0: proxyV0, 1: assV0, 2: markV0, 3: updV0, 4: chllV0} = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
        assert.equal(await proxy.countContracts(), '1', "wrong init number of contracts in proxy");
        assert.equal(await proxyV0.countContracts(), '5', "wrong V0 number of contracts in proxy");

        expectedNamesV0 = ['Assets0', 'Market0', 'Updates0', 'Challenges0'];
        for (c = 1; c < 1+nContractsToProxy; c++) {
            var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxyV0.getContractInfo(c).should.be.fulfilled;
            isActive.should.be.equal(true);
            assert(fromBytes32(nom) == expectedNamesV0[c-1] , "wrong contract name");
        }    

        namesAndAddresses = [
            ["ASSETS", assets.address],
            ["MARKET", proxyV0.address]
        ];
          
        // REDEPLOY
        const {0: proxyV1, 1: assV1, 2: markV1, 3: updV1, 4: chllV1} = await deployUtils.upgrade(
            versionNumber = 1,
            owners.superuser, 
            Proxy, 
            proxyV0.address,
            Assets, 
            Market, 
            Updates, 
            Challenges,
            Directory,
            namesAndAddresses,
            inheritedArtfcts
        ).should.be.fulfilled;
        
        assert.equal(await proxyV1.address, proxyV0.address);
        assert.equal(await proxyV0.countContracts(), '9', "wrong V1 number of contracts in proxyV0");
        assert.equal(await proxyV1.countContracts(), '9', "wrong V1 number of contracts in proxyV1");
        assert.equal(await assV1.address, assV0.address);
        assert.equal(await markV1.address, markV0.address);
        assert.equal(await updV1.address, updV0.address);
        assert.equal(await chllV1.address, chllV0.address);
        expectedNamesV1 = ['Assets1', 'Market1', 'Updates1', 'Challenges1'];
        for (c = 1; c < 1+nContractsToProxy; c++) {
            var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxyV1.getContractInfo(c).should.be.fulfilled;
            isActive.should.be.equal(false);
            assert(fromBytes32(nom) == expectedNamesV0[c-1] , "wrong contract name");
            var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxyV1.getContractInfo(c+nContractsToProxy).should.be.fulfilled;
            isActive.should.be.equal(true);
            assert(fromBytes32(nom) == expectedNamesV1[c-1] , "wrong contract name");
        }    
    });
});