/*
 Tests for all functions in Stakers.sol
*/
const expect = require('truffle-assertions');
const deployUtils = require('../utils/deployUtils.js');

const Stakers = artifacts.require("Stakers")
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
// TODO: add more tests that execute withdraw

contract('Stakers', (accounts) => {
  const inheritedArtfcts = [UniverseInfo, EncodingSkills, EncodingState, EncodingSkillsSetters, UpdatesBase];
  const [dummy, gameAddr, dummy2, bob, carol, dave, erin, frank, alice] = accounts

  let stakers
  let stake

  const it2 = async(text, f) => {};

  beforeEach(async () => {
    defaultSetup = deployUtils.getDefaultSetup(accounts);
    owners = defaultSetup.owners;
    depl = await deployUtils.deploy(owners, Proxy, Assets, Market, Updates, Challenges, inheritedArtfcts);
    [proxy, assets, market, updates] = depl;
    await deployUtils.setProxyContractOwners(proxy, assets, owners, owners.company).should.be.fulfilled;
    
    stakers  = await Stakers.new(proxy.address, 2000000000000000);
    stake = await stakers.requiredStake();
  });

////////////////////////////////////////////////////////////////////////////////////////////
  it("only COO" , async () => {
    await stakers.setGameOwner(frank, {from: dave}).should.be.rejected; // only COO can
    await stakers.setGameOwner(frank, {from: owners.COO}).should.be.fulfilled;

    await assets.setCOO(erin, {from: bob}).should.be.rejected;
    await assets.setCOO(erin, {from: owners.superuser}).should.be.fulfilled;

    await stakers.setGameOwner(frank, {from: owners.COO}).should.be.rejected; // only COO can
    await stakers.setGameOwner(frank, {from: erin}).should.be.fulfilled;
  });
  
  it("Tests game address", async () => {
    await expect.reverts(
      stakers.update(level = 1, alice),
      "Only gameOwner can call this function",
      "game not set yet, so it should revert"
    )
    await expect.reverts(
      stakers.setGameOwner(gameAddr, {from:alice}),
      "Only COO can call this function.",
      "wrong sender, so it should revert"
    )
    await expect.passes(
      stakers.setGameOwner(gameAddr, {from:owners.COO}),
      "failed to set game address"
    )
    past = await stakers.getPastEvents( 'NewGameOwner', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.newOwner.should.be.equal(gameAddr);
  })

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests enrolling", async () => {
    await expect.reverts(
      stakers.enrol({from:alice, value: stake}),
      null,
      "alice is not yet a trusted party, so it should revert"
    )
    await expect.reverts(
      stakers.addTrustedParty(alice, {from:gameAddr}),
      null,
      "only owners.COO can add trusted parties, so it should revert"
    )
    await expect.passes(
      stakers.addTrustedParty(alice, {from:owners.COO}),
      "failed to add alice as trusted party"
    )
    await expect.reverts(
      stakers.addTrustedParty(alice, {from:owners.COO}),
      null,
      "alice is already a trusted party, so it should revert"
    )
    await expect.passes(
      stakers.enrol({from:alice, value: stake}),
      "failed to enrol alice"
    )
  });

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests stake", async () => {
    assert.equal(0, await web3.eth.getBalance(stakers.address).should.be.fulfilled, "Initial contract should have 0 stake in place");

    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties).should.be.fulfilled;
    await deployUtils.enrol(stakers, stake, parties).should.be.fulfilled;

    assert.equal(parties.length*Number(stake),
      await web3.eth.getBalance(stakers.address).should.be.fulfilled,
      "Total stake is not the sum of all enrolled stakers stake"
    );

    await deployUtils.unenroll(stakers, parties);
    assert.equal(0, await web3.eth.getBalance(stakers.address).should.be.fulfilled);

    past = await stakers.getPastEvents( 'NewUnenrol', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    for (i = 0; i < parties.length; i++){ 
      past[i].args.staker.should.be.equal(parties[i]);
    }
  });

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests stakers can't unenroll after having done an update", async () => {
    await stakers.setGameOwner(gameAddr, {from:owners.COO}).should.be.fulfilled;
    await stakers.addTrustedParty(alice, {from:owners.COO}).should.be.fulfilled;
    await stakers.enrol({from:alice, value: stake}).should.be.fulfilled;
    await stakers.update(level = 0, alice, {from:gameAddr}).should.be.fulfilled;

    await expect.reverts(
      stakers.unEnroll({from:alice}),
      "failed to unenroll: staker currently updating",
      "alice is currently updating, so it should revert"
    )
    await stakers.finalize({from:gameAddr}).should.be.fulfilled;
    await expect.passes(
      stakers.unEnroll({from:alice}),
      "failed unenrolling alice"
    )

    past = await stakers.getPastEvents( 'NewEnrol', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.staker.should.be.equal(alice);
    past = await stakers.getPastEvents( 'AddedTrustedParty', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.party.should.be.equal(alice);
    past = await stakers.getPastEvents( 'NewGameLevel', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.level.toNumber().should.be.equal(1);
    past = await stakers.getPastEvents( 'FinalizedGameRound', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past.length.should.be.equal(1);
    
  })

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests adding reward", async () => {
    assert.equal(0, Number(await stakers.potBalance()));
    assert.equal(0, Number(await web3.eth.getBalance(stakers.address)));
    await expect.passes(
      stakers.addRewardToPot({value: stake}),
      "failed to add reward")
    assert.equal(Number(stake), Number(await web3.eth.getBalance(await stakers.address)));
    await expect.reverts(
      stakers.executeReward({from:owners.COO}),
      "failed to execute rewards: empty array",
      "no one deserves reward cause nothing has been played, so it should revert"
    )
    past = await stakers.getPastEvents( 'PotBalanceChange', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.newBalance.toNumber().should.be.equal(stake.toNumber());
  })

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests L0 -> L1 true -> start -> L1 true, the usual path", async () => {
    await stakers.setGameOwner(gameAddr, {from:owners.COO});
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties);
    await deployUtils.enrol(stakers, stake, parties);
    await expect.passes(
      stakers.addRewardToPot({value: stake}),
      "failed to add reward")

    // L0
    assert.equal(0, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(level = 0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    // L1
    assert.equal(1, (await stakers.level()).toNumber());
    await expect.reverts(
      stakers.update(level = 0, bob, {from:gameAddr}),
      "failed to update: resolving wrong level",
      "level 0 cannot be updated without starting a new verse, it should revert"
    )

    for (i=0; i<10; i++) {
      // start new verse
      await expect.passes(
        stakers.finalize({from:gameAddr}),
        "failed starting new verse"
      )

      // L0
      assert.equal(0, (await stakers.level()).toNumber());
      await expect.passes(
        stakers.update(level = 0, alice, {from:gameAddr}),
        "alice failed to update because he lied in previous game"
      )

      // L1
      assert.equal(1, (await stakers.level()).toNumber());
    }

    // execute reward and test that alice has more balance
    aliceBalanceBeforeRewarded = Number(await web3.eth.getBalance(alice));
    await expect.passes(
      stakers.executeReward({from:owners.COO}),
      "failed to execute reward"
    )

    await expect.passes(
      stakers.withdraw({from:alice}),
      "failed to withdraw alice's reward"
    )

    assert.isBelow(aliceBalanceBeforeRewarded, Number(await web3.eth.getBalance(alice)),
                 "Alice's current balance should be higher since she was rewarded");
                 
    past = await stakers.getPastEvents( 'RewardsExecuted', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past.length.should.be.equal(1);
  })

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests L0 -> L1 lie  -> L2 true -> start -> L1 lie  -> L2 true", async () => {
    await stakers.setGameOwner(gameAddr, {from:owners.COO});
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties);
    await deployUtils.enrol(stakers, stake, parties);

    // L0: first updater lies
    assert.equal(0, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(level = 0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    // L1: second updater (1st challenger) tells truth
    assert.equal(1, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(level = 1, bob, {from:gameAddr}),
      "bob failed to update"
    )

    assert.equal(2, (await stakers.level()).toNumber());

    // Ensure that nobody can update lev = 1 again, since we are at level = 2
    await expect.reverts(
      stakers.update(1, carol, {from:gameAddr}),
      "failed to update: resolving wrong level",
      "level 1 is already updated, it should revert"
    )

    // Allow update lev = 0 again, since we are at level = 2, it means that level 1
    // lied, and time enough passed to prove it. So the update of level 0
    // triggers a "resolve". Alice will be slashed by bob
    await expect.passes(
      stakers.update(level = 0, frank, {from:gameAddr}),
      "failed to update after enough time passed"
    )

    past = await stakers.getPastEvents( 'SlashedBy', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.slashedStaker.should.be.equal(alice);
    past[0].args.goodStaker.should.be.equal(bob);

    // ------------- start new verse ----------------
    // which implicitly slashes alice, the first updater
    await expect.passes(
      stakers.finalize({from:gameAddr}),
      "failed starting new verse"
    )
    

    // L0: check that Alice is not registered as staker anymore
    assert.equal(0, (await stakers.level()).toNumber());
    await expect.reverts(
      stakers.update(0, alice, {from:gameAddr}),
      "failed to update: staker not registered",
      "alice was slashed by bob and therefore it is removed from registered stakers, so it should revert"
    )
    // check that Alice cannot enrol again
    await expect.reverts(
      stakers.enrol({from:alice, value: stake}),
      "candidate was slashed previously",
      "alice was slashed by bob it can no longer enrol, so it should revert"
    )
    await expect.passes(
      stakers.update(0, bob, {from:gameAddr}),
      "bob failed to update after new verse"
    )

    // L1
    assert.equal(1, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(1, dave, {from:gameAddr}),
      "dave failed to update level 1"
    )

    // L2
    assert.equal(2, (await stakers.level()).toNumber());
  })

////////////////////////////////////////////////////////////////////////////////////////////
  it("Tests L0 -> L1 true -> L2 lie  -> L3 true -> start", async () => {
    await stakers.setGameOwner(gameAddr, {from:owners.COO}).should.be.fulfilled;
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties).should.be.fulfilled;
    await deployUtils.enrol(stakers, stake, parties).should.be.fulfilled;

    // L0
    assert.equal(0, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    // L1
    assert.equal(1, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(1, bob, {from:gameAddr}),
      "bob failed to update"
    )

    // L2
    assert.equal(2, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(2, dave, {from:gameAddr}),
      "dave failed to update"
    )

    // L3
    assert.equal(3, (await stakers.level()).toNumber());

    // make sure level 2 is not updatable
    await expect.reverts(
      stakers.update(2, erin, {from:gameAddr}),
      "failed to update: resolving wrong level",
      "we are at level 3, level 2 is not updatable anymore, so it should revert"
    )

    // challenge time for L3 has passed, and also challenge time for L1 has passed.
    // In other words dave  and alice told the truth, and the game can now call start
    // resolving that dave earns bob's stake, and alice earns reward. Also bob will
    // be slashed

    daveBalance = Number(await web3.eth.getBalance(dave));
    await expect.passes(
      stakers.finalize({from:gameAddr}),
      "failed to start from L3"
    )
    await expect.passes(
      stakers.withdraw({from:dave}),
      "dave failed to withdraw"
    )
    assert.isBelow(daveBalance, Number(await web3.eth.getBalance(dave)),
                 "Dave's current balance should be higher now, since he earned bob's stake");

  })


  it("Tests L0 -> L1 lie  -> L2 lie  -> L3 true -> L1 -> L2 true", async () => {
    await stakers.setGameOwner(gameAddr, {from:owners.COO});
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties);
    await deployUtils.enrol(stakers, stake, parties);

    // L0
    assert.equal(0, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    // L1
    assert.equal(1, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(1, bob, {from:gameAddr}),
      "bob failed to update"
    )

    // L2
    assert.equal(2, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(2, dave, {from:gameAddr}),
      "dave failed to update"
    )
    daveBalance = Number(await web3.eth.getBalance(dave));

    // L3
    assert.equal(3, (await stakers.level()).toNumber());

    // challenge time has passed, resolve from L3: bob will be slashed and dave earns bob's stake
    await expect.passes(
      stakers.update(1, erin, {from:gameAddr}),
      "erin failed to update"
    )

    // L2: because L3 was resolved with an update to L1, we are now at L2
    assert.equal(2, (await stakers.level()).toNumber());

    await expect.reverts(
      stakers.enrol({from:bob, value: stake}),
      "candidate was slashed previously",
      "bob was slashed, so it should revert"
    )
    await expect.passes(
      stakers.withdraw({from:dave}),
      "dave failed to withdraw"
    )

    assert.isBelow(daveBalance, Number(await web3.eth.getBalance(dave)),
                 "Dave current balance should be higher now, since he earned bob's stake");

    // start new verse
    await expect.passes(
      stakers.finalize({from:gameAddr}),
      "failed starting new verse"
    )

    await expect.reverts(
      stakers.enrol({from:bob, value: stake}),
      "candidate was slashed previously",
      "bob was slashed and will never be able to enrol again, so it should revert"
    )
  })

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests L0 -> L1 true -> L2 lie  -> L3 lie  -> L4 true -> L2 -> L3 true -> start", async () => {
    await stakers.setGameOwner(gameAddr, {from:owners.COO});
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties);
    await deployUtils.enrol(stakers, stake, parties);

    // L0
    assert.equal(0, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    // L1 - true
    assert.equal(1, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(1, bob, {from:gameAddr}),
      "bob failed to update"
    )

    // L2 - lie
    assert.equal(2, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(2, dave, {from:gameAddr}),
      "dave failed to update"
    )

    // L3 - lie
    assert.equal(3, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(3, erin, {from:gameAddr}),
      "erin failed to update to L4"
    )
    erinBalance = Number(await web3.eth.getBalance(erin));

    // L4 - true
    assert.equal(4, (await stakers.level()).toNumber());

    // challenge time passed, resolve from L4: erin told the truth,  dave will be slashed and erin earns dave's stake
    await expect.passes(
      stakers.update(2, frank, {from:gameAddr}),
      "frank failed to update to L4"
    )
    // L3
    assert.equal(3, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.withdraw({from:erin}),
      "erin failed to withdraw"
    )
    assert.isBelow(erinBalance, Number(await web3.eth.getBalance(erin)),
                 "Erin current balance should be higher now, since she earned Dave's stake");
    await expect.reverts(
      stakers.enrol({from:dave, value: stake}),
      "candidate was slashed previously",
      "dave was slashed and will never be able to enrol again, so it should revert"
    )

    // challenge time for L3 has passed, and also challenge time for L1 has passed.
    // In other words frank  and alice told the truth, and the game can now call start
    // resolving that frank earns bob's stake, and alice earns reward. Also bob will
    // be slashed

    frankBalance = Number(await web3.eth.getBalance(frank));
    await expect.passes(
      stakers.finalize({from:gameAddr}),
      "failed calling start from L3"
    )
    await expect.passes(
      stakers.withdraw({from:frank}),
      "frank failed to withdraw"
    )

    assert.isBelow(frankBalance, Number(await web3.eth.getBalance(frank)),
                 "Frank's current balance should be higher now, since he earned bob's stake");

    await expect.reverts(
      stakers.enrol({from:bob, value: stake}),
      "candidate was slashed previously",
      "bob was slashed and will never be able to enrol again, so it should revert"
    )
  })

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests L0 -> L1 lie  -> L2 true -> L3 lie  -> L4 true -> start", async () => {
    await stakers.setGameOwner(gameAddr, {from:owners.COO})
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties);
    await deployUtils.enrol(stakers, stake, parties);
    // L0
    assert.equal(0, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    // L1 - lie
    assert.equal(1, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(1, bob, {from:gameAddr}),
      "bob failed to update"
    )

    // L2 - true
    assert.equal(2, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(2, dave, {from:gameAddr}),
      "dave failed to update"
    )

    // L3 - lie
    assert.equal(3, (await stakers.level()).toNumber());
    await expect.passes(
      stakers.update(3, erin, {from:gameAddr}),
      "erin failed to update to L4"
    )

    // L4 - true
    assert.equal(4, (await stakers.level()).toNumber());

    // make sure level 3 is not updatable
    await expect.reverts(
      stakers.update(3, frank, {from:gameAddr}),
      "failed to update: resolving wrong level",
      "we are at level 4, level 3 is not updatable anymore, so it should revert"
    )

    // challenge time for L4 has passed, and also challenge time for L2 has passed.
    // In other words erin  and bob told the truth, and the game can now call start
    // resolving that erin earns dave's stake, and bob earns alice's stake. Also both
    // dave and alice will be slashed

    bobBalance = Number(await web3.eth.getBalance(bob));
    erinBalance = Number(await web3.eth.getBalance(erin));
    await expect.passes(
      stakers.finalize({from:gameAddr}),
      "failed to start new verse from L4"
    )
    await expect.passes(
      stakers.withdraw({from:bob}),
      "bob failed to withdraw"
    )
    await expect.passes(
      stakers.withdraw({from:erin}),
      "erin failed to withdraw"
    )
    assert.isBelow(bobBalance, Number(await web3.eth.getBalance(bob)),
                 "bob's current balance should be higher now, since she earned alice's stake");
    assert.isBelow(erinBalance, Number(await web3.eth.getBalance(erin)),
                 "Erin's current balance should be higher now, since she earned Dave's stake");

    await expect.reverts(
      stakers.enrol({from:alice, value: stake}),
      "candidate was slashed previously",
      "alice was slashed and will never be able to enrol again, so it should revert"
    )
    await expect.reverts(
      stakers.enrol({from:dave, value: stake}),
      "candidate was slashed previously",
      "dave was slashed and will never be able to enrol again, so it should revert"
    )
  })

