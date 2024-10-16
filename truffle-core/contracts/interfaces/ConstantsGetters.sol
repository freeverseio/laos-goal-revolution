pragma solidity >= 0.6.3;

import "../storage/Constants.sol";

/**
 @title Constants used in the project
 @author Freeverse.io, www.freeverse.io
*/

contract ConstantsGetters is Constants {

    function get_PLAYERS_PER_TEAM_MAX() external pure returns(uint8) { return PLAYERS_PER_TEAM_MAX;}
    function get_PLAYERS_PER_TEAM_INIT() external pure returns(uint8) { return PLAYERS_PER_TEAM_INIT;}
    function get_NULL_ADDR() external pure returns(address) { return NULL_ADDR;}
    function get_LEAGUES_PER_DIV() external pure returns(uint8) { return LEAGUES_PER_DIV;}
    function get_TEAMS_PER_LEAGUE() external pure returns(uint8) { return TEAMS_PER_LEAGUE;}
    function get_FREE_PLAYER_ID() external pure returns(uint256) { return FREE_PLAYER_ID;}
    function get_POST_AUCTION_TIME() external pure returns(uint256) { return POST_AUCTION_TIME;}
    function get_NULL_TIMEZONE() external pure returns(uint8) { return NULL_TIMEZONE;}
    function get_VERSES_PER_DAY() external pure returns(uint8) { return VERSES_PER_DAY;}
    function get_SECS_BETWEEN_VERSES() external pure returns(uint256) { return SECS_BETWEEN_VERSES;}
    function get_VERSES_PER_ROUND() external pure returns(uint16) { return VERSES_PER_ROUND;}
    function get_ACADEMY_TEAM() external pure returns(uint256) { return ACADEMY_TEAM; }
    function get_INGAMETIME_VS_REALTIME() external pure returns(uint256) { return INGAMETIME_VS_REALTIME; }
    function get_SK_SHO() external pure returns(uint8) { return SK_SHO; }
    function get_SK_SPE() external pure returns(uint8) { return SK_SPE; }
    function get_SK_PAS() external pure returns(uint8) { return SK_PAS; }
    function get_SK_DEF() external pure returns(uint8) { return SK_DEF; }
    function get_SK_END() external pure returns(uint8) { return SK_END; }
    function get_IN_TRANSIT_SHIRTNUM() external pure returns(uint8) { return IN_TRANSIT_SHIRTNUM;}
}