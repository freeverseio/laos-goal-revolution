import { Team } from "../../db/entity";
import { MintTeamMutation } from "../../types/rest/input/team";

export class TeamMapper {

  static mapTeamPlayersToMintMutation(team: Team, address: string): MintTeamMutation {
    return {
      input: {
        chainId: process.env.CHAIN_ID!,
        contractAddress: process.env.CONTRACT_ADDRESS!,
        tokens: team.players.map(player => ({
          mintTo: [address],
          name: player.name,
          description: `GoalRev: A player of the team: ${team.name}`,
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
              trait_type: "Shirt Number",
              value: player.shirt_number.toString()
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
              trait_type: "Race",
              value: player.race
            },
            {
              trait_type: "Tiredness",
              value: player.tiredness.toString()
            },
            {
              trait_type: "Skills",
              value: player.encoded_skills
            }
          ],
          image: "ipfs://QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi"
        }))
      }
    };
  }

}