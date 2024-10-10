import { Post, JsonController, Body } from "routing-controllers";
import { LeagueLeaderboardInput, LeagueLeaderboardOutput } from "../types";
import { LeagueService } from "../services/LeagueService";

@JsonController("/league")
export class LeagueController {

  @Post("/computeLeagueLeaderboard")
  async computeLeagueLeaderboard(@Body() body: LeagueLeaderboardInput): Promise<LeagueLeaderboardOutput> {
    return await LeagueService.computeLeagueLeaderboard(body);
  }

}
