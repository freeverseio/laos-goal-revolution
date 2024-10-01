import { ParamRepository } from "../repository/ParamRepository";
import { AppDataSource } from "../db/AppDataSource";
import { Param } from "../entity/Param";

export class ParamController {

  // Get all params
  async getAllParams(): Promise<Param[]> {
    return await AppDataSource.getRepository(Param).find();
  }

  // Get a param by name
  async getParamByName(name: string): Promise<Param | null> {
    return await AppDataSource.getRepository(Param).findOneBy({ name });
  }

  // Insert or update a param
  async insertOrUpdateParam(name: string, value: string): Promise<void> {
    const paramRepository = AppDataSource.getRepository(Param);
    await paramRepository.upsert({ name, value }, { conflictPaths: ["name"] });
  }

  // Get block number
  async getBlockNumber(): Promise<number> {
    const paramRepository = new ParamRepository();
    return await paramRepository.getBlockNumber();
  }

  // Set block number
  async setBlockNumber(value: number): Promise<void> {
    const paramRepository = new ParamRepository();
    await paramRepository.setBlockNumber(value);
  }
}
