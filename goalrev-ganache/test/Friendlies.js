/*
 Tests for all functions in Friendlies.sol   
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();
const truffleAssert = require('truffle-assertions');
const debug = require('../utils/debugUtils.js');

const Friendlies = artifacts.require('Friendlies');

contract('Friendlies', (accounts) => {
    const ALICE = accounts[1];
    const BOB = accounts[2];
    const CAROL = accounts[3];

    const it2 = async(text, f) => {};

    beforeEach(async () => {
        friendlies = await Friendlies.new().should.be.fulfilled;
    });

    it('getTeamsInCupMatch for 4 teams without shuffling', async () => {
        nTeams = 4;
        nMatchesPerDay = nTeams / 2;
        teamsInMatches = [];
        expected = Array.from(new Array(nTeams), (x,i) => i);
        // an array containing the number of matches played by each team:
        nGamesPlayedByTeam = Array.from(new Array(nTeams), (x,i) => 0);
        nGamesPlayedByTeamExpected = Array.from(new Array(nTeams), (x,i) => 1);

        for (matchIdxInDay = 0; matchIdxInDay < nMatchesPerDay; matchIdxInDay++) {  
            result = await friendlies.getTeamsInCupMatch(matchIdxInDay, nTeams, seed = 0);
            teamsInMatches.push(result[0]);
            teamsInMatches.push(result[1]);
            nGamesPlayedByTeam[result[0].toNumber()] += 1;
            nGamesPlayedByTeam[result[1].toNumber()] += 1;
        }
        debug.compareArrays(teamsInMatches, expected, toNum = true);
        debug.compareArrays(nGamesPlayedByTeam, nGamesPlayedByTeamExpected, toNum = false);
    });  
    
    it('getTeamsInCupMatch for 64 teams without shuffling', async () => {
        nTeams = 64;
        nMatchesPerDay = nTeams / 2;
        teamsInMatches = [];
        expected = Array.from(new Array(nTeams), (x,i) => i);
        // an array containing the number of matches played by each team:
        nGamesPlayedByTeam = Array.from(new Array(nTeams), (x,i) => 0);
        nGamesPlayedByTeamExpected = Array.from(new Array(nTeams), (x,i) => 1);

        for (matchIdxInDay = 0; matchIdxInDay < nMatchesPerDay; matchIdxInDay++) {  
            result = await friendlies.getTeamsInCupMatch(matchIdxInDay, nTeams, seed = 0);
            teamsInMatches.push(result[0]);
            teamsInMatches.push(result[1]);
            nGamesPlayedByTeam[result[0].toNumber()] += 1;
            nGamesPlayedByTeam[result[1].toNumber()] += 1;
        }
        debug.compareArrays(teamsInMatches, expected, toNum = true);
        debug.compareArrays(nGamesPlayedByTeam, nGamesPlayedByTeamExpected, toNum = false);
    });     
    
    it('getTeamsInCupMatch for 64 teams with shuffling', async () => {
        nTeams = 64;
        nMatchesPerDay = nTeams / 2;
        teamsInMatches = [];
        expected = [ 59, 45, 57, 21, 25, 51, 47, 18, 9, 13, 0, 3, 28, 55, 31, 43, 12, 63, 37, 30, 53, 24, 20, 44, 10, 17, 16, 33, 38, 2, 58, 49, 54, 8, 26, 50, 36, 52, 41, 27, 7, 34, 11, 29, 23, 35, 4, 61, 19, 62, 6, 46, 56, 32, 15, 40, 14, 60, 42, 22, 5, 1, 48, 39 ];
        // an array containing the number of matches played by each team:
        nGamesPlayedByTeam = Array.from(new Array(nTeams), (x,i) => 0);
        nGamesPlayedByTeamExpected = Array.from(new Array(nTeams), (x,i) => 1);

        seed = web3.utils.toBN(web3.utils.keccak256("32123"));

        for (matchIdxInDay = 0; matchIdxInDay < nMatchesPerDay; matchIdxInDay++) {  
            result = await friendlies.getTeamsInCupMatch(matchIdxInDay, nTeams, seed);
            teamsInMatches.push(result[0]);
            teamsInMatches.push(result[1]);
            nGamesPlayedByTeam[result[0].toNumber()] += 1;
            nGamesPlayedByTeam[result[1].toNumber()] += 1;
        }
        debug.compareArrays(teamsInMatches, expected, toNum = true);
        debug.compareArrays(nGamesPlayedByTeam, nGamesPlayedByTeamExpected, toNum = false);
    });     
        
    it('getTeamsInLeagueMatch for 4 teams', async () => {
        nTeams = 4;
        nMatchdays = (nTeams - 1) * 2;
        nMatchesPerDay = nTeams / 2;
        teamsInLeagueMatches = [];
        expected = [ 0, 1, 3, 2, 2, 0, 3, 1, 0, 3, 2, 1, 1, 0, 2, 3, 0, 2, 1, 3, 3, 0, 1, 2 ];
        // an array containing the number of matches played by each team, at home, and away:
        nGamesPlayedByTeam = Array.from(new Array(nTeams*2), (x,i) => 0);
        nGamesPlayedByTeamExpected = Array.from(new Array(nTeams*2), (x,i) => nMatchdays/2);

        for (matchday = 0; matchday < nMatchdays; matchday++) {
            for (matchIdxInDay = 0; matchIdxInDay < nMatchesPerDay; matchIdxInDay++) {  
                result = await friendlies.getTeamsInLeagueMatch(matchday, matchIdxInDay, nTeams);
                teamsInLeagueMatches.push(result[0]);
                teamsInLeagueMatches.push(result[1]);
                nGamesPlayedByTeam[result[0].toNumber()] += 1;
                nGamesPlayedByTeam[nTeams + result[1].toNumber()] += 1;
            }
        }
        debug.compareArrays(teamsInLeagueMatches, expected, toNum = true);
        debug.compareArrays(nGamesPlayedByTeam, nGamesPlayedByTeamExpected, toNum = false);
    });
    
    it('getTeamsInLeagueMatch for 6 teams', async () => {
        nTeams = 6;
        nMatchdays = (nTeams - 1) * 2;
        nMatchesPerDay = nTeams / 2;
        teamsInLeagueMatches = [];
        expected = [ 0, 1, 5, 2, 4, 3, 2, 0, 3, 1, 4, 5, 0, 3, 2, 4, 1, 5, 4, 0, 5, 3, 1, 2, 0, 5, 4, 1, 3, 2, 1, 0, 2, 5, 3, 4, 0, 2, 1, 3, 5, 4, 3, 0, 4, 2, 5, 1, 0, 4, 3, 5, 2, 1, 5, 0, 1, 4, 2, 3 ];
        // an array containing the number of matches played by each team, at home, and away:
        nGamesPlayedByTeam = Array.from(new Array(nTeams*2), (x,i) => 0);
        nGamesPlayedByTeamExpected = Array.from(new Array(nTeams*2), (x,i) => nMatchdays/2);
        for (matchday = 0; matchday < nMatchdays; matchday++) {
            for (matchIdxInDay = 0; matchIdxInDay < nMatchesPerDay; matchIdxInDay++) {  
                result = await friendlies.getTeamsInLeagueMatch(matchday, matchIdxInDay, nTeams);
                teamsInLeagueMatches.push(result[0]);
                teamsInLeagueMatches.push(result[1]);
                nGamesPlayedByTeam[result[0].toNumber()] += 1;
                nGamesPlayedByTeam[nTeams + result[1].toNumber()] += 1;            }
        }
        debug.compareArrays(teamsInLeagueMatches, expected, toNum = true);
        debug.compareArrays(nGamesPlayedByTeam, nGamesPlayedByTeamExpected, toNum = false);
    });

});