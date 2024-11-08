import { TeamRepository } from "../db/repository/TeamRepository";
import { TokenQuery } from "../services/graphql/TokenQuery";
import { TeamService } from "../services/TeamService";

export class TeamFactory {
  static createTeamService(): TeamService {
    const teamRepository = new TeamRepository();
    const tokenQuery = new TokenQuery();
    return new TeamService(teamRepository, tokenQuery);
  }
}