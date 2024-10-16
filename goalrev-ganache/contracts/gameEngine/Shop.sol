pragma solidity >= 0.6.3;

import "../encoders/EncodingSkillsSetters.sol";
import "../encoders/EncodingTacticsBase2.sol";
import "../storage/Assets.sol";
import "../gameEngine/ErrorCodes.sol";

/**
 @title Manages items in shop
 @author Freeverse.io, www.freeverse.io
*/

contract Shop is EncodingSkillsSetters, EncodingTacticsBase2, ErrorCodes{

    event ItemOffered(
        uint16 itemId,
        uint256 countriesRoot,
        uint256 championshipsRoot,
        uint256 teamsRoot,
        uint16 itemsRemaining,
        uint32 encodedBoost,
        uint8 matchesDuration,
        uint8 onlyTopInChampioniship,
        string uri
    );

    uint8 constant public SK_SHO = 0;
    uint8 constant public SK_SPE = 1;
    uint8 constant public SK_PAS = 2;
    uint8 constant public SK_DEF = 3;
    uint8 constant public SK_END = 4;
    uint8 constant public N_SKILLS = 5;
    uint8 constant private PLAYERS_PER_TEAM_MAX = 25;

    struct ShopItem {
        /// boosts from [0,..4] -> in percentage, order: shoot, speed, pass, defence, endurance
        /// boosts[5] in units, for potential
        uint256 countriesRoot;
        uint256 championshipsRoot;
        uint256 teamsRoot;
        uint16 itemsRemaining;
        uint32 encodedBoost;
        uint8 matchesDuration;
        uint8 onlyTopInChampioniship;
        string uri;
    }        

    Assets private _assets;
    ShopItem[] private _shopItems;
    uint8 maxPercentPerSkill = 50;
    uint8 maxIncreasePotential = 1;
    uint8 maxMatchesDuration = 14;
    uint16 maxItemsInOneOffering = 10000;

    modifier onlyCOO {
        require( _assets.COO() == msg.sender, "Only COO can call this function.");
            _;
    }
  
    constructor(address assetsAddress) public {
        _assets = Assets(assetsAddress);
        _shopItems.push(ShopItem(0, 0, 0, 0, 0, 0, 0, ""));
        /// Adding one item for testing only. TODO: remove from production.
        uint8[N_SKILLS+1] memory skillsBoost;
        for (uint8 sk = 0; sk < N_SKILLS; sk++) skillsBoost[sk] = 20;
        skillsBoost[N_SKILLS] = 1;
        _shopItems.push(ShopItem(0, 0, 0, 300, encodeBoosts(skillsBoost), 7, 0, "www.freeverse.io"));
    }

    function offerItem(
        uint8[N_SKILLS+1] calldata skillsBoost,
        uint256 countriesRoot,
        uint256 championshipsRoot,
        uint256 teamsRoot,
        uint16 itemsRemaining,
        uint8 matchesDuration,
        uint8 onlyTopInChampioniship,
        string calldata uri
    ) 
        external 
        onlyCOO
    {
        require(_shopItems.length < 2**16 - 1, "shop cannot accept more than 2**16-1 items");
        for (uint8 sk = 0; sk < N_SKILLS; sk++) {
            require(skillsBoost[sk] <= maxPercentPerSkill, "cannot offer items that boost one skill so much");
        }
        require(skillsBoost[N_SKILLS] <= maxIncreasePotential, "cannot offer items that boost potential so much");
        require(itemsRemaining > 0, "cannot offer 0 items");
        require(itemsRemaining <= maxItemsInOneOffering, "cannot offer so many items in one go");
        require(matchesDuration > 0, "cannot offer items that last 0 games");
        require(matchesDuration <= maxMatchesDuration, "cannot offer items that last so many games");
        uint32 encodedBoost = encodeBoosts(skillsBoost);
        _shopItems.push(ShopItem(
            countriesRoot,
            championshipsRoot,
            teamsRoot,
            itemsRemaining,
            encodedBoost,
            matchesDuration,
            onlyTopInChampioniship,
            uri
        ));
        emit ItemOffered(
            uint16(_shopItems.length - 1),
            countriesRoot,
            championshipsRoot,
            teamsRoot,
            itemsRemaining,
            encodedBoost,
            matchesDuration,
            onlyTopInChampioniship,
            uri
        );
    }
    
    function reduceItemsRemaining(uint16 itemId, uint16 newItemsRemaining) public onlyCOO {
        require(itemId < _shopItems.length, "item not found in shop");
        uint16 prevItemsRemaining = _shopItems[itemId].itemsRemaining;
        require(newItemsRemaining < prevItemsRemaining, "new value for itemsRemaining is larger than previous value, yet calling it reduce?");
        _shopItems[itemId].itemsRemaining = newItemsRemaining;
    }
    
    /// View functions
    
    function addItemsToTactics(uint256 tactics, uint16 itemId, uint8[PLAYERS_PER_TEAM_MAX] memory staminaRecovery) public view returns(uint256) {
        tactics = setStaminaRecovery(tactics, staminaRecovery);
        if (itemId > 0) {
            require(itemId < _shopItems.length, "item not found in shop");
            tactics = setItemId(tactics, itemId);
            tactics = setItemBoost(tactics, _shopItems[itemId].encodedBoost);
        }
        return tactics;
    }
    
    function validateItemsInTactics(uint256 tactics) public view returns(uint8) {
        ( , uint16 itemId, uint32 boost) = getItemsData(tactics);
        if (itemId == 0) return 0;
        if (itemId >= _shopItems.length) return ERR_SHOP; // item not found in shop
        if (_shopItems[itemId].encodedBoost != boost) return ERR_SHOP; // tactics refer to an item with mismatching boost properties
        return 0;
    }
    
    function getEncodedBoost(uint16 itemId) public view returns (uint32) { return _shopItems[itemId].encodedBoost; }
    function getCountriesRoot(uint16 itemId) public view returns (uint256) { return _shopItems[itemId].countriesRoot; }
    function getChampionshipsRoot(uint16 itemId) public view returns (uint256) { return _shopItems[itemId].championshipsRoot; }
    function getTeamsRoot(uint16 itemId) public view returns (uint256) { return _shopItems[itemId].teamsRoot; }
    function getItemsRemaining(uint16 itemId) public view returns (uint16) { return _shopItems[itemId].itemsRemaining; }
    function getMatchesDuration(uint16 itemId) public view returns (uint8) { return _shopItems[itemId].matchesDuration; }
    function getOnlyTopInChampioniship(uint16 itemId) public view returns (uint8) { return _shopItems[itemId].onlyTopInChampioniship; }
    function getUri(uint16 itemId) public view returns (string memory) { return _shopItems[itemId].uri; }
    function setMaxPercentPerSkill(uint8 newVal) public { maxPercentPerSkill = newVal; } 
    function setMaxIncreasePotential(uint8 newVal) public { maxIncreasePotential = newVal; } 
    function setMaxMatchesDuration(uint8 newVal) public { maxMatchesDuration = newVal; } 
    function setMaxItemsInOneOffering(uint16 newVal) public { maxItemsInOneOffering = newVal; } 
}
