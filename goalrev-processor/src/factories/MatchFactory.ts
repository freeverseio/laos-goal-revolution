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
import { LeagueFactory } from "./LeagueFactory";
import { MatchHistoryRepository } from "../db/repository/MatchHistoryRepository";

export class MatchFactory {
  
  static createMatchService(): MatchService {
    // Instantiate all the dependencies for MatchService
    const playerService = new PlayerService();
    const teamService = new TeamService();
    const matchEventRepository = new MatchEventRepository();
    const matchEventService = new MatchEventService(matchEventRepository);
    const verseRepository = new VerseRepository();
    const matchRepository = new MatchRepository();
    const matchHistoryRepository = new MatchHistoryRepository();
    const calendarService = new CalendarService(verseRepository); 
    const leagueService = LeagueFactory.createLeagueService();
    
    // Create and return the MatchService with injected dependencies
    return new MatchService(
      playerService,
      teamService,
      matchEventService,
      calendarService,
      verseRepository,
      matchRepository,
      matchHistoryRepository,
      leagueService
    );
  }
}
