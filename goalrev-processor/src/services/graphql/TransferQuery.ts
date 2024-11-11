import { gql } from "@apollo/client/core";
import { gqlClient } from "./GqlClient";
import { Transfer } from "../../types";

export class TransferQuery {
  // Method to construct the query with dynamic variables
  createQuery(limit: number, offset: number) {
    return gql`
      query MyQuery {
        polygon {
          transfers(
            pagination: { limit: ${limit}, offset: ${offset} }
            orderBy: BLOCKNUMBER_DESC
            where: { contractAddress: "${process.env.CONTRACT_ADDRESS}" }
          ) {
            from
            to
            timestamp
            tokenId
            blockNumber
            contractAddress
            txHash
          }
        }
      }
    `;
  }


  // Method to fetch transfers until a certain block number is found or no more results
  async fetchTransfers(targetBlockNumber: number, initialOffset = 0, limit = 30): Promise<Transfer[]> {
    let offset = initialOffset;
    let transferMap: { [key: string]: Transfer } = {};
    let stopLoop = false;

    try {
      while (!stopLoop) {
        const query = this.createQuery(limit, offset); // Create a query with the current offset
        console.log('query', query.loc?.source.body);
        const response = await gqlClient.query({
          query,
        });

        // Accessing the data
        let transfers: Transfer[] = response.data.polygon.transfers;

        // If no more transfers, break the loop
        if (transfers.length === 0 || transfers.length < limit) {
          console.log('No more transfers available.');
          stopLoop = true;
        }

        // Filter out transfers where `from` and `to` are equal and `from` is not the zero address
        transfers = transfers.filter(transfer => transfer.from !== transfer.to && transfer.from !== "0x0000000000000000000000000000000000000000");

        // Iterate over the filtered transfers
        for (const transfer of transfers) {
          // If the current block number is equal to the targetBlockNumber, stop querying but do not add it
          if (transfer.blockNumber === targetBlockNumber) {
            stopLoop = true;
            break;
          }

          // Add the transfer to the map if the block number is greater than the targetBlockNumber
          if (transfer.blockNumber > targetBlockNumber) {
            transferMap[transfer.txHash] = {
              from: transfer.from,
              to: transfer.to,
              timestamp: transfer.timestamp,
              tokenId: transfer.tokenId,
              blockNumber: transfer.blockNumber,
              txHash: transfer.txHash,
              contractAddress: transfer.contractAddress,
            } as Transfer;
          }
        }

        // Increment the offset to fetch the next batch of transfers
        if (!stopLoop) {
          offset += 30;
        }
      }
      // inverse order of the map
      return this.sortTransfersByBlockNumber(Object.values(transferMap));
    } catch (error) {
      console.error('Error fetching transfers:', error);
      throw new Error('Could not fetch transfers.');
    }
  }

  sortTransfersByBlockNumber(transfers: Transfer[]): Transfer[] {
    return transfers.sort((a, b) => a.blockNumber - b.blockNumber);
  }
}