////////////////////////////////////////////////////////////////////////////////////////////

  it("Tests L0 -> L1 lie  -> L2 lie  -> L3 true  -> L4 lie -> challenge -> L3", async () => {
    // start (L0) ->  alice updates (L1) -> bob updates (L2) -> carol updates (L3) -> dave updates (L4) ->
    // -> erin updates (L5) -> time passes -> L3 -> frank updates (L4)
    // at finalization time, we slash: dave by erin, carol frank, alice by bob
    await stakers.setGameOwner(gameAddr, {from:owners.COO});
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties);
    await deployUtils.enrol(stakers, stake, parties);

    assert.equal(0, (await stakers.level()).toNumber());

    await expect.reverts(
      stakers.update(1, alice, {from:gameAddr}),
      "failed to update: wrong level",
      "level to update is 1, so it should revert"
    )

    await expect.reverts(
      stakers.update(2, alice, {from:gameAddr}),
      "failed to update: wrong level",
      "level to update is 1, so it should revert"
    )

    await expect.passes(
      stakers.update(0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    assert.equal(1, (await stakers.level()).toNumber());

    await expect.reverts(
      stakers.update(1, alice, {from:gameAddr}),
      null,
      "alice is already updating, cannot participate until resolved"
    )

    await expect.passes(
      stakers.update(1, bob, {from:gameAddr}),
      "bob failed to update"
    )

    assert.equal(2, (await stakers.level()).toNumber());

    await expect.passes(
      stakers.update(2, carol, {from:gameAddr}),
      "carol failed to update"
    )

    assert.equal(3, (await stakers.level()).toNumber());

    await expect.passes(
      stakers.update(3, dave, {from:gameAddr}),
      "dave failed to update"
    )

    assert.equal(4, (await stakers.level()).toNumber());

    // erin callenges the very last update L4
    await expect.passes(
      stakers.update(4, erin, {from:gameAddr}),
      "erin failed to challenge"
    )

    assert.equal(5, (await stakers.level()).toNumber());

    // time passes, meaning that erin was right, so dave lied.
    // we implicitly go back to level 2, and frank updates there
    await expect.passes(
      stakers.update(3, frank, {from:gameAddr}),
      "frank failed to update after time passed"
    )

    assert.equal(4, (await stakers.level()).toNumber());

    await stakers.finalize({from:gameAddr}).should.be.fulfilled;
    
    // at finalization time, we slash: dave by erin, carol frank, alice by bob
    past = await stakers.getPastEvents( 'SlashedBy', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.slashedStaker.should.be.equal(dave);
    past[0].args.goodStaker.should.be.equal(erin);
    past[1].args.slashedStaker.should.be.equal(carol);
    past[1].args.goodStaker.should.be.equal(frank);
    past[2].args.slashedStaker.should.be.equal(alice);
    past[2].args.goodStaker.should.be.equal(bob);
  })
  
  it("Tests L0 -> L1 lie  -> L2 lie  -> L3 true  -> L4 lie -> time passes -> L1 update", async () => {
    // same as previous test up to L4, but then we update L1 directly after L4
    // alice - bob - carol - dave // erin // finalize
    // slashes: carol by dave, alice by bob
    await stakers.setGameOwner(gameAddr, {from:owners.COO});
    parties = [alice, bob, carol, dave, erin, frank];
    await deployUtils.addTrustedParties(stakers, owners.COO, parties);
    await deployUtils.enrol(stakers, stake, parties);

    assert.equal(0, (await stakers.level()).toNumber());

    await expect.passes(
      stakers.update(0, alice, {from:gameAddr}),
      "alice failed to update"
    )

    assert.equal(1, (await stakers.level()).toNumber());

    await expect.passes(
      stakers.update(1, bob, {from:gameAddr}),
      "bob failed to update"
    )

    assert.equal(2, (await stakers.level()).toNumber());

    await expect.passes(
      stakers.update(2, carol, {from:gameAddr}),
      "carol failed to update"
    )

    assert.equal(3, (await stakers.level()).toNumber());

    await expect.passes(
      stakers.update(3, dave, {from:gameAddr}),
      "dave failed to update"
    )

    assert.equal(4, (await stakers.level()).toNumber());

    // erin callenges the very last update L4
    await expect.passes(
      stakers.update(0, erin, {from:gameAddr}),
      "erin failed to challenge"
    )

    assert.equal(1, (await stakers.level()).toNumber());

    await stakers.finalize({from:gameAddr}).should.be.fulfilled;
    
    // at finalization time, we slash: dave by erin, carol frank, alice by bob
    past = await stakers.getPastEvents( 'SlashedBy', { fromBlock: 0, toBlock: 'latest' } ).should.be.fulfilled;
    past[0].args.slashedStaker.should.be.equal(carol);
    past[0].args.goodStaker.should.be.equal(dave);
    past[1].args.slashedStaker.should.be.equal(alice);
    past[1].args.goodStaker.should.be.equal(bob);
  })
})

