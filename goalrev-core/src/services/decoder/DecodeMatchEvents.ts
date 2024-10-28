
import { MatchEvent, MatchEventType, MatchLog, MatchTeams, TeamType } from "../../types/";
import { PENALTY_CODE, ROUNDS_PER_MATCH } from "../../utils/constants";

export default class DecodeMatchEvents {
  private matchLogsAndEvents: string[];
  private matchEvents: [string, string, string, string, string][]; // Array of 5-string tuples
  private matchTeams: MatchTeams;
  private matchLogs: MatchLog[];

  constructor(matchLogsAndEvents: string[], matchTeams: MatchTeams, matchLogs: MatchLog[]) {
    this.matchLogsAndEvents = matchLogsAndEvents;
    this.matchEvents = [];
    this.matchTeams = matchTeams;
    this.matchLogs = matchLogs;
  }

  decode(is2ndHalf: boolean): MatchEvent[] {
    this.matchEvents = [];
    const events = this.matchLogsAndEvents.slice(2);
    for (let i = 0; i < events.length; i += 5) {
      if (events.length - i >= 5) {
        // Create a tuple with exactly 5 elements
        this.matchEvents.push([events[i], events[i + 1], events[i + 2], events[i + 3], events[i + 4]]);
      }
    }
    let matchEvents = this.matchEvents.map((event, index) => this.decodeEvent(index, event, is2ndHalf));
    matchEvents = matchEvents.concat(this.addCardsAndInjuries(is2ndHalf));
    return matchEvents;
  }

  private decodeEvent(numEvent: number, event: [string, string, string, string, string], is2ndHalf: boolean): MatchEvent {
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
    const minute = (Math.floor(numEvent * 45 / ROUNDS_PER_MATCH) > 0 ? Math.floor(numEvent * 45 / ROUNDS_PER_MATCH) : 1) + (is2ndHalf ? 45 : 0);
    matchEvent.minute = minute.toString();
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
    if (!matchEvent.manage_to_shoot) {
      matchEvent.primary_shirt_number = this.getDefenderShirtNumber(teamThatAttacks !== TeamType.HOME);
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

  private getDefenderShirtNumber(isHomeTeam: boolean): string {
    //  1, 2, 3 are defenders
    const randomIdx = Math.floor(Math.random() * 3) + 1;
    if (isHomeTeam) {
      const defender = this.matchTeams.tacticsHome.lineup[randomIdx];
      return defender?.toString();
    } else {
      const defender = this.matchTeams.tacticsAway.lineup[randomIdx];
      return defender?.toString();
    }
  }

  private addCardsAndInjuries(is2ndHalf: boolean): MatchEvent[] {
    const injuryAndCardsEvents: MatchEvent[] = [];
    const MAX_MINUTES = 45;

    for (let teamIdx = 0; teamIdx < this.matchLogs.length; teamIdx++) {
      const matchLog = this.matchLogs[teamIdx];
      const teamType = teamIdx === 0 ? TeamType.HOME : TeamType.AWAY;

      // Process out-of-game players for red cards and injuries
      for (let i = 0; i < matchLog.outOfGamePlayers.length; i++) {
        const outOfGamePlayer = matchLog.outOfGamePlayers[i];
        const outOfGameType = matchLog.outOfGameTypes[i];
        const outOfGameRound = matchLog.outOfGameRounds[i];

        if (outOfGamePlayer !== '14' && outOfGameType !== '0') { // '14' means no player affected
          const primaryPlayer = this.getShirtNumberFromIdx(outOfGamePlayer, teamType === TeamType.HOME);
          const outOfGameMinute = Math.floor(parseInt(outOfGameRound) * (45 / ROUNDS_PER_MATCH)) + (is2ndHalf ? 45 : 0);

          let typeOfEvent: MatchEventType;
          switch (outOfGameType) {
            case '1':
              typeOfEvent = MatchEventType.INJURY_SOFT;
              break;
            case '2':
              typeOfEvent = MatchEventType.INJURY_HARD;
              break;
            case '3':
              typeOfEvent = MatchEventType.RED_CARD;
              break;
            default:
              throw new Error(`Invalid outOfGameType ${outOfGameType}`);
          }

          injuryAndCardsEvents.push({
            minute: outOfGameMinute.toString(),
            type: typeOfEvent,
            team_id: teamType === TeamType.HOME ? this.matchTeams.homeTeamId : this.matchTeams.awayTeamId,
            primary_shirt_number: primaryPlayer,
            is_goal: false,
            manage_to_shoot: false,
            assister: '',
          } as MatchEvent);
        }
      }

      // Process yellow cards with randomness
      for (let i = 0; i < matchLog.yellowCards.length; i++) {
        const yellowCardPlayer = matchLog.yellowCards[i];
        if (yellowCardPlayer !== '14') { // '14' means no yellow card given
          const primaryPlayer = this.getShirtNumberFromIdx(yellowCardPlayer, teamType === TeamType.HOME);

          let maxMinute = MAX_MINUTES;
          let yellowMinute: number;
          const outOfGamePlayerIdx = matchLog.outOfGamePlayers.indexOf(yellowCardPlayer);

          if (outOfGamePlayerIdx !== -1) {
            const outOfGameRound = matchLog.outOfGameRounds[outOfGamePlayerIdx];
            const outOfGameMinute = Math.floor(parseInt(outOfGameRound) * (45 / ROUNDS_PER_MATCH));
            maxMinute = outOfGameMinute > 1 ? outOfGameMinute - 1 : maxMinute;
          }

          // Generate a pseudo-random minute for the yellow card, ensuring it doesn't exceed `maxMinute`
          yellowMinute = this.generateRandomMinute(i, yellowCardPlayer, maxMinute);

          injuryAndCardsEvents.push({
            minute: yellowMinute.toString(),
            type: MatchEventType.YELLOW_CARD,
            team_id: teamType === TeamType.HOME ? this.matchTeams.homeTeamId : this.matchTeams.awayTeamId,
            primary_shirt_number: primaryPlayer,
            is_goal: false,
            manage_to_shoot: false,
            assister: '',
          } as MatchEvent);
        }
      }
    }

    return injuryAndCardsEvents;
  }


  private generateRandomMinute(seed: number, player: string, maxMinute: number): number {
    const salt = `c${player}`;
    const pseudoRandomValue = parseInt(salt.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed.toString()), 36);
    return Math.floor((pseudoRandomValue % maxMinute) + 1);
  }

}
