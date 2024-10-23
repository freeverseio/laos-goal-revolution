// Import necessary modules and the class to be tested
import DecodeMatchEvents from './DecodeMatchEvents';
import { MatchEventType, TacticRequest, TeamType } from '../../types';
import { PENALTY_CODE, ROUNDS_PER_MATCH } from '../../utils/constants';

// Mock data for testing
const matchTeams = {
  homeTeamId: 'home123',
  awayTeamId: 'away456',
  tacticsHome: { tacticsId: 1, lineup: [1, 2, 3, 4, 5], substitutions: [], extraAttack: [] } as unknown as TacticRequest,
  tacticsAway: { tacticsId: 2, lineup: [6, 7, 8, 9, 10], substitutions: [], extraAttack: [] } as unknown as TacticRequest,
};


describe('DecodeMatchEvents', () => {
  let matchLogsAndEvents: string[];
  let decodeMatchEvents: DecodeMatchEvents;

  beforeEach(() => {
    // Sample match logs with valid event data
    matchLogsAndEvents = [
      'MatchLog1',
      'MatchLog2',
      TeamType.HOME, '1', '1', '1', PENALTY_CODE, // Event 1
      TeamType.AWAY, '0', '2', '0', '3',          // Event 2
    ];
    decodeMatchEvents = new DecodeMatchEvents(matchLogsAndEvents, matchTeams);
  });

  test('should decode match events correctly', () => {
    const matchEvents = decodeMatchEvents.decode();
    
    expect(matchEvents.length).toBe(2);

    // Test first event
    expect(matchEvents[0]).toEqual({
      team_id: matchTeams.homeTeamId,
      type: MatchEventType.ATTACK,
      minute: Math.floor(0 * 45 / ROUNDS_PER_MATCH),
      manage_to_shoot: true,
      is_goal: true,
      primary_shirt_number: '2',
      secondary_shirt_number: PENALTY_CODE,
    });

    // Test second event
    expect(matchEvents[1]).toEqual({
      team_id: matchTeams.awayTeamId,
      type: MatchEventType.ATTACK,
      minute: Math.floor(1 * 45 / ROUNDS_PER_MATCH),
      manage_to_shoot: false,
      is_goal: false,
      primary_shirt_number: '8',
      secondary_shirt_number: '9',
    });
  });

  test('should return an empty array if there are no events', () => {
    const emptyLogs = ['Header1', 'Header2'];
    decodeMatchEvents = new DecodeMatchEvents(emptyLogs, matchTeams);

    const matchEvents = decodeMatchEvents.decode();
    expect(matchEvents).toEqual([]);
  });

  test('should handle missing shooter gracefully', () => {
    matchLogsAndEvents = [
      'Header1',
      'Header2',
      TeamType.HOME, '1', '', '1', PENALTY_CODE, // Event with missing shooter index
    ];
    decodeMatchEvents = new DecodeMatchEvents(matchLogsAndEvents, matchTeams);

    const matchEvents = decodeMatchEvents.decode();
    expect(matchEvents[0].primary_shirt_number).toBeUndefined();
    expect(matchEvents[0].secondary_shirt_number).toBe(PENALTY_CODE);
  });

  test('should handle invalid assister index gracefully', () => {
    matchLogsAndEvents = [
      'Header1',
      'Header2',
      TeamType.HOME, '1', '0', '1', 'invalidIndex', // Event with invalid assister index
    ];
    decodeMatchEvents = new DecodeMatchEvents(matchLogsAndEvents, matchTeams);

    const matchEvents = decodeMatchEvents.decode();
    expect(matchEvents[0].secondary_shirt_number).toBeUndefined();
  });
});
