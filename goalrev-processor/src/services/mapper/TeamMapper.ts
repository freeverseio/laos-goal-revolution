import { Team } from "../../db/entity";
import { MintTeamMutation } from "../../types/rest/input/team";
import { MintedPlayer } from "../../types";
import SkillsUtils from "../../utils/SkillsUtils";

export class TeamMapper {

  static mapTeamPlayersToMintMutation(team: Team, address: string): MintTeamMutation {
    return {
      input: {
        chainId: process.env.CHAIN_ID!,
        contractAddress: process.env.CONTRACT_ADDRESS!,
        tokens: team.players.map(player => ({
          mintTo: [address],
          name: player.name,
          description: `Player of Goal Revolution`,
          attributes: [
            {
              trait_type: "ID",
              value: player.player_id
            },
            {
              trait_type: "Defence",
              value: player.defence.toString()
            },
            {
              trait_type: "Speed",
              value: player.speed.toString()
            },
            {
              trait_type: "Pass",
              value: player.pass.toString()
            },
            {
              trait_type: "Shoot",
              value: player.shoot.toString()
            },
            {
              trait_type: "Endurance",
              value: player.endurance.toString()
            },
            {
              trait_type: "Preferred Position",
              value: player.preferred_position
            },
            {
              trait_type: "Potential",
              value: player.potential.toString()
            },
            {
              trait_type: "Country of Birth",
              value: player.country_of_birth
            },
           
            {
              trait_type: "Tiredness",
              value: player.tiredness.toString()
            },
            {
              trait_type: "Age",
              value: SkillsUtils.getAge(player.encoded_skills).toString()
            }
          ],
          image: "ipfs://QmThWWVj3DxyT5FFSFaVDnDAooCFRP1qR4mYGPpexBKxKG"
        }))
      }
    };
  }

  static mapMintedPlayersToResponse(team: Team, tokenIds: string[]): MintedPlayer[] {
    return team.players.map((player, index) => ({
      id: player.player_id,
      tokenId: tokenIds[index],
      teamId: team.team_id
    }));
  }

  static mapMintedPlayersToTeamPlayers(team: Team, tokenIds: string[]): Team {
    team.players.forEach((player, index) => {
      player.token_id = tokenIds[index];
    });
    return team;
  }

}