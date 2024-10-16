pragma solidity >= 0.6.3;

import "./UniverseInfo.sol";
import "../encoders/EncodingState.sol";
import "../encoders/EncodingSkillsSetters.sol";

/**
 @title View and Pure functions inherited by Market
 @author Freeverse.io, www.freeverse.io
*/

/// Warning: This contract must ALWAYS inherit UniverseInfo first, so that it ends up inheriting Storage before any other contract.
contract MarketView is UniverseInfo, EncodingSkillsSetters, EncodingState {
    
    function getMaxAllowedAcquisitions(uint256 teamId) public view returns (bool isConstrained, uint8) {
        uint256 remainingAcqs = _teamIdToRemainingAcqs[teamId];
        if (remainingAcqs == 0) return (false, 0);
        uint8 nRemain = 255;
        for (uint8 acq = 0; acq < MAX_ACQUISITON_CONSTAINTS; acq++) {
            if (!isAcquisitionFree(remainingAcqs, acq)) {
                uint8 thisNRemain = getAcquisitionConstraintNRemain(remainingAcqs, acq);
                if (thisNRemain == 0) return (true, 0);
                if (thisNRemain < nRemain) nRemain = thisNRemain;
                
            }
        }
        return (nRemain == 255) ? (false, 0) : (true, nRemain);
    }    
    
    function isAcquisitionFree(uint256 remainingAcqs, uint8 acq) public view returns (bool) {
        uint32 validUntil = getAcquisitionConstraintValidUntil(remainingAcqs, acq);
        return (validUntil == 0) || (validUntil < now);
    }
    
    function getAcquisitionConstraintValidUntil(uint256 remainingAcqs, uint8 acq) public pure returns (uint32) {
        return uint32((remainingAcqs >> 36 * acq) & (2**32-1)) ; 
    }

    function getAcquisitionConstraintNRemain(uint256 remainingAcqs, uint8 acq) public pure returns (uint8) {
        return uint8((remainingAcqs >> 32 + 36 * acq) & 15); 
    }
    
    function setAcquisitionConstraint(uint256 remainingAcqs, uint32 validUntil, uint8 nRemain, uint8 acq) public pure returns (uint256) {
        return  (remainingAcqs & ~(uint256(2**36-1) << (36 * acq)))
                | (uint256(validUntil) << (36 * acq))
                | (uint256(nRemain) << (32 + 36 * acq));
    }

    function decreaseAcquisitionConstraint(uint256 remainingAcqs, uint8 acq) public pure returns (uint256) {
        uint8 nRemain = getAcquisitionConstraintNRemain(remainingAcqs, acq);
        return (remainingAcqs & ~(uint256(15) << (32 + 36 * acq))) | (uint256(nRemain-1) << (32 + 36 * acq));
    }
    
    function areFreezeTeamRequirementsOK(
        bytes32 sellerHiddenPrice,
        uint256 teamId,
        bytes32[2] memory sig,
        uint8 sigV,
        uint32 validUntil,
        uint32 offerValidUntil
    ) 
        public 
        view 
        returns (bool ok)
    {
        address teamOwner = getOwnerTeam(teamId);
        if (offerValidUntil == 0) {
            /// check validUntil has not expired
            ok = (validUntil > now);
        } else {
            /// check offerValidUntil has not expired, and that validUntil is at least 3min larger
            ok = (offerValidUntil > now) && (validUntil > offerValidUntil + 180);
        }
        bytes32 sellerDigest = computePutAssetForSaleDigest(sellerHiddenPrice, teamId, validUntil, offerValidUntil);
        ok =    ok &&
                /// check player is not already frozen
                (!isTeamFrozen(teamId)) &&  
                /// check asset is owned by legit address
                (teamOwner != NULL_ADDR) && 
                /// check signatures are valid by requiring that they own the asset:
                (teamOwner == recoverAddr(sellerDigest, sigV, sig[IDX_r], sig[IDX_s])) &&    
                /// check that auction time is less that the required 32 bit (2^32 - 1)
                (validUntil < now + MAX_VALID_UNTIL);
        if (!ok) return false;
        if (teamId == ACADEMY_TEAM) return true;
        
        /// check that the team itself does not have players already for sale:   
        uint256[PLAYERS_PER_TEAM_MAX] memory playerIds = getPlayerIdsInTeam(teamId);
        for (uint8 p = 0; p < PLAYERS_PER_TEAM_MAX; p++) {
            if (!isFreeShirt(playerIds[p], p) && isPlayerFrozenInAnyMarket(playerIds[p])) return false;
        }
    }

    function areCompleteTeamAuctionRequirementsOK(
        bytes32 auctionId,
        uint256 teamId,
        bytes32 buyerHiddenPrice,
        bytes32[2] memory sig,
        uint8 sigV,
        address buyerAddress
     ) 
        public
        view
        returns(bool ok) 
    {
        /// the next line will verify that the teamId is the same that was used by the seller to sign
        bytes32 msgHash = prefixed(buildAgreeToBuyTeamTxMsg(auctionId, buyerHiddenPrice));
        ok =    /// check buyerAddress is legit and signature is valid
                (buyerAddress != address(0)) && 
                /// /// check that they signed what they input data says they signed:
                (buyerAddress == recoverAddr(msgHash, sigV, sig[IDX_r], sig[IDX_s])) && 
                /// check buyer and seller refer to the exact same auction
                ((uint256(auctionId) & KILL_LEFTMOST_40BIT_MASK) == (_teamIdToAuctionData[teamId] >> 32)) &&
                /// /// check player is still frozen
                isTeamFrozen(teamId);
    }

    function areCompletePlayerAuctionRequirementsOK(
        bytes32 auctionId,
        uint256 playerId,
        bytes32 buyerHiddenPrice,
        uint256 buyerTeamId,
        bytes32[2] memory sig,
        uint8 sigV
     ) 
        public
        view
        returns(bool ok) 
    {
        /// the next line will verify that the playerId is the same that was used by the seller to sign
        (bool isConstrained, uint8 nRemain) = getMaxAllowedAcquisitions(buyerTeamId);
        if (isConstrained && nRemain == 0) return false;
        bytes32 msgHash = prefixed(buildAgreeToBuyPlayerTxMsg(auctionId, buyerHiddenPrice, buyerTeamId));
        address buyerTeamOwner = getOwnerTeam(buyerTeamId);
        uint256 state = getPlayerState(playerId);
        ok =    /// cannot be a player in transit
                !getIsInTransitFromState(state) &&
                /// origin and target teams must be different
                buyerTeamId != getCurrentTeamIdFromPlayerState(state) &&
                /// check asset is owned by buyer
                (buyerTeamOwner != NULL_ADDR) && 
                /// check buyer and seller refer to the exact same auction
                ((uint256(auctionId) & KILL_LEFTMOST_40BIT_MASK) == (_playerIdToAuctionData[playerId] >> 32)) &&
                /// check signatures are valid by requiring that they own the asset:
                (buyerTeamOwner == recoverAddr(msgHash, sigV, sig[IDX_r], sig[IDX_s])) &&
                /// check player is still frozen
                isPlayerFrozenFiat(playerId);
    }

    function areFreezePlayerRequirementsOK(
        bytes32 sellerHiddenPrice,
        uint256 playerId,
        bytes32[2] memory sig,
        uint8 sigV,
        uint32 validUntil,
        uint32 offerValidUntil
    ) 
        public 
        view 
        returns (bool ok)
    {
        uint256 state = getPlayerState(playerId);
        require(!getIsInTransitFromState(state), "cannot freeze a player that is in transit");
        if (offerValidUntil == 0) {
            /// check validUntil has not expired
            ok = (validUntil > now);
        } else {
            /// check offerValidUntil has not expired, and that validUntil is at least 10sec larger
            ok = (offerValidUntil > now) && (validUntil > offerValidUntil + 10);
        }
        ok = ok &&
            /// check player is not already frozen
            (!isPlayerFrozenInAnyMarket(playerId)) &&  
            /// check that auction time is less that the required 32 bit
            (validUntil < now + MAX_VALID_UNTIL);
        
        /// If this is an academy player, just check that the msg arrives from the owner of the Academy.
        uint256 currentTeamId = getCurrentTeamIdFromPlayerState(state);
        if (currentTeamId == ACADEMY_TEAM) { return(ok && (msg.sender == _market)); }

        /// Otherwise, check that the signature is from the owner, and that the team is OK.
        address prevOwner = getOwnerTeam(currentTeamId);
        bytes32 sellerDigest = computePutAssetForSaleDigest(sellerHiddenPrice, playerId, validUntil, offerValidUntil);
        ok = ok &&
            /// check that the team it belongs to not already frozen
            !isTeamFrozen(currentTeamId) &&
            /// check asset is owned by legit address
            (prevOwner != address(0)) && 
            /// check signatures are valid by requiring that they own the asset:
            (prevOwner == recoverAddr(sellerDigest, sigV, sig[IDX_r], sig[IDX_s]));
    }
    
    /// this function is not used in the contract. It's only for external helps
    function hashPrivateMsg(uint8 currencyId, uint256 price, uint256 rnd) external pure returns (bytes32) {
        return keccak256(abi.encode(currencyId, price, rnd));
    }

    function hashBidHiddenPrice(uint256 extraPrice, uint256 rnd) external pure returns (bytes32) {
        return keccak256(abi.encode(extraPrice, rnd));
    }

    function computeAuctionId(bytes32 hiddenPrice, uint256 assetId, uint32 validUntil, uint32 offerValidUntil) public pure returns (bytes32) {
        return (offerValidUntil == 0) ? keccak256(abi.encode(hiddenPrice, assetId, validUntil)) : keccak256(abi.encode(hiddenPrice, assetId, offerValidUntil));
    }

    function computePutAssetForSaleDigest(bytes32 hiddenPrice, uint256 assetId, uint32 validUntil, uint32 offerValidUntil) public pure returns (bytes32) {
        return prefixed(keccak256(abi.encode(hiddenPrice, assetId, validUntil, offerValidUntil)));
    }

    function buildOfferToBuyTxMsg(bytes32 hiddenPrice, uint256 validUntil, uint256 playerId, uint256 buyerTeamId) public pure returns (bytes32) {
        return keccak256(abi.encode(hiddenPrice, validUntil, playerId, buyerTeamId));
    }

    function buildAgreeToBuyPlayerTxMsg(bytes32 auctionId, bytes32 buyerHiddenPrice, uint256 buyerTeamId) public pure returns (bytes32) {
        return keccak256(abi.encode(auctionId, buyerHiddenPrice, buyerTeamId));
    }

    function buildAgreeToBuyTeamTxMsg(bytes32 auctionId, bytes32 buyerHiddenPrice) public pure returns (bytes32) {
        return keccak256(abi.encode(auctionId, buyerHiddenPrice));
    }

    /// FUNCTIONS FOR SIGNATURE MANAGEMENT
    /// retrieves the addr that signed a message
    function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        return ecrecover(msgHash, v, r, s);
    }

    /// (currently not used) checks if the signature of a message says that it was signed by the provided address
    function isSigned(address _addr, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (bool) {
        return ecrecover(msgHash, v, r, s) == _addr;
    }

    /// Builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function getBlockchainNowTime() external view returns (uint) {
        return now;
    }

    function isPlayerFrozenInAnyMarket(uint256 playerId) public view returns (bool) {
        return isPlayerFrozenFiat(playerId) || _playerIdToIsFrozenCrypto[playerId];
    }

    function isPlayerFrozenFiat(uint256 playerId) public view returns (bool) {
        return (_playerIdToAuctionData[playerId] & VALID_UNTIL_MASK) + POST_AUCTION_TIME > now;
    }

    function isTeamFrozen(uint256 teamId) public view returns (bool) {
        if (teamId == ACADEMY_TEAM) return false;
        require(wasTeamCreatedVirtually(teamId), "unexistent team");
        return (_teamIdToAuctionData[teamId] & VALID_UNTIL_MASK) + POST_AUCTION_TIME > now;
    }
    
    function getOwnerTeam(uint256 teamId) public view returns(address) {
        return _teamIdToOwner[teamId];
    }

    function getPlayerStateAtBirth(uint256 playerId) public pure returns (uint256) {
        if (getIsSpecial(playerId)) return encodePlayerState(ACADEMY_TEAM, 0, 0, 0);
        (uint8 timeZone, uint256 countryIdxInTZ, uint256 playerIdxInCountry) = decodeTZCountryAndVal(playerId);
        uint256 teamIdxInCountry = playerIdxInCountry / PLAYERS_PER_TEAM_INIT;
        uint256 currentTeamId = encodeTZCountryAndVal(timeZone, countryIdxInTZ, teamIdxInCountry);
        uint8 shirtNum = uint8(playerIdxInCountry % PLAYERS_PER_TEAM_INIT);
        return encodePlayerState(currentTeamId, shirtNum, 0, 0);
    }

    function getPlayerState(uint256 playerId) public view returns (uint256) {
        uint256 state = _playerIdToState[playerId];
        if (state != 0) return state;
        if (!getIsSpecial(playerId) && !wasPlayerCreatedVirtually(playerId)) return 0;
        return getPlayerStateAtBirth(playerId);
    }
    
    /// TODO: we really don't need this function. Only for external use. Consider removal
    function getPlayerIdsInTeam(uint256 teamId) public view returns (uint256[PLAYERS_PER_TEAM_MAX] memory playerIds) {
        (uint8 timeZone, uint256 countryIdxInTZ, uint256 teamIdxInCountry) = decodeTZCountryAndVal(teamId);
        require(teamExistsInCountry(timeZone, countryIdxInTZ, teamIdxInCountry), "invalid team id");
        if (isBotTeamInCountry(timeZone, countryIdxInTZ, teamIdxInCountry)) {
            for (uint8 shirtNum = 0 ; shirtNum < PLAYERS_PER_TEAM_MAX ; shirtNum++){
                playerIds[shirtNum] = getDefaultPlayerIdForTeamInCountry(timeZone, countryIdxInTZ, teamIdxInCountry, shirtNum);
            }
        } else {
            for (uint8 shirtNum = 0 ; shirtNum < PLAYERS_PER_TEAM_MAX ; shirtNum++){
                uint256 writtenId = _teamIdToPlayerIds[teamId][shirtNum];
                if (writtenId == 0) {
                    playerIds[shirtNum] = getDefaultPlayerIdForTeamInCountry(timeZone, countryIdxInTZ, teamIdxInCountry, shirtNum);
                } else {
                    playerIds[shirtNum] = writtenId;
                }
            }
        }
    }
    
    function getCurrentTeamIdFromPlayerId(uint256 playerId) public view returns(uint256) {
        return getCurrentTeamIdFromPlayerState(getPlayerState(playerId));
    }

    function getFreeShirt(uint256 teamId) public view returns(uint8) {
        /// already assumes that there was a previous check that this team is not a bot
        for (uint8 shirtNum = PLAYERS_PER_TEAM_MAX-1; shirtNum > 0; shirtNum--) {
            if (isFreeShirt(_teamIdToPlayerIds[teamId][shirtNum], shirtNum)) { return shirtNum; }
        }
        return isFreeShirt(_teamIdToPlayerIds[teamId][0], 0) ? 0 : PLAYERS_PER_TEAM_MAX;
    }
    
    function isFreeShirt(uint256 playerId, uint8 shirtNum) public pure returns(bool) {
        if (shirtNum >= PLAYERS_PER_TEAM_INIT) {
            return (playerId == 0 || playerId == FREE_PLAYER_ID);
        } else {
            return (playerId == FREE_PLAYER_ID);
        }
    }

    function getDefaultPlayerIdForTeamInCountry(
        uint8 timeZone,
        uint256 countryIdxInTZ,
        uint256 teamIdxInCountry,
        uint8 shirtNum
    )
        public
        pure
        returns(uint256)
    {
        if (shirtNum >= PLAYERS_PER_TEAM_INIT) {
            return 0;
        } else {
            return encodeTZCountryAndVal(timeZone, countryIdxInTZ, teamIdxInCountry * PLAYERS_PER_TEAM_INIT + shirtNum);
        }
    }
       
    function getOwnerPlayer(uint256 playerId) public view returns(address) {
        return getOwnerTeam(getCurrentTeamIdFromPlayerId(playerId));
    }
    
    function getNPlayersInTransitInTeam(uint256 teamId) public view returns (uint8) { return _nPlayersInTransitInTeam[teamId]; }        

    function getNewMaxSumSkillsBuyNowPlayer() public view returns(uint256 sumSkills, uint256 minLapseTime, uint256 lastUpdate) {
        sumSkills = _maxSumSkillsBuyNowPlayer;
        minLapseTime = _maxSumSkillsBuyNowPlayerMinLapse;
        lastUpdate = _maxSumSkillsBuyNowPlayerLastUpdate;
    } 

    function isPlayerDismissed(uint256 playerId) public view returns(bool) {
        uint256 state = getPlayerState(playerId);
        return getCurrentShirtNum(state) == PLAYERS_PER_TEAM_MAX;
    }

}
