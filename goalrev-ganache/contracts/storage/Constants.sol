pragma solidity >= 0.6.3;

/**
 @title Constants used in the project
 @author Freeverse.io, www.freeverse.io
 @dev They are not public because it made the contracts
 @dev too large to be deployable (!)
 @dev Yes, their getters occupy space.
*/

contract Constants {
    
    uint8 constant internal N_SKILLS = 5;
    address constant internal NULL_ADDR = address(0);
    uint256 constant internal DIVS_PER_LEAGUE_AT_START = 1;
    uint8 constant internal PLAYERS_PER_TEAM_INIT = 18;
    uint8 constant internal LEAGUES_PER_DIV = 16;
    uint8 constant internal TEAMS_PER_LEAGUE = 8;
    uint8 constant internal PLAYERS_PER_TEAM_MAX  = 25;
    uint256 constant internal FREE_PLAYER_ID  = 1; /// it never corresponds to a legit playerId due to its TZ = 0
    uint256 constant internal ACADEMY_TEAM = 1;
    uint256 constant internal IN_TRANSIT_TEAM = 2;
    uint8 constant internal IN_TRANSIT_SHIRTNUM = 26;
    uint256 constant internal NULL_TEAMID = 0;
    uint256 constant internal NULL_PLAYERID = 0;
    uint256 constant internal INGAMETIME_VS_REALTIME = 14;
    uint8 constant internal MAX_POTENTIAL_AT_BIRTH = 7;

    /// Skills: shoot, speed, pass, defence, endurance
    uint8 constant internal SK_SHO = 0;
    uint8 constant internal SK_SPE = 1;
    uint8 constant internal SK_PAS = 2;
    uint8 constant internal SK_DEF = 3;
    uint8 constant internal SK_END = 4;

    /// Skills for GKs: shot-stopping, 1-on-1, pass, penaltySaving, endurance 
    uint8 constant internal GK_SHO = 0;
    uint8 constant internal GK_1O1 = 1;
    uint8 constant internal GK_PAS = 2;
    uint8 constant internal GK_PEN = 3;
    uint8 constant internal GK_END = 4;


    /// Birth Traits: potential, forwardness, leftishness, aggressiveness
    uint8 constant internal IDX_POT = 0;
    uint8 constant internal IDX_FWD = 1;
    uint8 constant internal IDX_LEF = 2;
    uint8 constant internal IDX_AGG = 3;
    /// prefPosition idxs: GoalKeeper, Defender, Midfielder, Forward, MidDefender, MidAttacker
    uint8 constant internal IDX_GK = 0;
    uint8 constant internal IDX_D  = 1;
    uint8 constant internal IDX_M  = 2;
    uint8 constant internal IDX_F  = 3;
    uint8 constant internal IDX_MD = 4;
    uint8 constant internal IDX_MF = 5;


    uint8 constant internal TEAMS_PER_DIVISION = 128; /// LEAGUES_PER_DIV * TEAMS_PER_LEAGUE
    uint256 constant internal MATCHDAYS_PER_ROUND = 14;
    uint256 constant internal DAYS_PER_ROUND = 7;
    bytes32 constant INIT_ORGMAP_HASH = bytes32(0); /// to be computed externally once and placed here

    uint8 constant internal IDX_r   = 0;
    uint8 constant internal IDX_s   = 1;
 
    uint8 constant internal NO_OUT_OF_GAME_PLAYER  = 14;   /// noone saw a card
    uint8 constant internal RED_CARD = 3;   /// noone saw a card
    uint256 constant internal POINTS_FOR_HAVING_PLAYED  = 10; 
    uint256 constant internal MAX_POINTS_PER_GAME  = 150; 

 
    /// POST_AUCTION_TIME: is how long does the buyer have to pay in fiat, after auction is finished.
    ///  ...it includes time to ask for a 2nd-best bidder, or 3rd-best.
    uint256 constant internal POST_AUCTION_TIME   = 48 hours; 
    uint256 constant internal MAX_VALID_UNTIL     = 96 hours; 
    uint256 constant internal VALID_UNTIL_MASK    = 4294967295; /// 2^32-1 (32 bit)
    uint256 constant internal KILL_LEFTMOST_40BIT_MASK = (2**(256-40))-1; 
    uint8 constant internal MAX_ACQUISITON_CONSTAINTS  = 6;

    /// Updates related:
    uint16 constant internal SECS_BETWEEN_VERSES = 900; /// 15 mins
    uint8 constant internal VERSES_PER_DAY = 96; /// 24 * 4
    uint16 constant internal VERSES_PER_ROUND = 672; /// 96 * 7days
    uint8 constant internal NULL_TIMEZONE = 0;
    uint8 constant internal MAX_CHALLENGE_LEVELS = 6;
    
}