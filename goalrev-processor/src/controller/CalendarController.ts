import { Get, JsonController, Param } from "routing-controllers";
import { CalendarService } from "../services/CalendarService";
import { MatchEventService } from "../services/MatchEventService";
import { CalendarFactory } from "../factories/CalendarFactory";
@JsonController("/calendar")
export class CalendarController {
    private calendarService: CalendarService;

    constructor() {
        this.calendarService = CalendarFactory.createCalendarService();
    }

    @Get("/generate")
    async generateLeagues() {
        return await this.calendarService.generateCalendarForAllLeagues();
    }

    @Get("/generate/:countryIdx/:timezoneIdx")
    async generateLeague(@Param("countryIdx") countryIdx: number, @Param("timezoneIdx") timezoneIdx: number) {
        return await this.calendarService.generateCalendarForNewLeague(countryIdx, timezoneIdx);
    }
}