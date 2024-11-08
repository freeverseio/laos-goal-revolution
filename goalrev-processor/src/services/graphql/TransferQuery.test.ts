import { TransferQuery } from './TransferQuery';
import { gqlClient } from "./GqlClient";
import { Transfer } from '../../types';

jest.mock('./GqlClient');



describe('TransferQuery', () => {
  let transferQuery: TransferQuery;

  beforeEach(() => {
    transferQuery = new TransferQuery();
    jest.clearAllMocks();
  });

  it('should fetch transfers until the target block number is found', async () => {
    // Mocking gqlClient response with block numbers greater than targetBlockNumber
    const transfers: Transfer[] = [
      {
        from: '0xabc',
        to: '0xdef',
        timestamp: '2024-11-06T10:00:00Z',
        tokenId: '1',
        blockNumber: 12345679,
        contractAddress: '0x123',
        txHash: '0xtxhash1',
      },
      {
        from: '0xghi',
        to: '0xjkl',
        timestamp: '2024-11-06T11:00:00Z',
        tokenId: '2',
        blockNumber: 12345678, // This is the target block number, should trigger stop
        contractAddress: '0x123',
        txHash: '0xtxhash2',
      },
    ];

    (gqlClient.query as jest.Mock).mockResolvedValue({
      data: {
        polygon: {
          transfers: transfers,
        },
      },
    });

    const targetBlockNumber = 12345678;
    const result = await transferQuery.fetchTransfers(targetBlockNumber, 0, 10);

    // Assertions
    expect(gqlClient.query).toHaveBeenCalledTimes(1);
    expect(result[0].txHash).toBe('0xtxhash1');
    expect(result.length).toBe(1);
  });

  it('should stop fetching when no more transfers are available', async () => {
    (gqlClient.query as jest.Mock).mockResolvedValue({
      data: {
        polygon: {
          transfers: [],
        },
      },
    });

    const targetBlockNumber = 12345678;
    const result = await transferQuery.fetchTransfers(targetBlockNumber);

    // Assertions
    expect(gqlClient.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('should handle multiple pages of results', async () => {
    // Mocking multiple pages of transfers
    const transfersPage1: Transfer[] = [
      {
        from: '0xabc',
        to: '0xdef',
        timestamp: '2024-11-06T10:00:00Z',
        tokenId: '1',
        blockNumber: 12345681,
        contractAddress: '0x123',
        txHash: '0xtxhash1',
      },
      {
        from: '0xabc',
        to: '0xdef',
        timestamp: '2024-11-06T10:00:00Z',
        tokenId: '2',
        blockNumber: 12345680,
        contractAddress: '0x123',
        txHash: '0xtxhash2',
      },
    ];
    const transfersPage2: Transfer[] = [
      {
        from: '0xghi',
        to: '0xjkl',
        timestamp: '2024-11-06T11:00:00Z',
        tokenId: '2',
        blockNumber: 12345679,
        contractAddress: '0x123',
        txHash: '0xtxhash3',
      },
    ];

    (gqlClient.query as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          polygon: {
            transfers: transfersPage1,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          polygon: {
            transfers: transfersPage2,
          },
        },
      });

    const targetBlockNumber = 12345679;
    const result = await transferQuery.fetchTransfers(targetBlockNumber, 0, 2);

    // Assertions
    expect(gqlClient.query).toHaveBeenCalledTimes(2);
    expect(result[0].txHash).toBe('0xtxhash2');
    expect(result[1].txHash).toBe('0xtxhash1');
    expect(result.length).toBe(2);
  });

  it('should handle multiple pages of results with 3 calls', async () => {
    // Mocking multiple pages of transfers
    const transfersPage1: Transfer[] = [
      {
        from: '0xabc',
        to: '0xdef',
        timestamp: '2024-11-06T10:00:00Z',
        tokenId: '1',
        blockNumber: 12345680,
        contractAddress: '0x123',
        txHash: '0xtxhash1',
      },
      {
        from: '0xabc',
        to: '0xdef',
        timestamp: '2024-11-06T10:00:00Z',
        tokenId: '2',
        blockNumber: 12345679,
        contractAddress: '0x123',
        txHash: '0xtxhash2',
      },
      {
        from: '0xabc',
        to: '0xdef',
        timestamp: '2024-11-06T10:00:00Z',
        tokenId: '3',
        blockNumber: 12345678,
        contractAddress: '0x123',
        txHash: '0xtxhash3',
      },
    ];
    const transfersPage2: Transfer[] = [
      {
        from: '0xghi',
        to: '0xjkl',
        timestamp: '2024-11-06T11:00:00Z',
        tokenId: '4',
        blockNumber: 12345677,
        contractAddress: '0x123',
        txHash: '0xtxhash4',
      },
      {
        from: '0xghi',
        to: '0xjkl',
        timestamp: '2024-11-06T11:00:00Z',
        tokenId: '5',
        blockNumber: 12345676,
        contractAddress: '0x123',
        txHash: '0xtxhash5',
      },  
      {
        from: '0xghi',
        to: '0xjkl',
        timestamp: '2024-11-06T11:00:00Z',
        tokenId: '6',
        blockNumber: 12345675,
        contractAddress: '0x123',
        txHash: '0xtxhash6',
      },
    ];

    const transfersPage3: Transfer[] = [
      {
        from: '0xghi',
        to: '0xjkl',
        timestamp: '2024-11-06T11:00:00Z',
        tokenId: '7',
        blockNumber: 12345674,
        contractAddress: '0x123',
        txHash: '0xtxhash7',
      },
      {
        from: '0xghi',
        to: '0xjkl',
        timestamp: '2024-11-06T11:00:00Z',
        tokenId: '8',
        blockNumber: 12345673,
        contractAddress: '0x123',
        txHash: '0xtxhash8',
      },
    ];

    (gqlClient.query as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          polygon: {
            transfers: transfersPage1,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          polygon: {
            transfers: transfersPage2,
          },
        },
      }).mockResolvedValueOnce({
        data: {
          polygon: {
            transfers: transfersPage3,
          },
        },
      });

    const targetBlockNumber = 12345673;
    const result = await transferQuery.fetchTransfers(targetBlockNumber, 0, 3);

    // Assertions
    expect(gqlClient.query).toHaveBeenCalledTimes(3);
    expect(result[0].txHash).toBe('0xtxhash7');
    expect(result[1].txHash).toBe('0xtxhash6');
    expect(result[2].txHash).toBe('0xtxhash5');
    expect(result.length).toBe(7);
  });

  it('should handle errors thrown by gqlClient', async () => {
    (gqlClient.query as jest.Mock).mockRejectedValue(new Error('Network error'));

    const targetBlockNumber = 12345678;

    await expect(transferQuery.fetchTransfers(targetBlockNumber)).rejects.toThrow('Could not fetch transfers.');
    expect(gqlClient.query).toHaveBeenCalledTimes(1);
  });
});

describe('inverseMapOrder', () => {
  let transferQuery: TransferQuery;

  beforeEach(() => {
    transferQuery = new TransferQuery();
    jest.clearAllMocks();
  });
  it('should inverse the order of the map by block number', () => {
    const map = { '0xtxhash1': { 
      from: '0xabc',
      to: '0xdef',
      timestamp: '2024-11-06T10:00:00Z',
      tokenId: '1',
      blockNumber: 12345679,
      contractAddress: '0x123',
      txHash: '0xtxhash1',
    }, '0xtxhash2': { 
      from: '0xghi',
      to: '0xjkl',
      timestamp: '2024-11-06T11:00:00Z',
      tokenId: '2',
      blockNumber: 12345678,
      contractAddress: '0x123',
      txHash: '0xtxhash2',
    } };
    const resultArray = transferQuery.sortTransfersByBlockNumber(Object.values(map));

    expect(resultArray[0]).toEqual({ 
      from: '0xghi',
      to: '0xjkl',
      timestamp: '2024-11-06T11:00:00Z',
      tokenId: '2',
      blockNumber: 12345678,
      contractAddress: '0x123',
      txHash: '0xtxhash2',
    });
    expect(resultArray[1]).toEqual({ 
      from: '0xabc',
      to: '0xdef',
      timestamp: '2024-11-06T10:00:00Z',
      tokenId: '1',
      blockNumber: 12345679,
      contractAddress: '0x123',
      txHash: '0xtxhash1',
    });
  });
});