export interface EvolvePlayerInput {
  chainId: string;
  contractAddress: string;
  tokens: Token[];  
}

export type Token = {
  attributes: Attribute[];
  description: string;
  image: string;
  name: string;
  tokenId: string;
};

export type EvolvePlayerMutation = {
  input: EvolvePlayerInput;
};

export type Attribute = {
  trait_type: string;
  value: string;
};
