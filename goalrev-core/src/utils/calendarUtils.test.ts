import { calendarInfo } from './calendarUtils'; // Make sure to import your actual module

describe('CalendarInfo Tests', () => {
    const NULL_TIMEZONE = 0;
    const VERSES_PER_ROUND = 672; // 96 * 7days

    test('Basic cases for calendarInfo', () => {
        let info;

        info = calendarInfo(0, 1, 0);
        expect(info).toEqual({ timezone: 1, matchDay: 0, half: 0, leagueRound: 0, timestamp: 0 });

        info = calendarInfo(0, 14, 55550);
        expect(info).toEqual({ timezone: 14, matchDay: 0, half: 0, leagueRound: 0, timestamp: 55550 });

        info = calendarInfo(1, 1, 0);
        expect(info).toEqual({ timezone: 1, matchDay: 0, half: 1, leagueRound: 0, timestamp: 900 });

        info = calendarInfo(2, 1, 0);
        expect(info).toEqual({ timezone: NULL_TIMEZONE, matchDay: null, half: null, leagueRound: null, timestamp: null });

        info = calendarInfo(3, 1, 0);
        expect(info).toEqual({ timezone: NULL_TIMEZONE, matchDay: null, half: null, leagueRound: null, timestamp: null });

        info = calendarInfo(4, 1, 0);
        expect(info).toEqual({ timezone: 2, matchDay: 0, half: 0, leagueRound: 0, timestamp: 3600 });

        info = calendarInfo(5, 1, 0);
        expect(info).toEqual({ timezone: 2, matchDay: 0, half: 1, leagueRound: 0, timestamp: 4500 });

        info = calendarInfo(6, 1, 0);
        expect(info).toEqual({ timezone: NULL_TIMEZONE, matchDay: null, half: null, leagueRound: null, timestamp: null });

        info = calendarInfo(7, 1, 0);
        expect(info).toEqual({ timezone: NULL_TIMEZONE, matchDay: null, half: null, leagueRound: null, timestamp: null });

        info = calendarInfo(8, 1, 0);
        expect(info).toEqual({ timezone: 3, matchDay: 0, half: 0, leagueRound: 0, timestamp: 7200 });

        info = calendarInfo(9, 1, 0);
        expect(info).toEqual({ timezone: 3, matchDay: 0, half: 1, leagueRound: 0, timestamp: 8100 });

        info = calendarInfo(10, 1, 0);
        expect(info).toEqual({ timezone: NULL_TIMEZONE, matchDay: null, half: null, leagueRound: null, timestamp: null });

        info = calendarInfo(11, 1, 0);
        expect(info).toEqual({ timezone: NULL_TIMEZONE, matchDay: null, half: null, leagueRound: null, timestamp: null });
    });

    test('After one league', () => {
        let info;

        info = calendarInfo(VERSES_PER_ROUND, 1, 0);
        expect(info).toEqual({ timezone: 1, matchDay: 0, half: 0, leagueRound: 1, timestamp: 900 * VERSES_PER_ROUND });

        info = calendarInfo(VERSES_PER_ROUND + 1, 1, 0);
        expect(info).toEqual({ timezone: 1, matchDay: 0, half: 1, leagueRound: 1, timestamp: 900 * (VERSES_PER_ROUND + 1) });

        info = calendarInfo(VERSES_PER_ROUND + 2, 1, 0);
        expect(info).toEqual({ timezone: 16, matchDay: 13, half: 0, leagueRound: 0, timestamp: 900 * (VERSES_PER_ROUND + 2) });

        info = calendarInfo(VERSES_PER_ROUND + 2, 1, 534535);
        expect(info).toEqual({ timezone: 16, matchDay: 13, half: 0, leagueRound: 0, timestamp: 534535 + 900 * (VERSES_PER_ROUND + 2) });
    });
});
