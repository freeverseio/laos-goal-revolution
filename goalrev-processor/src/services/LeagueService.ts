import axios from "axios";
import { AppDataSource } from "../db/AppDataSource";

import { EntityManager } from "typeorm";
import { Country } from "../db/entity/Country";
import { Verse } from "../db/entity/Verse";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { CreateTeamCoreInput, LeagueGroup, Matchday, Schedule, TeamId } from "../types";
import { getMatch1stHalfUTC } from "../utils/calendarUtils";
import { MATCHDAYS_PER_ROUND } from "../utils/constants/constants";
import { CalendarService } from "./CalendarService";
import { RankingPointsInput } from "../types/rest/input/rankingPoints";
import { League, Player, Tactics, Team, TeamPartialUpdate, Training } from "../db/entity";

export class LeagueService {
  private teamRepository: TeamRepository;
  private calendarService: CalendarService;
  private matchRepository: MatchRepository;
  private verseRepository: VerseRepository;
  private matchEventRepository: MatchEventRepository

  constructor(teamRepository: TeamRepository, matchRepository: MatchRepository, verseRepository: VerseRepository, matchEventRepository: MatchEventRepository, calendarService: CalendarService) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
    this.verseRepository = verseRepository;
    this.calendarService = calendarService;
    this.matchEventRepository = matchEventRepository;
  }

  async computeTeamRankingPointsForTimezone(timezoneIdx: number): Promise<void> {
    const teams = await this.teamRepository.findTeamsWithPlayersByTimezone(timezoneIdx);
    const partialRankingPoints: TeamPartialUpdate[] = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const players = team.players;
      const encodedSkills = players.map(player => player.encoded_skills);
      const rankingPoints = await this.getTeamRankingPoints(team.team_id, encodedSkills, team.leaderboard_position, Number(team.prev_perf_points));
      partialRankingPoints.push({
        team_id: team.team_id,
        ranking_points: rankingPoints.toString(),
      });
    }
    const entityManager = AppDataSource.manager;
    await entityManager.transaction(async (transactionalEntityManager) => {
      await this.teamRepository.bulkUpdate(partialRankingPoints, transactionalEntityManager);
    });
  }


  async generateCalendarForTimezone(timezoneIdx: number): Promise<Schedule[]> {
    const finished = await this.haveTimezoneLeaguesFinished(timezoneIdx);
    if (!finished) {
      return [];
    }
    const firstVerse = await this.verseRepository.getInitialVerse(AppDataSource.manager);
    const leagueGroups = await this.getNewLeaguesForTimezone(timezoneIdx);
    const schedules: Schedule[] = [];
    for (const leagueGroup of leagueGroups) {
      // Call the new private method
      const leagueSchedules = await this.saveLeagueSchedules(leagueGroup, firstVerse!);
      schedules.push(...leagueSchedules);
    }
    return schedules;
  }

  async getNewLeaguesForTimezone(timezoneIdx: number): Promise<LeagueGroup[]> {
    const entityManager = AppDataSource.manager;
    // Fetch all countries (grouping will be done by country and timezone)
    const countries = await entityManager.find(Country, { where: { timezone_idx: timezoneIdx } });
    const leagueGroups: LeagueGroup[] = [];

    //  Process each country and group teams into leagues
    for (const country of countries) {
      const leaguesForCountry = await this.getLeagueGroupsByCountry(country);

      if (leaguesForCountry) {
        leagueGroups.push(leaguesForCountry);
      }
    }
    return leagueGroups;
  }

  async getNewLeaguesByCountry(countryIdx: number, timezoneIdx: number): Promise<LeagueGroup | null> {
    const entityManager = AppDataSource.manager;
    const country = await entityManager.findOne(Country, { where: { country_idx: countryIdx } });
    if (!country) {
      return null;
    }
    return this.getLeagueGroupsByCountry(country);
  }

  private async getLeagueGroupsByCountry(country: Country): Promise<LeagueGroup | null> {
    // Fetch teams for the current country and timezone
    const teams = await this.teamRepository.findTeamsByCountryAndTimezone(country.country_idx, country.timezone_idx);

    if (teams.length <= 0) {
      return null; // No teams, skip this country
    }

    //  Group the teams into leagues of 8
    const leagues: TeamId[][] = [];
    for (let i = 0; i < teams.length; i += 8) {
      leagues.push(teams.slice(i, i + 8).map(team => team.team_id as TeamId));
    }

    // Return the grouped leagues for the country and timezone
    return {
      country,
      timezone: country.timezone_idx,
      leagues,
    };
  }

  async updateLeaderboard(timezoneIdx: number, countryIdx: number, leagueIdx: number) {
    // getMatchDay
    const info = await this.calendarService.getCalendarInfo();
    // check if timestamp to play is in the future
    if (info.timestamp! > Date.now() / 1000) {
      console.error("Timestamp to play is in the future, skipping");
      return {
        err: 1,
      };
    }
    const matchDay = info.matchDay;

    // getMatches
    const leagueMatches = await this.matchRepository.getLeagueMatches(timezoneIdx, countryIdx, leagueIdx);
    const leagueMatchesInput = leagueMatches.map(match => ({
      homeGoals: match.home_goals,
      visitorGoals: match.visitor_goals
    }));

    // getTeams
    const teams = await this.teamRepository.findTeamsByTimezoneCountryAndLeague(timezoneIdx, countryIdx, leagueIdx);
    const teamsInput = teams.map(team => ({
      teamId: team.team_id,
      teamIdxInLeague: team.team_idx_in_league,
    }));

    // call goalrev-core
    const requestBody = {
      teams: teamsInput,
      matchDay: matchDay,
      matches: leagueMatchesInput,
    }
    const response = await axios.post(`${process.env.CORE_API_URL}/league/computeLeagueLeaderboard`, requestBody);

    // update DB
    const transactionalEntityManager = AppDataSource.manager;
    for (const team of response.data.teams) {
      await this.teamRepository.updateLeaderboard(team.teamId, team.teamPoints, team.leaderboardPosition, transactionalEntityManager);
    }

    // Mock return
    const teamsOutput = [];
    const team = {
      teamId: 1,
      leaderboardPosition: 1,
      teamPoints: 1,
    }
    teamsOutput.push(team);

    return {
      teams: teamsOutput,
    };
  }
  async haveTimezoneLeaguesFinished(timezoneIdx: number): Promise<boolean> {
    const pendingMatches = await this.matchRepository.countPendingMatchesByTimezone(timezoneIdx);
    return pendingMatches <= 0;
  }

  async getActualRoundOfLeague(timezoneIdx: number): Promise<number> {
    const verses = await this.verseRepository.countVersesByTimezone(timezoneIdx);
    return Math.max(Math.ceil(verses / MATCHDAYS_PER_ROUND) - 1, 0);
  }

  private async saveLeagueSchedules(leagueGroup: LeagueGroup, firstVerse: Verse): Promise<Schedule[]> {
    let schedules: Schedule[] = [];
    const entityManager = AppDataSource.manager;
    schedules = await entityManager.transaction(async (transactionalEntityManager) => {
      for (let i = 0; i < leagueGroup.leagues.length; i++) {
        const league = leagueGroup.leagues[i];
        // Update the league_idx for all teams in the league
        await this.teamRepository.updateLeagueIdxInBulk(league, i, transactionalEntityManager);
        const schedule = CalendarService.generateLeagueSchedule(league);
        const league_idx = i;
        try {
          await this.saveLeagueSchedule(league_idx, leagueGroup.timezone, leagueGroup.country, schedule, firstVerse!, transactionalEntityManager);
        } catch (error) {
          console.error("Error saving league schedule:", error);
          throw error;
        }
        schedules.push(schedule);
      }
      return schedules;
    });
    return schedules;
  }

  private async saveLeagueSchedule(league_idx: number, timezone: number, country: Country, leagueSchedule: Matchday[], firstVerse: Verse, transactionalEntityManager: EntityManager) {
    const actualRound = await this.getActualRoundOfLeague(timezone);
    leagueSchedule.forEach((matchday, matchday_idx) => {
      matchday.forEach((match, match_idx) => {
        this.matchEventRepository.deleteAllMatchEvents(timezone, country.country_idx, league_idx, matchday_idx, match_idx, transactionalEntityManager);
        const matchStartUTC = getMatch1stHalfUTC(timezone, actualRound, matchday_idx, firstVerse.timezoneIdx, Number(firstVerse.verseTimestamp) );
        this.matchRepository.resetMatch(timezone, country.country_idx, league_idx, matchday_idx, match_idx, match.home, match.away, matchStartUTC, transactionalEntityManager);
      });
    });
  }

  private async getTeamRankingPoints(teamId: string, encodedSkills: string[], leagueRanking: number, prevPerfPoints: number): Promise<number> {
    const requestBody: RankingPointsInput = {
      leagueRanking,
      prevPerfPoints,
      teamId,
      isBot: false,
      skills: encodedSkills,
    }
    const response = await axios.post(`${process.env.CORE_API_URL}/league/computeRankingPoints`, requestBody);
    return response.data.rankingPoints;
  }

  async addDivision(timezoneIdx: number, countryIdx: number, divisionCreationRound: number) {
    console.log('addDivision: ',timezoneIdx, countryIdx);
    const entityManager = AppDataSource.manager;
    const firstVerse = await this.verseRepository.getInitialVerse(AppDataSource.manager);
    const lastTeamIdxInTZ =await this.teamRepository.countTeamsByTimezone( timezoneIdx, entityManager);
    //const lastLeagueIdx = await this.leagueRepository.countTeamsByTimezoneAndCountry( timezoneIdx, countryIdx, entityManager);
    const lastLeagueIdx = 0;
    
    for (let i = 0; i < 16; i++) { // 16 leagues
      // open tx
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        for (let j = 0; j < 8; j++) { // 8 teams per league
          // create 1 team
          const requestBody: CreateTeamCoreInput = {
            timezoneIdx,
            countryIdx,
            teamIdxInTZ: (lastTeamIdxInTZ + 1 + j + (i*8)),
            deployTimeInUnixEpochSecs: firstVerse.verseTimestamp,
            divisionCreationRound: divisionCreationRound
          }    
          const response = await axios.post(`${process.env.CORE_API_URL}/team/createTeam`, requestBody);
          // TODO define types

          // TODO leagueRepository

          // TODO Mappers TeamResponse to Team Entity

          console.log('TODO store Team in DB: ',response.data);        
          // TODO Store Team in DB
          //iterate teams
          const team: Team = {
            team_id: response.data.id,
            name: 'Mock Team',
            manager_name: 'Mock Manager',
            country: {
              timezone_idx: timezoneIdx,
              country_idx: countryIdx,
            } as Country,
            league: {
              timezone_idx: timezoneIdx,
              country_idx: countryIdx,
              league_idx: lastLeagueIdx + 1 + i,
            } as League,
            players: [],
            tactics: {} as Tactics,
            trainings: {} as Training,
            timezone_idx: timezoneIdx,
            country_idx: countryIdx,
            owner: '0x0000000000000000000000000000000000000000',
            league_idx: lastLeagueIdx + 1 + i,
            team_idx_in_league: j,
            leaderboard_position: j,
            points: 0,
            w: 0,
            d: 0,
            l: 0,
            goals_forward: 0,
            goals_against: 0,
            prev_perf_points: '0',
            ranking_points: '0',
            training_points: 0,
            tactic: '',
            match_log: '',
            is_zombie: false,
            promo_timeout: 0,
          };
          


          // const team: Team = response.data.team;
          // this.teamRepository.createTeam(team, entityManager);

          // TODO Mapper response.data.players to Player Entity

          // set players to team
        }

        // TODO bulk store 8 teams
      }); // clos tx


    }
  
    return true;
  }


}
