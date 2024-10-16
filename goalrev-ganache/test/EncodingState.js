/*
 Tests for all functions in EncodingState.sol and contracts inherited by it
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();;

const fs = require('fs');
const EncodingState = artifacts.require('EncodingState');
const EncodingIDs = artifacts.require('EncodingIDs');
const ConstantsGetters = artifacts.require('ConstantsGetters');

async function stateWrapper(state) {
    var result = {
        encodedState: state.toString(),
        currentTeamId: 0, 
        currentShirtNum: 0,
        prevPlayerTeamId: 0,
        lastSaleBlocknum: 0,
        isInTransit: false
    };
    result.currentTeamId = Number(await encodingState.getCurrentTeamIdFromPlayerState(state).should.be.fulfilled);
    result.currentShirtNum = Number(await encodingState.getCurrentShirtNum(state).should.be.fulfilled);
    result.prevPlayerTeamId = Number(await encodingState.getPrevPlayerTeamId(state).should.be.fulfilled);
    result.lastSaleBlocknum = Number(await encodingState.getLastSaleBlock(state).should.be.fulfilled);
    result.isInTransit = await encodingState.getIsInTransitFromState(state).should.be.fulfilled;

    return result;
}

contract('EncodingState', (accounts) => {

    beforeEach(async () => {
        encodingState = await EncodingState.new().should.be.fulfilled;
        encodingIDs = await EncodingIDs.new().should.be.fulfilled;
        constants = await ConstantsGetters.new().should.be.fulfilled;
    });
    
    it('encode decode player state', async () => {
        const writeMode = true;
        toWrite = [];

        const currentTeamId = await encodingIDs.encodeTZCountryAndVal(tz = 1, countryIdx = 0, teamIDx = 0).should.be.fulfilled;
        const currentShirtNum = 12;
        const prevPlayerTeamId = await encodingIDs.encodeTZCountryAndVal(tz = 1, countryIdx = 0, teamIDx = 1).should.be.fulfilled;
        const lastSaleBlock = 3221;
        // check the initial setting of a player state (from empty)
        const state = await encodingState.encodePlayerState(currentTeamId, currentShirtNum, prevPlayerTeamId, lastSaleBlock).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await stateWrapper(state))}

        // console.log(state.toString())
        result = await encodingState.getCurrentTeamIdFromPlayerState(state).should.be.fulfilled;
        result.should.be.bignumber.equal(currentTeamId);
        result = await encodingState.getCurrentShirtNum(state).should.be.fulfilled;
        result.toNumber().should.be.equal(currentShirtNum);
        result = await encodingState.getPrevPlayerTeamId(state).should.be.fulfilled;
        result.should.be.bignumber.equal(prevPlayerTeamId);
        result = await encodingState.getLastSaleBlock(state).should.be.fulfilled;
        result.toNumber().should.be.equal(lastSaleBlock);
        // check the individual changes (from non-empty)
        newState = await encodingState.setCurrentTeamId(state, newval = 43).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await stateWrapper(newState))}
        result = await encodingState.getCurrentTeamIdFromPlayerState(newState).should.be.fulfilled;
        result.toNumber().should.be.equal(newval);
        newState = await encodingState.setCurrentShirtNum(state, newval = 2).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await stateWrapper(newState))}
        result = await encodingState.getCurrentShirtNum(newState).should.be.fulfilled;
        result.toNumber().should.be.equal(newval);
        newState = await encodingState.setPrevPlayerTeamId(state, newval = 43643).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await stateWrapper(newState))}
        result = await encodingState.getPrevPlayerTeamId(newState).should.be.fulfilled;
        result.toNumber().should.be.equal(newval);
        newState = await encodingState.setLastSaleBlock(state, newval = 11223).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await stateWrapper(newState))}
        result = await encodingState.getLastSaleBlock(newState).should.be.fulfilled;
        result.toNumber().should.be.equal(newval);
        result = await encodingState.getIsInTransitFromState(newState).should.be.fulfilled;
        result.should.be.equal(false);
        IN_TRANSIT_SHIRTNUM = await constants.get_IN_TRANSIT_SHIRTNUM().should.be.fulfilled;
        newState = await encodingState.setCurrentShirtNum(newState, newval = IN_TRANSIT_SHIRTNUM.toNumber()).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await stateWrapper(newState))}
        result = await encodingState.getIsInTransitFromState(newState).should.be.fulfilled;
        result.should.be.equal(true);
        newState = await encodingState.setCurrentShirtNum(newState, newval = 13).should.be.fulfilled;
        if (writeMode) { await toWrite.push(await stateWrapper(newState))}
        result = await encodingState.getIsInTransitFromState(newState).should.be.fulfilled;
        result.should.be.equal(false);

        if (writeMode) {
            fs.writeFileSync('test/testdata/encodingStateTestData.json', JSON.stringify(toWrite), function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }             
        
        writtenData = fs.readFileSync('test/testdata/encodingStateTestData.json', 'utf8');
        assert.equal(
            web3.utils.keccak256(writtenData),
            "0xf42362d5f2917296bb8c0d6b15caebd08af89a3946fa69fd9e60190709bea73e",
            "written testdata for encodingState State does not match expected result"
        );
    });


    it('generate tests for libraries in other platforms with from-the-filed values', async () => {
        const states = [
            "222651104624647",
            "28241970391324172840623950903902215",
            "28242688396546958361315333791285253",
            "28244686431770364964947079582449685",
            "222651104624661",
            "28257944769591111387902355435421877",
            "27751156876308462410972948053622818",
            "222651104624694",
            "28271458123059950598912785531273270",
            "26226336612319088111168700781953031",
            "28283973696857125793360074281844766",
            "28284894724246354116478113276755978",
            "28285461700784346820556056145428534",
            "28296162454483929647749041198465145",
            "222651104624670",
            "28324224079294450647670920964997150"
        ]

        toWrite = [];
        for (state of states) {
            await toWrite.push(await stateWrapper(state));
        }

        fitxer = 'test/testdata/encodingStateTestDataFromTheField.json';
        fs.writeFileSync(fitxer, JSON.stringify(toWrite), function(err) {
            if (err) {
                console.log(err);
            }
        });
        
        writtenData = fs.readFileSync(fitxer, 'utf8');
        assert.equal(
            web3.utils.keccak256(writtenData),
            "0x262761b6cec41e5b8bbd36fd729295253774ab697e756a7f0529e9c97fa00c56",
            "written testdata for encodingState State does not match expected result"
        );
    });


});