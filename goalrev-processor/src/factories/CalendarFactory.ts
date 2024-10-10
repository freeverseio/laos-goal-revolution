import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { CalendarService } from "../services/CalendarService";
import { LeagueService } from "../services/LeagueService";

export class CalendarFactory {
    static createCalendarService(): CalendarService {
      const matchRepository = new MatchRepository();
      const verseRepository = new VerseRepository();
      const matchEventRepository = new MatchEventRepository();
      const teamRepository = new TeamRepository();
      const leagueService = new LeagueService(teamRepository);  
      const calendarService = new CalendarService(matchRepository, verseRepository, matchEventRepository, leagueService); // Inject VerseService & MatchEventService
      return calendarService; 
    }
}