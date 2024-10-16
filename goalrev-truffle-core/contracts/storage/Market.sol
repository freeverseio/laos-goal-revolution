pragma solidity >= 0.6.3;

import "./MarketView.sol";

/**
 @title Storage writers for changing ownership of assets, and managing bids and auctions, in FIAT.
 @author Freeverse.io, www.freeverse.io
 @dev Auctions are operated by first Freezing the asset (only seller signature required)
 @dev and then by CompleAuction the sale (owner required).
 @dev If the payment was in FIAT, the CompleteAuction TX requires the company signture too.
 @dev Only BuyNow players can be offered by the company without auction. 
 @dev These "BuyNow" players have limited max skills.
 @dev If a team acquires more than 25 players, the extra ones remain with shirtNum = 26 = IN_TRANSIT_SHIRTNUM
 @dev until some of the 25 are sold or retired.
 @dev The serialized structs appearing here are "AcquisitonConstraints" and "AuctionData"
 @dev Both use validUntil (in seconds) which uses 32b, hence allowing 2**32/(3600*24*365) = 136 years after 1970
 @dev AuctionData encodes, (8b of zeroes, 216 for auctionId, 32b for validUntil 
 @dev   where auctionId has the leftmost 40 bit killed, 
 @dev   => validUntil + (uint256(auctionId) << 40)) >> 8;
 @dev "Constraints" can be added to teams that participate in "Top Critical" championships, where
 @dev they want to make sure that they can't change their teams too much since the moment they sign up.
 @dev AcquisitonConstraints: serializes the number of trades left (4b), and until when, for the 6 possible constraints
 @dev   => (n5, validUntil5, n4, validUntil4,... n0, validUntil0), 
 @dev   => so it leaves the leftmost 256 - 6 * 36 = 40b free
*/

