import { EntityManager } from "typeorm";
import { Match } from "../db/entity/Match";
import { MatchEvent } from "../db/entity/MatchEvent";
import { Team } from "../db/entity/Team";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchEventOutput } from "../types";

export class MatchEventService {

  private matchEventRepository: MatchEventRepository;

  constructor(matchEventRepository: MatchEventRepository) {
    this.matchEventRepository = matchEventRepository;
  }

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
      const team = await entityManager.findOne(
        Team,
        { where: { team_id: event.team_id.toString() },
          relations: ["players"]
        }
      );
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
      const primaryPlayerId = this.getPlayerIdFromShirtNumber(event.primary_shirt_number, team);
      if (primaryPlayerId !== '') {
        matchEvent.primary_player_id = primaryPlayerId;
      }
      const secondaryPlayerId = this.getPlayerIdFromShirtNumber(event.secondary_shirt_number, team);
      if (secondaryPlayerId !== '') {
        matchEvent.secondary_player_id = secondaryPlayerId;
      }
      matchEvent.match_idx = matchDetails.match_idx;
      matchEvent.team_id = event.team_id.toString();
      matchEventEntities.push(matchEvent);
    }
    await this.matchEventRepository.saveMatchEvents(matchEventEntities, entityManager);
  }

  getGoals(matchEvents: MatchEventOutput[], match: Match): [number, number] {
    let homeGoals = 0;
    let visitorGoals = 0;

    // Iterate over match events and update goals
    matchEvents.forEach((event) => {
      if (event.is_goal) {
        if (event.team_id === match.homeTeam!.team_id) {
          homeGoals += 1;
        } else {
          visitorGoals += 1;
        }
      }
    });

    return [homeGoals, visitorGoals];
  }

  private getPlayerIdFromShirtNumber(shirtNumber: string | undefined, team: Team): string {
    if (!shirtNumber) {
      return '';
    }
    const player = team.players.find((player) => player.shirt_number.toString() === shirtNumber);
    return player ? player.player_id.toString() : '';
  }

}