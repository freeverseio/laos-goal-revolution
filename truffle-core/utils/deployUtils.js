var Web3 = require('web3');
var assert = require('assert')
var web3 = new Web3(Web3.givenProvider);
const NULL_ADDR = web3.utils.toHex("0");

const deployPair = async (proxyAddress, Contr) => {
    if (Contr == "") return ["", "", []];
    selectors = extractSelectorsFromAbi(Contr.abi);
    contr = await Contr.at(proxyAddress).should.be.fulfilled;
    let contrAsLib
    contrAsLib = await Contr.new().should.be.fulfilled;
    return [contr, contrAsLib, selectors];
};

const deployContractsToDelegateTo = async (proxyAddress, Assets, Market, Updates, Challenges) => {
    // setting up StorageProxy delegate calls to Assets
    const {0: assets, 1: assetsAsLib, 2: selectorsAssets} = await deployPair(proxyAddress, Assets);
    const {0: market, 1: marketAsLib, 2: selectorsMarket} = await deployPair(proxyAddress, Market);
    const {0: updates, 1: updatesAsLib, 2: selectorsUpdates} = await deployPair(proxyAddress, Updates);
    const {0: challenges, 1: challengesAsLib, 2: selectorsChallenges} = await deployPair(proxyAddress, Challenges);
    
    namesStr            = ['Assets', 'Market', 'Updates', 'Challenges'];
    contractsAsLib      = [assetsAsLib, marketAsLib, updatesAsLib, challengesAsLib];
    allSelectors        = [selectorsAssets, selectorsMarket, selectorsUpdates, selectorsChallenges];

    addresses = [];                 
    names = [];
    addresses = [];
    contractIds = [];

    nContracts = namesStr.length;
    for (c = 0; c < nContracts; c++) {
        if (allSelectors[c].length > 0) {
            names.push(toBytes32(namesStr[c]));
            addresses.push(contractsAsLib[c].address);
            contractIds.push(c+1);
        }
    }
    return [assets, market, updates, challenges, addresses, allSelectors, names];
}

function getInputsToAddContracts(allSelectors, firstNewContractId) {
    // Add all contracts to ids = [firstNewContractId, firstNewContractId+1,...]
    nContracts = allSelectors.length;
    newContractIds = [];
    concatSelectors = [];
    nSelectorsPerContract = [];
    for (c = 0; c < nContracts; c++) {
        if (allSelectors[c].length > 0) {
            newContractIds.push(firstNewContractId + c);
        }
        nSelectorsPerContract.push(allSelectors[c].length);
        concatSelectors = concatSelectors.concat(allSelectors[c]);
    }
    return [newContractIds, nSelectorsPerContract, concatSelectors];
}



const assertActiveStatusIs = async (contractIds, status, proxy) => {
    for (c = 0; c < contractIds.length; c++) {
        var {0: addr, 1: nom, 2: sels, 3: isActive} = await proxy.getContractInfo(contractIds[c]).should.be.fulfilled;
        assert.equal(isActive, status, "unexpected contract state");
    }
}

function extractSelectorsFromAbi(abi) {
    functions = [];
    for (i = 0; i < abi.length; i++) { 
        if (abi[i].type == "function") {
            functions.push(web3.eth.abi.encodeFunctionSignature(abi[i]));
        }
    }    
    return functions;
}

function toBytes32(name) { return web3.utils.utf8ToHex(name); }
function fromBytes32(name) { return web3.utils.hexToUtf8(name); }


function findDuplicates(data) {
    let result = [];
    for (i = 0; i < data.length; i++) {
        thisEntry = data[i]
        for (j = 0; j < i; j++) {
            if (thisEntry == data[j]) {
                result.push(thisEntry);
            }
        }
    }
    return result;
}
  
function assertNoCollisionsWithProxy(Proxy, Assets, Market, Updates, Challenges) {
    proxySelectors = extractSelectorsFromAbi(Proxy.abi);

    duplicates = findDuplicates(proxySelectors.concat(extractSelectorsFromAbi(Assets.abi)));
    assert.equal(duplicates.length, 0, "duplicates found proxy-Assets!!!");

    duplicates = findDuplicates(proxySelectors.concat(extractSelectorsFromAbi(Market.abi)));
    assert.equal(duplicates.length, 0, "duplicates found proxy-Market!!!");

    duplicates = findDuplicates(proxySelectors.concat(extractSelectorsFromAbi(Updates.abi)));
    assert.equal(duplicates.length, 0, "duplicates found proxy-Updates!!!");

    duplicates = findDuplicates(proxySelectors.concat(extractSelectorsFromAbi(Challenges.abi)));
    assert.equal(duplicates.length, 0, "duplicates found proxy-Challenges!!!");

}

