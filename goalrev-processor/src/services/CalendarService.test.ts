import { CalendarService } from './CalendarService';
import { Matchday } from '../types';

describe('CalendarService', () => {
  describe('generateLeagueSchedule', () => {
    
    it('should generate the correct number of matchdays for 8 teams', () => {
      const teams = ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7', 'Team8'];
      const schedule: Matchday[] = CalendarService.generateLeagueSchedule(teams);

      // There should be 14 matchdays (7 other teams, playing home and away)
      expect(schedule.length).toBe(14);

      // Each matchday should have 4 matches
      schedule.forEach(matchday => {
        expect(matchday.length).toBe(4);
      });
    });

    it('should alternate home and away for the same matchups', () => {
      const teams = ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7', 'Team8'];
      const schedule: Matchday[] = CalendarService.generateLeagueSchedule(teams);

      // Check that for each matchup, there is a reverse home/away in the second half
      const firstHalf = schedule.slice(0, 7);
      const secondHalf = schedule.slice(7);

      firstHalf.forEach((matchday, index) => {
        matchday.forEach((match, matchIndex) => {
          const reverseMatch = secondHalf[index][matchIndex];
          expect(match.home).toBe(reverseMatch.away);
          expect(match.away).toBe(reverseMatch.home);
        });
      });
    });

    it('should throw an error if the number of teams is odd', () => {
      const teams = ['Team1', 'Team2', 'Team3']; // Odd number of teams
      
      expect(() => {
        CalendarService.generateLeagueSchedule(teams);
      }).toThrow('The number of teams must be even.');
    });

    it('should generate correct matches for a smaller league with 4 teams', () => {
      const teams = ['Team1', 'Team2', 'Team3', 'Team4'];
      const schedule: Matchday[] = CalendarService.generateLeagueSchedule(teams);

      // There should be 6 matchdays (3 teams to play, home and away)
      expect(schedule.length).toBe(6);

      // Each matchday should have 2 matches
      schedule.forEach(matchday => {
        expect(matchday.length).toBe(2);
      });

      // Check the first matchday for specific matches
      expect(schedule[0]).toEqual([
        { home: 'Team1', away: 'Team2' },
        { home: 'Team3', away: 'Team4' },
      ]);

      // Check the second half reverses the matches
      expect(schedule[3]).toEqual([
        { home: 'Team2', away: 'Team1' },
        { home: 'Team4', away: 'Team3' },
      ]);
    });

  });
});
