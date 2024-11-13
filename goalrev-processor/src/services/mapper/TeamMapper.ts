import { MintStatus, Team, Player as PlayerEntity, TeamPartialUpdateMint } from "../../db/entity";
import { MintTeamMutation } from "../../types/rest/input/team";
import { MintedPlayer, PlayerDto, TokenIndexer, TokenIndexerWithPlayerId } from "../../types";
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
  static mapTokenIndexerToTeamPlayers(team: Team, tokenFromIndexer: TokenIndexer[]): Team {
    const tokensWithPlayerId = tokenFromIndexer.map(token => new TokenIndexerWithPlayerId(token));
    team.players.forEach((player, index) => {
      // find the token with the same playerId
      const token = tokensWithPlayerId.find(token => token.playerId === player.player_id);
      player.token_id = token?.tokenId!;
    });
    return team;
  }

  static mapMintedPlayersToTeamPlayers(teams: Team[], tokenIds: string[]): TeamPartialUpdateMint[] {
    return teams.map((team) => {
      const teamUpdate: TeamPartialUpdateMint = {
        team_id: team.team_id,
        mint_status: MintStatus.SUCCESS,
        mint_updated_at: new Date(),
        players: team.players.map((player, index) => ({
          player_id: player.player_id,
          token_id: tokenIds[index] 
        }))
      };
      return teamUpdate;
    });
  }
  

  static mapTeamPlayersToDto(players: PlayerEntity[], owner: string): PlayerDto[] {
    return players.map(player => ({
      ...player,
      owner
    }));
  }
}
