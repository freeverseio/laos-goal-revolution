import { Post, JsonController, Body } from "routing-controllers";
import { LeagueService } from "../services/LeagueService";
import { UpdateLeagueLeaderboardInput, UpdateLeagueLeaderboardsInput } from "../types";
import { LeagueFactory } from "../factories/LeagueFactory";

@JsonController("/league")
export class LeagueController {    

    private leagueService: LeagueService;

    constructor() {
        this.leagueService = LeagueFactory.createLeagueService();
    }

    @Post("/updateLeaderboards")
    async updateLeaderboards(@Body() data: UpdateLeagueLeaderboardsInput) {
        console.log("updateLeaderboards.data:", data);
        return true;
        //return await this.leagueService.updateLeaderboards();
    }

    @Post("/updateLeaderboard")
    async updateLeaderboard(@Body() data: UpdateLeagueLeaderboardInput) {
        console.log("updateLeaderboard.data:", data);
        return await this.leagueService.updateLeaderboard(data.timezoneIdx, data.countryIdx, data.leagueIdx);
    }


}