import { PlayerRepository } from "../db/repository/PlayerRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { TransferRepository } from "../db/repository/TransferRepository";
import { TransferQuery } from "../services/graphql/TransferQuery";
import { TransferService } from "../services/TransferService";


export class TransferFactory {

  static create(): TransferService {
    const transferQuery = new TransferQuery();
    const transferRepository = new TransferRepository();
    const playerRepository = new PlayerRepository();
    const teamRepository = new TeamRepository();
    return new TransferService(transferQuery, transferRepository, playerRepository, teamRepository);
  }
}
