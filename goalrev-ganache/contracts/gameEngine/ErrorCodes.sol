pragma solidity >= 0.6.3;

/**
 @title Error codes returned by many functions in the project
 @author Freeverse.io, www.freeverse.io
*/

contract ErrorCodes {
    
    uint8 internal constant ERR_IS2NDHALF = 1;
    uint8 internal constant ERR_TRAINING_SPLAYER = 2;
    uint8 internal constant ERR_TRAINING_SINGLESKILL = 3;
    uint8 internal constant ERR_TRAINING_SUMSKILLS = 4;
    uint8 internal constant ERR_TRAINING_PREVMATCH = 5;
    uint8 internal constant ERR_TRAINING_STAMINA = 6;
    
    uint8 internal constant ERR_COMPUTETRAINING = 7;
    uint8 internal constant ERR_PLAYHALF = 8;
    uint8 internal constant ERR_EVOLVE = 9;
    uint8 internal constant ERR_UPDATEAFTER_YELLOW = 10;
    uint8 internal constant ERR_SHOP = 11;
    uint8 internal constant ERR_UPDATEAFTER_CHANGES = 12;
    uint8 internal constant ERR_UPDATEAFTER_OUTOFGAME1 = 13;
    uint8 internal constant ERR_UPDATEAFTER_OUTOFGAME2 = 14;

    uint8 internal constant ERR_PLAYHALF_TOO_MANY_LINEDUP = 15;
    uint8 internal constant ERR_PLAYHALF_HALFCHANGES = 16;
    uint8 internal constant ERR_PLAYHALF_PLAYER_TWICE = 17;

    uint8 internal constant ERR_2NDHALF_CANCELLED_DUE_TO_1STHALF_CANCELLED = 18;

}