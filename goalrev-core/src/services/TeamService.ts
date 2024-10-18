import { ethers } from "ethers";
import utilsAbi from "../contracts/abi/utils.json";
import { CreateTeamInput, Team } from "../types";
import { TeamMapper } from "./mapper/TeamMapper";

export class TeamService {

  private provider: ethers.JsonRpcProvider;
  private utilsContract: ethers.Contract;

  constructor() {
    // Initialize the provider with the RPC URL from environment variables
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL is not defined in the environment variables");
    }

    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.utilsContract = new ethers.Contract(process.env.UTILS_CONTRACT_ADDRESS!, utilsAbi.abi, this.provider);
  }

  async createTeam(body: CreateTeamInput): Promise<Team> {
    const response = await this.utilsContract.createTeam(
      body.timezoneIdx,
      body.countryIdx,
      body.teamIdxInTZ,
      body.deployTimeInUnixEpochSecs,
      body.divisionCreationRound
    );
    const team = TeamMapper.mapCreateTeamOutput(response);
    const skills = await this.utilsContract.fullDecodeSkillsForEntireTeam(team.playerSkillsAtBirth);
    const decodedTeam = TeamMapper.mapContractResponseToTeam(skills, team.teamId, team.playerSkillsAtBirth);
    return decodedTeam;
  }
}
