import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { CalendarService } from "../services/CalendarService";

export class CalendarFactory {
    static createCalendarService(): CalendarService {
      const verseRepository = new VerseRepository();
      const matchEventRepository = new MatchEventRepository();
      const calendarService = new CalendarService(verseRepository, matchEventRepository); // Inject VerseService & MatchEventService
      return calendarService; 
    }
}