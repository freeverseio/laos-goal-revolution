import { PlayerService } from "../services/PlayerService";
import { TeamService } from "../services/TeamService";
import { MatchEventService } from "../services/MatchEventService";
import { CalendarService } from "../services/CalendarService";
import { MatchRepository } from "../db/repository/MatchRepository";
import { MatchService } from "../services/MatchService";
import { VerseRepository } from "../db/repository/VerseRepository";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { LeagueService } from "../services/LeagueService";
import { TeamRepository } from "../db/repository/TeamRepository";

export class MatchFactory {
  
  static createMatchService(): MatchService {
    // Instantiate all the dependencies for MatchService
    const playerService = new PlayerService();
    const teamService = new TeamService();
    const matchEventRepository = new MatchEventRepository();
    const matchEventService = new MatchEventService(matchEventRepository);
    const verseRepository = new VerseRepository();
    const matchRepository = new MatchRepository();
    const calendarService = new CalendarService(verseRepository); // Inject VerseService & MatchEventService

    // Create and return the MatchService with injected dependencies
    return new MatchService(
      playerService,
      teamService,
      matchEventService,
      calendarService,
      verseRepository,
      matchRepository 
    );
  }
}
