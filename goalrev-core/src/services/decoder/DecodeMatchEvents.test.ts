// Import necessary modules and the class to be tested
import DecodeMatchEvents from './DecodeMatchEvents';
import { MatchEventType, MatchLog, TacticRequest, TeamType } from '../../types';
import { PENALTY_CODE, ROUNDS_PER_MATCH } from '../../utils/constants';

// Mock data for testing
const matchTeams = {
  homeTeamId: 'home123',
  awayTeamId: 'away456',
  tacticsHome: { tacticsId: 1, lineup: [1, 2, 3, 4, 5], substitutions: [], extraAttack: [] } as unknown as TacticRequest,
  tacticsAway: { tacticsId: 2, lineup: [6, 7, 8, 9, 10], substitutions: [], extraAttack: [] } as unknown as TacticRequest,
};

const matchLogs = [
  {
    numberOfGoals: '15',
    assisters: [
      '15', '14', '13',
      '12', '15', '14',
      '13', '12', '15',
      '14', '13', '12'
    ],
    shooters: [
      '15', '14', '13',
      '12', '15', '14',
      '13', '12', '15',
      '14', '13', '12'
    ],
    forwardPositions: [
      '0', '1', '2', '3',
      '0', '1', '2', '3',
      '0', '1', '2', '3'
    ],
    penalties: [
      true, false,
      true, false,
      true, false,
      true
    ],
    outOfGamePlayers: [ '14', '13' ],
    outOfGameTypes: [ '2', '3' ],
    outOfGameRounds: [ '14', '15' ],
    yellowCards: [ '14', '15', '15', '14' ],
    inGameSubsHappened: [ '3', '2', '3', '2', '3', '2' ],
    halfTimeSubstitutions: [ '31', '30', '31' ],
    nDefs: [ '14', '15' ],
    nTotHalf: [ '15', '14' ],
    winner: '3',
    gamePoints: '3',
    teamSumSkills: '16777215',
    trainingPoints: '4095',
    isHomeStadium: true,
    changesAtHalftime: '0',
    isCancelled: false,
    encodedMatchLog: '904625697166429907578684580254429362549174092576235409827636622758600564479'
  } as unknown as MatchLog,
  {
    numberOfGoals: '15',
    assisters: [
      '15', '14', '13',
      '12', '15', '14',
      '13', '12', '15',
      '14', '13', '12'
    ],
    shooters: [
      '15', '14', '13',
      '12', '15', '14',
      '13', '12', '15',
      '14', '13', '12'
    ],
    forwardPositions: [
      '0', '1', '2', '3',
      '0', '1', '2', '3',
      '0', '1', '2', '3'
    ],
    penalties: [
      true, false,
      true, false,
      true, false,
      true
    ],
    outOfGamePlayers: [ '14', '13' ],
    outOfGameTypes: [ '2', '3' ],
    outOfGameRounds: [ '14', '15' ],
    yellowCards: [ '14', '15', '15', '14' ],
    inGameSubsHappened: [ '3', '2', '3', '2', '3', '2' ],
    halfTimeSubstitutions: [ '31', '30', '31' ],
    nDefs: [ '14', '15' ],
    nTotHalf: [ '15', '14' ],
    winner: '3',
    gamePoints: '3',
    teamSumSkills: '16777215',
    trainingPoints: '4095',
    isHomeStadium: true,
    changesAtHalftime: '0',
    isCancelled: false,
    encodedMatchLog: '904625697166429907578684580254429362549174092576235409827636622758600564479'
  } as unknown as MatchLog
];

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
    decodeMatchEvents = new DecodeMatchEvents(matchLogsAndEvents, matchTeams, matchLogs);
  });

  test('should decode match events correctly', () => {
    const matchEvents = decodeMatchEvents.decode(false);
    
    //expect(matchEvents.length).toBe(2);

    // Test first event
    expect(matchEvents[0]).toEqual({
      team_id: matchTeams.homeTeamId,
      type: MatchEventType.ATTACK,
      minute: '1',
      manage_to_shoot: true,
      is_goal: true,
      primary_shirt_number: '2',
      secondary_shirt_number: PENALTY_CODE,
    });

    // Test second event
    expect(matchEvents[1].minute).toBe('3');
    expect(matchEvents[1].is_goal).toBe(false);
    expect(matchEvents[1].primary_shirt_number).not.toBe('8'); // has to de the defender
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
});
