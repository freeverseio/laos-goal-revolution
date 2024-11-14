// Import dependencies
import { TokenQuery } from './TokenQuery';
import { gqlClient } from './GqlClient';
import { ApolloQueryResult } from '@apollo/client';

jest.mock('./GqlClient', () => ({
  gqlClient: {
    query: jest.fn() as jest.MockedFunction<(<T = any>(options: any) => Promise<ApolloQueryResult<T>>)>,
  },
}));

describe('TokenQuery - fetchTokensByOwner', () => {
  const mockData = {
    data: {
      polygon: {
        tokens: {
          totalCount: 18,
          edges: [
            {
              node: {
                attributes: [
                  {
                    "value": "2748779069630",
                    "traitType": "ID"
                  },
                  {
                    "value": "881",
                    "traitType": "Defence"
                  },
                  {
                    "value": "1036",
                    "traitType": "Speed"
                  },
                  {
                    "value": "1359",
                    "traitType": "Pass"
                  },
                  {
                    "value": "885",
                    "traitType": "Shoot"
                  },
                  {
                    "value": "839",
                    "traitType": "Endurance"
                  },
                  {
                    "value": "10",
                    "traitType": "Shirt Number"
                  },
                  {
                    "value": "MD C",
                    "traitType": "Preferred Position"
                  },
                  {
                    "value": "6",
                    "traitType": "Potential"
                  },
                  {
                    "value": "ES",
                    "traitType": "Country of Birth"
                  },
                  {
                    "value": "Spanish",
                    "traitType": "Race"
                  },
                  {
                    "value": "0",
                    "traitType": "Tiredness"
                  },
                  {
                    "value": "26328088242270179065952717366766006629855130129897153013571650417",
                    "traitType": "Skills"
                  }
                ],
                block_number: 241353,
                description: null,
                image: null,
                name: null,
                tokenId: '5859940151081954314402908485620542763290938128937918929447',
              },
            },
            {
              node: {
                attributes: null,
                block_number: 241353,
                description: null,
                image: null,
                name: null,
                tokenId: '1596981792969232974370101329926450223133977488622968117799',
              },
            },
            {
              node: {
                attributes: null,
                block_number: 241353,
                description: null,
                image: null,
                name: null,
                tokenId: '2235577223979834083966307893144337510179708528232167119399',
              },
            },
            {
              node: {
                attributes: null,
                block_number: 241353,
                description: null,
                image: null,
                name: null,
                tokenId: '2753159977428053296503966492551065707587701753794738264615',
              },
            },
          ],
        },
      },
    },
  };

  beforeEach(() => {
    (gqlClient.query as jest.Mock).mockResolvedValue(mockData);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should fetch tokens by owner', async () => {
    const tokenQuery = new TokenQuery();
    const contractAddress = '0x123456789abcdef';
    const owner = '0xowneraddress';

    const tokens = await tokenQuery.fetchTokensByOwner(contractAddress, owner);

    expect(gqlClient.query).toHaveBeenCalled();
    expect(tokens).toHaveLength(4);
    expect(tokens![0].tokenId).toBe('5859940151081954314402908485620542763290938128937918929447');
    const attributes = tokens![0].attributes;
    const idAttribute = attributes.find((attribute) => attribute.traitType === 'ID');
    
    expect(idAttribute?.value).toBe('2748779069630');
    expect(tokens![1].tokenId).toBe('1596981792969232974370101329926450223133977488622968117799');
    expect(tokens![2].tokenId).toBe('2235577223979834083966307893144337510179708528232167119399');
    expect(tokens![3].tokenId).toBe('2753159977428053296503966492551065707587701753794738264615');
  });

  it('should throw an error when gqlClient query fails', async () => {
    (gqlClient.query as jest.Mock).mockRejectedValue(new Error('GraphQL query failed'));
    const tokenQuery = new TokenQuery();
    const contractAddress = '0x123456789abcdef';
    const owner = '0xowneraddress';

    await expect(tokenQuery.fetchTokensByOwner(contractAddress, owner)).rejects.toThrow('Could not fetch token by owner.');
  });
});
