import { TeamService } from './TeamService';
import { Team } from '../db/entity/Team';
import { MatchEventOutput, MatchEventType, MatchLog } from '../types';
import { EntityManager } from 'typeorm';
import { MatchState } from '../db/entity';

const mockEntityManager = {
  findOne: jest.fn(),
  save: jest.fn(),
} as unknown as jest.Mocked<EntityManager>;

describe('TeamService', () => {
  let teamService: TeamService;

  beforeEach(() => {
    teamService = new TeamService();
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should update goals_forward, training points, and points when the team scores more goals than the opponent', async () => {
    const mockTeam = {
      team_id: '1',
      goals_forward: 0,
      goals_against: 0,
      training_points: 0,
      points: 0,
    } as unknown as Team;

    mockEntityManager.findOne.mockResolvedValueOnce(mockTeam);

    const matchEvents: MatchEventOutput[] = [
      { minute: 15, type: MatchEventType.ATTACK, team_id: '1', manage_to_shoot: true, is_goal: true }, // Goal by the team
      { minute: 30, type: MatchEventType.ATTACK, team_id: '2', manage_to_shoot: true, is_goal: true }, // Goal by the opponent
      { minute: 60, type: MatchEventType.ATTACK, team_id: '1', manage_to_shoot: true, is_goal: true }, // Another goal by the team
    ];

    const matchLogHome: MatchLog = {
      numberOfGoals: 2,
      winner: 0,
      teamSumSkills: 0,
      trainingPoints: 50,
      isHomeStadium: true,
      changesAtHalftime: 0,
      isCancelled: false,
      encodedMatchLog: '',
    };

    const matchLogVisitor: MatchLog = {
      numberOfGoals: 1,
      winner: 0,
      teamSumSkills: 0,
      trainingPoints: 50,
      isHomeStadium: false,
      changesAtHalftime: 0,
      isCancelled: false,
      encodedMatchLog: '',
    };


    await teamService.updateTeamData(matchLogHome, matchLogVisitor, mockTeam, 1, false, true, mockEntityManager);

    // Check that goals_forward, goals_against, training_points, and points were updated
    expect(mockTeam.goals_forward).toBe(2); // Team scored 2 goals
    expect(mockTeam.goals_against).toBe(1); // Opponent scored 1 goal
    expect(mockTeam.training_points).toBe(50); // Training points should be updated
    expect(mockTeam.points).toBe(3); // Team wins, so 3 points should be awarded

    // Ensure that save was called with updated team
    expect(mockEntityManager.save).toHaveBeenCalledWith(mockTeam);
  });

  it('should update goals_against, training points, and award 1 point if the match is a draw', async () => {
    const mockTeam = {
      team_id: '1',
      goals_forward: 0,
      goals_against: 0,
      training_points: 0,
      points: 0,
    } as unknown as Team;

    mockEntityManager.findOne.mockResolvedValueOnce(mockTeam);

    const matchEvents: MatchEventOutput[] = [
      { minute: 15, type: MatchEventType.ATTACK, team_id: '1', manage_to_shoot: true, is_goal: true }, // Goal by the team
      { minute: 30, type: MatchEventType.ATTACK, team_id: '2', manage_to_shoot: true, is_goal: true }, // Goal by the opponent
    ];

    const matchLog: MatchLog = {
      numberOfGoals: 1,
      winner: 2,
      teamSumSkills: 0,
      trainingPoints: 50,
      isHomeStadium: false,
      changesAtHalftime: 0,
      isCancelled: false,
      encodedMatchLog: '',
    };

    await teamService.updateTeamData(matchLog, matchLog, mockTeam, 1, false, false, mockEntityManager);

    // Check that goals_forward, goals_against, training_points, and points were updated
    expect(mockTeam.goals_forward).toBe(1); // Team scored 1 goal
    expect(mockTeam.goals_against).toBe(1); // Opponent scored 1 goal
    expect(mockTeam.training_points).toBe(50); // Training points should be updated
    expect(mockTeam.points).toBe(1); // Draw, so 1 point should be awarded

    // Ensure that save was called with updated team
    expect(mockEntityManager.save).toHaveBeenCalledWith(mockTeam);
  });

  it('should update goals_against, training points, and award 0 points if the team loses', async () => {
    const mockTeam = {
      team_id: '1',
      goals_forward: 0,
      goals_against: 0,
      training_points: 0,
      points: 0,
    } as unknown as Team;

    mockEntityManager.findOne.mockResolvedValueOnce(mockTeam);

    const matchEvents: MatchEventOutput[] = [
      { minute: 30, type: MatchEventType.ATTACK, team_id: '2', manage_to_shoot: true, is_goal: true }, // Goal by the opponent
    ];



    const matchLogHome: MatchLog = {
      numberOfGoals: 0,
      winner: 1,
      teamSumSkills: 0,
      trainingPoints: 50,
      isHomeStadium: false,
      changesAtHalftime: 0,
      isCancelled: false,
      encodedMatchLog: '',
    };

    const matchLogVisitor: MatchLog = {
      numberOfGoals: 1,
      winner: 1,
      teamSumSkills: 0,
      trainingPoints: 50,
      isHomeStadium: true,
      changesAtHalftime: 0,
      isCancelled: false,
      encodedMatchLog: '',
    };

    await teamService.updateTeamData( matchLogVisitor, matchLogHome, mockTeam, 1, false, false, mockEntityManager);

    // Check that goals_forward, goals_against, training_points, and points were updated
    expect(mockTeam.goals_forward).toBe(1); // Team scored 0 goals
    expect(mockTeam.goals_against).toBe(0); // Opponent scored 1 goal
    expect(mockTeam.training_points).toBe(50); // Training points should be updated
    expect(mockTeam.points).toBe(3); // Team lost, so 0 points should be awarded

    // Ensure that save was called with updated team
    expect(mockEntityManager.save).toHaveBeenCalledWith(mockTeam);
  });

  
});