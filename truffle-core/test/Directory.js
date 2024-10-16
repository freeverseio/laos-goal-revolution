/*
 Tests for all functions in Directoy.sol
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

const Directory = artifacts.require('Directory');

contract('Directory', (accounts) => {
    const FREEVERSE = accounts[0];
    const ALICE = accounts[1];
    const BOB = accounts[2];
    const CAROL = accounts[3];
    const it2 = async(text, f) => {};

    function toBytes32(name) { return web3.utils.utf8ToHex(name); }
    function fromBytes32(name) { return web3.utils.hexToUtf8(name); }

    beforeEach(async () => {
    });
    
    it('standard deploy', async () => {
        names = ["Baby1", "Baby2_Weird"];
        names32 = []
        for (n = 0; n < names.length; n++) names32.push(toBytes32(names[n]));        
        addresses = [ALICE, BOB];
        // only COO can do deploy
        const directory = await Directory.new(names32, addresses).should.be.fulfilled;
        
        var {0: noms, 1: addr} = await directory.getDirectory().should.be.fulfilled;

        debug.compareArrays(addr, addresses, toNum = false);
        for (n = 0; n < noms.length; n++) noms[n] = fromBytes32(noms[n]);        
        debug.compareArrays(noms, names, toNum = false);
    });

    
});