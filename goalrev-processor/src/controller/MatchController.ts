import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { MatchService } from "../services/MatchService"; // Import MatchService
import { PlayMatchesInput } from "../types";
import { PlayerService } from "../services/PlayerService";

@JsonController("/match")
export class MatchController {
    private matchService: MatchService; // Declare MatchService
    private playerService: PlayerService;

    constructor() {
        this.playerService = new PlayerService();
        this.matchService = new MatchService(this.playerService); // Initialize MatchService
    }

    @Post("/play") // Define a new POST endpoint
    async playMatches(@Body() data: PlayMatchesInput) { // Accept request body
        return await this.matchService.playMatches(data.timeZone, data.league, data.matchDay); // Call playMatches method
    }
}