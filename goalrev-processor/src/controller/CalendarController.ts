import { Get, JsonController, Param } from "routing-controllers";
import { LeagueService } from "../services/LeagueService";
import { CalendarFactory } from "../factories/CalendarFactory";
import { LeagueFactory } from "../factories/LeagueFactory";
@JsonController("/calendar")
export class CalendarController {
    
  private leagueService: LeagueService;

    constructor() {
        this.leagueService = LeagueFactory.createLeagueService();
    }

    @Get("/generate/:timezoneIdx")
    async generateCalendar(@Param("timezoneIdx") timezoneIdx: number) {
        return await this.leagueService.generateCalendarForTimezone(timezoneIdx);
    }
}