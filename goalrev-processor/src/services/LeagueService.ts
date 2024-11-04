import axios from "axios";
import { AppDataSource } from "../db/AppDataSource";

import { EntityManager } from "typeorm";
import { TeamPartialUpdate } from "../db/entity";
import { Country } from "../db/entity/Country";
import { Verse } from "../db/entity/Verse";
import { LeagueRepository } from "../db/repository/LeagueRepository";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { TrainingRepository } from "../db/repository/TrainingRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { CreateTeamCoreInput, LeagueGroup, Matchday, Schedule, TeamId } from "../types";
import { RankingPointsInput } from "../types/rest/input/rankingPoints";
import { CreateTeamResponse } from "../types/rest/output/team";
import { getMatch1stHalfUTC } from "../utils/calendarUtils";
import { MATCHDAYS_PER_ROUND } from "../utils/constants/constants";
import { CalendarService } from "./CalendarService";
import { CreateTeamResponseToEntityMapper } from "./mapper/CreateTeamResponseToEntityMapper";
import { MatchMapper } from "./mapper/MatchMapper";
import { generateTeamName, loadNamesDatabase } from "../utils/TeamNameUtils";

export class LeagueService {
  private teamRepository: TeamRepository;
  private matchRepository: MatchRepository;
  private verseRepository: VerseRepository;
  private matchEventRepository: MatchEventRepository;
  private leagueRepository: LeagueRepository;
  private trainingRepository: TrainingRepository;

  constructor(
    teamRepository: TeamRepository, 
    matchRepository: MatchRepository, 
    verseRepository: VerseRepository, 
    matchEventRepository: MatchEventRepository, 
    leagueRepository: LeagueRepository, 
    trainingRepository: TrainingRepository
  ) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
    this.verseRepository = verseRepository;
    this.matchEventRepository = matchEventRepository;
    this.leagueRepository = leagueRepository;
    this.trainingRepository = trainingRepository;
  }

  async computeTeamRankingPointsForTimezone(timezoneIdx: number): Promise<void> {
    const teams = await this.teamRepository.findTeamsWithPlayersByTimezone(timezoneIdx);
    const partialRankingPoints: TeamPartialUpdate[] = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const players = team.players;
      const encodedSkills = MatchMapper.calculateTeamSkills(players);
      const {rankingPoints, prevPerfPoints} = await this.getTeamRankingPoints(team.team_id, encodedSkills, team.leaderboard_position, Number(team.prev_perf_points));
      
      partialRankingPoints.push({
        team_id: team.team_id,
        ranking_points: this.normalizeRankingPoints(rankingPoints),
        prev_perf_points: prevPerfPoints.toString()
      });
    }
    const entityManager = AppDataSource.manager;
    await entityManager.transaction(async (transactionalEntityManager) => {
      await this.teamRepository.bulkUpdate(partialRankingPoints, transactionalEntityManager);
    });
  }

  normalizeRankingPoints(rankingPoints: string): string {
    // Convert the input rankingPoints from a string to BigInt
    const rankingPointsBigInt = BigInt(rankingPoints);
    // Calculate the normalized ranking points using BigInt math
    const normalizedRankingPoints = rankingPointsBigInt  / (48318382080000n) ;
    // Convert the result back to a string
    return normalizedRankingPoints.toString();
  }


  async generateCalendarForTimezone(timezoneIdx: number): Promise<Schedule[]> {
    const finished = await this.haveTimezoneLeaguesFinished(timezoneIdx);
    if (!finished) {
      console.log(" -Leagues not finished for timezone: ", timezoneIdx);
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
    const entityManager = AppDataSource.manager;
    await this.leagueRepository.recalculateLeaderboardPosition(timezoneIdx, countryIdx, leagueIdx, entityManager);
    return true;
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

  private async getTeamRankingPoints(teamId: string, encodedSkills: string[], leagueRanking: number, prevPerfPoints: number): Promise<{rankingPoints: string, prevPerfPoints: number}> {
    const requestBody: RankingPointsInput = {
      leagueRanking,
      prevPerfPoints,
      teamId,
      isBot: false,
      skills: encodedSkills,
    }
    const response = await axios.post(`${process.env.CORE_API_URL}/league/computeRankingPoints`, requestBody);
    if (response.data.err == 0) {
      return {
        rankingPoints: response.data.rankingPoints,
        prevPerfPoints: response.data.prevPerfPoints
      };
    } else {
      console.error('Error computing team ranking points:', response.data);
      throw new Error('Error computing team ranking points');
    }
  }

  async addDivision(timezoneIdx: number, countryIdx: number, divisionCreationRound: number) {
    console.log('addDivision: ',timezoneIdx, countryIdx);
    const entityManager = AppDataSource.manager;
    const firstVerse = await this.verseRepository.getInitialVerse(AppDataSource.manager);
    const nextTeamIdxInTZ =await this.teamRepository.countTeamsByTimezone( timezoneIdx, entityManager);
    const nextLeagueIdx = await this.leagueRepository.countLeaguesByTimezoneAndCountry( timezoneIdx, countryIdx, entityManager);

    // Load names database once so we can use it multiple times later
    const teamNamesDb = await loadNamesDatabase();
    
    for (let i = 0; i < 4; i++) { // 16 leagues
      // open tx
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        for (let j = 0; j < 8; j++) { // 8 teams per league
          // create 1 team
          const requestBody: CreateTeamCoreInput = {
            timezoneIdx,
            countryIdx,
            teamIdxInTZ: (nextTeamIdxInTZ + j + (i*8)),
            deployTimeInUnixEpochSecs: firstVerse.verseTimestamp,
            divisionCreationRound: divisionCreationRound
          }    
          const response = await axios.post(`${process.env.CORE_API_URL}/team/createTeam`, requestBody);
          console.log('Creating Team: ', (j + (i*8)));
          const createTeamResponse = response.data as CreateTeamResponse;
          
          const teamName = await generateTeamName(teamNamesDb, createTeamResponse.id);
          const teamMapped = CreateTeamResponseToEntityMapper.map({response: createTeamResponse, 
            timezoneIdx, 
            countryIdx, 
            league_idx: nextLeagueIdx + i, 
            team_idx_in_league: j, 
            leaderboard_position: j,
            teamName
          });

          const resultTeam = await this.teamRepository.createTeam(teamMapped, transactionManager);
          if (!resultTeam) {
            console.error(`error on iteration [${i}, ${j}]`);
            throw new Error('Error creating team in DB');          
          }         
         
        }

        // TODO bulk store 8 teams
      }); // close tx
    }
  
    return true;
  }

  async resetTrainings(timezoneIdx: number, countryIdx: number, leagueIdx: number) {
    const entityManager = AppDataSource.manager;
    await this.trainingRepository.resetTrainings(timezoneIdx, countryIdx, leagueIdx, entityManager);
  }  
  

}
