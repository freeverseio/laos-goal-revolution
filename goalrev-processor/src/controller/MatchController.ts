import { Get, Param, Post, JsonController, Body } from "routing-controllers";
import { MatchService } from "../services/MatchService"; // Import MatchService
import { PlayMatchesInput } from "../types";
import { MatchFactory } from "../factories/MatchFactory";
@JsonController("/match")
export class MatchController {
    private matchService: MatchService; // Declare MatchService

    constructor() {
        this.matchService = MatchFactory.createMatchService();
    }


    @Post("/play")
    async playAllMatches() {
        return await this.matchService.playMatches();
    }


}