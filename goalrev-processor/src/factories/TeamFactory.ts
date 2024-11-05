import { TeamRepository } from "../db/repository/TeamRepository";
import { TeamService } from "../services/TeamService";

export class TeamFactory {
    static createTeamService(): TeamService {
      const teamRepository = new TeamRepository();
        return new TeamService(teamRepository);
    }
}