/// Warning: This contract must ALWAYS inherit MarketView first, so that it ends up inheriting Storage before any other contract.
contract Market is MarketView {
    event PlayerFreeze(uint256 playerId, uint256 auctionData, bool frozen);
    event PlayerFreezeCrypto(uint256 playerId, bool frozen);
    event TeamFreeze(uint256 teamId, uint256 auctionData, bool frozen);
    event PlayerStateChange(uint256 playerId, uint256 state);
    event ProposedNewMaxSumSkillsBuyNowPlayer(uint256 newSumSkills, uint256 newLapseTime);
    event UpdatedNewMaxSumSkillsBuyNowPlayer(uint256 newSumSkills, uint256 newLapseTime);

    /// Only the authorized contract can operate assets in Crypto: 
    modifier onlyCryptoMarket() {
        require(msg.sender == _cryptoMktAddr, "Only CryptoMarket is authorized.");
        _;
    }

    function setCryptoMarketAddress(address addr) external onlyCOO {
        _cryptoMktAddr = addr;
    }
    
    /// By default, the company can transfer a BuyNow player without forcing
    /// the blockchain to check the owner's signature. This is to safe gas.
    /// The company has obviously checked it off-chain, and receiving a player is
    /// always a good thing.
    /// However, Users can opt-out from allowing the company to put BuyNow players in their teams:
    function setIsBuyNowAllowedByOwner(uint256 teamId, bool isAllowed) external {
        require(msg.sender == getOwnerTeam(teamId), "only owner of team can change isBuyNowAlloed");
        _teamIdToIsBuyNowForbidden[teamId] = !isAllowed;
    }
    
    /// When the player has been frozen in the crypto market, 
    /// it won't be available in the FIAT market (or in any other) until auction finises
    function setIsPlayerFrozenCrypto(uint256 playerId, bool isFrozen) external onlyCryptoMarket {
        _playerIdToIsFrozenCrypto[playerId] = isFrozen;
        emit PlayerFreezeCrypto(playerId, isFrozen);
    }

    /// Changing the MaxSkills allowed for BuyNow players is not instant, to prevent manipulating matches
    /// by suddenly offering amazing players to some user.
    /// The company must let everyone know the new value first (propose), and then wait
    /// for some time (Lapse) until it can be made effective.
    // function proposeNewMaxSumSkillsBuyNowPlayer(uint256 newSumSkills, uint256 newLapseTime) external onlyCOO{
    //     _maxSumSkillsBuyNowPlayerProposed = newSumSkills;
    //     _maxSumSkillsBuyNowPlayerMinLapseProposed = newLapseTime;
    //     _maxSumSkillsBuyNowPlayerLastUpdate = now;
    //     emit ProposedNewMaxSumSkillsBuyNowPlayer(newSumSkills, newLapseTime);
    // }

    /// maxSumSkills can only grow if enough time has passed 
    function setNewMaxSumSkillsBuyNowPlayer(uint256 newSumSkills, uint256 newLapseTime) external onlyCOO {
        _maxSumSkillsBuyNowPlayer = newSumSkills;
        _maxSumSkillsBuyNowPlayerMinLapse = newLapseTime;
        emit UpdatedNewMaxSumSkillsBuyNowPlayer(newSumSkills, newLapseTime);
    }
    
    /// Lowering maxSumSkills can always be made instantly, as this restricts the company further.
    function lowerNewMaxSumSkillsBuyNowPlayer(uint256 newMaxSum) external onlyCOO {
        require (newMaxSum < _maxSumSkillsBuyNowPlayer, "newMaxSum is not lower than previous");
        _maxSumSkillsBuyNowPlayer = newMaxSum;
        emit UpdatedNewMaxSumSkillsBuyNowPlayer(newMaxSum, _maxSumSkillsBuyNowPlayerMinLapse);
    }
    
    /// TODO: require signature from team owner
    function addAcquisitionConstraint(uint256 teamId, uint32 validUntil, uint8 nRemain) external onlyCOO {
        require(nRemain > 0, "nRemain = 0, which does not make sense for a constraint");
        uint256 remainingAcqs = _teamIdToRemainingAcqs[teamId];
        bool success;
        for (uint8 acq = 0; acq < MAX_ACQUISITON_CONSTAINTS; acq++) {
            if (isAcquisitionFree(remainingAcqs, acq)) {
                _teamIdToRemainingAcqs[teamId] = setAcquisitionConstraint(remainingAcqs, validUntil, nRemain, acq);
                success = true;
                continue;
            }
        }
        require(success, "this team is already signed up in 7 contrained friendly championships");
    }
    
    /// Freezes the player, preventing it from trading in any other market for "validUntil" time.
    /// This is suposed to be triggered only when a valid buyer has been found.
    /// If offerValindUntil != 0 => the put for sale comes from an offer. 
    ///     - Then, although the seller specified validUntil too (!=0), we set auctionId = hash(sellerHidden, playerId, offerValidUntil)
    /// If offerValindUntil = 0 => the put for sale comes out of the blue. Then, auctionId = hash(sellerHidden, playerId, validUntil)
    function freezePlayer(
        bytes32 sellerHiddenPrice,
        uint256 playerId,
        bytes32[2] calldata sig,
        uint8 sigV,
        uint32 validUntil,
        uint32 offerValidUntil
    ) 
        external 
        onlyMarket 
    {
        require(areFreezePlayerRequirementsOK(sellerHiddenPrice, playerId, sig, sigV, validUntil, offerValidUntil), "FreezePlayer requirements not met");
        bytes32 auctionId = computeAuctionId(sellerHiddenPrice, playerId, validUntil, offerValidUntil);
        _playerIdToAuctionData[playerId] = validUntil + ((uint256(auctionId) << 40) >> 8);
        emit PlayerFreeze(playerId, _playerIdToAuctionData[playerId], true);
    }

    function transferBuyNowPlayer(
        uint256 playerId,
        uint256 targetTeamId
     ) 
        external 
    {
        require((msg.sender == _market) || (msg.sender == _relay), "Only market or relay are authorized.");
        /// isAcademy checks that player isSpecial, and not written.
        require(getCurrentTeamIdFromPlayerId(playerId) == ACADEMY_TEAM, "only Academy players can be sold via buy-now");
        require(getSumOfSkills(playerId) < _maxSumSkillsBuyNowPlayer, "buy now player has sum of skills larger than allowed");
        require(!isBotTeam(targetTeamId), "cannot transfer to bot teams");
        require(!_teamIdToIsBuyNowForbidden[targetTeamId], "user has explicitly forbidden buyNow");
        require(targetTeamId != ACADEMY_TEAM, "targetTeam of buyNow player cannot be Academy Team");

        /// note that wasTeamCreatedVirtually(targetTeamId) &  !isBotTeam(targetTeamId) => already part of transferPlayer
        (bool isConstrained, uint8 nRemain) = getMaxAllowedAcquisitions(targetTeamId);
        require(!(isConstrained && (nRemain == 0)), "trying to accept a buyNow player, but team is busy in constrained friendlies");
        transferPlayer(playerId, targetTeamId);
        decreaseMaxAllowedAcquisitions(targetTeamId);
    }
    
    function transferPlayerFromCryptoMkt(
        uint256 playerId,
        uint256 targetTeamId
    ) 
        external 
        onlyCryptoMarket 
    {
        transferPlayer(playerId, targetTeamId);
        decreaseMaxAllowedAcquisitions(targetTeamId);
    }
    
    function completePlayerAuction(
        bytes32 auctionId,
        uint256 playerId,
        bytes32 buyerHiddenPrice,
        uint256 buyerTeamId,
        bytes32[2] calldata sig,
        uint8 sigV
     ) 
        external 
        onlyMarket 
    {
        require(areCompletePlayerAuctionRequirementsOK(
            auctionId,
            playerId,
            buyerHiddenPrice,
            buyerTeamId,
            sig,
            sigV
            ), "requirements to complete auction are not met"    
        );
        transferPlayer(playerId, buyerTeamId);
        _playerIdToAuctionData[playerId] = 1;
        decreaseMaxAllowedAcquisitions(buyerTeamId);
        emit PlayerFreeze(playerId, 1, false);
    }

    /// Teams follow the same pattern as players 
    function freezeTeam(
        bytes32 sellerHiddenPrice,
        uint256 teamId,
        bytes32[2] calldata sig,
        uint8 sigV,
        uint32 validUntil,
        uint32 offerValidUntil
    ) 
        external 
        onlyMarket 
    {
        require(areFreezeTeamRequirementsOK(sellerHiddenPrice, teamId, sig, sigV, validUntil, offerValidUntil), "FreezeTeam requirements not met");
        bytes32 auctionId = computeAuctionId(sellerHiddenPrice, teamId, validUntil, offerValidUntil);
        _teamIdToAuctionData[teamId] = validUntil + ((uint256(auctionId) << 40) >> 8);
        emit TeamFreeze(teamId, _teamIdToAuctionData[teamId], true);
    }

    function completeTeamAuction(
        bytes32 auctionId,
        uint256 teamId,
        bytes32 buyerHiddenPrice,
        bytes32[2] calldata sig,
        uint8 sigV,
        address buyerAddress
    ) 
        external 
        onlyMarket 
    {
        bool ok = areCompleteTeamAuctionRequirementsOK(
            auctionId,
            teamId,
            buyerHiddenPrice,
            sig,
            sigV,
            buyerAddress
        );
        require(ok, "requirements to complete auction are not met");
        transferTeam(teamId, buyerAddress);
        _teamIdToAuctionData[teamId] = 1;
        emit TeamFreeze(teamId, 1, false);
    }
    
    /// Main function for a user to immeditely remove a player from his/her team
    /// It can either return it to the Academy (potentially resold again by the Academy owner)
    /// Or retire the player forever, remaining in the original team, but not occupying
    /// one of the 25 players slots.
    function dismissPlayer(
        uint256 validUntil,
        uint256 playerId,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) 
        external 
        onlyMarket 
    {
        uint256 state = getPlayerState(playerId);
        uint256 teamIdOrigin = getCurrentTeamIdFromPlayerState(state);
        address owner = getOwnerTeam(teamIdOrigin);
        bytes32 msgHash = prefixed(keccak256(abi.encode(validUntil, playerId)));
        require (
            /// check validUntil has not expired
            (now < validUntil) &&
            /// check player is not already frozen
            (!isPlayerFrozenInAnyMarket(playerId)) &&  
            /// check that the team it belongs to not already frozen
            !isTeamFrozen(teamIdOrigin) &&
            /// check asset is owned by legit address
            (owner != address(0)) && 
            /// check signatures are valid by requiring that they own the asset:
            (owner == recoverAddr(msgHash, sigV, sigR, sigS)) &&    
            /// check that auction time is less that the required 32 bit
            (validUntil < now + MAX_VALID_UNTIL),
            "conditions to dismiss player are not met"
        );  
        uint256 shirtOrigin = getCurrentShirtNum(state);
        _teamIdToPlayerIds[teamIdOrigin][shirtOrigin] = FREE_PLAYER_ID;
        state = setCurrentShirtNum(state, PLAYERS_PER_TEAM_MAX);
        _playerIdToState[playerId] = state;
        emit PlayerStateChange(playerId, state);
    }

    /// When a player has been put in IN_TRANSIT (due to more than 25 players in a team)
    /// Then it can be given to the target team executing this function, if at least one slot is available.
    /// This function can be called by anyone who wants to pay the gas
    function completePlayerTransit(uint256 playerId) external  {
        uint256 state = getPlayerState(playerId);
        require(getIsInTransitFromState(state), "player not in transit");
        uint256 teamIdTarget = getCurrentTeamIdFromPlayerState(state);
        require(teamIdTarget != 0, "target team cannot be null");
        uint8 shirtTarget = getFreeShirt(teamIdTarget);
        require(shirtTarget < PLAYERS_PER_TEAM_MAX, "cannot complete player transit because targetTeam is still full");
        state = setCurrentShirtNum(
                    setCurrentTeamId(
                        state, teamIdTarget
                    ), 
                shirtTarget);
        _playerIdToState[playerId] = state;
        _teamIdToPlayerIds[teamIdTarget][shirtTarget] = playerId;
        _nPlayersInTransitInTeam[teamIdTarget] -= 1;
        emit PlayerStateChange(playerId, state);
    }

    /// Private functions

    function transferPlayer(uint256 playerId, uint256 teamIdTarget) private  {
        /// warning: check of ownership of players and teams should be done before calling this function
        /// so in this function, both teams are asumed to exist, be different, and belong to the rightful (nonBot) owners

        /// part related to origin team:
        uint256 state = getPlayerState(playerId);
        uint256 teamIdOrigin = getCurrentTeamIdFromPlayerState(state);
    
        if (teamIdOrigin != ACADEMY_TEAM) {
            uint256 shirtOrigin = getCurrentShirtNum(state);
            // if shirtOrigin == PLAYER_PER_TEAM_MAX => player had been dismissed
            if (shirtOrigin != PLAYERS_PER_TEAM_MAX) { _teamIdToPlayerIds[teamIdOrigin][shirtOrigin] = FREE_PLAYER_ID; }
        }

        /// part related to target team:
        /// - determine new state of player
        /// - if not Academy, write playerId in target team's shirt
        if (teamIdTarget == ACADEMY_TEAM) {
            state = setCurrentTeamId(state, ACADEMY_TEAM);
        } else {
            uint8 shirtTarget = getFreeShirt(teamIdTarget);
            if (shirtTarget < PLAYERS_PER_TEAM_MAX) {
                state = setLastSaleBlock(
                            setCurrentShirtNum(
                                setCurrentTeamId(
                                    state, teamIdTarget
                                ), shirtTarget
                            ), block.number
                        );
                _teamIdToPlayerIds[teamIdTarget][shirtTarget] = playerId;
            } else {
                _nPlayersInTransitInTeam[teamIdTarget] += 1;
                state = setLastSaleBlock(
                            setCurrentShirtNum(
                                setCurrentTeamId(
                                    state, teamIdTarget
                                ), 
                            IN_TRANSIT_SHIRTNUM),
                        block.number);
            }
        }
        _playerIdToState[playerId] = state;
        emit PlayerStateChange(playerId, state);
    }
    
    function transferTeam(uint256 teamId, address addr) private {
        /// requiring that team is not bot already ensures that tz and countryIdxInTz exist 
        require(!isBotTeam(teamId), "cannot transfer a bot team");
        require(addr != NULL_ADDR, "cannot transfer to a null address");
        require(_teamIdToOwner[teamId] != addr, "buyer and seller are the same addr");
        _teamIdToOwner[teamId] = addr;
        emit TeamTransfer(teamId, addr);
    }
    
    function decreaseMaxAllowedAcquisitions(uint256 teamId) private {
        uint256 remainingAcqs = _teamIdToRemainingAcqs[teamId];
        if (remainingAcqs == 0) return;
        for (uint8 acq = 0; acq < MAX_ACQUISITON_CONSTAINTS; acq++) {
            if (!isAcquisitionFree(remainingAcqs, acq)) {
                remainingAcqs = decreaseAcquisitionConstraint(remainingAcqs, acq);
            }
        }
        _teamIdToRemainingAcqs[teamId] = remainingAcqs;
    }
    
}
