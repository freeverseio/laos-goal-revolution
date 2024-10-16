pragma solidity >= 0.6.3;

import "./ProxyStorage.sol";
import "./Stakers.sol";

/**
 @title Storage for all assets.
 @author Freeverse.io, www.freeverse.io
 @dev Treat with great care. All additions must go below the last line
 @dev of the previous version
*/

/**
Warning:
- This contract must ALWAYS inherit ProxyStorage first, to preserve order of slots.
- Never alter the order of variables, never remove one.
- Variables that need to be added must always go at the bottom of this file, and once deployed, remain in the introced order.
- Avoid inheriting Constants, specially if these constants determine the size of the storage variables (e.g. length of arrays)
- ...because a change in Constants would change the Storage allocation order.
*/
contract Storage is ProxyStorage {

    uint256[2**12] _slotReserve;

    /// Roles
    address internal _market;
    address internal _COO;
    address internal _relay;
    address internal _cryptoMktAddr;
    
    /// Assets Storage
    uint256 public gameDeployDay;
    mapping(uint256 => uint256) internal _playerIdToState;
    mapping (uint256 => uint256) internal _playerIdToAuctionData;
    mapping (uint256 => bool) internal _playerIdToIsFrozenCrypto;
    mapping (uint256 => uint256) internal _teamIdToAuctionData;
    mapping (uint256 => uint256) internal _teamIdToRemainingAcqs;
    mapping (uint256 => uint256) internal _playerInTransitToTeam;
    mapping (uint256 => uint8) internal _nPlayersInTransitInTeam;
    mapping (uint256 => bool) internal _teamIdToIsBuyNowForbidden;
    mapping (uint256 => uint256) internal _countryIdToNDivisions;
    mapping (uint256 => uint256) internal _countryIdToNHumanTeams;
    mapping (uint256 => uint256) internal _divisionIdToRound;
    mapping (uint256 => uint256[25]) internal _teamIdToPlayerIds;
    mapping (uint256 => address) internal _teamIdToOwner;
    mapping (uint8 => uint256) internal _tzToNCountries;

    /// Used for restricting skills of players offered via BuyNow pattern
    uint256 internal _maxSumSkillsBuyNowPlayer;
    uint256 internal _maxSumSkillsBuyNowPlayerMinLapse;
    uint256 internal _maxSumSkillsBuyNowPlayerProposed;
    uint256 internal _maxSumSkillsBuyNowPlayerMinLapseProposed;
    uint256 internal _maxSumSkillsBuyNowPlayerLastUpdate;

    /// Storage required by Updates/Challenges games
    /// Time is often measured in verses
    /// A new verse starts with a userActions submission, 
    /// one every 15min
    uint256 internal _nextVerseTimestamp;
    uint8 internal _timeZoneForRound1;
    uint256 internal _currentVerse;
    bytes32 internal _currentVerseSeed;

    uint256 internal _firstVerseTimeStamp;
    uint16 internal _levelsInOneChallenge;
    uint16 internal _leafsInLeague;
    uint16 internal _levelsInLastChallenge;
    uint256 internal _challengeTime;
    bool internal _allowChallenges;
    mapping (uint256 => bytes32[2]) _actionsRoot;
    mapping (uint256 => bytes32[2]) _activeTeamsPerCountryRoot;
    mapping (uint256 => bytes32[2]) _orgMapRoot;
    mapping (uint256 => uint8[2]) _levelVerifiableByBC;
    mapping (uint256 => bytes32[6][2]) _roots;
    mapping (uint256 => uint8[2]) _challengeLevel;
    mapping (uint256 => uint8) _newestOrgMapIdx;
    mapping (uint256 => uint8) _newestRootsIdx;
    mapping (uint256 => uint256) _lastActionsSubmissionTime;
    mapping (uint256 => uint256) _lastUpdateTime;
 
    /// The update/challenge game needs to call the external
    /// Stakers contract, that only manages deposits, slashes, etc.
    Stakers public _stakers;

    // Last line of this contract as of Thursday, July 23rd, midday UTC+2 
    // Any new storage variables, add below this line.
}