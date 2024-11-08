


export type AttributeIndexer = {
  traitType: string;
  value: string;
}

export type TokenIndexer = {
  attributes: AttributeIndexer[];
  tokenId: string;
  image: string;
  name: string;
  owner: string;
  playerId?: string;
}

export class TokenIndexerWithPlayerId implements TokenIndexer {
  constructor(token: TokenIndexer) {
    this.attributes = token.attributes;
    this.tokenId = token.tokenId;
    this.image = token.image;
    this.name = token.name;
    this.owner = token.owner;
    this.mapAttributesToPlayerId();
  }
  attributes: AttributeIndexer[];
  tokenId: string;
  image: string;
  name: string;
  owner: string;
  playerId?: string;

  mapAttributesToPlayerId(): void {
    this.playerId = this.attributes.find(attribute => attribute.traitType === 'playerId')?.value;
  }
}