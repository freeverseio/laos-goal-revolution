export interface MintTeamInput {
    address: string,
    teamId: string,
}

export type MintTeamMutation = {
  input: {
    chainId: string;
    contractAddress: string;
    tokens: Token[];
  };
};

export type Token = {
  mintTo: string[];
  name: string;
  description: string;
  attributes: Attribute[];
  image: string;
};

export type Attribute = {
  trait_type: string;
  value: string;
};
