import { LeagueRepository } from "../db/repository/LeagueRepository";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { TrainingCustomRepository } from "../db/repository/TrainingRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { CalendarService } from "../services/CalendarService";
import { LeagueService } from "../services/LeagueService";

export class LeagueFactory {
    static createLeagueService(): LeagueService {
        const teamRepository = new TeamRepository();
        const matchRepository = new MatchRepository();
        const verseRepository = new VerseRepository();
        const matchEventRepository = new MatchEventRepository();
        const calendarService = new CalendarService(verseRepository);
        const leagueRepository = new LeagueRepository();
        const trainingRepository = new TrainingCustomRepository();
        return new LeagueService(teamRepository, matchRepository, verseRepository, matchEventRepository, calendarService, leagueRepository, trainingRepository);
    }
} 