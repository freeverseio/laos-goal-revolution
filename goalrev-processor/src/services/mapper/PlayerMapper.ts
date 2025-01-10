import { MintStatus, Team, Player as PlayerEntity, TeamPartialUpdateMint, BroadcastStatus, Player } from "../../db/entity";
import { MintedPlayer, PlayerDto, TokenIndexer, TokenIndexerWithPlayerId } from "../../types";
import SkillsUtils from "../../utils/SkillsUtils";
import { EvolvePlayerMutation } from "../../types/rest/input/player";

export class PlayerMapper {

  static mapPlayersToEvolveMutation(players: Player[]): EvolvePlayerMutation {
    return {
      input: {
        chainId: process.env.CHAIN_ID!,
        contractAddress: process.env.CONTRACT_ADDRESS!,
        tokens: players.map(player => ({
          tokenId: player.token_id!,
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
              trait_type: "Level",
              value: PlayerMapper.calculateLevel(player).toString()
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
              trait_type: "Age",
              value: SkillsUtils.getAge(player.encoded_skills).toString()
            }
          ],
          image: "ipfs://QmXEx4oVwoHSeSSLFW5HN6vjgKCh7mCve5Z7VUnb7ha3pj"
        }))
      }
    };
  }

  static calculateLevel(player: Player): number {
    if(!player) {
      return 0;
    }
    const level = Math.ceil(player.defence /1000) + Math.ceil(player.speed /1000) + Math.ceil(player.pass /1000) + Math.ceil(player.shoot /1000) + Math.ceil(player.endurance /1000);
    return level;
  }

}
