
import { MatchEvent, MatchEventType, MatchTeams, TeamType } from "../../types/";
import { PENALTY_CODE, ROUNDS_PER_MATCH } from "../../utils/constants";

export default class DecodeMatchEvents {
  private matchLogsAndEvents: string[];
  private matchEvents: [string, string, string, string, string][]; // Array of 5-string tuples
  private matchTeams: MatchTeams;

  constructor(matchLogsAndEvents: string[], matchTeams: MatchTeams) {
    this.matchLogsAndEvents = matchLogsAndEvents;
    this.matchEvents = [];
    this.matchTeams = matchTeams;
  }

  decode(): MatchEvent[] {
    this.matchEvents = [];
    const events = this.matchLogsAndEvents.slice(2);
    for (let i = 0; i < events.length; i += 5) {
      if (events.length - i >= 5) {
        // Create a tuple with exactly 5 elements
        this.matchEvents.push([events[i], events[i + 1], events[i + 2], events[i + 3], events[i + 4]]);
      }
    }
    return this.matchEvents.map((event, index) => this.decodeEvent(index, event));
  }

  private decodeEvent(numEvent: number, event: [string, string, string, string, string]): MatchEvent {
    const [teamThatAttacks, managesToShoot, shooterIdx, isGoal, assister] = event;
    const matchEvent = {} as MatchEvent;
    // set attacking team
    if (teamThatAttacks === TeamType.HOME) {
      matchEvent.team_id = this.matchTeams.homeTeamId;
    } else {
      matchEvent.team_id = this.matchTeams.awayTeamId;
    }
    // set event type
    matchEvent.type = MatchEventType.ATTACK;
    // set minute
    matchEvent.minute = Math.floor(numEvent * 45 / ROUNDS_PER_MATCH).toString();
    // set manage to shoot
    matchEvent.manage_to_shoot = managesToShoot === '1';
    // set is goal
    matchEvent.is_goal = isGoal === '1';
    // set shooter
    let shooterId = '';
    if (shooterIdx !== '0') {
      const shooterId = this.getShirtNumberFromIdx(shooterIdx, teamThatAttacks === TeamType.HOME);
      if (shooterId !== '') {
        matchEvent.primary_shirt_number = shooterId;
      }
    }
    // set assister
    if (assister === PENALTY_CODE) {
      matchEvent.secondary_shirt_number = PENALTY_CODE;
    } else {
      if (assister !== '0') {
        const assisterId = this.getShirtNumberFromIdx(assister, teamThatAttacks === TeamType.HOME);
        if (assisterId !== '' && assister !== shooterId) {
        matchEvent.secondary_shirt_number = assisterId;
        }
      }
    }
    return matchEvent
  }

  private getShirtNumberFromIdx(playerIdx: string, isHomeTeam: boolean): string {
    if (isHomeTeam) {
      const shirtNumber = this.matchTeams.tacticsHome.lineup[parseInt(playerIdx)];
      return shirtNumber?.toString();
    } else {
      const shirtNumber = this.matchTeams.tacticsAway.lineup[parseInt(playerIdx)];
      return shirtNumber?.toString();
    }
  }
}
