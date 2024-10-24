import { EntityManager } from "typeorm";
import { Match } from "../db/entity/Match";
import { MatchEvent } from "../db/entity/MatchEvent";
import { Team } from "../db/entity/Team";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchEventOutput } from "../types";
import { Player } from "../db/entity";

export class MatchEventService {

  private matchEventRepository: MatchEventRepository;

  constructor(matchEventRepository: MatchEventRepository) {
    this.matchEventRepository = matchEventRepository;
  }


  async saveMatchEvents(matchEvents: MatchEventOutput[], matchDetails: Match, entityManager: EntityManager): Promise<void> {
    const matchEventEntities: MatchEvent[] = [];

    // Combine home and visitor players into the allPlayers object
    const allPlayers: { [key: string]: Player[] } = {};
    const teams = [matchDetails.homeTeam, matchDetails.visitorTeam];
    
    teams.forEach(team => {
      if (team) {
        const teamId = team.team_id.toString();
        allPlayers[teamId] = team.players || [];
      }
    });

    // Create match event entities
    for (const event of matchEvents) {
        const teamId = event.team_id.toString();
        const players = allPlayers[teamId];

        if (!players) {
            console.warn(`No players found for team_id: ${teamId}`);
            continue;
        }

        const matchEvent = new MatchEvent();
        matchEvent.timezone_idx = matchDetails.timezone_idx;
        matchEvent.country_idx = matchDetails.country_idx;
        matchEvent.league_idx = matchDetails.league_idx;
        matchEvent.match_day_idx = matchDetails.match_day_idx;
        matchEvent.match_idx = matchDetails.match_idx;
        matchEvent.minute = event.minute;
        matchEvent.team_id = teamId; // Use the previously stored string
        matchEvent.type = event.type as any;
        matchEvent.manage_to_shoot = event.manage_to_shoot;
        matchEvent.is_goal = event.is_goal;

        // Set primary player ID if available
        const primaryPlayerId = this.getPlayerIdFromShirtNumber(event.primary_shirt_number, players);
        if (primaryPlayerId !== '') {
            matchEvent.primary_player_id = primaryPlayerId;
        }

        // Set secondary player ID if available
        const secondaryPlayerId = this.getPlayerIdFromShirtNumber(event.secondary_shirt_number, players);
        if (secondaryPlayerId !== '') {
            matchEvent.secondary_player_id = secondaryPlayerId;
        }

        matchEventEntities.push(matchEvent);
    }

    // Persist the match events using the repository
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

  private getPlayerIdFromShirtNumber(shirtNumber: string | undefined, players: Player[]): string {
    if (!shirtNumber || players.length === 0) {
        return '';
    }

    const player = players.find(player => player.shirt_number?.toString() === shirtNumber);
    return player?.player_id?.toString() || '';
}
}