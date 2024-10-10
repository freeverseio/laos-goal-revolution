import { Post, JsonController, Body } from "routing-controllers";
import { LeagueService } from "../services/LeagueService";
import { UpdateLeagueLeaderboardInput, UpdateLeagueLeaderboardsInput } from "../types";
import { VerseService } from "../services/VerseService";
import { MatchService } from "../services/MatchService";
import { TeamService } from "../services/TeamService";
import { PlayerService } from "../services/PlayerService";
import { MatchEventService } from "../services/MatchEventService";

@JsonController("/league")
export class LeagueController {
    private leagueService: LeagueService;
    private matchService: MatchService;
    private verseService: VerseService;
    private teamService: TeamService;
    private playerService: PlayerService;
    private matchEventService: MatchEventService;

    constructor() {
        this.playerService = new PlayerService();
        this.teamService = new TeamService();
        this.matchEventService = new MatchEventService(); 
        this.verseService = new VerseService(); 
        this.matchService = new MatchService(this.playerService, this.teamService, this.matchEventService, this.verseService); 
        this.leagueService = new LeagueService(this.matchService, this.verseService);
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