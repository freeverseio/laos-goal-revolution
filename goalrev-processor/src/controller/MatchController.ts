import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { MatchService } from "../services/MatchService"; // Import MatchService
import { PlayMatchesInput } from "../types";

@JsonController("/match")
export class MatchController {
    private matchService: MatchService; // Declare MatchService

    constructor() {
        this.matchService = new MatchService(); // Initialize MatchService
    }

    @Post("/play") // Define a new POST endpoint
    async playMatches(@Body() data: PlayMatchesInput) { // Accept request body
        return await this.matchService.playMatches(data.timeZone, data.league, data.matchDay); // Call playMatches method
    }
}