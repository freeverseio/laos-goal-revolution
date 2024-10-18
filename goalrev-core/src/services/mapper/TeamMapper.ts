import { CreateTeamOutput, Team, Player, PlayerSkill, BirthTraits } from "../../types";

export class TeamMapper {

  static mapCreateTeamOutput(response: any): CreateTeamOutput {
    return {
      teamId: response.teamId.toString(),
      playerIds: response.playerIds.map((id: bigint) => id.toString()),
      playerSkillsAtBirth: response.playerSkillsAtBirth.map((id: bigint) => id.toString()),
    };
  }

  static mapContractResponseToTeam(response: any, teamId: string, encodedSkills: string[]): Team {
    const players: Player[] = response[0].map((skills: any, index: number) => {
      const birthTraits = response[2][index];
      const playerId = response[3][index].toString();
      const dayOfBirth = Number(response[1][index]);

      const playerSkills: PlayerSkill = {
        defence: Number(skills[0]),
        speed: Number(skills[1]),
        pass: Number(skills[2]),
        shoot: Number(skills[3]),
        endurance: Number(skills[4]),
        encodedSkills: encodedSkills[index],
      };

      const birthTraitsObj: BirthTraits = {
        potential: Number(birthTraits[0]),
        forwardness: Number(birthTraits[1]),
        leftishness: Number(birthTraits[2]),
        aggressiveness: Number(birthTraits[3]),
      };

      return {
        id: playerId,
        skills: playerSkills,
        dayOfBirth,
        birthTraits: birthTraitsObj,
      };
    });

    return {
      id: teamId,
      players,
    };
  }
}
