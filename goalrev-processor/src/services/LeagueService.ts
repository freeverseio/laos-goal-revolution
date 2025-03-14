import axios from "axios";
import { AppDataSource } from "../db/AppDataSource";

import Big from 'big.js';
import { EntityManager } from "typeorm";
import { Country } from "../db/entity/Country";
import { Verse } from "../db/entity/Verse";
import { LeagueRepository } from "../db/repository/LeagueRepository";
import { MatchEventRepository } from "../db/repository/MatchEventRepository";
import { MatchRepository } from "../db/repository/MatchRepository";
import { TeamRepository } from "../db/repository/TeamRepository";
import { TrainingRepository } from "../db/repository/TrainingRepository";
import { VerseRepository } from "../db/repository/VerseRepository";
import { CreateTeamCoreInput, LeagueGroup, Matchday, PlayerNamesMap, Schedule, TeamId } from "../types";
import { RankingPointsInput } from "../types/rest/input/rankingPoints";
import { CreateTeamResponse } from "../types/rest/output/team";
import { generatePlayerFullName, generateTeamName, loadNamesDatabase } from "../utils/nameUtils";
import { CalendarService } from "./CalendarService";
import { CreateTeamResponseToEntityMapper } from "./mapper/CreateTeamResponseToEntityMapper";
import { MatchMapper } from "./mapper/MatchMapper";

export class LeagueService {
  private teamRepository: TeamRepository;
  private matchRepository: MatchRepository;
  private verseRepository: VerseRepository;
  private matchEventRepository: MatchEventRepository;
  private leagueRepository: LeagueRepository;
  private trainingRepository: TrainingRepository;
  private calendarService: CalendarService;
  
  constructor(
    teamRepository: TeamRepository, 
    matchRepository: MatchRepository, 
    verseRepository: VerseRepository, 
    matchEventRepository: MatchEventRepository, 
    leagueRepository: LeagueRepository, 
    trainingRepository: TrainingRepository,
    calendarService: CalendarService
  ) {
    this.teamRepository = teamRepository;
    this.matchRepository = matchRepository;
    this.verseRepository = verseRepository;
    this.matchEventRepository = matchEventRepository;
    this.leagueRepository = leagueRepository;
    this.trainingRepository = trainingRepository;
    this.calendarService = calendarService;
  }

