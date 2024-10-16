const Market = artifacts.require('Market');
const Assets = artifacts.require('Assets');
const Engine = artifacts.require('Engine');
const EnginePreComp = artifacts.require('EnginePreComp');
const EngineApplyBoosters = artifacts.require('EngineApplyBoosters');
const TrainingPoints = artifacts.require('TrainingPoints');
const Evolution = artifacts.require('Evolution');
const Leagues = artifacts.require('Leagues');
const Updates = artifacts.require('Updates');
const Shop = artifacts.require('Shop');
const Privileged = artifacts.require('Privileged');
const Utils = artifacts.require('Utils');
const PlayAndEvolve = artifacts.require('PlayAndEvolve');
const Merkle = artifacts.require('Merkle');
const Challenges = artifacts.require('Challenges');

const ConstantsGetters = artifacts.require('ConstantsGetters');
const Proxy = artifacts.require('Proxy');
const Directory = artifacts.require('Directory');
const MarketCrypto = artifacts.require('MarketCrypto');
const Stakers = artifacts.require('Stakers');

const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');
const UpdatesBase = artifacts.require('UpdatesBase');

// here's the deploy time used in prod, and a candidate for dev
const DEPLOY_TIME_PROD = 1592785800 - 1800; // half an hour before the first match played in PROD
const ONE_WEEK = 7 * 24 * 3600; // one week in secs
const DEPLOY_TIME_DEV = DEPLOY_TIME_PROD + 28 * ONE_WEEK; // 28 weeks after prod => 4th of Jan, 2021
// make your final choice:
const DEPLOY_TIME = DEPLOY_TIME_DEV;

require('chai')
    .use(require('chai-as-promised'))
    .should();
const assert = require('assert');
const deployUtils = require('../utils/deployUtils.js');



