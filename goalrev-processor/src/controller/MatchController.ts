import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { MatchService } from "../services/MatchService"; // Import MatchService
import { PlayMatchesInput } from "../types";
import { PlayerService } from "../services/PlayerService";
import { TeamService } from "../services/TeamService";

@JsonController("/match")
export class MatchController {
    private matchService: MatchService; // Declare MatchService
    private playerService: PlayerService;
    private teamService: TeamService;

    constructor() {
        this.playerService = new PlayerService();
        this.teamService = new TeamService();
        this.matchService = new MatchService(this.playerService, this.teamService); // Initialize MatchService
    }

    @Post("/play") // Define a new POST endpoint
    async playMatches(@Body() data: PlayMatchesInput) { // Accept request body
        return await this.matchService.playMatches(data.timeZone, data.league, data.matchDay); // Call playMatches method
    }
}