import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { MatchService } from "../services/MatchService"; // Import MatchService
import { PlayMatchesInput } from "../types";
import { PlayerService } from "../services/PlayerService";
import { TeamService } from "../services/TeamService";
import { MatchEventService } from "../services/MatchEventService";
import { VerseService } from "../services/VerseService";
import { CalendarService } from "../services/CalendarService";
import { MatchFactory } from "../factories/MatchFactory";
@JsonController("/match")
export class MatchController {
    private matchService: MatchService; // Declare MatchService

    constructor() {
        this.matchService = MatchFactory.createMatchService();
    }

    @Post("/playDay") // Define a new POST endpoint
    async playMatches(@Body() data: PlayMatchesInput) { // Accept request body
        return await this.matchService.playMatches(data.timeZone,  data.matchDay); // Call playMatches method
    }

    @Post("/play")
    async playAllMatches() {
        return await this.matchService.playMatches(null, null);
    }


}