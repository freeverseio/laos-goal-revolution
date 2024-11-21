import { EntityManager } from 'typeorm';
import { Team } from '../db/entity/Team';
import { TeamRepository } from '../db/repository/TeamRepository';
import { MatchEventOutput, MatchEventType, MatchLog } from '../types';
import { gqlClient } from './graphql/GqlClient';
import { TokenQuery } from './graphql/TokenQuery';
import { TeamService } from './TeamService';
import { PlayerService } from './PlayerService';
import { PlayerRepository } from '../db/repository/PlayerRepository';

jest.mock('./graphql/GqlClient'); // Mock the gqlClient

const mockEntityManager = {
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<EntityManager>;

  const mockPlayerRepository = {
    save: jest.fn(),
    findPlayersPending: jest.fn(),
    updateBroadcastStatus: jest.fn(),
  } as unknown as jest.Mocked<PlayerRepository>;


describe('broadcastPlayersMinted', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });
    playerService = new PlayerService(mockPlayerRepository);
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should successfully broadcast players minted', async () => {
    (gqlClient.mutate as jest.Mock).mockResolvedValue({
      data: {
        broadcast: {
          success: true,
          tokenId: "10524557615468411906022060882295722425347575855803285350732116992720137948447",
        },
      },
    });

    const tokenIds = [{
      token_id: "10524557615468411906022060882295722425347575855803285350732116992720137948447",
    }];
    (mockPlayerRepository.findPlayersPending as jest.Mock).mockResolvedValue(tokenIds);
    const result = await playerService.broadcastPlayersPending();

    expect(result).toBe(1); // One player should be broadcasted
    expect(gqlClient.mutate).toHaveBeenCalledTimes(1);
  });
});