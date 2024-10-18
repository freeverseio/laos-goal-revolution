import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { PlayInput, PlayOutput } from "../types";
import { MatchService } from "../services/MatchService";

@JsonController("/match")
export class MatchController {
  private matchService: MatchService;

  constructor() {
    this.matchService = new MatchService();
  }


  @Get("/playersPerTeamMax")
  async getPlayersPerTeamMax(): Promise<string> {
    return await this.matchService.getPlayersPerTeamMax();
  }

  @Post("/play1stHalf")
  async play1stHalf(@Body() body: PlayInput): Promise<PlayOutput> {
    return await this.matchService.play1stHalf(body);
  }

  @Post("/play2ndHalf")
  async play2ndHalf(@Body() body: PlayInput): Promise<PlayOutput> {
    return await this.matchService.play2ndHalf(body);
  }

}
