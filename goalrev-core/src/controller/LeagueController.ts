import { Post, JsonController, Body } from "routing-controllers";
import { CreateTeamInput, CreateTeamOutput, LeagueLeaderboardInput, LeagueLeaderboardOutput, RankingPointsInput, RankingPointsOutput } from "../types";
import { LeagueService } from "../services/LeagueService";

@JsonController("/league")
export class LeagueController {
  private leagueService: LeagueService;

  constructor() {
    this.leagueService = new LeagueService();
  }

  @Post("/computeLeagueLeaderboard")
  async computeLeagueLeaderboard(@Body() body: LeagueLeaderboardInput): Promise<LeagueLeaderboardOutput> {
    return await this.leagueService.computeLeagueLeaderboard(body);
  }

  @Post("/computeRankingPoints")
  async computeRankingPoints(@Body() body: RankingPointsInput): Promise<RankingPointsOutput> {
    return await this.leagueService.computeRankingPoints(body);
  }

 

}
