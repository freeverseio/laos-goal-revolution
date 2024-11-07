import { MintStatus, Team, Player as PlayerEntity } from "../../db/entity";
import { MintTeamMutation } from "../../types/rest/input/team";
import { MintedPlayer, Player, PlayerDto } from "../../types";
import SkillsUtils from "../../utils/SkillsUtils";

export class TeamMapper {

  static mapTeamPlayersToMintMutation(teams: Team[]): MintTeamMutation {
    const allPlayers = teams.flatMap(team => TeamMapper.mapTeamPlayersToDto(team.players, team.owner));
    return {
      input: {
        chainId: process.env.CHAIN_ID!,
        contractAddress: process.env.CONTRACT_ADDRESS!,
        tokens: allPlayers.map(player => ({
          mintTo: [player.owner],
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
          image: "ipfs://QmXEx4oVwoHSeSSLFW5HN6vjgKCh7mCve5Z7VUnb7ha3pj"
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

  static mapMintedPlayersToTeamPlayers(teams: Team[], tokenIds: string[]): Team[] {
    teams.forEach((team, index) => {
      team.mint_status = MintStatus.SUCCESS;
      team.mint_updated_at = new Date();
      team.players.forEach((player, index) => {
        player.token_id = tokenIds[index];
      });
    });
    return teams;
  } 

  static mapTeamPlayersToDto(players: PlayerEntity[], owner: string): PlayerDto[] {
    return players.map(player => ({
      ...player,
      owner
    }));
  }
}
