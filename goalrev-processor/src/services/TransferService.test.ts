import { TransferService } from "./TransferService";
import { TransferQuery } from "./graphql/TransferQuery";
import { TransferRepository } from "../db/repository/TransferRepository";
import { PlayerRepository } from "../db/repository/PlayerRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { Transfer } from "../types/graphql/transfer";
import { RpcUtils } from "./blockchain/RpcUtils";
import { AppDataSource } from "../db/AppDataSource";
import { Team } from "../db/entity";
import { EntityManager } from "typeorm";
import { IN_TRANSIT_SHIRTNUM, PLAYERS_PER_TEAM_MAX } from "../utils/constants/constants";

jest.mock("../db/repository/TransferRepository");
jest.mock("../db/repository/PlayerRepository");
jest.mock("../db/repository/TeamRepository");
jest.mock("./blockchain/RpcUtils");
jest.mock('../db/AppDataSource');

const mockEntityManager = {
  transaction: jest.fn(),
} as unknown as EntityManager;



const mockTeamRepository = {
  findByOwners: jest.fn(),
  getShirtNumbers: jest.fn(),
  findById: jest.fn(),
} as unknown as jest.Mocked<TeamRepository>;

const transferQueryMock = new TransferQuery();
const transferRepositoryMock = new TransferRepository();
const playerRepositoryMock = new PlayerRepository();

const transferService = new TransferService(transferQueryMock, transferRepositoryMock, playerRepositoryMock, mockTeamRepository);

describe('TransferService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('processTransfers', () => {
    xit('should throw an error if a player is not found', async () => {
      RpcUtils.getLatestBlockNumber = jest.fn().mockResolvedValue(200);
      transferRepositoryMock.getLatestBlockNumber = jest.fn().mockResolvedValue(100);
      playerRepositoryMock.findPlayersByTokenIds = jest.fn().mockResolvedValue([]);

      const transfers: Transfer[] = [{ tokenId: '1', to: 'address', from: 'address', blockNumber: 50 } as Transfer];

      await expect(transferService.processTransfers(transfers)).rejects.toThrow('Player 1 not found');
    });

    it('should assign a player to the correct team if the team is found', async () => {
      RpcUtils.getLatestBlockNumber = jest.fn().mockResolvedValue(200);
      playerRepositoryMock.findPlayersByTokenIds = jest.fn().mockResolvedValue([{ token_id: '1' }]);
      mockTeamRepository.findByOwners = jest.fn().mockResolvedValue([{ owner: 'address'.toLowerCase(), team_id: '123' }]);
      mockTeamRepository.getShirtNumbers = jest.fn().mockResolvedValue([]);

      const transfers: Transfer[] = [{ tokenId: '1', to: 'address1', from: 'address2', blockNumber: 50 } as Transfer];
      await transferService.processTransfers(transfers);

      expect(mockTeamRepository.findByOwners).toHaveBeenCalledWith(['address1', 'address2']);
    });
  });

  describe('getTeamsByOwners', () => {
    it('should return teams when owners are provided', async () => {
      const owners = ['owner1', 'owner2'];
      mockTeamRepository.findByOwners = jest.fn().mockResolvedValue([{ owner: 'owner1' }, { owner: 'owner2' }] as Team[]);

      const result = await transferService['getTeamsByOwners'](owners);

      expect(mockTeamRepository.findByOwners).toHaveBeenCalledWith(owners);
      expect(result).toEqual([{ owner: 'owner1' }, { owner: 'owner2' }]);
    });
  });

  describe('getFreeShirtNumber', () => {
    it('should return a free shirt number if available', async () => {
      mockTeamRepository.getShirtNumbers = jest.fn().mockResolvedValue([1, 2, 3, 4, 5]);
      const teamId = 'team123';

      const result = await transferService['getFreeShirtNumber'](teamId);
      expect(result).toBe(25);
    });

    it('should return a free shirt number if available', async () => {
      mockTeamRepository.getShirtNumbers = jest.fn().mockResolvedValue([1, 2, 3, 4, 5, 21, 22, 23, 24, 25]);
      const teamId = 'team123';
      const result = await transferService['getFreeShirtNumber'](teamId);
      expect(result).toBe(20);
    });

    it('should return IN_TRANSIT_SHIRTNUM if no free shirt number is available', async () => {
      let shirtNumbers = [];
      for (let i = 1; i <= PLAYERS_PER_TEAM_MAX; i++) {
        shirtNumbers.push(i);
      }
      mockTeamRepository.getShirtNumbers = jest.fn().mockResolvedValue(shirtNumbers);
      const teamId = 'team123';
      const result = await transferService['getFreeShirtNumber'](teamId);
      expect(result).toBe(IN_TRANSIT_SHIRTNUM);
    });
  });
});
