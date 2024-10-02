import { AppDataSource } from "../AppDataSource";
import { Param } from "../entity/Param";

export class ParamRepository {


  async getParamByName(name: string): Promise<Param | null> {
    const repository = AppDataSource.getRepository(Param);
    try {
      const param = await repository.findOneBy({ name });
      return param || null;
    } catch (error) {
      console.error(`Error fetching param with name: ${name}`, error);
      throw new Error(`Failed to fetch param with name: ${name}`);
    }
  }


  // Get block number (similar to GetBlockNumber in Go)
  async getBlockNumber(): Promise<number> {
    const param = await this.getParamByName("block_number");
    if (!param) {
      return 0;
    }
    const blockNumber = parseInt(param.value, 10);
    if (isNaN(blockNumber)) {
      throw new Error("Invalid block number format");
    }
    return blockNumber;
  }

  // Set block number (similar to SetBlockNumber in Go)
  async setBlockNumber(value: number): Promise<void> {
    const param = new Param();
    param.name = "block_number";
    param.value = value.toString();
    const repository = AppDataSource.getRepository(Param);
    await repository.save(param)

  }
}
