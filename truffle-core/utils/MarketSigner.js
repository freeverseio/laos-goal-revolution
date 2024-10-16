class Signer {
    
  constructor(web3) {    
      this.web3 = web3;
  }


  // Signing  functions

  signPutAssetForSale(currencyId, price, rnd, validUntil, assetId, sellerAccount) {
    const offerValidUntil = 0;
    const sigSeller = sellerAccount.sign(
        this.computePutAssetForSaleDigestNoPrefix(currencyId, price, rnd, validUntil, offerValidUntil, assetId)
    );
    return sigSeller;
  }

  signPlayerBid(currencyId, price, extraPrice, sellerRnd, buyerRnd, validUntil, offerValidUntil, playerId, buyerTeamId, buyerAccount) {
    const buyerHiddenPrice = this.hideBuyerPrice(extraPrice, buyerRnd);
    const auctionId = this.computeAuctionId(currencyId, price, sellerRnd, playerId, validUntil, offerValidUntil);
    const buyerTxMsg = this.concatHash(
        ['bytes32', 'bytes32', 'uint256'],
        [auctionId, buyerHiddenPrice, buyerTeamId.toString()]
    );
    const sigBuyer = buyerAccount.sign(buyerTxMsg);
    return [sigBuyer, auctionId, buyerHiddenPrice];
  }

  signPlayerOffer(currencyId, price, offererRnd, playerId, offerValidUntil, buyerTeamId, offererAccount) {
    const extraPrice = 0;
    const buyerRnd = 0;
    const validUntil = 0;
    return this.signPlayerBid(currencyId, price, extraPrice, offererRnd, buyerRnd, validUntil, offerValidUntil, playerId, buyerTeamId, offererAccount);
  }

  signAcceptPlayerOffer(currencyId, price, rnd, validUntil, offerValidUntil, playerId, sellerAccount) {
    const sigSeller = sellerAccount.sign(
        this.computePutAssetForSaleDigestNoPrefix(currencyId, price, rnd, validUntil, offerValidUntil, playerId)
    );
    return sigSeller;
  }

  concatHash(types, vals) {
    return this.web3.utils.keccak256(
        this.web3.eth.abi.encodeParameters(types, vals)
    )
  }

  signDismissPlayer(validUntil, asssetId, sellerAccount) {
    const sellerTxMsg = this.concatHash(
        ['uint256', 'uint256'],
        [validUntil, asssetId.toString()]
    )
    const sigSeller = sellerAccount.sign(sellerTxMsg);
    return sigSeller;
  }

  computePutAssetForSaleDigestNoPrefixFromHiddenPrice(sellerHiddenPrice, assetId, validUntil, offerValidUntil) {
    return this.concatHash(
      ['bytes32', 'uint256', 'uint32', 'uint32'],
      [sellerHiddenPrice, assetId.toString(), validUntil, offerValidUntil]
    );
  }

  computePutAssetForSaleDigestNoPrefix(currencyId, price, sellerRnd, validUntil, offerValidUntil, assetId) {
    return this.computePutAssetForSaleDigestNoPrefixFromHiddenPrice(this.hideSellerPrice(currencyId, price, sellerRnd), assetId, validUntil, offerValidUntil);
  }

  computeAuctionId(currencyId, price, sellerRnd, assetId, validUntil, offerValidUntil) {
    const sellerHiddenPrice = this.hideSellerPrice(currencyId, price, sellerRnd);

    return (offerValidUntil == 0) ?
      this.concatHash(['bytes32', 'uint256', 'uint32'], [sellerHiddenPrice, assetId.toString(), validUntil]) :
      this.concatHash(['bytes32', 'uint256', 'uint32'], [sellerHiddenPrice, assetId.toString(), offerValidUntil]);
  }


  hideSellerPrice(currencyId, price, rnd) {
    return this.concatHash(['uint8', 'uint256', 'uint256'], [currencyId, price, rnd]);
  }

  hideBuyerPrice(extraPrice, rnd) {
    return this.concatHash(['uint256', 'uint256'], [extraPrice, rnd]);
  }
}


module.exports = {
  Signer
}