function appendVersionNumberToNames(names, versionNumber) {
    newNames = [...names];
    for (n = 0; n < newNames.length; n++) {
        newNames[n] = toBytes32( fromBytes32(newNames[n]) + versionNumber.toString() );
    }
    return newNames;
}

function getAllSelectors(artfcts) {
    all = [];
    for (a = 0; a < artfcts.length; a++) {
        all = all.concat(extractSelectorsFromAbi(artfcts[a].abi));
    }
    return all;
}

function removeDuplicates(allSelectors, inheritedSelectors) {
    added = [];
    purgedSelectors = [];
    
    nContracts = allSelectors.length;
    for (c = 0; c < nContracts; c++) {
        thisContractSels = allSelectors[c];
        thisContractPurgedSels = [];
        for (s = 0; s < thisContractSels.length; s++) {
            thisSel = thisContractSels[s];
            alreadyAdded = added.includes(thisSel);
            if (alreadyAdded) {
                assert(inheritedSelectors.includes(thisSel));
            } else {
                added.push(thisSel);
                thisContractPurgedSels.push(thisSel);
            }
        }
        purgedSelectors.push(thisContractPurgedSels);
    }
    return purgedSelectors;
}

// - versionNumber = 0 for first deploy
const deploy = async (owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts) => {
    assertNoCollisionsWithProxy(Proxy, Assets, Market, Updates, Challenges);

    // Next: proxy is built either by deploy, or by assignement to already deployed address
    const proxySelectors = extractSelectorsFromAbi(Proxy.abi);
    const proxy = await Proxy.new(owners.company, owners.superuser, proxySelectors).should.be.fulfilled;

    // Check that the number of contracts already declared in Proxy is as expected.
    //  - contactId = 0 is null, so the first available contract on a clean deploy is 1, and every version adds 3 contracts
    const firstNewContractId = 1
    const nContractsNum = await proxy.countContracts().should.be.fulfilled;
    assert.equal(firstNewContractId, nContractsNum.toNumber(), "mismatch between firstNewContractId and nContractsNum");

    // The following line does:
    //  - deploy new contracts (not proxy) to delegate to, and return their addresses
    //  - build interfaces to those contracts which point to the proxy address
    const {0: assets, 1: market, 2: updates, 3: challenges, 4: addresses, 5: allSelectors, 6: names} = 
        await deployContractsToDelegateTo(proxy.address, Assets, Market, Updates, Challenges);

    const inheritedSelectors = getAllSelectors(inheritedArtfcts);
    const purgedSelectors = removeDuplicates(allSelectors, inheritedSelectors);
        
    const versionedNames = appendVersionNumberToNames(names, versionNumber = 0);

    // Adds new contracts to proxy
    const {0: newContractIds, 1: nSelectorsPerContract, 2: concatSelectors} = getInputsToAddContracts(purgedSelectors, firstNewContractId);
    tx0 = await proxy.addContracts(newContractIds, addresses, nSelectorsPerContract, concatSelectors, versionedNames, {from: owners.superuser}).should.be.fulfilled;

    // await assertActiveStatusIs(deactivateContractIds, true, proxy);
    // Deactivate and Activate all contracts atomically
    tx1 = await proxy.activateContracts(newContractIds, {from: owners.superuser}).should.be.fulfilled;

    // await assertActiveStatusIs(deactivateContractIds, false, proxy);
    // await assertActiveStatusIs(newContractIds, true, proxy);
    return [proxy, assets, market, updates, challenges];
}

