/*
 Tests for all functions in Merkle.sol
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();

function nocache(module) {require("fs").watchFile(require("path").resolve(module), () => {delete require.cache[require.resolve(module)]})}
nocache('../utils/merkleUtils.js');
delete require.cache['../utils/merkleUtils.js'];
    
const truffleAssert = require('truffle-assertions');
const debug = require('../utils/debugUtils.js');
const merkleUtils = require('../utils/merkleUtils.js');

const Merkle = artifacts.require('Merkle');
const NULL_BYTES32 = web3.eth.abi.encodeParameter('bytes32','0x0');


contract('Merkle', (accounts) => {
    
    const it2 = async(text, f) => {};
    const nullHash = web3.eth.abi.encodeParameter('bytes32','0x0');
    function toBytes32(name) { return web3.utils.utf8ToHex(name); }

    beforeEach(async () => {
        merkle = await Merkle.new().should.be.fulfilled;
    });

    it('compatibility of NULL_BYTES32', async () => {
        resultBC = await merkle.hash_node(NULL_BYTES32, NULL_BYTES32).should.be.fulfilled;
        resultBC.should.be.equal(NULL_BYTES32);
    });
    
    it('compatibility of hash function', async () => {
        leafs = Array.from(new Array(2), (x,i) => web3.utils.keccak256(i.toString()));
        resultBC = await merkle.hash_node(leafs[0], leafs[1]).should.be.fulfilled;
        resultJS = merkleUtils.hash_node(leafs[0], leafs[1]);
        resultBC.should.be.equal(resultJS)
        resultBC = await merkle.hash_node(nullHash, leafs[1]).should.be.fulfilled;
        resultJS = merkleUtils.hash_node(nullHash, leafs[1]);
        resultBC.should.be.equal(resultJS)
        resultBC = await merkle.hash_node(leafs[0], nullHash).should.be.fulfilled;
        resultJS = merkleUtils.hash_node(leafs[0], nullHash);
        resultBC.should.be.equal(resultJS)
        resultBC = await merkle.hash_node(nullHash, nullHash).should.be.fulfilled;
        resultJS = merkleUtils.hash_node(nullHash, nullHash);
        resultBC.should.be.equal(resultJS)
        resultBC.should.be.equal(nullHash)
    });

    it('get merkle root with padding', async () => {
        leafs = [ 
            '0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d',
            '0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6',
            '0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5',
            '0x0000000000000000000000000000000000000000000000000000000000000000' 
        ]
        root1 = await merkleUtils.merkleRootZeroPad(leafs, nLevels = 2);
        root1.should.be.equal('0x1cb9f7923cd35fa294c1ffec3b80a81957766a26c52ff2089a8f0b0e1328b7d8');
    });
    
    it('get merkle root with padding', async () => {
        leafs = Array.from(new Array(16), (x,i) => (i < 6 ? web3.utils.keccak256(i.toString()): NULL_BYTES32));
        root1 = await merkleUtils.merkleRoot(leafs, nLevels = 4);
        leafs = Array.from(new Array(6), (x,i) => (i < 6 ? web3.utils.keccak256(i.toString()): NULL_BYTES32));
        root2 = await merkleUtils.merkleRoot(leafs, nLevels = 4);
        root1.should.be.equal(root2);
        root3 = await merkleUtils.merkleRootZeroPad(leafs, nLevels = 4);
        root1.should.be.equal(root3);
    });
    
    it('get merkle root', async () => {
        leafs = Array.from(new Array(4), (x,i) => web3.utils.keccak256(i.toString()));
        rootBC = await merkle.merkleRoot(leafs, nLevels = 2).should.be.fulfilled;
        rootJS = merkleUtils.merkleRoot(leafs, nLevels);
        root1 = await merkle.hash_node(leafs[0], leafs[1]).should.be.fulfilled;
        root2 = await  merkle.hash_node(leafs[2], leafs[3]).should.be.fulfilled;
        rootHandMade = await merkle.hash_node(root1, root2).should.be.fulfilled;
        rootHandMade.should.be.equal(rootBC)
        rootHandMade.should.be.equal(rootJS)
    });

    it('get merkle root high count', async () => {
        leafs = Array.from(new Array(640), (x,i) => web3.utils.keccak256(i.toString()));
        rootBC = await merkle.merkleRoot(leafs, nLevels = 10).should.be.fulfilled;
        rootJS = merkleUtils.merkleRoot(leafs, nLevels);
        rootBC.should.be.equal(rootJS)

        leafs[1] = NULL_BYTES32;
        leafs[638] = web3.eth.abi.encodeParameter('bytes32', '0x0');
        leafs[639] = web3.eth.abi.encodeParameter('bytes32', '0x0');
        rootBC = await merkle.merkleRoot(leafs, nLevels = 10).should.be.fulfilled;
        rootJS = merkleUtils.merkleRoot(leafs, nLevels);
        rootBC.should.be.equal(rootJS)

        leafs[638] = '0x0';
        leafs[639] = '0x0';
        rootBC = await merkle.merkleRoot(leafs, nLevels = 10).should.be.fulfilled;
        rootJS = merkleUtils.merkleRoot(leafs, nLevels);
        rootBC.should.not.be.equal(rootJS)
    });

    it('verify', async () => {
        leafs = Array.from(new Array(4), (x,i) => web3.utils.keccak256(i.toString()));
        root = await merkle.merkleRoot(leafs, nLevels = 2).should.be.fulfilled;
        leafPos = 1;
        proof2 = await merkle.hash_node(leafs[2], leafs[3]).should.be.fulfilled;
        proof = [leafs[0], proof2];
        ok = await merkle.verify(root, proof, leafs[leafPos], leafPos).should.be.fulfilled;
        ok.should.be.equal(true);
        okJS = merkleUtils.verify(root, proof, leafs[leafPos], leafPos);
        okJS.should.be.equal(true);
    });

    it('build proof', async () => {
        leafs = Array.from(new Array(4), (x,i) => web3.utils.keccak256(i.toString()));
        root = await merkle.merkleRoot(leafs, nLevels = 2).should.be.fulfilled;
        leafPos = 1;
        proof = await merkle.buildProof(leafPos, leafs, nLevels).should.be.fulfilled; 
        ok = await merkle.verify(root, proof, leafs[leafPos], leafPos).should.be.fulfilled;
        ok.should.be.equal(true);
        proofJS = merkleUtils.buildProof(leafPos, leafs, nLevels); 
        ok = await merkle.verify(root, proofJS, leafs[leafPos], leafPos).should.be.fulfilled;
        ok.should.be.equal(true);
        ok = merkleUtils.verify(root, proofJS, leafs[leafPos], leafPos);
        ok.should.be.equal(true);
    });

});