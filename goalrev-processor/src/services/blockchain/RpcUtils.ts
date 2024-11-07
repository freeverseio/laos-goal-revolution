import { JsonRpcProvider } from "ethers";

export class RpcUtils {
  
  static async getLatestBlockNumber(): Promise<number> {
    try {
      const client = new JsonRpcProvider(process.env.RPC_URL);
      const block = await client.getBlockNumber();
      return block;
    } catch (error) {
      console.error('Error getting latest block number', error);
      return 0;
    }
  }
}