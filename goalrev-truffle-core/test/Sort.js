/*
 Tests for all functions in Sort.sol
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();;

const SortValues = artifacts.require('SortValues');
const SortIdxs = artifacts.require('SortIdxs');
const SortValues25 = artifacts.require('SortValues25');
const debug = require('../utils/debugUtils.js');

contract('SortValues', (accounts) => {

    const it2 = async(text, f) => {};

    beforeEach(async () => {
        sort = await SortValues.new().should.be.fulfilled;
        sortIdxs = await SortIdxs.new().should.be.fulfilled;
        sort25 = await SortValues25.new().should.be.fulfilled;
    });
    
    it('sorts arrays of 14 numbers', async () =>  {
        data =      [4, 7, 3, 1, 12, 9, 5, 3, 1, 6, 10, 13, 11, 11];
        expected =  [13, 12, 11, 11, 10, 9, 7, 6, 5, 4, 3, 3, 1, 1];
        result = await sort.sort14(data).should.be.fulfilled;
        debug.compareArrays(result, expected, toNum = true);
    });
    
    it('sorts idxs of 8 numbers', async () =>  {
        data =          [4, 7, 3, 1, 12, 9, 5, 3];
        expectedIdxs =  [ 4, 5, 1, 6, 0, 2, 7, 3 ];
        idxs = Array.from(new Array(8), (x,i) => i);
        result = await sortIdxs.sortIdxs(data, idxs).should.be.fulfilled;
        debug.compareArrays(result, expectedIdxs, toNum = true);
    });

    it('sorts arrays of 25 uint256 numbers', async () =>  {
        data =      [44325, 7234534, 234543, 1, 2435, 0, 23453245, 4543534, 5345234, 11, 102, 433, 11, 11, 0,0,0,0,0,0,0,0,11,12,13];
        expected =  [23453245, 7234534, 5345234, 4543534, 234543, 44325, 2435, 433, 102, 13, 12, 11, 11, 11, 11,1,0,0,0,0,0,0,0,0,0];
        result = await sort25.sort25(data).should.be.fulfilled;
        debug.compareArrays(result, expected, toNum = true);
    });
});