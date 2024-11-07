


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
}
