import { AppDataSource } from "../db/AppDataSource";
import axios from "axios";

import { calendarInfo } from "../utils/calendarUtils";
import { MatchService } from "./MatchService";
import { EntityManager } from "typeorm";
import { LeagueGroup,  TeamId } from "../types";
import { Country } from "../db/entity/Country";
import { TeamRepository } from "../db/repository/TeamRepository";
import { CalendarService } from "./CalendarService";

export class LeagueService {

  private teamRepository: TeamRepository;
  private matchService: MatchService;
  private calendarService: CalendarService;
 
  constructor(teamRepository: TeamRepository, matchService: MatchService, calendarService: CalendarService) {
    this.calendarService = calendarService;
    this.matchService = matchService;
    this.teamRepository = teamRepository;
  }


  async getNewLeagues(): Promise<LeagueGroup[]> {
    const entityManager = AppDataSource.manager;
    // Fetch all countries (grouping will be done by country and timezone)
    const countries = await entityManager.find(Country);
    const leagueGroups: LeagueGroup[] = [];
  
    //  Process each country and group teams into leagues
    for (const country of countries) {
      const leaguesForCountry = await this.getLeagueGroupsByCountry(entityManager, country);
      
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
    return this.getLeagueGroupsByCountry(entityManager, country);
  }

  private async getLeagueGroupsByCountry(entityManager: EntityManager, country: Country): Promise<LeagueGroup | null> {
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
    const leagueMatches = await this.matchService.getLeagueMatches(timezoneIdx, countryIdx, leagueIdx);
    console.log('leagueMatches:', leagueMatches);


    // getTeams

        

    // TODO call core method
    // teams, matchDay, matches
    // const response = await axios.post(`${process.env.CORE_API_URL}/league/${endpoint}`, requestBody);
    // const leagueLeaderboardOutput = response.data as PlayOutput;
    // return leagueLeaderboardOutput.teams;

    // Mock return
    const teams = [];
    const team = {
      teamId: 1,
      leaderboardPosition: 1,
      teamPoints: 1,
    }
    teams.push(team);

    return {
      teams,      
    };
  }
}