  async computeTeamRankingPointsForTimezone(timezoneIdx: number): Promise<void> {
    const teams = await this.teamRepository.findTeamsWithPlayersByTimezone(timezoneIdx);
    const partialRankingPoints: { team_id: string; ranking_points: string; ranking_points_real: string; prev_perf_points: string }[] = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const players = team.players;
      const encodedSkills = MatchMapper.calculateTeamSkills(players);
      const isBot = team.owner === '0x0000000000000000000000000000000000000000';
      const {rankingPoints, prevPerfPoints} = await this.getTeamRankingPoints(team.team_id, encodedSkills, team.leaderboard_position, Number(team.prev_perf_points), isBot);
      
      partialRankingPoints.push({
        team_id: team.team_id,
        ranking_points: this.normalizeRankingPoints(rankingPoints),
        ranking_points_real: rankingPoints.toString(),
        prev_perf_points: prevPerfPoints.toString()
      });
    }
    const entityManager = AppDataSource.manager;
    await entityManager.transaction(async (transactionalEntityManager) => {
      await this.teamRepository.bulkUpdateRankingPoints(partialRankingPoints, transactionalEntityManager);
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
    // set teams to zombies
    const numDays = process.env.NUM_DAYS_TO_SET_TEAMS_TO_ZOMBIES ? parseInt(process.env.NUM_DAYS_TO_SET_TEAMS_TO_ZOMBIES) : 5;
    await this.teamRepository.setTeamsToZombies(timezoneIdx, numDays);
    
    const entityManager = AppDataSource.manager;
    const verses = await this.calendarService.getVerses(entityManager);
    const leagueGroups = await this.getNewLeaguesForTimezone(timezoneIdx);
    const schedules: Schedule[] = [];
    for (const leagueGroup of leagueGroups) {
      // Call the new private method
      const leagueSchedules = await this.saveLeagueSchedules(leagueGroup, verses.firstVerse!, verses.lastVerse!);
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


  private async saveLeagueSchedules(leagueGroup: LeagueGroup, firstVerse: Verse, lastVerse: Verse): Promise<Schedule[]> {
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
          await this.saveLeagueSchedule(league_idx, leagueGroup.timezone, leagueGroup.country, schedule, firstVerse!, lastVerse!, transactionalEntityManager);
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

  private async saveLeagueSchedule(league_idx: number, timezone: number, country: Country, leagueSchedule: Matchday[], firstVerse: Verse, lastVerse: Verse, transactionalEntityManager: EntityManager) {
    leagueSchedule.forEach((matchday, matchday_idx) => {
      matchday.forEach((match, match_idx) => {
        this.matchEventRepository.deleteAllMatchEvents(timezone, country.country_idx, league_idx, matchday_idx, match_idx, transactionalEntityManager);
        const matchStartUTC = this.calendarService.getMatchStartTimeUTC(timezone, matchday_idx, firstVerse, lastVerse);
        this.matchRepository.resetMatch(timezone, country.country_idx, league_idx, matchday_idx, match_idx, match.home, match.away, matchStartUTC, transactionalEntityManager);
      });
    });
  }

  private async getTeamRankingPoints(teamId: string, encodedSkills: string[], leagueRanking: number, prevPerfPoints: number, isBot: boolean): Promise<{rankingPoints: string, prevPerfPoints: number}> {
    const requestBody: RankingPointsInput = {
      leagueRanking,
      prevPerfPoints,
      teamId,
      isBot: isBot,
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
    const namesDb = await loadNamesDatabase();
    const numLeaguesToCreate = 16; // 16 leagues
    const numTeamsPerLeague = 8; // 8 teams per league
    const MAX_TEAMIDX_IN_COUNTRY = 268435455; /// 268435455 = 2**28 - 1
    
    for (let i = 0; i < numLeaguesToCreate; i++) { 
      // open tx
      await entityManager.transaction(async (transactionManager: EntityManager) => {
        for (let j = 0; j < numTeamsPerLeague; j++) { // N teams per league
          // create 1 team
          const teamIdxInTZ = (nextTeamIdxInTZ + j + (i*numTeamsPerLeague))
          const requestBody: CreateTeamCoreInput = {
            timezoneIdx,
            countryIdx,
            teamIdxInTZ: teamIdxInTZ,
            deployTimeInUnixEpochSecs: firstVerse.verseTimestamp,
            divisionCreationRound: divisionCreationRound
          }    
          const response = await axios.post(`${process.env.CORE_API_URL}/team/createTeam`, requestBody);
          console.log('Creating Team: ', (j + (i*numTeamsPerLeague)));
          const createTeamResponse = response.data as CreateTeamResponse;
          const teamName = await generateTeamName(namesDb, createTeamResponse.id);

          // generate players names, race and region
          const playerNamesMap: PlayerNamesMap = {};
          for (let k = 0; k < createTeamResponse.players.length; k++) {
            createTeamResponse.players[k];
            const playerFullName = await generatePlayerFullName(namesDb, createTeamResponse.players[k].id, divisionCreationRound, timezoneIdx, BigInt(countryIdx));
            playerNamesMap[createTeamResponse.players[k].id] = playerFullName;
          }

          const teamMapped = CreateTeamResponseToEntityMapper.map({response: createTeamResponse, 
            timezoneIdx, 
            countryIdx, 
            league_idx: nextLeagueIdx + i, 
            team_idx_in_league: j, 
            leaderboard_position: j,
            teamName,            
            playerNamesMap
          });
          teamMapped.ranking_points_real = (MAX_TEAMIDX_IN_COUNTRY - teamIdxInTZ).toString();
          const normalizedValue = new Big(teamMapped.ranking_points_real).div(new Big("48318382080000")).toFixed(0);      
          teamMapped.ranking_points = normalizedValue;

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