module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    if ((network == "ganache") || (network == "xdai") || (network == "local")) {    
      const { singleTimezone, owners, requiredStake } = deployUtils.getExplicitOrDefaultSetup(deployer.networks[network], accounts);
      const account0Owners = deployUtils.getAccount0Owner(accounts[0]);
      console.log("Deploying proxy related contracts");
      const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
      const {0: proxy, 1: assets, 2: market, 3: updates, 4: challenges} = 
        await deployUtils.deploy(account0Owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts).should.be.fulfilled;


      // Only input required at this stage: proxy.address
      console.log("Deploying non-proxy contracts");
      const stakers  = await deployer.deploy(Stakers, proxy.address, requiredStake).should.be.fulfilled;
      const enginePreComp = await deployer.deploy(EnginePreComp).should.be.fulfilled;
      const engineApplyBoosters = await deployer.deploy(EngineApplyBoosters).should.be.fulfilled;
      const engine = await deployer.deploy(Engine, enginePreComp.address, engineApplyBoosters.address).should.be.fulfilled;
      const trainingPoints= await deployer.deploy(TrainingPoints).should.be.fulfilled;
      const evolution= await deployer.deploy(Evolution).should.be.fulfilled;
      const leagues = await deployer.deploy(Leagues).should.be.fulfilled;
      const shop = await deployer.deploy(Shop, proxy.address).should.be.fulfilled;
      const privileged = await deployer.deploy(Privileged).should.be.fulfilled;
      const utils = await deployer.deploy(Utils).should.be.fulfilled;
      const playAndEvolve = await deployer.deploy(PlayAndEvolve, trainingPoints.address, evolution.address, engine.address).should.be.fulfilled;
      const merkle = await deployer.deploy(Merkle).should.be.fulfilled;
      const constantsGetters = await deployer.deploy(ConstantsGetters).should.be.fulfilled;
      const marketCrypto = await deployer.deploy(MarketCrypto, proxy.address).should.be.fulfilled;

      console.log("Writing to Directory...");
      namesAndAddresses = [
        ["ASSETS", assets.address],
        ["MARKET", market.address],
        ["ENGINE", engine.address],
        ["ENGINEPRECOMP", enginePreComp.address],
        ["ENGINEAPPLYBOOSTERS", engineApplyBoosters.address],
        ["LEAGUES", leagues.address],
        ["UPDATES", updates.address],
        ["TRAININGPOINTS", trainingPoints.address],
        ["EVOLUTION", evolution.address],
        ["SHOP", shop.address],
        ["PRIVILEGED", privileged.address],
        ["UTILS", utils.address],
        ["PLAYANDEVOLVE", playAndEvolve.address],
        ["MERKLE", merkle.address],
        ["CONSTANTSGETTERS", constantsGetters.address],
        ["CHALLENGES", challenges.address],
        ["MARKETCRYPTO", marketCrypto.address],
        ["STAKERS", stakers.address],
      ]
      const {0: names, 1: namesBytes32, 2: addresses} = deployUtils.splitNamesAndAdresses(namesAndAddresses);
      const directory = await deployer.deploy(Directory, namesBytes32, addresses).should.be.fulfilled;
      
      console.log("Setting up ...");
      await proxy.setDirectory(directory.address).should.be.fulfilled;

      console.log("Giving temporary control to accounts[0]...");
      // first set all owners to accounts[0] so that we can do some operations
      await assets.setCOO(accounts[0]).should.be.fulfilled;
      await assets.setMarket(accounts[0]).should.be.fulfilled;
      await assets.setRelay(accounts[0]).should.be.fulfilled;
      
      await market.setCryptoMarketAddress(marketCrypto.address).should.be.fulfilled;
      await market.setNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed = 20000, newLapseTime = 5*24*3600).should.be.fulfilled;
      await updates.initUpdates(DEPLOY_TIME).should.be.fulfilled; 
      await updates.setStakersAddress(stakers.address).should.be.fulfilled;
      await stakers.setGameOwner(updates.address).should.be.fulfilled;
      for (trustedParty of owners.trustedParties) {
        await stakers.addTrustedParty(trustedParty);
      }
      if (singleTimezone != -1) {
        console.log("Init single timezone", singleTimezone);
        await assets.initSingleTZ(singleTimezone, DEPLOY_TIME).should.be.fulfilled;
      } else {
        await assets.initTZs(DEPLOY_TIME).should.be.fulfilled;
      }

      console.log("Setting final ownerships, up to acceptance by company...");
      await assets.setCOO(owners.COO).should.be.fulfilled;
      await assets.setMarket(owners.market).should.be.fulfilled;
      await assets.setRelay(owners.relay).should.be.fulfilled;
      await proxy.setSuperUser(owners.superuser).should.be.fulfilled;
      await proxy.proposeCompany(owners.company).should.be.fulfilled;

      if (network == "test") {
        console.log("Acquiring final ownership -- only available in TEST network -- requires privKeys");
        await proxy.acceptCompany({from: owners.company}).should.be.fulfilled;
        for (trustedParty of owners.trustedParties) {
          await stakers.enrol({from: trustedParty, value: requiredStake});
        }
      } else {
        console.log("You need to perform the final ownership stage with your HD wallets");
      }
      // Print Summary to Console
      console.log("");
      console.log("🚀  Deployed on:", deployer.network)
      console.log("-----------AddressesStart-----------");
      console.log("PROXY" + "=" + proxy.address),
      console.log("-----------AddressesEnd-----------");
    }
    /////// /////// /////// /////// /////// /////// /////// /////// /////// /////// /////// ///////
    if (network == "upgradexdaidev") {    
      // we only need 2 external inputs:
      const versionNumber = 3;
      const proxyAddr = "0x720C10669287462Bb96eFd9bb5220EcfcBfd88cf";
      console.log("Upgrading " + network + " to version number " + versionNumber);
      
      console.log("Reading the directory info referred to by the proxy contract")
      const proxy = await Proxy.at(proxyAddr);
      const directoryAddr = await proxy.directory();
      const directory = await Directory.at(directoryAddr);
      const dirInfo = await directory.getDirectory();
      
      console.log("Reading addresses of contracts that do not need to be re-deployed");
      const stakersAddr = deployUtils.getAddrFromDirectory("STAKERS", dirInfo);
      const marketCryptoAddr = await deployUtils.getAddrFromDirectory("MARKETCRYPTO", dirInfo);
      
      console.log("Deploying new non-proxy-related contracts");
      const enginePreComp = await deployer.deploy(EnginePreComp).should.be.fulfilled;
      const engineApplyBoosters = await deployer.deploy(EngineApplyBoosters).should.be.fulfilled;
      const engine = await deployer.deploy(Engine, enginePreComp.address, engineApplyBoosters.address).should.be.fulfilled;
      const trainingPoints= await deployer.deploy(TrainingPoints).should.be.fulfilled;
      const evolution= await deployer.deploy(Evolution).should.be.fulfilled;
      const leagues = await deployer.deploy(Leagues).should.be.fulfilled;
      const shop = await deployer.deploy(Shop, proxy.address).should.be.fulfilled;
      const privileged = await deployer.deploy(Privileged).should.be.fulfilled;
      const utils = await deployer.deploy(Utils).should.be.fulfilled;
      const playAndEvolve = await deployer.deploy(PlayAndEvolve, trainingPoints.address, evolution.address, engine.address).should.be.fulfilled;
      const merkle = await deployer.deploy(Merkle).should.be.fulfilled;
      const constantsGetters = await deployer.deploy(ConstantsGetters).should.be.fulfilled;

      const namesAndAddresses = [
        ["ASSETS", proxy.address],
        ["MARKET", proxy.address],
        ["ENGINE", engine.address],
        ["ENGINEPRECOMP", enginePreComp.address],
        ["ENGINEAPPLYBOOSTERS", engineApplyBoosters.address],
        ["LEAGUES", leagues.address],
        ["UPDATES", proxy.address],
        ["TRAININGPOINTS", trainingPoints.address],
        ["EVOLUTION", evolution.address],
        ["SHOP", shop.address],
        ["PRIVILEGED", privileged.address],
        ["UTILS", utils.address],
        ["PLAYANDEVOLVE", playAndEvolve.address],
        ["MERKLE", merkle.address],
        ["CONSTANTSGETTERS", constantsGetters.address],
        ["CHALLENGES", proxy.address],
        ["MARKETCRYPTO", marketCryptoAddr],
        ["STAKERS", stakersAddr]
      ]
      
      // REDEPLOY
      const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
      const {0: proxyV1, 1: assV1, 2: markV1, 3: updV1, 4: chllV1} = await deployUtils.upgrade(
        versionNumber,
        superuser = accounts[0], 
        Proxy, 
        proxy.address,
        Assets, 
        Market, 
        Updates, 
        Challenges,
        Directory,
        namesAndAddresses,
        inheritedArtfcts
      ).should.be.fulfilled;
    }
  });
};

