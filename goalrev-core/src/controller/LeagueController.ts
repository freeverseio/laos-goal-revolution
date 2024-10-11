import { Post, JsonController, Body } from "routing-controllers";
import { LeagueLeaderboardInput, LeagueLeaderboardOutput, RankingPointsInput, RankingPointsOutput } from "../types";
import { LeagueService } from "../services/LeagueService";

@JsonController("/league")
export class LeagueController {

  @Post("/computeLeagueLeaderboard")
  async computeLeagueLeaderboard(@Body() body: LeagueLeaderboardInput): Promise<LeagueLeaderboardOutput> {
    return await LeagueService.computeLeagueLeaderboard(body);
  }

  @Post("/computeRankingPoints")
  async computeRankingPoints(@Body() body: RankingPointsInput): Promise<RankingPointsOutput> {
    return await LeagueService.computeRankingPoints(body);
  }

}
