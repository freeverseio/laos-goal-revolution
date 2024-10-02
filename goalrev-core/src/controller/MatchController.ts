import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { PlayInput, PlayOutput } from "../types";
import { MatchService } from "../services/MatchService";

@JsonController("/match")
export class MatchController {
  @Get("/:id")
  getMatch(@Param("id") id: number) {
    return { id, name: `Match ${id}` };
  }

  @Post("/play1stHalf")
  async play1stHalf(@Body() body: PlayInput): Promise<PlayOutput> {
    return await MatchService.play1stHalf(body);
  }

  @Post("/play2ndHalf")
  async play2ndHalf(@Body() body: PlayInput): Promise<PlayOutput> {
    return await MatchService.play2ndHalf(body);
  }

}
