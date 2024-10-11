import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { CalendarService } from "../services/CalendarService";
import { LeagueService } from "../services/LeagueService";

export class CalendarFactory {
    static createCalendarService(): CalendarService {
      const verseRepository = new VerseRepository();
      const calendarService = new CalendarService(verseRepository); // Inject VerseService & MatchEventService
      return calendarService; 
    }
}