// - versionNumber = 0 for first deploy
// - proxyAddress needs only be specified for upgrades
// Step 1: deploy all contracts except for proxy (permisionless)
//  - deploy all non-proxy, non-directory contracts
//  - deploy directory pointing to these new-deployed contracts
// Step 2: "proxy.addContracts" (superUser)
//  - build input parameters, such as: "selectors"...
// Step 3: "proxy.upgrade", (superUser)
//  - atomic: deactivateOld + activateNew + setNewDirectoryAddress    
const upgrade = async (versionNumber, superuser, Proxy, proxyAddress, Assets, Market, Updates, Challenges, Directory, namesAndAddressesForDirectory, inheritedArtfcts) => {
    console.log(" - Checking absence of collisions between proxy and functions to be delegated to.")
    assert.notEqual(versionNumber, 0, "version number must be larger than 0 for upgrades");
    assert.notEqual(proxyAddress, "0x0", "proxyAddress must different from 0x0 for upgrades");
    assertNoCollisionsWithProxy(Proxy, Assets, Market, Updates, Challenges);

    console.log(" - Deploying new Directory contract");
    const {0: dummy, 1: nonProxyNames, 2: nonProxyAddresses} = splitNamesAndAdresses(namesAndAddressesForDirectory);
    directory = await Directory.new(nonProxyNames, nonProxyAddresses).should.be.fulfilled;
    
    console.log(" - Getting the interface to deployed proxy");
    const proxy = await Proxy.at(proxyAddress).should.be.fulfilled;

    console.log(" - Deploy proxy-related contracts");
    const {0: assets, 1: market, 2: updates, 3: challenges, 4: addresses, 5: allSelectors, 6: names} = 
        await deployContractsToDelegateTo(proxy.address, Assets, Market, Updates, Challenges);
    const versionedNames = appendVersionNumberToNames(names, versionNumber);

    console.log(" - Checking absence of collisions among functions to be delegated to.")
    const inheritedSelectors = getAllSelectors(inheritedArtfcts);
    const purgedSelectors = removeDuplicates(allSelectors, inheritedSelectors);

    console.log(" - Building ids for contracts to deactivate and to activate, as a function of version number");
    // Check that the number of contracts already declared in Proxy is as expected.
    //  - contactId = 0 is null, so the first available contract on a clean deploy is 1, and every version adds 3 contracts
    const nContractsToProxy = 4;
    const firstNewContractId = 1 + versionNumber * nContractsToProxy;
    const nContractsNum = await proxy.countContracts().should.be.fulfilled;
    assert.equal(firstNewContractId, nContractsNum.toNumber(), "mismatch between firstNewContractId and nContractsNum");
    // Build list of contracts to deactivate
    //  - example: when deploying v1, we have activated already [0,1,2,3]
    //  - so newId = 4, and we need to deactivate [1,2,3]
    const deactivateContractIds = Array.from(new Array(nContractsToProxy), (x,i) => firstNewContractId - nContractsToProxy + i);
    await assertActiveStatusIs(deactivateContractIds, true, proxy);

    // Adds new contracts to proxy in one single TX signed by superuser
    console.log(" - Calling getInputsToAddContracts...");
    const {0: newContractIds, 1: nSelectorsPerContract, 2: concatSelectors} = getInputsToAddContracts(purgedSelectors, firstNewContractId);
    
    // -- SUPER USER RESTRICTED STAGE --
    console.log("Setting market and relay to null temporarily");
    const nullAddr = "0x0000000000000000000000000000000000000000";
    const assetsTmp = await Assets.at(proxyAddress).should.be.fulfilled;
    const currentRelayAddr = await assetsTmp.relay().should.be.fulfilled;      
    const currentMarketAddr = await assetsTmp.market().should.be.fulfilled;   
    await assetsTmp.setRelay(nullAddr, {from: superuser}).should.be.fulfilled;
    await assetsTmp.setMarket(nullAddr, {from: superuser}).should.be.fulfilled;

    console.log(" - ");
    console.log(" - Calling addContracts...");
    console.log(" - ");
    console.log(" + proxy.addContracts(newContractIds, addresses, nSelectorsPerContract, concatSelectors, versionedNames)");
    console.log(" +   newContractIds        = ", newContractIds);
    console.log(" +   addresses             = ", toPrintable(addresses));
    console.log(" +   nSelectorsPerContract = ", nSelectorsPerContract);
    console.log(" +   concatSelectors       = ", toPrintable(concatSelectors));
    tx0 = await proxy.addContracts(newContractIds, addresses, nSelectorsPerContract, concatSelectors, versionedNames, {from: superuser}).should.be.fulfilled;


    console.log(" - ");
    console.log(" - DeActivating, activating, and pointing to the new Directory address...");
    console.log(" - ");
    console.log(" + proxy.upgrade(deactivateContractIds, newContractIds, directoryAddress)");
    console.log(" +   deactivateContractIds = ", deactivateContractIds);
    console.log(" +   newContractIds        = ", newContractIds);
    console.log(" +   directoryAddress      = ", directory.address);
    await proxy.upgrade(deactivateContractIds, newContractIds, directory.address, {from: superuser}).should.be.fulfilled;

    console.log(" - ");
    console.log(" - DeActivating, activating, and pointing to the new Directory address...DONE");

    console.log("Restoring previous market and relay");
    await assetsTmp.setRelay(currentRelayAddr, {from: superuser}).should.be.fulfilled;
    await assetsTmp.setMarket(currentMarketAddr, {from: superuser}).should.be.fulfilled;

    console.log(" - Upgrade done. Returning.");
    return [proxy, assets, market, updates, challenges];
}

