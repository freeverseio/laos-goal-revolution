import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { MatchService } from "../services/MatchService"; // Import MatchService
import { PlayMatchesInput } from "../types";
import { PlayerService } from "../services/PlayerService";
import { TeamService } from "../services/TeamService";
import { MatchEventService } from "../services/MatchEventService";
import { VerseService } from "../services/VerseService";

@JsonController("/match")
export class MatchController {
    private matchService: MatchService; // Declare MatchService
    private playerService: PlayerService;
    private teamService: TeamService;
    private matchEventService: MatchEventService;
    private verseService: VerseService;

    constructor() {
        this.playerService = new PlayerService();
        this.teamService = new TeamService();
        this.matchEventService = new MatchEventService(); 
        this.verseService = new VerseService(); 
        this.matchService = new MatchService(this.playerService, this.teamService, this.matchEventService, this.verseService); // Initialize MatchService
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