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


    @Get("/generate/:timezoneIdx")
    async generateLeague(@Param("timezoneIdx") timezoneIdx: number) {
        return await this.calendarService.generateCalendarForTimezone(timezoneIdx);
    }
}