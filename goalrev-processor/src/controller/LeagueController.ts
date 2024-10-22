import { Post, JsonController, Body } from "routing-controllers";
import { LeagueService } from "../services/LeagueService";
import { UpdateLeagueLeaderboardInput, AddDivisionInput } from "../types";
import { LeagueFactory } from "../factories/LeagueFactory";

@JsonController("/league")
export class LeagueController {    

    private leagueService: LeagueService;

    constructor() {
        this.leagueService = LeagueFactory.createLeagueService();
    }

    @Post("/updateLeaderboard")
    async updateLeaderboard(@Body() data: UpdateLeagueLeaderboardInput) {
        return await this.leagueService.updateLeaderboard(data.timezoneIdx, data.countryIdx, data.leagueIdx, data.matchDayIdx);
    }

    @Post("/addDivision")
    async addDivision(@Body() data: AddDivisionInput) {        
        return await this.leagueService.addDivision(data.timezoneIdx, data.countryIdx, data.divisionCreationRound);        
    }

}