function toPrintable(arr) {
    str = "[" + arr[0];
    for (i = 1; i < arr.length; i++) {    
        str += "," + arr[i];
    }
    return str + "]";
}

function splitNamesAndAdresses(namesAndAddresses) {    
    names = [];
    namesBytes32 = [];
    addresses = [];
    for (c = 0; c < namesAndAddresses.length; c++) {
        names.push(namesAndAddresses[c][0]);
        namesBytes32.push(web3.utils.utf8ToHex(namesAndAddresses[c][0]));
        addresses.push(namesAndAddresses[c][1]);
    }
    return [names, namesBytes32, addresses];
}

async function addTrustedParties(contract, owner, addresses) {
    await asyncForEach(addresses, async (address) => {
        await contract.addTrustedParty(address, {from:owner}).should.be.fulfilled;
    });
}
async function enrol(contract, stake, addresses) {
    await asyncForEach(addresses, async (address) => {
        await contract.enrol({from:address, value: stake}).should.be.fulfilled;
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

async function unenroll(contract, addresses) {
    await asyncForEach(addresses, async (address) => {
        await contract.unEnroll({from:address}).should.be.fulfilled;
    });
}

function getDefaultSetup(accounts) {
    return {
      singleTimezone: -1,
      owners: {
        company:  accounts[0],
        superuser:  accounts[1],
        COO:  accounts[2],
        market:  accounts[3],
        relay:  accounts[4],
        trustedParties: [accounts[5]]
      },
      requiredStake: 1000000000000,
    }
  }
  
  function getAccount0Owner(account0) {
    return {
          company:  account0,
          superuser:  account0,
          COO:  account0,
          market:  account0,
          relay:  account0,
          trustedParties: [account0]
      }
  }
  
  function getExplicitOrDefaultSetup(networkParams, accounts) {
    const { singleTimezone, owners, requiredStake } = networkParams;
    // Safety check: either ALL or NONE of the networkParams must be defined (otherwise, expect having forgotten to assign some)
    numDefined = (singleTimezone ? 1 : 0) +  (owners ? 1 : 0) + (requiredStake ? 1 : 0);
    isValidSetup = (numDefined == 3) || (numDefined == 0);
    assert.equal(isValidSetup, true, "only some of the setup parameters are assigned in deployer.networks");
    // Set up default values only if needed:
    needsDefaultValues = (numDefined == 0);
    return needsDefaultValues ? getDefaultSetup(accounts) : networkParams;
  }
  
async function setProxyContractOwners(proxy, assets, owners, prevCompany) {
    // Order matters. First, company is established:
    await proxy.proposeCompany(owners.company, {from: prevCompany}).should.be.fulfilled;
    await proxy.acceptCompany({from: owners.company}).should.be.fulfilled;
    // company authorizes superUser to do everything else:
    await proxy.setSuperUser(owners.superuser, {from: owners.company}).should.be.fulfilled;
    // finally, superUser sets the rest of the roles:
    await assets.setCOO(owners.COO, {from: owners.superuser}).should.be.fulfilled;
    await assets.setMarket(owners.market, {from: owners.superuser}).should.be.fulfilled;
    await assets.setRelay(owners.relay, {from: owners.superuser}).should.be.fulfilled;
  }

function getAddrFromDirectory(name, dirInfo) {
    names = dirInfo[0];
    addrs = dirInfo[1];
    for (i = 0; i < names.length; i++) {
        if (name == web3.utils.hexToUtf8(names[i])) return addrs[i];
    }
    assert.equal(1,2,"contract name not found in directory");
}


  
module.exports = {
    extractSelectorsFromAbi,
    assertNoCollisionsWithProxy,
    deploy,
    addTrustedParties,
    enrol,
    unenroll,
    getExplicitOrDefaultSetup,
    getDefaultSetup,
    setProxyContractOwners,
    getAccount0Owner,
    upgrade,
    splitNamesAndAdresses,
    getAddrFromDirectory
}

