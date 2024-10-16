/*
 Tests for all functions in 
  Market.sol   
  MarketCrypto.sol, 
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
const timeTravel = require('../utils/TimeTravel.js');
const marketUtils = require('../utils/marketUtils.js');
const deployUtils = require('../utils/deployUtils.js');

const ConstantsGetters = artifacts.require('ConstantsGetters');
const Proxy = artifacts.require('Proxy');
const Assets = artifacts.require('Assets');
const Market = artifacts.require('Market');
const Updates = artifacts.require('Updates');
const Challenges = artifacts.require('Challenges');
const MarketCrypto = artifacts.require('MarketCrypto');
const Privileged = artifacts.require('Privileged');
const TrainingPoints = artifacts.require('TrainingPoints');
const Utils = artifacts.require('Utils');

const UniverseInfo = artifacts.require('UniverseInfo');
const EncodingSkills = artifacts.require('EncodingSkills');
const EncodingState = artifacts.require('EncodingState');
const EncodingSkillsSetters = artifacts.require('EncodingSkillsSetters');
const UpdatesBase = artifacts.require('UpdatesBase');

async function createSpecialPlayerId(rnd = 144321433) {
  const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
  sk = [16383, 13, 4, 56, 456];
  traits = [potential = 5, forwardness = 3, leftishness = 4, aggressiveness = 1]
  secsInYear = 365*24*3600
  internalId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 1, playerIdxInCountry = rnd % 268435455);
  
  playerId = await privileged.createSpecialPlayer(
    sk,
    age = 24 * secsInYear,
    traits,
    internalId,
    now,
  ).should.be.fulfilled;
  return playerId;
}

contract("Market", accounts => {
  let ok;
  const NULL_TEAMID = 0;
  const NULL_PLAYERID = 0;
  const ACADEMY_TEAM_ID = 1;
  const NULL_ADDR = '0x0000000000000000000000000000000000000000';
  
  const it2 = async(text, f) => {};
  
  beforeEach(async () => {
    const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
    defaultSetup = deployUtils.getDefaultSetup(accounts);
    owners = defaultSetup.owners;
    depl = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
    [proxy, assets, market, updates] = depl;
    await deployUtils.setProxyContractOwners(proxy, assets, owners, owners.company).should.be.fulfilled;

    await market.setNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed = 20000, newLapseTime = 5*24*3600, {from: owners.COO}).should.be.fulfilled;

    constants = await ConstantsGetters.new().should.be.fulfilled;
    marketCrypto = await MarketCrypto.new(proxy.address, {from: owners.superuser}).should.be.fulfilled;

    freeverseAccount = await web3.eth.accounts.create("iamFreeverse");

    blockChainTimeSec = Math.floor(Date.now()/1000);
    await assets.initTZs(blockChainTimeSec, {from: owners.COO}).should.be.fulfilled;
    privileged = await Privileged.new().should.be.fulfilled;
    sellerAccount = await web3.eth.accounts.create("iamaseller");
    buyerAccount = await web3.eth.accounts.create("iamabuyer");
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sellerTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry1 = 0);
    buyerTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);
    await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, sellerAccount.address, {from: owners.relay}).should.be.fulfilled;
    await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, buyerAccount.address, {from: owners.relay}).should.be.fulfilled;
    now = await market.getBlockchainNowTime().should.be.fulfilled;

    AUCTION_TIME = 48 * 3600;
    
    POST_AUCTION_TIME = await constants.get_POST_AUCTION_TIME().should.be.fulfilled;
    POST_AUCTION_TIME = POST_AUCTION_TIME.toNumber();
    
    validUntil = now.toNumber() + AUCTION_TIME;
    currencyId = 1;
    price = 41234;
    sellerRnd = 42321;
    extraPrice = 332;
    buyerRnd = 1243523;

    zeroOfferValidUntil = 0;
    NonZeroOfferValidUntil = validUntil - 300;
  });

  it("dismissPlayer signature", async () => {
    const account = web3.eth.accounts.privateKeyToAccount('0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709');
    account.address.should.be.equal("0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01");
    const playerId = "123455";
    const validUntil = "5646456";
    sigSeller = signer.signDismissPlayer(validUntil, playerId, account)

    sigSeller.message.should.be.equal('0x26a63dd7a77ba6da621296c5433d235fa802b0eed629457ff3237b321f6db462');
    sigSeller.messageHash.should.be.equal('0xa345906cc0144e72ba04ea426d34bd486000e51de093b4b1a106deafa21c3244');
    sigSeller.v.should.be.equal('0x1b');
    sigSeller.r.should.be.equal('0x2148732eeca5265898a5fe8dd3ba1c1af5b3d5b815fb23d9d6e383b376a2c91c');
    sigSeller.s.should.be.equal('0x694170ebd18b64b122905f82d3d6961a78a784b8966fcb350d51c6c5e7917d2d');
    sigSeller.signature.should.be.equal('0x2148732eeca5265898a5fe8dd3ba1c1af5b3d5b815fb23d9d6e383b376a2c91c694170ebd18b64b122905f82d3d6961a78a784b8966fcb350d51c6c5e7917d2d1b');
  });

  it("changing newSumSkillsAllowed", async () => {
    var {0: sumSkills, 1: minLapseTime, 2: lastUpdate} = await market.getNewMaxSumSkillsBuyNowPlayer().should.be.fulfilled;
    sumSkills.toNumber().should.be.equal(20000);
    minLapseTime.toNumber().should.be.equal(3600*24*5);
  
    // cannot change because I didn't wait enough
    await market.setNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed = 25000, newLapseTime = 3600*24*4, {from: owners.COO}).should.be.fulfilled;

    var {0: sumSkills, 1: minLapseTime, 2: lastUpdate} = await market.getNewMaxSumSkillsBuyNowPlayer().should.be.fulfilled;
    sumSkills.toNumber().should.be.equal(sumSkillsAllowed);
    minLapseTime.toNumber().should.be.equal(newLapseTime);
    
    // But now we will fail if we don't wait for 4 days...
    await market.setNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed = 30000, newLapseTime2 = 3600*24*1, {from: owners.COO}).should.be.fulfilled;

    // we will now have to wait for 1 day... or decrease the value:
    await market.setNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed = 31000, newLapseTime2 = 3600*24*1, {from: owners.COO}).should.be.fulfilled;
    await market.lowerNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed = 29000, {from: owners.COO}).should.be.fulfilled;
    var {0: sumSkills, 1: minLapseTime2, 2: lastUpdate} = await market.getNewMaxSumSkillsBuyNowPlayer().should.be.fulfilled;
    sumSkills.toNumber().should.be.equal(sumSkillsAllowed);
    minLapseTime2.toNumber().should.be.equal(newLapseTime2);
  });

  it("normal players, go above 25, and get rid of player", async () => {
    playerIds = [];
    nPlayersToBuy = 9;
    for (i = 0; i < nPlayersToBuy; i++) {
      playerIds.push(playerId.add(web3.utils.toBN(i))); 
      tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerIds[i], sellerAccount).should.be.fulfilled;
    }
    for (i = 0; i < nPlayersToBuy; i++) {
      const {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
        currencyId, price, extraPrice,
        sellerRnd, buyerRnd,
        validUntil, zeroOfferValidUntil,
        playerIds[i], buyerTeamId,
        buyerAccount
      );
      await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerIds[i], buyerTeamId, sigBuyer).should.be.fulfilled;
    }

    nTransit = await market.getNPlayersInTransitInTeam(buyerTeamId).should.be.fulfilled;
    nTransit.toNumber().should.be.equal(2);

    // transfer fails because team is still full
    await market.completePlayerTransit(playerIds[nPlayersToBuy-1]).should.be.rejected;
    await market.completePlayerTransit(playerIds[nPlayersToBuy-2]).should.be.rejected;
  });

  it("cryptomarket: only COO" , async () => {
    const [dummy1, dummy2, dummy3, dummy4, dummy5, alice, bob, carol, dave, erin] = accounts;
    await marketCrypto.setAuctionDuration(360, {from: dave}).should.be.rejected;
    await marketCrypto.setAuctionDuration(360, {from: owners.COO}).should.be.fulfilled;

    await assets.setCOO(dave, {from: bob}).should.be.rejected;
    await assets.setCOO(dave, {from: owners.superuser}).should.be.fulfilled;

    await marketCrypto.setAuctionDuration(360, {from: owners.COO}).should.be.rejected;
    await marketCrypto.setAuctionDuration(360, {from: dave}).should.be.fulfilled;
  });
  
  it("crypto flow with player" , async () => {
    await market.setCryptoMarketAddress(marketCrypto.address, {from: owners.COO}).should.be.fulfilled;
    // set up teams: team 2 - ALICE, team 3 - BOB, team 4 - CAROL
    ALICE = accounts[0];
    BOB = accounts[1];
    CAROL = accounts[2];
    startingPrice = web3.utils.toWei('1');
    teamIdxInCountry0 = 2; 
    playerId0 = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry0 = teamIdxInCountry0*18+3);
    sellerTeamId0 = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0);
    tx = await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, ALICE, {from: owners.relay}).should.be.fulfilled;

    // ALICE puts for sale
    tx = await marketCrypto.putPlayerForSale(playerId0, startingPrice, {from: ALICE}).should.be.fulfilled;
    truffleAssert.eventEmitted(tx, "PlayerPutForSaleCrypto", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId0) && event.startingPrice.should.be.bignumber.equal(web3.utils.toBN(startingPrice));
    });

    auctionId = await marketCrypto.getCurrentAuctionForPlayer(playerId0).should.be.fulfilled;
    auctionId.toNumber().should.be.equal(1); 
    
    // TEST all auction getters at this stage:
    var {0: validUn, 1: teamIdHi, 2: hiBid, 3: hiBidder, 4: sell, 5: assetWent} = await marketCrypto.getAuctionData(auctionId).should.be.fulfilled;
    teamIdHi.toNumber().should.be.equal(0);
    hiBid.toNumber().should.be.equal(0);
    hiBidder.should.be.equal('0x0000000000000000000000000000000000000000');
    sell.should.be.equal(ALICE);
    assetWent.should.be.equal(false);
    (Math.abs(validUn - now.toNumber()) < 24*3600 + 10).should.be.equal(true);
    (Math.abs(validUn - now.toNumber()) > 24*3600 - 10).should.be.equal(true);

    
    // BOB does first bid
    tx = await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, BOB, {from: owners.relay}).should.be.fulfilled;
    buyerTeamId0 = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0 + 1);

    tx = await marketCrypto.bidForPlayer(playerId0, buyerTeamId0, {from: BOB, value: startingPrice}).should.be.fulfilled;

    past = await market.getPastEvents( 'PlayerFreezeCrypto', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.playerId.should.be.bignumber.equal(playerId0);
    past[0].args.frozen.should.be.equal(true);

    truffleAssert.eventEmitted(tx, "BidForPlayerCrypto", (event) => {
      return  event.playerId.should.be.bignumber.equal(playerId0) && 
              event.bidderTeamId.should.be.bignumber.equal(buyerTeamId0) && 
              event.totalAmount.should.be.bignumber.equal(web3.utils.toBN(startingPrice));
    });

    // TEST all auction getters at this stage:
    var {0: validUn, 1: teamIdHi, 2: hiBid, 3: hiBidder, 4: sell, 5: assetWent} = await marketCrypto.getAuctionData(auctionId).should.be.fulfilled;
    teamIdHi.should.be.bignumber.equal(buyerTeamId0);
    hiBid.should.be.bignumber.equal(web3.utils.toBN(startingPrice));
    hiBidder.should.be.equal(BOB);
    sell.should.be.equal(ALICE);
    assetWent.should.be.equal(false);
    (Math.abs(validUn - now.toNumber()) < 24*3600 + 10).should.be.equal(true);
    (Math.abs(validUn - now.toNumber()) > 24*3600 - 10).should.be.equal(true);
    
 
    tx = await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, CAROL,  {from: owners.relay}).should.be.fulfilled;
    buyerTeamId1 = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0 + 2);

    await marketCrypto.bidForPlayer(playerId0, buyerTeamId1, {from: CAROL, value: startingPrice}).should.be.rejected;

    newBid = web3.utils.toWei('1.1');
    await marketCrypto.bidForPlayer(playerId0, buyerTeamId1, {from: CAROL, value: (newBid)}).should.be.rejected;

    newBid = web3.utils.toWei('1.5');
    // ALICE cannot bid for her own player:
    tx = await marketCrypto.bidForPlayer(playerId0, buyerTeamId1, {from: ALICE, value: (newBid)}).should.be.rejected;
    // but CAROL can:
    tx = await marketCrypto.bidForPlayer(playerId0, buyerTeamId1, {from: CAROL, value: (newBid)}).should.be.fulfilled;

    truffleAssert.eventEmitted(tx, "BidForPlayerCrypto", (event) => {
      return  event.playerId.should.be.bignumber.equal(playerId0) && 
              event.bidderTeamId.should.be.bignumber.equal(buyerTeamId1) && 
              event.totalAmount.should.be.bignumber.equal(web3.utils.toBN(newBid));
    });

    // TEST all auction getters at this stage:
    var {0: validUn, 1: teamIdHi, 2: hiBid, 3: hiBidder, 4: sell, 5: assetWent} = await marketCrypto.getAuctionData(auctionId).should.be.fulfilled;
    teamIdHi.should.be.bignumber.equal(buyerTeamId1);
    hiBid.should.be.bignumber.equal(web3.utils.toBN(newBid));
    hiBidder.should.be.equal(CAROL);
    sell.should.be.equal(ALICE);
    assetWent.should.be.equal(false);
    (Math.abs(validUn - now.toNumber()) < 24*3600 + 10).should.be.equal(true);
    (Math.abs(validUn - now.toNumber()) > 24*3600 - 10).should.be.equal(true);
    
     
    await marketCrypto.withdraw(auctionId, {from: CAROL}).should.be.rejected;

    
    balanceBefore = await web3.eth.getBalance(BOB);
    await marketCrypto.withdraw(auctionId, {from: BOB}).should.be.fulfilled;
    balanceAfter = await web3.eth.getBalance(BOB);
    // checks that BOB has as much as he had at the beginning up to gas costs
    (startingPrice - (balanceAfter - balanceBefore) < web3.utils.toWei('0.001')).should.be.equal(true);

    await marketCrypto.withdraw(auctionId, {from: CAROL}).should.be.rejected;
    await marketCrypto.withdraw(auctionId, {from: ALICE}).should.be.rejected;
    await marketCrypto.executePlayerTransfer(playerId0).should.be.rejected;

    await timeTravel.advanceTime(24*3600-100);
    await timeTravel.advanceBlock().should.be.fulfilled;
    await marketCrypto.withdraw(auctionId, {from: ALICE}).should.be.rejected;
    await marketCrypto.executePlayerTransfer(playerId0).should.be.rejected;

    await timeTravel.advanceTime(0.1*3600);
    await timeTravel.advanceBlock().should.be.fulfilled;
    await marketCrypto.withdraw(auctionId, {from: ALICE}).should.be.fulfilled;
    // fails because marketCrypto is not authotized:
    await market.setCryptoMarketAddress(owners.superuser, {from: owners.COO}).should.be.fulfilled;
    tx = await marketCrypto.executePlayerTransfer(playerId0).should.be.rejected;
    // authorize:
    await market.setCryptoMarketAddress(marketCrypto.address, {from: owners.COO}).should.be.fulfilled;
    tx = await marketCrypto.executePlayerTransfer(playerId0).should.be.fulfilled;
    truffleAssert.eventEmitted(tx, "AssetWentToNewOwner", (event) => {
      return  event.playerId.should.be.bignumber.equal(playerId0) && 
              event.auctionId.should.be.bignumber.equal(web3.utils.toBN(1)) 
    });

    past = await market.getPastEvents( 'PlayerFreezeCrypto', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[1].args.playerId.should.be.bignumber.equal(playerId0);
    past[1].args.frozen.should.be.equal(false);

    finalOwner = await market.getOwnerPlayer(playerId0).should.be.fulfilled;
    finalOwner.should.be.equal(CAROL);
    
    // TEST all auction getters at this stage:
    var {0: validUn, 1: teamIdHi, 2: hiBid, 3: hiBidder, 4: sell, 5: assetWent} = await marketCrypto.getAuctionData(auctionId).should.be.fulfilled;
    teamIdHi.should.be.bignumber.equal(buyerTeamId1);
    hiBid.should.be.bignumber.equal(web3.utils.toBN(0));
    hiBidder.should.be.equal(CAROL);
    sell.should.be.equal(ALICE);
    assetWent.should.be.equal(true);
    (Math.abs(validUn - now.toNumber()) < 24*3600 + 10).should.be.equal(true);
    (Math.abs(validUn - now.toNumber()) > 24*3600 - 10).should.be.equal(true);
    
  });

  it("crypto mkt shows that we can get past 25 players, sell, and complete in-transits" , async () => {
    await market.setCryptoMarketAddress(marketCrypto.address, {from: owners.COO}).should.be.fulfilled;
    // set up teams: team 2 - ALICE, team 3 - BOB
    ALICE = accounts[0];
    BOB = accounts[1];
    startingPrice = web3.utils.toWei('1');
    teamIdxInCountry0 = 2; 

    // ALICE will be selling
    sellerTeamId0 = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0);
    await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, ALICE,  {from: owners.relay}).should.be.fulfilled;
    // BOB will be buying
    await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, BOB,  {from: owners.relay}).should.be.fulfilled;
    buyerTeamId0 = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0 + 1);

    nTransfers = 10;
    playerIds = [];
    for (n = 0; n < nTransfers; n++) { 
      thisPlayerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry0 = teamIdxInCountry0*18+2+n);
      playerIds.push(thisPlayerId);
      // ALICE puts for sale and BOB bids
      await marketCrypto.putPlayerForSale(thisPlayerId, startingPrice, {from: ALICE}).should.be.fulfilled;

      result = await market.isPlayerFrozenInAnyMarket(thisPlayerId).should.be.fulfilled;
      result.should.be.equal(false);

      await marketCrypto.bidForPlayer(thisPlayerId, buyerTeamId0, {from: BOB, value: startingPrice}).should.be.fulfilled;
      result = await market.isPlayerFrozenInAnyMarket(thisPlayerId).should.be.fulfilled;
      result.should.be.equal(true);
      }

    await timeTravel.advanceTime(24*3600+100);
    await timeTravel.advanceBlock().should.be.fulfilled;

    // show that the first 7 transfers works normally, for the others, players go to limbo
    IN_TRANSIT_TEAM = 2;
    for (n = 0; n < nTransfers; n++) { 
      await marketCrypto.executePlayerTransfer(playerIds[n]).should.be.fulfilled;
      if (n >= 7) {
        ownTeam = await market.getCurrentTeamIdFromPlayerId(playerIds[n]).should.be.fulfilled;
        ownTeam.should.be.bignumber.equal(buyerTeamId0);
        state = await market.getPlayerState(playerIds[n]).should.be.fulfilled;
        isInTransit = await market.getIsInTransitFromState(state).should.be.fulfilled;
        isInTransit.should.be.equal(true);
      }
    }

    // note that the players are not frozen anymore. However, it'll be impossible to freeze them since
    // they currently are In transit
    result = await market.isPlayerFrozenInAnyMarket(playerIds[8]).should.be.fulfilled;
    result.should.be.equal(false);
  
    // buyer can not continue bidding because he already has players in limbo:
    thisPlayerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry0 = teamIdxInCountry0*18+2+nTransfers+1);
    await marketCrypto.putPlayerForSale(thisPlayerId, startingPrice, {from: ALICE}).should.be.fulfilled;
    await marketCrypto.bidForPlayer(thisPlayerId, buyerTeamId0, {from: BOB, value: startingPrice}).should.be.rejected;

    // so player 7, 8, 9 are in transit. We can still not complete transits because team is still full
    await market.completePlayerTransit(playerIds[7]).should.be.rejected;

    // so let's sell again, return back to ALICE :-)
    for (n = 0; n < 3; n++) { 
      await marketCrypto.putPlayerForSale(playerIds[n], startingPrice, {from: BOB}).should.be.fulfilled;
      await marketCrypto.bidForPlayer(playerIds[n], sellerTeamId0, {from: ALICE, value: startingPrice}).should.be.fulfilled;
    }
    await timeTravel.advanceTime(24*3600+100);
    await timeTravel.advanceBlock().should.be.fulfilled;
    for (n = 0; n < 3; n++) { 
      await marketCrypto.executePlayerTransfer(playerIds[n]).should.be.fulfilled;
    }
    await market.completePlayerTransit(playerIds[7]).should.be.fulfilled;
    await market.completePlayerTransit(playerIds[8]).should.be.fulfilled;
    await market.completePlayerTransit(playerIds[9]).should.be.fulfilled;
    ownTeam = await market.getCurrentTeamIdFromPlayerId(playerIds[8]).should.be.fulfilled;
    ownTeam.should.be.bignumber.equal(buyerTeamId0);

    result = await market.isPlayerFrozenInAnyMarket(playerIds[8]).should.be.fulfilled;
    result.should.be.equal(false);
  });

  it("crypto mkt cannot bid if buyerTeamId = sellerTeamId" , async () => {
    // set up teams: ALICE, BOB, ALICE
    await market.setCryptoMarketAddress(marketCrypto.address, {from: owners.COO}).should.be.fulfilled;
    ALICE = accounts[0];
    BOB = accounts[1];

    startingPrice = web3.utils.toWei('1');
    teamIdxInCountry0 = 2; 

    // ALICE will be 
    sellerTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0);
    await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, ALICE, {from: owners.relay}).should.be.fulfilled;
    // BOB will be buying
    await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, BOB, {from: owners.relay}).should.be.fulfilled;
    buyerTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0 + 1);
    // ALICE will be buying too
    await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, BOB, {from: owners.relay}).should.be.fulfilled;
    allice2ndTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry0 + 2);

    
    // ALICE puts for sale and BOB bids, all OK
    thisPlayerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry0 = teamIdxInCountry0 * 18 + 1);
    await marketCrypto.putPlayerForSale(thisPlayerId, startingPrice, {from: ALICE}).should.be.fulfilled;
    // await web3.eth.sendTransaction({ from: originAccounts[i], to, value }).should.be.fulfilled;

    await marketCrypto.bidForPlayer(thisPlayerId, buyerTeamId, {from: BOB, value: startingPrice}).should.be.fulfilled;
    result = await market.isPlayerFrozenInAnyMarket(thisPlayerId).should.be.fulfilled;
    result.should.be.equal(true);

    // ALICE puts for sale and ALICE bids, fails because of same teamId and same owner
    thisPlayerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry0 = teamIdxInCountry0 * 18 + 2);
    await marketCrypto.putPlayerForSale(thisPlayerId, startingPrice, {from: ALICE}).should.be.fulfilled;
    await marketCrypto.bidForPlayer(thisPlayerId, sellerTeamId, {from: ALICE, value: startingPrice}).should.be.rejected;

    // ALICE puts for sale and ALICE bids with her 2nd team, fails because of same owner
    thisPlayerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry0 = teamIdxInCountry0 * 18 + 3);
    await marketCrypto.putPlayerForSale(thisPlayerId, startingPrice, {from: ALICE}).should.be.fulfilled;
    await marketCrypto.bidForPlayer(thisPlayerId, allice2ndTeamId, {from: ALICE, value: startingPrice}).should.be.rejected;

    // TODO: test when BOB aquires ALICE's team, and then tries to bid. He'll be a different ownerAddr, but same teamID. Should fail
    // problem is I didn't figure out how to have an account that both i) signs as needed for our MarketAPI, ii) signs TXs in Truffle
  });

  
  it('setAcquisitionConstraint of constraints in friendliess', async () => {
    maxNumConstraints = 7;
    remainingAcqs = 0;
    for (c = 0; c < maxNumConstraints; c++) {
      acq = c;
      isIt = await market.isAcquisitionFree(remainingAcqs, acq).should.be.fulfilled;
      isIt.should.be.equal(true);
      remainingAcqs = await market.setAcquisitionConstraint(remainingAcqs, valUnt = now.toNumber() + c * 4400, numRemain = c, acq, {from: owners.COO}).should.be.fulfilled;
      isIt = await market.isAcquisitionFree(remainingAcqs, acq).should.be.fulfilled;
      isIt.should.be.equal(false);
      valid = await market.getAcquisitionConstraintValidUntil(remainingAcqs, acq = c).should.be.fulfilled;
      num = await market.getAcquisitionConstraintNRemain(remainingAcqs, acq = c).should.be.fulfilled;
      valid.toNumber().should.be.equal(valUnt);
      num.toNumber().should.be.equal(numRemain);
    }
  });
  
  it('addAcquisitionConstraint of constraints in friendlies', async () => {
    maxNumConstraints = 6;
    teamId = buyerTeamId;
    for (c = 0; c < maxNumConstraints; c++) {
      await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() + (c + 1) * 4400, numRemain = c + 1, {from: owners.COO}).should.be.fulfilled;
    }
    // the team is full already
    await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() + (c + 1) * 4400, numRemain = c + 1, {from: owners.COO}).should.be.rejected;
    // as just enough time passes it can do one more submission again:
    await timeTravel.advanceTime(4400 + 1000);
    await timeTravel.advanceBlock().should.be.fulfilled;
    await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() + (c + 1) * 4400, numRemain = c + 1, {from: owners.COO}).should.be.fulfilled;
    await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() + (c + 1) * 4400, numRemain = c + 1, {from: owners.COO}).should.be.rejected;
  });

  it('encoding of constraints pass with time', async () => {
    teamId = buyerTeamId;
    remainingAcqs = 0;
    acq = 5;
    isIt = await market.isAcquisitionFree(remainingAcqs, acq).should.be.fulfilled;
    isIt.should.be.equal(true);
    remainingAcqs = await market.setAcquisitionConstraint(remainingAcqs, valUnt = now.toNumber() - 10, numRemain = c, acq, {from: owners.COO}).should.be.fulfilled;
    isIt = await market.isAcquisitionFree(remainingAcqs, acq).should.be.fulfilled;
    isIt.should.be.equal(true);
  });

  it('getMaxAllowedAcquisitions and decreaseMaxAllowedAcquisitions', async () => {
    teamId = buyerTeamId;
    // initially, isContrained = false
    result = await  market.getMaxAllowedAcquisitions(teamId).should.be.fulfilled;
    var {0: isConstrained, 1: nRemain} = result;
    isConstrained.should.be.equal(false);
    nRemain.toNumber().should.be.equal(0);
    // we add 1 contraint
    await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() + 4400, numRemain = 8, {from: owners.COO}).should.be.fulfilled;
    result = await  market.getMaxAllowedAcquisitions(teamId).should.be.fulfilled;
    var {0: isConstrained, 1: nRemain} = result;
    isConstrained.should.be.equal(true);
    nRemain.toNumber().should.be.equal(numRemain);
    // we another constraint, but in the past, so nothing changes
    await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() - 4400, n = 7, {from: owners.COO}).should.be.fulfilled;
    result = await  market.getMaxAllowedAcquisitions(teamId).should.be.fulfilled;
    var {0: isConstrained, 1: nRemain} = result;
    isConstrained.should.be.equal(true);
    nRemain.toNumber().should.be.equal(numRemain);
    // we another constraint, it takes into account the lowest constaint (in this case, the newest)
    await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() + 6666, n = 7, {from: owners.COO}).should.be.fulfilled;
    result = await  market.getMaxAllowedAcquisitions(teamId).should.be.fulfilled;
    var {0: isConstrained, 1: nRemain} = result;
    isConstrained.should.be.equal(true);
    nRemain.toNumber().should.be.equal(n);
    // we another constraint, it takes into account the lowest constaint (in this case, the previous one)
    await market.addAcquisitionConstraint(teamId, valUnt = now.toNumber() + 6666, n2 = 15, {from: owners.COO}).should.be.fulfilled;
    result = await  market.getMaxAllowedAcquisitions(teamId).should.be.fulfilled;
    var {0: isConstrained, 1: nRemain} = result;
    isConstrained.should.be.equal(true);
    nRemain.toNumber().should.be.equal(n);
    // after a long time, it's ready again
    await timeTravel.advanceTime(6666 + 1000);
    await timeTravel.advanceBlock().should.be.fulfilled;
    result = await  market.getMaxAllowedAcquisitions(teamId).should.be.fulfilled;
    var {0: isConstrained, 1: nRemain} = result;
    isConstrained.should.be.equal(false);
    nRemain.toNumber().should.be.equal(0);
  });
  

  // *************************************************************************
  // *********************************   TEST  *******************************
  // *************************************************************************
   
  
  // ------------------------------------------------------------------------------------ 
  // ------------------------------------------------------------------------------------ 
  // ------------------------------------------------------------------------------------ 
  // ----------------------------------------------------------------- TEAMS 
  // ------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------
  
  it("teams: completes a MAKE_AN_OFFER via MTXs", async () => {
    // now, sellerRnd is fixed by offerer
    offererRnd = 23987435;
    offerValidUntil = now.toNumber() + 3600; // valid for an hour
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, sellerTeamId, sellerAccount).should.be.fulfilled;
    isTeamFrozen = await market.isTeamFrozen(sellerTeamId.toNumber()).should.be.fulfilled;
    isTeamFrozen.should.be.equal(true);
    truffleAssert.eventEmitted(tx, "TeamFreeze", (event) => {
      return event.teamId.should.be.bignumber.equal(sellerTeamId) && event.frozen.should.be.equal(true);
    });

    tx = await marketUtils.completeTeamAuction(
      owners.market, 
      currencyId, price, offererRnd, validUntil, offerValidUntil, sellerTeamId, 
      extraPrice = 0, buyerRnd = 0, buyerAccount
    ).should.be.fulfilled;
  });
  
  it("teams: fails a MAKE_AN_OFFER via MTXs because offerValidUntil had expired", async () => {
    // now, sellerRnd is fixed by offerer
    offererRnd = 23987435;
    offerValidUntil = now.toNumber() -10; // offer had expired before doing the freeze
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, sellerTeamId, sellerAccount).should.be.rejected;

    offerValidUntil = now.toNumber() +10; // offer had expired before doing the freeze
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, sellerTeamId, sellerAccount).should.be.fulfilled;
    isTeamFrozen = await market.isTeamFrozen(sellerTeamId.toNumber()).should.be.fulfilled;
    isTeamFrozen.should.be.equal(true);
    truffleAssert.eventEmitted(tx, "TeamFreeze", (event) => {
      return event.teamId.should.be.bignumber.equal(sellerTeamId) && event.frozen.should.be.equal(true);
    });
  });

  it("teams: fails a MAKE_AN_OFFER via MTXs because validUntil is too large", async () => {
    validUntil = now.toNumber() + 3600*24*4 + 30; // 4 days + 30 sec
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, sellerTeamId, sellerAccount).should.be.rejected;
    validUntil = now.toNumber() + 3600*24*1 + 30; // 1 days + 30 sec
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, sellerTeamId, sellerAccount).should.be.fulfilled;
  });
  
 
  it("teams: completes a PUT_FOR_SALE and AGREE_TO_BUY via MTXs", async () => {
    // 1. buyer's mobile app sends to Freeverse: sigBuyer AND params (currencyId, price, ....)
    // 2. Freeverse checks signature and returns to buyer: OK, failed
    // 3. Freeverse advertises to owner that there is an offer to buy his asset at price
    // 4. seller's mobile app sends to Freeverse: sigSeller and params
    // 5. Freeverse checks signature and returns to seller: OK, failed
    // 6. Freeverse FREEZES the player by sending a TX to the BLOCKCHAIN
    // 7. If freeze went OK:
    //          urges buyer to complete payment
    //    If freeze not OK (he probably sold the player in a different market)
    //          tells the buyer to forget about this player
    // 8. Freeverse receives confirmation from Paypal, Apple, GooglePay... of payment buyer -> seller
    // 9. Freeverse COMPLETES TRANSFER OF PLAYER USING BLOCKCHAIN
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, sellerRnd, validUntil, zeroOfferValidUntil, sellerTeamId, sellerAccount).should.be.fulfilled;
    isTeamFrozen = await market.isTeamFrozen(sellerTeamId.toNumber()).should.be.fulfilled;
    isTeamFrozen.should.be.equal(true);
    truffleAssert.eventEmitted(tx, "TeamFreeze", (event) => {
      return event.teamId.should.be.bignumber.equal(sellerTeamId) && event.frozen.should.be.equal(true);
    });
    
    tx = await marketUtils.completeTeamAuction(
      owners.market, 
      currencyId, price, sellerRnd, validUntil, zeroOfferValidUntil, sellerTeamId, 
      extraPrice, buyerRnd, buyerAccount
    ).should.be.fulfilled;
    
    truffleAssert.eventEmitted(tx, "TeamFreeze", (event) => {
      return event.teamId.should.be.bignumber.equal(sellerTeamId) && event.frozen.should.be.equal(false);
    });

    let finalOwner = await market.getOwnerTeam(sellerTeamId.toNumber()).should.be.fulfilled;
    finalOwner.should.be.equal(buyerAccount.address);
  });

  it("teams: completes a PUT_FOR_SALE and AGREE_TO_BUY via MTXs (same as previous, but with one single call)", async () => {
    await marketUtils.transferTeamViaAuction(owners.market, market, sellerTeamId, sellerAccount, buyerAccount); 
  });

  
  it("teams: fails a PUT_FOR_SALE and AGREE_TO_BUY via MTXs because one of its players already frozen", async () => {

    // make sure we'll put for sale a player who belongs to the team that we will also put for sale.
    teamId = await market.getCurrentTeamIdFromPlayerId(playerId).should.be.fulfilled;
    teamId.should.be.bignumber.equal(sellerTeamId);
    
    // put player:
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.fulfilled;
    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(true);
    
    // fail to put team:
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, sellerRnd, validUntil, zeroOfferValidUntil, sellerTeamId, sellerAccount).should.be.rejected;
    isTeamFrozen = await market.isTeamFrozen(sellerTeamId.toNumber()).should.be.fulfilled;
    isTeamFrozen.should.be.equal(false);
    
  });


  // ------------------------------------------------------------------------------------ 
  // ------------------------------------------------------------------------------------ 
  // ------------------------------------------------------------------------------------ 
  // ----------------------------------------------------------------- PLAYERS 
  // ------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------

  it("players: fails a PUT_FOR_SALE and AGREE_TO_BUY via MTXs because his team is already frozen", async () => {

    // make sure we'll put for sale a player who belongs to the team that we will also put for sale.
    teamId = await market.getCurrentTeamIdFromPlayerId(playerId).should.be.fulfilled;
    teamId.should.be.bignumber.equal(sellerTeamId);

    // put team:
    tx = await marketUtils.freezeTeam(owners.market, currencyId, price, sellerRnd, validUntil, zeroOfferValidUntil, sellerTeamId, sellerAccount).should.be.fulfilled;
    isTeamFrozen = await market.isTeamFrozen(sellerTeamId.toNumber()).should.be.fulfilled;
    isTeamFrozen.should.be.equal(true);
    
    // fail to put player:
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.rejected;
    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(false);
  });
  
  
  it("players: completes a MAKE_AN_OFFER via MTXs", async () => {
    // now, sellerRnd is fixed by offerer
    offererRnd = 23987435;
    offerValidUntil = now.toNumber() + 3600; // valid for an hour

    const tx = await marketUtils.acceptOffer(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, playerId, sellerAccount).should.be.fulfilled;
    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(true);
    truffleAssert.eventEmitted(tx, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(true);
    });

    // the MTX was actually created before the seller put the asset for sale, but it is used now to complete the auction  
    const {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerOffer(
      currencyId, price, offererRnd, playerId, offerValidUntil, buyerTeamId, buyerAccount
    );
    const tx2 = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, buyerTeamId, sigBuyer).should.be.fulfilled;

    truffleAssert.eventEmitted(tx2, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(false);
    });

    let finalOwner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    finalOwner.should.be.equal(buyerAccount.address);
  });
  
  it("players: fails a MAKE_AN_OFFER via MTXs because offerValidUntil had expired", async () => {
    // now, sellerRnd is fixed by offerer
    offererRnd = 23987435;
    offerValidUntil = now.toNumber() - 10; // valid until one sec in the past
    tx = await marketUtils.acceptOffer(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, playerId, sellerAccount).should.be.rejected;

    offerValidUntil = now.toNumber() + 10; // valid until one sec in the past
    tx = await marketUtils.acceptOffer(owners.market, currencyId, price, offererRnd, validUntil, offerValidUntil, playerId, sellerAccount).should.be.fulfilled;
    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(true);
    truffleAssert.eventEmitted(tx, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(true);
    });
  });
  
  it("players: fails a freezePlayer via MTXs because validUntil is too large", async () => {
    // validUntil is capped to avoid malicious use of MTXs in the future. Currenly capped to AUCTION_TIME + POST_AUCTION_TIME = 1d + 2d = 3 days
    // Check that default value works, 2 days work, 3 days fail
    // validUntil = now.toNumber() + AUCTION_TIME;
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.fulfilled;
    validUntil2 = now.toNumber() + 3600*24*3 + 10; // 3 days and 10 sec
    playerId2 = playerId.add(web3.utils.toBN(1));
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil2, playerId2, sellerAccount).should.be.fulfilled;
    validUntil2 = now.toNumber() + 3600*24*4 + 10; // 4 days and 10 sec
    playerId2 = playerId.add(web3.utils.toBN(2));
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil2, playerId2, sellerAccount).should.be.rejected;
  });
  
  it("players: fails a PUT_FOR_SALE and AGREE_TO_BUY via MTXs because targetTeam = originTeam", async () => {
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.fulfilled;
    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(true);
    truffleAssert.eventEmitted(tx, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(true);
    });
    
    const {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil, zeroOfferValidUntil,
      playerId, sellerTeamId,
      sellerAccount
    );
  
    await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, sellerTeamId, sigBuyer).should.be.rejected;
  });
  
  it("players: completes a PUT_FOR_SALE and AGREE_TO_BUY via MTXs", async () => {
    // 1. buyer's mobile app sends to Freeverse: sigBuyer AND params (currencyId, price, ....)
    // 2. Freeverse checks signature and returns to buyer: OK, failed
    // 3. Freeverse advertises to owner that there is an offer to buy his asset at price
    // 4. seller's mobile app sends to Freeverse: sigSeller and params
    // 5. Freeverse checks signature and returns to seller: OK, failed
    // 6. Freeverse FREEZES the player by sending a TX to the BLOCKCHAIN
    // 7. If freeze went OK:
    //          urges buyer to complete payment
    //    If freeze not OK (he probably sold the player in a different market)
    //          tells the buyer to forget about this player
    // 8. Freeverse receives confirmation from Paypal, Apple, GooglePay... of payment buyer -> seller
    // 9. Freeverse COMPLETES TRANSFER OF PLAYER USING BLOCKCHAIN
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.fulfilled;

    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(true);
    truffleAssert.eventEmitted(tx, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(true);
    });

    const {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil, zeroOfferValidUntil,
      playerId, buyerTeamId,
      buyerAccount
    );
  
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, buyerTeamId, sigBuyer).should.be.fulfilled;

    truffleAssert.eventEmitted(tx, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(false);
    });

    let finalOwner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    finalOwner.should.be.equal(buyerAccount.address);
  });
  
  it("players: fails a PUT_FOR_SALE and AGREE_TO_BUY via MTXs because post_auction time had passed", async () => {
    // validUntil = now + AUCTION_TIME = now + 48 hours
    // the payment must take place within 48 hours after valid until, so within 4 days from now.
    // We show that 4 days - 10 sec work, but 4 days + 10 sec fail
    validUntil0 = now.toNumber() + AUCTION_TIME;
    playerId0 = playerId.add(web3.utils.toBN(1));
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil0, playerId0, sellerAccount).should.be.fulfilled;

    await timeTravel.advanceTime(4*24*3600-10);
    await timeTravel.advanceBlock().should.be.fulfilled;

    var {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil0, zeroOfferValidUntil,
      playerId0, buyerTeamId,
      buyerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId0, buyerTeamId, sigBuyer).should.be.fulfilled;


    // try again
    now0 = await market.getBlockchainNowTime().should.be.fulfilled;
    validUntil0 = now0.toNumber() + AUCTION_TIME;
    playerId0 = playerId.add(web3.utils.toBN(2));
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil0, playerId0, sellerAccount).should.be.fulfilled;

    await timeTravel.advanceTime(4*24*3600+10);
    await timeTravel.advanceBlock().should.be.fulfilled;

    var {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil0, zeroOfferValidUntil,
      playerId0, buyerTeamId,
      buyerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId0, buyerTeamId, sigBuyer).should.be.rejected;
  });
  
  it("players: test that valid until can be larger than AUCTION_TIME and complete transaction", async () => {
    // this test illustrates an undesired behaviour: TODO - change solidity code
    validUntil0 = now.toNumber() + AUCTION_TIME + 12 * 3600;
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil0, playerId, sellerAccount).should.be.fulfilled;
    await timeTravel.advanceTime(AUCTION_TIME + 6 * 3600);
    await timeTravel.advanceBlock().should.be.fulfilled;

    const {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil0, zeroOfferValidUntil,
      playerId, buyerTeamId,
      buyerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, buyerTeamId, sigBuyer).should.be.fulfilled;
  });

  it("players: completes a PUT_FOR_SALE and AGREE_TO_BUY via MTXs - via function call", async () => {
    await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, buyerTeamId, sellerAccount, buyerAccount).should.be.fulfilled;
  });
  
  
  it("players: tests constraints on players", async () => {
    await market.addAcquisitionConstraint(buyerTeamId, valUnt = now.toNumber() + 1000, n = 1, {from: owners.COO}).should.be.fulfilled;
    // first acquisition works:
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.fulfilled;

    var {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil, zeroOfferValidUntil,
      playerId, buyerTeamId,
      buyerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, buyerTeamId, sigBuyer).should.be.fulfilled;

    // second acquisition should fail:
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 5);
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.fulfilled;

    var {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil, zeroOfferValidUntil,
      playerId, buyerTeamId,
      buyerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, buyerTeamId, sigBuyer).should.be.rejected;
  });  

  it("behaviour of getCurrentTeamIdFromPlayerId", async () => {
    playerId = await createSpecialPlayerId();

    teamId = await market.getCurrentTeamIdFromPlayerId(playerId).should.be.fulfilled;
    teamId.toNumber().should.be.equal(ACADEMY_TEAM_ID);

    teamId = await market.getCurrentTeamIdFromPlayerId(id = 0).should.be.fulfilled;
    teamId.toNumber().should.be.equal(NULL_TEAMID);
    
    teamId = await market.getCurrentTeamIdFromPlayerId(id = 43214234).should.be.fulfilled;
    teamId.toNumber().should.be.equal(NULL_TEAMID);
  });
  
  
  it("ownership functions of Academy Players", async () => {
    owner = await market.getOwnerTeam(ACADEMY_TEAM_ID).should.be.fulfilled;
    owner.should.be.equal(owners.market);

    tx = await assets.setMarket(freeverseAccount.address, {from: owners.superuser}).should.be.fulfilled;

    owner = await market.getOwnerTeam(ACADEMY_TEAM_ID).should.be.fulfilled;
    owner.should.be.equal(freeverseAccount.address);

    playerId = await createSpecialPlayerId();

    teamId = await market.getCurrentTeamIdFromPlayerId(playerId).should.be.fulfilled;
    teamId.toNumber().should.be.equal(ACADEMY_TEAM_ID);

    owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    owner.should.be.equal(freeverseAccount.address);

    is = await market.getIsSpecial(playerId).should.be.fulfilled;
    is.should.be.equal(true);

    was = await market.wasPlayerCreatedVirtually(playerId).should.be.fulfilled;
    was.should.be.equal(false);
  
    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(false)
    
    tx = await assets.setMarket(owners.market, {from: owners.superuser}).should.be.fulfilled;
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd, validUntil, playerId).should.be.fulfilled;

    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(true);

    owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    owner.should.be.equal(owners.market);

    was = await market.wasPlayerCreatedVirtually(playerId).should.be.fulfilled;
    was.should.be.equal(false);
  });

  
  it("special players: completes a PUT_FOR_SALE and AGREE_TO_BUY via MTXs", async () => {
    playerId = await createSpecialPlayerId();

    tx = await assets.setMarket(owners.COO, {from: owners.superuser}).should.be.fulfilled;
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd, validUntil, playerId).should.be.rejected;
    tx = await assets.setMarket(owners.market, {from: owners.superuser}).should.be.fulfilled;
    truffleAssert.eventEmitted(tx, "TeamTransfer", (event) => {
      return event.teamId.toNumber() == 1 && event.to == owners.market;
    });

    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd, validUntil, playerId).should.be.fulfilled;

    isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(true);

    truffleAssert.eventEmitted(tx, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(true);
    });
    

    var {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil, zeroOfferValidUntil,
      playerId, buyerTeamId,
      buyerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, buyerTeamId, sigBuyer).should.be.fulfilled;


    truffleAssert.eventEmitted(tx, "PlayerFreeze", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.frozen.should.be.equal(false);
    });
    let finalOwner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    finalOwner.should.be.equal(buyerAccount.address);

    // test that Freeverse cannot put the same player again in the market
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, freeverseAccount).should.be.rejected;
    
    // test that the new owner can sell freely as always
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, buyerAccount).should.be.fulfilled;

    // in particular, it can re-bought by the original seller
    var {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil, zeroOfferValidUntil,
      playerId, sellerTeamId,
      sellerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, sellerTeamId, sigBuyer).should.be.fulfilled;
  });
  
  it("special players: same special player cannot be sold twice", async () => {
    playerId = await createSpecialPlayerId();
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd, validUntil, playerId).should.be.fulfilled;
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd, validUntil, playerId).should.be.rejected;

    var {0: sigBuyer, 1: auctionId, 2: buyerHiddenPrice} = signer.signPlayerBid(
      currencyId, price, extraPrice,
      sellerRnd, buyerRnd, validUntil, zeroOfferValidUntil,
      playerId, buyerTeamId,
      buyerAccount
    );
    tx = await marketUtils.completePlayerAuction(owners.market, auctionId, buyerHiddenPrice, playerId, buyerTeamId, sigBuyer).should.be.fulfilled;

    // slight variations of auction data fail because they refer to the same playerId 
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd, validUntil, playerId).should.be.rejected;
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd+1, validUntil, playerId).should.be.rejected;
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price+1, sellerRnd, validUntil, playerId).should.be.rejected;
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price+1, sellerRnd, validUntil+1, playerId).should.be.rejected;
    // a different playerId does work
    tx = await marketUtils.freezeAcademyPlayer(owners.market, currencyId, price, sellerRnd, validUntil, playerId.add(web3.utils.toBN(1))).should.be.fulfilled;
  });

  it("special players: check children of special players", async () => {
    training= await TrainingPoints.new().should.be.fulfilled;
    playerId = await createSpecialPlayerId();
    sumSkills = await market.getSumOfSkills(playerId).should.be.fulfilled;
    sumSkills.toNumber().should.be.equal(16912);
    fwd = await market.getForwardness(playerId).should.be.fulfilled;
    fwd.toNumber().should.be.equal(3);

    matchStartTime = 50*365*24*3600;
    ageSecs = matchStartTime + 38*365*24*3600;
    for (i = 0; i < 10; i++) {
      thisId = playerId.add(web3.utils.toBN(i));
      newId = await training.generateChildIfNeeded(thisId, ageSecs, matchStartTime).should.be.fulfilled;
    }
  });

  it("dismissPlayer player works", async () => {
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sigSeller = signer.signDismissPlayer(validUntil, playerId.toString(), sellerAccount);
    onwer = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    onwer.should.be.equal(sellerAccount.address);
    
    // First of all, Freeverse and Buyer check the signature
    // In this case, using web3:
    recoveredSellerAddr = await web3.eth.accounts.recover(sigSeller);
    recoveredSellerAddr.should.be.equal(sellerAccount.address);
  
    // We check that player is not frozen
    let isPlayerFrozen = await market.isPlayerFrozenFiat(playerId).should.be.fulfilled;
    isPlayerFrozen.should.be.equal(false);
  
    tx = await market.dismissPlayer(
      validUntil,
      playerId,
      sigSeller.r,
      sigSeller.s,
      sigSeller.v,
      {from: owners.market}
    ).should.be.fulfilled;

    onwer = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    onwer.should.be.equal(sellerAccount.address);

    teamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry = 0);
    
    state = await market.getPlayerState(playerId).should.be.fulfilled;
    const PLAYERS_PER_TEAM_MAX = 25;
    newState = await assets.setCurrentShirtNum(state, PLAYERS_PER_TEAM_MAX).should.be.fulfilled;

    truffleAssert.eventEmitted(tx, "PlayerStateChange", (event) => {
      return event.playerId.should.be.bignumber.equal(playerId) && event.state.should.be.bignumber.equal(newState);
    });

    onwer = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    onwer.should.be.equal(sellerAccount.address);

    ids = await market.getPlayerIdsInTeam(teamId).should.be.fulfilled;
    isFree = await market.isFreeShirt(ids[shirtNum = playerIdxInCountry], shirtNum ).should.be.fulfilled
    isFree.should.be.equal(true);
    isFree = await market.isFreeShirt(ids[shirtNum= playerIdxInCountry + 1], shirtNum).should.be.fulfilled
    isFree.should.be.equal(false);
    isFree = await market.isFreeShirt(ids[shirtNum= playerIdxInCountry - 1], shirtNum).should.be.fulfilled
    isFree.should.be.equal(false);
  });
  
  it("dismissPlayers: owner can still sell in auction after a dismiss", async () => {
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sigSeller = signer.signDismissPlayer(validUntil, playerId.toString(), sellerAccount);

    tx = await market.dismissPlayer(
      validUntil,
      playerId,
      sigSeller.r,
      sigSeller.s,
      sigSeller.v,
      {from: owners.market}
    ).should.be.fulfilled;
    
    // check that the shirtNum of this player is NULL ( = PLAYER_PER_TEAM_MAX)
    state = await market.getPlayerState(playerId).should.be.fulfilled;
    const PLAYERS_PER_TEAM_MAX = 25;
    result = await market.getCurrentShirtNum(state).should.be.fulfilled;
    result.toNumber().should.be.equal(PLAYERS_PER_TEAM_MAX);

    await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, buyerTeamId, sellerAccount, buyerAccount).should.be.fulfilled;

    // check that the shirtNum is now correct
    state = await market.getPlayerState(playerId).should.be.fulfilled;
    result = await market.getCurrentShirtNum(state).should.be.fulfilled;
    (result.toNumber() != PLAYERS_PER_TEAM_MAX).should.be.equal(true);
  });

  it("dismissPlayers: complete in transit can be achieved if dismissing first", async () => {
    // sellerTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry1 = 0);
    sellerPlayerIds = Array.from(new Array(10), (x,i) => 0);
    // Prepare 10 player IDs
    for (n = 0; n < 10; n++) {
      sellerPlayerIds[n] = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdInCountry2 = n).should.be.fulfilled;
    }
    ownerTeamId = await market.getCurrentTeamIdFromPlayerId(sellerPlayerIds[0]).should.be.fulfilled;
    ownerTeamId.should.be.bignumber.equal(sellerTeamId);
    ownerTeamId = await market.getCurrentTeamIdFromPlayerId(sellerPlayerIds[7]).should.be.fulfilled;
    ownerTeamId.should.be.bignumber.equal(sellerTeamId);
    // Transfer the first 7. No prob, there's space in the buyerTeam
    for (n = 0; n < 7; n++) {
        await marketUtils.transferPlayerViaAuction(owners.market, market, sellerPlayerIds[n], buyerTeamId, sellerAccount, buyerAccount).should.be.fulfilled;
    }
    // Player 0 belongs to buyer, player 7 still to seller
    ownerTeamId = await market.getCurrentTeamIdFromPlayerId(sellerPlayerIds[0]).should.be.fulfilled;
    ownerTeamId.should.be.bignumber.equal(buyerTeamId);
    owner = await market.getOwnerPlayer(sellerPlayerIds[0]).should.be.fulfilled;
    owner.should.be.equal(buyerAccount.address);
    ownerTeamId = await market.getCurrentTeamIdFromPlayerId(sellerPlayerIds[7]).should.be.fulfilled;
    ownerTeamId.should.be.bignumber.equal(sellerTeamId);

    state = await market.getPlayerState(sellerPlayerIds[7]).should.be.fulfilled;
    isInTransit = await market.getIsInTransitFromState(state).should.be.fulfilled;
    isInTransit.should.be.equal(false);

    await marketUtils.transferPlayerViaAuction(owners.market, market, sellerPlayerIds[7], buyerTeamId, sellerAccount, buyerAccount).should.be.fulfilled;

    state = await market.getPlayerState(sellerPlayerIds[7]).should.be.fulfilled;
    isInTransit = await market.getIsInTransitFromState(state).should.be.fulfilled;
    isInTransit.should.be.equal(true);

    nTransit = await market.getNPlayersInTransitInTeam(buyerTeamId).should.be.fulfilled;
    nTransit.toNumber().should.be.equal(1);
    await market.completePlayerTransit(sellerPlayerIds[7]).should.be.rejected;

    sigBuyer = signer.signDismissPlayer(validUntil, sellerPlayerIds[0].toString(), buyerAccount);
    tx = await market.dismissPlayer(
      validUntil,
      sellerPlayerIds[0],
      sigBuyer.r,
      sigBuyer.s,
      sigBuyer.v,
      {from: owners.market}
    ).should.be.fulfilled;

    await market.completePlayerTransit(sellerPlayerIds[7]).should.be.fulfilled;

    state = await market.getPlayerState(sellerPlayerIds[7]).should.be.fulfilled;
    isInTransit = await market.getIsInTransitFromState(state).should.be.fulfilled;
    isInTransit.should.be.equal(false);
  });

  it("dismissPlayers: Academy can not sell in auction after a dismiss", async () => {
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sigSeller = signer.signDismissPlayer(validUntil, playerId.toString(), sellerAccount);

    tx = await market.dismissPlayer(
      validUntil,
      playerId,
      sigSeller.r,
      sigSeller.s,
      sigSeller.v,
      {from: owners.market}
    ).should.be.fulfilled;

    await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, buyerTeamId, freeverseAccount, buyerAccount).should.be.rejected;
  });

  it("dismissPlayers: Academy can not sell as buynow", async () => {
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sigSeller = signer.signDismissPlayer(validUntil, playerId.toString(), sellerAccount);

    tx = await market.dismissPlayer(
      validUntil,
      playerId,
      sigSeller.r,
      sigSeller.s,
      sigSeller.v,
      {from: owners.market}
    ).should.be.fulfilled;

    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.rejected;
  });
  
  it("transferBuyNow field issue: this transfer failed because player sum skills was larger than allowed", async () => {
    playerId = '25774653249826802746817168298702153927337350437920121584357232';
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.rejected;
  });
  
  it("dismissPlayers fails when already sold, not owner any more", async () => {
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sigSeller = signer.signDismissPlayer(validUntil, playerId.toString(), sellerAccount);
    
    await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, buyerTeamId, sellerAccount, buyerAccount).should.be.fulfilled;
    onwer = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    onwer.should.be.equal(buyerAccount.address);
    
    tx = await market.dismissPlayer(
      validUntil,
      playerId,
      sigSeller.r,
      sigSeller.s,
      sigSeller.v,
      {from: owners.market}
    ).should.be.rejected;
  });
  
  it("dismissPlayers fails if frozen first", async () => {
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sigSeller = signer.signDismissPlayer(validUntil, playerId.toString(), sellerAccount);
    tx = await marketUtils.putPlayerForSale(owners.market, currencyId, price, sellerRnd, validUntil, playerId, sellerAccount).should.be.fulfilled;
    
    tx = await market.dismissPlayer(
      validUntil,
      playerId,
      sigSeller.r,
      sigSeller.s,
      sigSeller.v,
      {from: owners.market}
    ).should.be.rejected;
  });
  
  it("dismissPlayers fails if too long passed", async () => {
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    sigSeller = signer.signDismissPlayer(validUntil, playerId.toString(), sellerAccount);

    await timeTravel.advanceTime(validUntil - now + 200);
    await timeTravel.advanceBlock().should.be.fulfilled;

    tx = await market.dismissPlayer(
      validUntil,
      playerId,
      sigSeller.r,
      sigSeller.s,
      sigSeller.v,
      {from: owners.market}
    ).should.be.rejected;
  });


  
  it("buyNow: buy now player fails for players with too large sumSkills", async () => {
    playerId = await createSpecialPlayerId(id = 4312432432);
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);

    // if value is too low, it fails
    sumSkillsAllowed = 10000;
    sum = await market.getSumOfSkills(playerId).should.be.fulfilled;
    (sum.toNumber() < sumSkillsAllowed).should.be.equal(false);
    
    var {0: sumSkills, 1: minLapseTime, 2: lastUpdate} = await market.getNewMaxSumSkillsBuyNowPlayer().should.be.fulfilled;
    
    await market.setNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed, newLapseTime = 0, {from: owners.COO}).should.be.fulfilled;
    await timeTravel.advanceTime(minLapseTime.toNumber()+100);
    await timeTravel.advanceBlock().should.be.fulfilled;
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.rejected;

    // if value is too low, it fails
    sumSkillsAllowed = 20000;
    sum = await market.getSumOfSkills(playerId).should.be.fulfilled;
    (sum.toNumber() < sumSkillsAllowed).should.be.equal(true);
    await market.setNewMaxSumSkillsBuyNowPlayer(sumSkillsAllowed, newLapseTime = 0, {from: owners.COO}).should.be.fulfilled;
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.fulfilled;
  });
  
  it("buyNow: buy now player", async () => {
    playerId = await createSpecialPlayerId(id = 4312432432);

    // it currently has no owner:
    owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    owner.should.be.equal(owners.market);
    
    // set target to a bot team => should fail
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 2);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.rejected;

    // set target to a Academy team => should fail
    tx = await market.transferBuyNowPlayer(playerId.toString(), ACADEMY_TEAM_ID, {from: owners.market}).should.be.rejected;

    // set target to a team that does not exist => should fail
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 2, teamIdxInCountry2 = 2);
    was = await market.wasTeamCreatedVirtually(targetTeamId).should.be.fulfilled;
    was.should.be.equal(false);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.rejected;
    
    // set target to a human team => should work
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.fulfilled;
    
    owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    owner.should.be.equal(buyerAccount.address);
  });

  it("buyNow: buyNow of a non-academy player fails", async () => {
    playerId = await createSpecialPlayerId(id = 4312432432);
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.fulfilled;
    
    // a non academy player would not work
    playerId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, playerIdxInCountry = 4);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.rejected;
  });

  it("buyNow: after acquiring via buyNow, user can sell normally", async () => {
    playerId = await createSpecialPlayerId(id = 4312432432);
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 0);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.fulfilled;
    owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    owner.should.be.equal(sellerAccount.address);
    await marketUtils.transferPlayerViaAuction(owners.market, market, playerId, buyerTeamId, sellerAccount, buyerAccount).should.be.fulfilled;
  });

  it("buyNow: The same academy player cannot be sold twice via buyNow", async () => {
    // // ownership of teams:  0 - seller, 1 - buyer, 2 - buyer
    // await assets.transferFirstBotToAddr(tz = 1, countryIdxInTZ = 0, buyerAccount.address).should.be.fulfilled;
    playerId = await createSpecialPlayerId(id = 4312432432);
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 0);
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.fulfilled;
    owner = await market.getOwnerPlayer(playerId).should.be.fulfilled;
    owner.should.be.equal(sellerAccount.address);

    targetTeamId = await assets.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, teamIdxInCountry2 = 1);
    tx = await market.transferBuyNowPlayer(playerId, targetTeamId, {from: owners.market}).should.be.rejected;
    tx = await market.transferBuyNowPlayer(playerId.add(web3.utils.toBN(1)), targetTeamId, {from: owners.market}).should.be.fulfilled;
  });

  
  it("user can forbid BuyNow operated by FV", async () => {
    playerId = await createSpecialPlayerId(id = 4312432432);
    targetTeamId = await assets.encodeTZCountryAndVal(tz = 2, countryIdxInTZ = 0, teamIdxInCountry2 = 0);
    JOSE = accounts[0];
    await assets.transferFirstBotToAddr(tz = 2, countryIdxInTZ = 0, JOSE, {from: owners.relay}).should.be.fulfilled;
    teamOwner = await market.getOwnerTeam(targetTeamId).should.be.fulfilled;
    teamOwner.should.be.equal(JOSE);
    // if user explicitly forbidds buyNows, it will fail:
    await market.setIsBuyNowAllowedByOwner(targetTeamId, isAllowed = false, {from: JOSE}).should.be.fulfilled;
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.rejected;
    // if user explicitly allows buyNows, it will succeed:
    await market.setIsBuyNowAllowedByOwner(targetTeamId, isAllowed = true, {from: JOSE}).should.be.fulfilled;
    tx = await market.transferBuyNowPlayer(playerId.toString(), targetTeamId, {from: owners.market}).should.be.fulfilled;
  });
  
  
  // OTHER TESTS
  
  it("test accounts from truffle and web3", async () => {
    accountsWeb3 = await web3.eth.getAccounts().should.be.fulfilled;
    accountsWeb3[0].should.be.equal(accounts[0]);
  });
  
  it('teams: deterministic sign (values used in market.notary test, ref XX2) ', async () => {
    sellerTeamId.should.be.bignumber.equal('274877906944');

    const sellerAccount = await web3.eth.accounts.privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
    const buyerAccount = await web3.eth.accounts.privateKeyToAccount('0x3693a221b147b7338490aa65a86dbef946eccaff76cc1fc93265468822dfb882');

    // Define params of the seller, and sign
    validUntil = 2000000000;
    buyerHiddenPrice = signer.concatHash(
      ["uint256", "uint256"],
      [extraPrice, buyerRnd]
    );
    offValidUntil = validUntil - 300;

    const sellerHiddenPrice = await market.hashPrivateMsg(currencyId, price, sellerRnd).should.be.fulfilled;
    const message = await signer.computePutAssetForSaleDigestNoPrefixFromHiddenPrice(sellerHiddenPrice, sellerTeamId.toString(10), validUntil, offValidUntil);
    const sigSeller = sellerAccount.sign(message);

    sellerHiddenPrice.should.be.equal('0x4200de738160a9e6b8f69648fbb7feb323f73fac5acff1b7bb546bb7ac3591fa');
    message.should.be.equal('0x6b564a2ff0d5da6fb2ce68118e4b009b92062e5e071e32b47ae4d53dc61fdaf6');
    sigSeller.messageHash.should.be.equal('0xb03aa629623298051d0d8b1f730ae73ab28630b852180351b86c63cbda33f6e9');
    sigSeller.signature.should.be.equal('0xb172e37a072c67db729f083f5b40c0a461570b757a98a455aa1042904b80446816777096531357157c2f5998deb3885d7155e87dbd538f38d9bbda31904daafc1b');

    const prefixed = await market.prefixed(message).should.be.fulfilled;
    const buyerMsg = await market.buildAgreeToBuyTeamTxMsg(prefixed, buyerHiddenPrice).should.be.fulfilled;
    const sigBuyer = buyerAccount.sign(buyerMsg);

    buyerMsg.should.be.equal('0x02db7053ab7b9611e48691c0e847c6d56ddcaf7c2b4870e3386a796cc4fbfe09');
    sigBuyer.messageHash.should.be.equal('0x00100dd971508527d1741ea7cb10fdcf33c0fefb80c03b113e81b2604e3654ee');
    sigBuyer.signature.should.be.equal('0x414ea45ef8bf69f49e69471a3582545e6a4c681117d799e52aa43f33b1799121577520b17accad661041b23a38435c460d8fbb25574f6a7851125ec5ca95ba8a1c');
  });

  it('players: deterministic sign (values used in market.notary test) ', async () => {
    const sellerAccount = await web3.eth.accounts.privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
    const buyerAccount = await web3.eth.accounts.privateKeyToAccount('0x3693a221b147b7338490aa65a86dbef946eccaff76cc1fc93265468822dfb882');

    // Define params of the seller, and sign
    playerId = '274877906944';
    buyerTeamId = '274877906945';
    validUntil = 2000000000;
    offValidUntil = validUntil - 300;
    buyerHiddenPrice = signer.concatHash(
      ["uint256", "uint256"],
      [extraPrice, buyerRnd]
    );

    const sellerHiddenPrice = await market.hashPrivateMsg(currencyId, price, sellerRnd).should.be.fulfilled;
    const message = await signer.computePutAssetForSaleDigestNoPrefixFromHiddenPrice(sellerHiddenPrice, sellerTeamId.toString(10), validUntil, offValidUntil);
    const sigSeller = sellerAccount.sign(message);
    const auctionId = await market.computeAuctionId(sellerHiddenPrice, playerId, validUntil, offValidUntil).should.be.fulfilled;

    sellerHiddenPrice.should.be.equal('0x4200de738160a9e6b8f69648fbb7feb323f73fac5acff1b7bb546bb7ac3591fa');
    message.should.be.equal('0x6b564a2ff0d5da6fb2ce68118e4b009b92062e5e071e32b47ae4d53dc61fdaf6');
    sigSeller.messageHash.should.be.equal('0xb03aa629623298051d0d8b1f730ae73ab28630b852180351b86c63cbda33f6e9');
    sigSeller.signature.should.be.equal('0xb172e37a072c67db729f083f5b40c0a461570b757a98a455aa1042904b80446816777096531357157c2f5998deb3885d7155e87dbd538f38d9bbda31904daafc1b');

    const buyerMsg = await market.buildAgreeToBuyPlayerTxMsg(auctionId, buyerHiddenPrice, buyerTeamId).should.be.fulfilled;
    const sigBuyer = buyerAccount.sign(buyerMsg);
    sigBuyer.messageHash.should.be.equal('0x95478a09b9de0d5b8f95db436265ab21f2e8eabc7d2ff6bd58863b515a7c637c');
    sigBuyer.signature.should.be.equal('0x8bfc8368ec014bad0e1c540cf2a1c5a567b2b650242786229290fbd45dfb30fa21f9f30cb9b6ae5b7d229b8b551ce01d3e53f384460a8651b786357d49b18aa81c');
  });

  it('players: deterministic sign (values used in market.notary test, ref XX2) ', async () => {
    const sellerAccount = await web3.eth.accounts.privateKeyToAccount('0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54');
    const buyerAccount = await web3.eth.accounts.privateKeyToAccount('0x3693a221b147b7338490aa65a86dbef946eccaff76cc1fc93265468822dfb882');

    // Define params of the seller, and sign
    playerId = '274877906944';
    buyerTeamId = '274877906945';
    validUntil = 2000000000;
    offValidUntil = validUntil - 300;
    buyerHiddenPrice = signer.concatHash(
      ["uint256", "uint256"],
      [0, 0]
    );

    const sellerHiddenPrice = await market.hashPrivateMsg(currencyId, price, sellerRnd).should.be.fulfilled;
    const message = await signer.computePutAssetForSaleDigestNoPrefixFromHiddenPrice(sellerHiddenPrice, sellerTeamId.toString(10), validUntil, offValidUntil);
    const sigSeller = sellerAccount.sign(message);
    const auctionId = await market.computeAuctionId(sellerHiddenPrice, playerId, validUntil, offValidUntil).should.be.fulfilled;

    const buyerMsg = await market.buildAgreeToBuyPlayerTxMsg(auctionId, buyerHiddenPrice, buyerTeamId).should.be.fulfilled;
    const sigBuyer = buyerAccount.sign(buyerMsg);
    sigBuyer.messageHash.should.be.equal('0xc272356ecde3af2f8c3d04879f8c32b1ccc091ff155f0c9d2412f35620ccd235');
    sigBuyer.signature.should.be.equal('0xb3a17e9c821e4e6bd12554168add461d77f15da42657d284eb9a459ee646bdd15024a60a6332f8617ff82f5a1c5fedf4e005da620ac01673c71ad5c08bba2d221c');
  });
});
