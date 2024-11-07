import { Body, JsonController, Post, Put } from "routing-controllers";
import { TeamService } from "../services/TeamService";
import { TeamFactory } from "../factories/TeamFactory";
import { MintTeamInput } from "../types/";
import { MintTeamResponse } from "../types/rest/output/team";
import { TransferService } from "../services/TransferService";
import { TransferFactory } from "../factories/TransferFactory";

@JsonController("/team")
export class TeamController {
    private teamService: TeamService;
    private transferService: TransferService;

    constructor() {
        this.teamService = TeamFactory.createTeamService();
        this.transferService = TransferFactory.create();
    }

    // @Put("/mint")
    // async mintTeam(@Body() mintTeamInput: MintTeamInput): Promise<MintTeamResponse> {
    //     const mintedPlayers = await this.teamService.mintTeam(mintTeamInput);
    //     return {
    //         players: mintedPlayers
    //     };
    // }

    @Post("/sync-transfers")
    async syncTransfers(): Promise<boolean> {
        return await this.transferService.syncTransfers();
    }


}

