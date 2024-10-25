import { EntityManager } from "typeorm";
import { Team } from "../entity/Team";
import { Training } from "../entity/Training";

export class TrainingRepository {

  // Create a default training for each Team in a specific timezone
  async createDefaultTrainingByTimezone(timezoneIdx: number, entityManager: EntityManager): Promise<void> {
    // Get the team repository to find teams based on timezone
    const teamRepository = entityManager.getRepository(Team);
    const teams = await teamRepository.find({ where: { timezone_idx: timezoneIdx } });

    if (teams.length === 0) {
      throw new Error(`No teams found in timezone ${timezoneIdx}`);
    }

    // Create default training entries for each team
    const defaultTrainings: Training[] = teams.map(team => {
      const training = new Training();
      training.team_id = team.team_id;
      training.special_player_shirt = -1;
      training.goalkeepers_shoot = 0;
      training.goalkeepers_speed = 0;
      training.goalkeepers_pass = 0;
      training.goalkeepers_defence = 0;
      training.goalkeepers_endurance = 0;
      training.defenders_shoot = 0;
      training.defenders_speed = 0;
      training.defenders_pass = 0;
      training.defenders_defence = 0;
      training.defenders_endurance = 0;
      training.midfielders_shoot = 0;
      training.midfielders_speed = 0;
      training.midfielders_pass = 0;
      training.midfielders_defence = 0;
      training.midfielders_endurance = 0;
      training.attackers_shoot = 0;
      training.attackers_speed = 0;
      training.attackers_pass = 0;
      training.attackers_defence = 0;
      training.attackers_endurance = 0;
      training.special_player_shoot = 0;
      training.special_player_speed = 0;
      training.special_player_pass = 0;
      training.special_player_defence = 0;
      training.special_player_endurance = 0;
      training.team = team;
      return training;
    });

    await entityManager.save(defaultTrainings);
  }

  // Reset trainings for each Team in a specific timezone
  async resetTrainings(timezoneIdx: number, countryIdx: number, leagueIdx: number, entityManager: EntityManager): Promise<void> {
    // Use the EntityManager to execute a raw SQL update query
    await entityManager.query(`
      UPDATE trainings
      SET special_player_shirt = -1,
          goalkeepers_shoot = 0,
          goalkeepers_speed = 0,
          goalkeepers_pass = 0,
          goalkeepers_defence = 0,
          goalkeepers_endurance = 0,
          defenders_shoot = 0,
          defenders_speed = 0,
          defenders_pass = 0,
          defenders_defence = 0,
          defenders_endurance = 0,
          midfielders_shoot = 0,
          midfielders_speed = 0,
          midfielders_pass = 0,
          midfielders_defence = 0,
          midfielders_endurance = 0,
          attackers_shoot = 0,
          attackers_speed = 0,
          attackers_pass = 0,
          attackers_defence = 0,
          attackers_endurance = 0,
          special_player_shoot = 0,
          special_player_speed = 0,
          special_player_pass = 0,
          special_player_defence = 0,
          special_player_endurance = 0
      FROM teams
      WHERE teams.team_id = trainings.team_id
      AND teams.timezone_idx = $1
      AND teams.country_idx = $2
      AND teams.league_idx = $3
    `, [timezoneIdx, countryIdx, leagueIdx]);
  }
}
