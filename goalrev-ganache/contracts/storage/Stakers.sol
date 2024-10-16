pragma solidity >= 0.6.3;

import "./Assets.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 @title Manages Stakers and their deposits. Agnostic of the rules behind the game.
 @author Freeverse.io, www.freeverse.io
 @dev All source of truth regarding updates & challenges comes from the GameOwner contract
 @dev This contract's convention: prepend _ to function inputs only.
*/
 

contract Stakers {
  using SafeMath for uint256;
  
  address constant internal NULL_ADDR = address(0x0);

  event PotBalanceChange(uint256 newBalance);
  event RewardsExecuted();
  event AddedTrustedParty(address party);
  event NewGameOwner(address newOwner);
  event NewEnrol(address staker);
  event NewUnenrol(address staker);
  event SlashedBy(address slashedStaker, address goodStaker);
  event AddedRewardToUpdater(address staker);
  event FinalizedGameRound();
  event NewGameLevel(uint16 level);

  Assets private assets;

  address public gameOwner;

  mapping (address => bool) public isStaker;
  mapping (address => bool) public isSlashed;
  mapping (address => bool) public isTrustedParty;

  mapping (address => uint256) public stakes;
  mapping (address => uint256) public pendingWithdrawals;
  mapping (address => uint256) public howManyUpdates;
  
  uint256 public nStakers;  
  uint256 public requiredStake;
  uint256 public potBalance;
  uint256 public totalNumUpdates;
  address [] public toBeRewarded;
  address[] public updaters;

  /// Permission handling
  
  modifier onlyGame {
    require(msg.sender == gameOwner && gameOwner != NULL_ADDR,
            "Only gameOwner can call this function.");
    _;
  }

  modifier onlyCOO {
      require( assets.COO() == msg.sender, "Only COO can call this function.");
          _;
  }
  
  constructor(address _assetsAddress, uint256 _stake) public {
    assets = Assets(_assetsAddress);
    requiredStake = _stake;
  }
    
  /// External / Public Functions

  /// sets the address of the external contract that interacts with this contract
  function setGameOwner(address _address) external onlyCOO {
    require (_address != NULL_ADDR, "invalid address 0x0");
    gameOwner = _address;
    emit NewGameOwner(_address);
  }
  

  /// executes rewards
  function executeReward() external onlyCOO {
    require (toBeRewarded.length > 0, "failed to execute rewards: empty array");
    require (potBalance >= toBeRewarded.length, "failed to execute rewards: Not enough balance to share");
    for (uint256 i = 0; i < toBeRewarded.length; i++) {
      address who = toBeRewarded[i];
      /// better to multiply, and then divide, each time, to minimize rounding errors.
      pendingWithdrawals[who] += (potBalance * howManyUpdates[who]) / totalNumUpdates;
      howManyUpdates[who] = 0;
    }
    delete toBeRewarded;
    potBalance = 0; /// there could be a negligible loss of funds in the Pot.
    totalNumUpdates = 0;
    emit RewardsExecuted();
  }  

  /// transfers pendingWithdrawals to the calling staker; the stake remains until unenrol is called
  function withdraw() external {
    /// no need to require (isStaker[msg.sender], "failed to withdraw: staker not registered");
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, "nothing to withdraw by this msg.sender");
    pendingWithdrawals[msg.sender] = 0;
    msg.sender.transfer(amount);
  }

  function assertGoodCandidate(address _addr) public view {
    require(_addr != NULL_ADDR, "candidate is null addr");
    require(!isSlashed[_addr], "candidate was slashed previously");
    require(stakes[_addr] == 0, "candidate already has a stake");
  }

  /// adds address as trusted party
  function addTrustedParty(address _staker) external onlyCOO {
    assertGoodCandidate(msg.sender);
    require(!isTrustedParty[_staker], "trying to add a trusted party that is already trusted");
    isTrustedParty[_staker] = true;
    emit AddedTrustedParty(_staker);
  }

  /// registers a new staker
  function enrol() external payable {
    assertGoodCandidate(msg.sender);
    require (msg.value == requiredStake, "failed to enrol: wrong stake amount");
    require (isTrustedParty[msg.sender], "failed to enrol: staker is not trusted party");
    require (addStaker(msg.sender), "failed to enrol: cannot add staker");
    stakes[msg.sender] = msg.value;
    emit NewEnrol(msg.sender);
  }

  /// unregisters a new staker and transfers all earnings, and pot
  function unEnroll() external {
    require (!alreadyDidUpdate(msg.sender), "failed to unenroll: staker currently updating");
    require (removeStaker(msg.sender), "failed to unenroll");
    uint256 amount = pendingWithdrawals[msg.sender] + stakes[msg.sender];
    pendingWithdrawals[msg.sender] = 0;
    stakes[msg.sender]  = 0;
    if (amount > 0) { msg.sender.transfer(amount); }
    emit NewUnenrol(msg.sender);
  }

  /// update to a new level
  //// @param _level to which update
  //// @param _staker address of the staker that reports this update
  //// @dev This function will also resolve previous updates when
  ///       level is below current or level has reached the end
  function update(uint16 _level, address _staker) external onlyGame {
    require (_level <= level(),        "failed to update: wrong level");
    require (isStaker[_staker],        "failed to update: staker not registered");
    //require (!isSlashed(_staker),      "failed to update: staker was slashed"); /// also covered by not being part of stakers, because slashing removes address from stakers
    require(!alreadyDidUpdate(_staker), "staker has already updated this game");

    while (_level < level()) {
        /// If level is below current, it means the challenge
        /// period has passed, so last updater told the truth.
        /// The last updater should be rewarded, the one before
        /// last should be slashed and level moves back two positions
        require ((level() -_level) % 2 == 0, "failed to update: resolving wrong level");
        resolve();
    }
    updaters.push(_staker);
    emit NewGameLevel(level());
  }

  /// finalize current game, get ready for next one.
  //// @dev current state will be resolved at this point.
  //// If called from level 1, then staker is rewarded.
  //// When called from any other level, means that every
  //// other staker told the truth but the one in between
  //// lied.
  function finalize() external onlyGame {
    require (level() > 0, "failed to finalize: wrong level");
    while (level() > 1) {
      resolve();
    }
    if (level() == 1) {
      addRewardToUpdater(popUpdaters());
    }
    require (level() == 0, "failed to finalize: no updaters should have been left");
    emit FinalizedGameRound();
  }


  function addRewardToPot() external payable {
    require (msg.value > 0, "failed to add reward of zero");
    potBalance += msg.value;
    emit PotBalanceChange(potBalance);
  }

  /// Private Functions

  function addStaker(address _staker) private returns (bool) {
    if (_staker == NULL_ADDR) return false; /// prevent null addr
    if (isStaker[_staker]) return false; /// staker already registered
    isStaker[_staker] = true;
    nStakers++;
    return true;
  }

  function removeStaker(address _staker) private returns (bool){
    if (_staker == NULL_ADDR) return false; /// prevent null addr
    if (!isStaker[_staker]) return false; /// staker not registered
    isStaker[_staker] = false;
    nStakers--;
    return true;
  }

  function resolve() private {
    address goodStaker = popUpdaters();
    address badStaker = popUpdaters();
    earnStake(goodStaker, badStaker);
    slash(badStaker);
  }

  function slash(address _staker) private {
    require (removeStaker(_staker), "failed to slash: staker not found");
    isSlashed[_staker] = true;
  }

  /// the slashed stake goes into the "pendingWithdrawals" of the good staker,
  /// not to his "stake". This way, he can cash it without unenrolling.
  function earnStake(address _goodStaker, address _badStaker) private {
    uint256 amount = stakes[_badStaker];
    stakes[_badStaker] = 0;
    pendingWithdrawals[_goodStaker] += amount;
    emit SlashedBy(_badStaker, _goodStaker);
    /// TODO: alternatively it has been proposed to burn stake, and reward true tellers with the monthly pool.
    /// The idea behind it, is not to promote interest in stealing someone else's stake
    /// NULL_ADDR.transfer(requiredStake); /// burn stake
  }
  


  function addRewardToUpdater(address _addr) private {
    if (howManyUpdates[_addr] == 0) {
      toBeRewarded.push(_addr);
    }
    howManyUpdates[_addr] += 1;
    totalNumUpdates++;
    emit AddedRewardToUpdater(_addr);
  }

  function popUpdaters() private returns (address _address) {
    uint256 updatersLength = updaters.length;
    require (updatersLength > 0, "cannot pop from an empty AddressStack");
    _address = updaters[updatersLength - 1];
    updaters.pop();
  }


  /// View Functions

  /// this function iterates over a storage array, but of max length 4.
  function alreadyDidUpdate(address _address) public view returns (bool) {
    for (uint256 i = 0; i < updaters.length; i++) {
      if (updaters[i] == _address) {
        return true;
      }
    }
    return false;
  }
  
  /// get the current level
  function level() public view returns (uint16) {
    return uint16(updaters.length);
  }

}

