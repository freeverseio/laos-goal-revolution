import { Body, JsonController, Put } from "routing-controllers";
import { TeamService } from "../services/TeamService";
import { TeamFactory } from "../factories/TeamFactory";
import { MintTeamInput } from "../types/";

@JsonController("/team")
export class TeamController {
    private teamService: TeamService;

    constructor() {
        this.teamService = TeamFactory.createTeamService();
    }

    @Put("/mint")
    async mintTeam(@Body() mintTeamInput: MintTeamInput) {
        return await this.teamService.mintTeam(mintTeamInput);
    }
}

