import { gql } from "@apollo/client/core";
import { gqlClient } from "./GqlClient";
import { TokenIndexer } from "../../types";

export class TokenQuery {
  // Method to construct the query with dynamic variables
  createQuery(contractAddress: string, tokenId: string) {
    return gql`
      query MyQuery {
        polygon {
          token(
            contractAddress: "${contractAddress}"
            tokenId: "${tokenId}"
          ) {
            attributes
            image
            name
            initialOwner
            owner
            tokenId
            description
          }
        }
      }
    `;
  }

  createQueryByOwner(contractAddress: string, owner: string) {
    return gql`
      query MyQuery {
        polygon {
          tokens(
            orderBy: CREATED_AT_DESC
            pagination: {first: 25}
            where: {contractAddress: "${contractAddress}", owner: "${owner}"}
          ) {
            totalCount
            edges {
              node {
                attributes
                block_number
                description
                image
                name
                tokenId
              }
            }
          }
        }
      }
    `;
  }

  // Method to fetch the token data
  async fetchToken(contractAddress: string, tokenId: string): Promise<TokenIndexer | null> {
    try {
      const query = this.createQuery(contractAddress, tokenId); // Create a query with the current variables
      const response = await gqlClient.query({
        query,
        fetchPolicy: 'no-cache',
      });

      // Accessing the data
      const token: TokenIndexer = response.data.polygon.token;

      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
      throw new Error('Could not fetch token.');
    }
  }

  async fetchTokensByOwner(contractAddress: string, owner: string): Promise<TokenIndexer[] | null> {
    try {
      const query = this.createQueryByOwner(contractAddress, owner);
      const response = await gqlClient.query({
        query,
        fetchPolicy: 'no-cache',
      });
      const tokens: TokenIndexer[] = response.data.polygon.tokens.edges.map((edge: any) => edge.node);
      return tokens;
    } catch (error) {
      console.error('Error fetching token by owner:', error);
      throw new Error('Could not fetch token by owner.');
    }
  }
}
