import { Body, JsonController, Post } from "routing-controllers";
import { TeamService } from "../services/TeamService";
import { CreateTeamInput, Team } from "../types";

@JsonController("/team")
export class TeamController {

  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  @Post("/createTeam")
  async createTeam(@Body() body: CreateTeamInput): Promise<Team> {
    return await this.teamService.createTeam(body);
  }
}
