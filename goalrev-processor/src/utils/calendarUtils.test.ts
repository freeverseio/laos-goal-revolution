import { initMatchtimeAndTimezone, calendarInfo } from './calendarUtils'; // Make sure to import your actual module

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

    test('should correctly initialize match time and timezone based on deploy time', () => {
        let info1, info2;
        
        // If we deploy exactly at midnight, we need to wait half an hour
        info1 = initMatchtimeAndTimezone(0);

        info1 = initMatchtimeAndTimezone(600);
        expect(info1).toEqual({ "TZForRound1": 24, "firstVerseTimeStamp": 1800 });

        info2 = calendarInfo(0, 15, info1.firstVerseTimeStamp);
        expect(info2).toEqual({ "timezone": 15, "matchDay": 0, "half": 0, "leagueRound": 0, "timestamp": info1.firstVerseTimeStamp });

        info1 = initMatchtimeAndTimezone(600);
        expect(info1).toEqual({ "TZForRound1": 24, "firstVerseTimeStamp": 1800 });

        info2 = calendarInfo(0, 15, info1.firstVerseTimeStamp);
        expect(info2).toEqual({ "timezone": 15, "matchDay": 0, "half": 0, "leagueRound": 0, "timestamp": info1.firstVerseTimeStamp });

        // After half an hour, we would have to wait under hour
        info1 = initMatchtimeAndTimezone(1801);
        expect(info1).toEqual({ "TZForRound1": 1, "firstVerseTimeStamp": 1800 + 3600 });

        info2 = calendarInfo(0, 15, info1.firstVerseTimeStamp);
        expect(info2).toEqual({ "timezone": 15, "matchDay": 0, "half": 0, "leagueRound": 0, "timestamp": info1.firstVerseTimeStamp });

        info1 = initMatchtimeAndTimezone(1801 + 1800);
        expect(info1).toEqual({ "TZForRound1": 1, "firstVerseTimeStamp": 1800 + 3600 });

        info2 = calendarInfo(0, 15, info1.firstVerseTimeStamp);
        expect(info2).toEqual({ "timezone": 15, "matchDay": 0, "half": 0, "leagueRound": 0, "timestamp": info1.firstVerseTimeStamp });

        // After 1 hour...
        info1 = initMatchtimeAndTimezone(1801 + 3600);
        expect(info1).toEqual({ "TZForRound1": 2, "firstVerseTimeStamp": 1800 + 3600 * 2 });

        info2 = calendarInfo(0, 15, info1.firstVerseTimeStamp);
        expect(info2).toEqual({ "timezone": 15, "matchDay": 0, "half": 0, "leagueRound": 0, "timestamp": info1.firstVerseTimeStamp });

        // Test with specific timestamp
        const referenceDeploy = 1727967000;
        info1 = initMatchtimeAndTimezone(referenceDeploy);
        const referenceDeployTZ = 15;
        const referenceDeployTimestamp = 1727969400;
        expect(info1).toEqual({ "TZForRound1": referenceDeployTZ, "firstVerseTimeStamp": referenceDeployTimestamp });

        info2 = calendarInfo(0, 15, info1.firstVerseTimeStamp);
        expect(info2).toEqual({ "timezone": 15, "matchDay": 0, "half": 0, "leagueRound": 0, "timestamp": info1.firstVerseTimeStamp });

        // Spain timezone calculations
        const spainTZ = 10;
        info2 = calendarInfo(76, referenceDeployTZ, referenceDeployTimestamp);
        expect(info2).toEqual({ "timezone": spainTZ, "matchDay": 0, "half": 0, "leagueRound": 0, "timestamp": 1728037800 });

        info2 = calendarInfo(114, referenceDeployTZ, referenceDeployTimestamp);
        expect(info2).toEqual({ "timezone": spainTZ, "matchDay": 1, "half": 0, "leagueRound": 0, "timestamp": 1728072000 });

        info2 = calendarInfo(172, referenceDeployTZ, referenceDeployTimestamp);
        expect(info2).toEqual({ "timezone": spainTZ, "matchDay": 2, "half": 0, "leagueRound": 0, "timestamp": 1728124200 });
    });
});
