// Import necessary modules and the class to be tested
import DecodeMatchEvents from './DecodeMatchEvents';
import { MatchEventType, MatchLog, TacticRequest, TeamType } from '../../types';
import { PENALTY_CODE, ROUNDS_PER_MATCH } from '../../utils/constants';

// Mock data for testing
const matchTeams = {
  homeTeamId: 'home123',
  awayTeamId: 'away456',
  tacticsHome: { tacticsId: 1, lineup: [1, 2, 3, 4, 5, 6,7], substitutions: [], extraAttack: [] } as unknown as TacticRequest,
  tacticsAway: { tacticsId: 2, lineup: [6, 7, 8, 9, 10,11,12], substitutions: [], extraAttack: [] } as unknown as TacticRequest,
};

const matchLogs: MatchLog[] = [
  {
    numberOfGoals: '15',
    outOfGamePlayers: ['14', '13', '1'],
    outOfGameTypes: ['2', '3', '2'],
    outOfGameRounds: ['14', '3', '1'],
    yellowCards: ['14', '2', '2', '14'],
    // Other properties can remain the same as in your original mock data
  } as unknown as MatchLog,
  {
    numberOfGoals: '15',
    outOfGamePlayers: ['14', '13'],
    outOfGameTypes: ['2', '3'],
    outOfGameRounds: ['14', '15'],
    yellowCards: ['14', '3', '4', '14'],
    // Other properties can remain the same as in your original mock data
  } as unknown as MatchLog
];

describe('DecodeMatchEvents', () => {
  let matchLogsAndEvents: string[];
  let decodeMatchEvents: DecodeMatchEvents;

  beforeEach(() => {
    matchLogsAndEvents = [
      'MatchLog1',
      'MatchLog2',
      TeamType.HOME, '1', '1', '1', PENALTY_CODE, // Event 1
      TeamType.AWAY, '0', '2', '0', '3',          // Event 2
    ];
    decodeMatchEvents = new DecodeMatchEvents(matchLogsAndEvents, matchTeams, matchLogs);
  });

  test('should decode match events correctly', () => {
    const matchEvents = decodeMatchEvents.decode(false);

    expect(matchEvents[0]).toEqual({
      team_id: matchTeams.homeTeamId,
      type: MatchEventType.ATTACK,
      minute: '1',
      manage_to_shoot: true,
      is_goal: true,
      primary_shirt_number: '2',
      secondary_shirt_number: PENALTY_CODE,
    });

    expect(matchEvents[1].minute).toBe('3');
    expect(matchEvents[1].is_goal).toBe(false);
    expect(matchEvents[1].primary_shirt_number).not.toBe('8');
    expect(matchEvents[1].secondary_shirt_number).toBe('9');
  });

  test('should return an empty array if there are no events', () => {
    const emptyLogs = ['Header1', 'Header2'];
    decodeMatchEvents = new DecodeMatchEvents(emptyLogs, matchTeams, []);

    const matchEvents = decodeMatchEvents.decode(false);
    expect(matchEvents).toEqual([]);
  });

  test('should handle missing shooter gracefully', () => {
    matchLogsAndEvents = [
      'Header1',
      'Header2',
      TeamType.HOME, '1', '', '1', PENALTY_CODE, // Event with missing shooter index
    ];
    decodeMatchEvents = new DecodeMatchEvents(matchLogsAndEvents, matchTeams, matchLogs);

    const matchEvents = decodeMatchEvents.decode(false);
    expect(matchEvents[0].primary_shirt_number).toBeUndefined();
    expect(matchEvents[0].secondary_shirt_number).toBe(PENALTY_CODE);
  });

  test('should handle invalid assister index gracefully', () => {
    matchLogsAndEvents = [
      'Header1',
      'Header2',
      TeamType.HOME, '1', '0', '1', 'invalidIndex', // Event with invalid assister index
    ];
    decodeMatchEvents = new DecodeMatchEvents(matchLogsAndEvents, matchTeams, matchLogs);

    const matchEvents = decodeMatchEvents.decode(false);
    expect(matchEvents[0].secondary_shirt_number).toBeUndefined();
  });

  // New tests to handle addCardsAndInjuries cases
  it('should handle yellow cards correctly', () => {
    const matchEvents = decodeMatchEvents.decode(false);
    console.log("Generated Events:", matchEvents); // Add this to inspect generated events

    const yellowCardEvents = matchEvents.filter(event => event.type === MatchEventType.YELLOW_CARD);
    expect(yellowCardEvents.length).toBeGreaterThan(0); // Check if yellow cards are generated
    yellowCardEvents.forEach(event => {
      expect(event.minute).toBeDefined();
      expect(parseInt(event.minute)).toBeGreaterThan(0);
      expect(event.primary_shirt_number).toBeDefined();
      expect(event.type).toBe(MatchEventType.YELLOW_CARD);
    });
  });

  it('should handle injuries correctly', () => {
    const matchEvents = decodeMatchEvents.decode(false);

    const injuryEvents = matchEvents.filter(event =>
      event.type === MatchEventType.INJURY_SOFT || event.type === MatchEventType.INJURY_HARD
    );
    expect(injuryEvents.length).toBeGreaterThan(0);
    injuryEvents.forEach(event => {
      expect(event.minute).toBeDefined();
      expect(parseInt(event.minute)).toBeGreaterThan(0);
      expect(event.type === MatchEventType.INJURY_SOFT || event.type === MatchEventType.INJURY_HARD).toBe(true);
    });
  });

  test('should handle red cards correctly', () => {
    const matchEvents = decodeMatchEvents.decode(false);

    const redCardEvents = matchEvents.filter(event => event.type === MatchEventType.RED_CARD);
    expect(redCardEvents.length).toBeGreaterThan(0);
    redCardEvents.forEach(event => {
      expect(event.minute).toBeDefined();
      expect(parseInt(event.minute)).toBeGreaterThan(0);
      expect(event.type).toBe(MatchEventType.RED_CARD);
    });
  });
});
