import { EntityManager } from "typeorm";
import { MatchEvent } from "../db/entity/MatchEvent";
import { Match } from "../db/entity/Match";
import { Team } from "../db/entity/Team";
import { Player } from "../db/entity/Player";
import { MatchEventOutput } from "../types"; 

export class MatchEventService {
  /**
   * Saves an array of match events as MatchEvent entities in the database.
   * 
   * @param matchEvents - Array of match event inputs.
   * @param matchDetails - Composite match key for the events.
   * @param entityManager - The transaction-scoped EntityManager instance.
   */
  async saveMatchEvents(matchEvents: MatchEventOutput[], matchDetails: Match, entityManager: EntityManager): Promise<void> {
    const matchEventEntities: MatchEvent[] = [];

    for (const event of matchEvents) {
      const team = await entityManager.findOne(Team, { where: { team_id: event.team_id.toString() } });
      if (!team) {
        throw new Error(`Team not found for team ID: ${event.team_id}`);
      }

      const matchEvent = new MatchEvent();
      matchEvent.timezone_idx = matchDetails.timezone_idx;
      matchEvent.country_idx = matchDetails.country_idx;
      matchEvent.league_idx = matchDetails.league_idx;
      matchEvent.match_day_idx = matchDetails.match_day_idx;
      matchEvent.match_idx = matchDetails.match_idx;
      matchEvent.minute = event.minute;
      matchEvent.team_id = event.team_id.toString();
      matchEvent.type = event.type as any;
      matchEvent.manage_to_shoot = event.manage_to_shoot;
      matchEvent.is_goal = event.is_goal;
      matchEvent.primary_player_id = event.primary_player_id;
      matchEvent.secondary_player_id = event.secondary_player_id;
      matchEvent.match_idx = matchDetails.match_idx;
      matchEvent.team_id = event.team_id.toString();
      matchEventEntities.push(matchEvent);
    }
    await entityManager.save(matchEventEntities);
  }

  getGoals(matchEvents: MatchEventOutput[], match: Match): [number, number] {
    let homeGoals = 0;
    let visitorGoals = 0;

    // Iterate over match events and update goals
    matchEvents.forEach((event) => {
      if (event.is_goal) {
        if (event.team_id === Number(match.homeTeam!.team_id)) {
          homeGoals += 1;
        } else {
          visitorGoals += 1;
        }
      }
    });

    return [homeGoals, visitorGoals];
  }
}