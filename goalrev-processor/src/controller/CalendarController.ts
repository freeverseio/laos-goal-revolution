import { Get, JsonController } from "routing-controllers";
import { CalendarService } from "../services/CalendarService";
import { VerseService } from "../services/VerseService";
import { MatchEventService } from "../services/MatchEventService";
@JsonController("/calendar")
export class CalendarController {
    private verseService: VerseService;
    private matchEventService: MatchEventService;
    private calendarService: CalendarService;

    constructor() {
        this.verseService = new VerseService();
        this.matchEventService = new MatchEventService();
        this.calendarService = new CalendarService(this.verseService, this.matchEventService);
    }

    @Get("/generate")
    async generateLeagues() {
        return await this.calendarService.generateLeagues();
    }
}