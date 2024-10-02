import { AppDataSource } from "../db/AppDataSource";
import { Match } from "../db/entity/Match";

export class MatchService {

  async playMatches(timezone: number, league: number, matchDay: number) {
    // get matches for timezone and epoch
    const matches = await this.getMatches(timezone, league, matchDay);
    
    // Process matches
    for (const match of matches) {
      // Logic to play the match
      await this.playMatch(match);
    }
    return "ok"
  }

  private async getMatches(timezone: number, league: number, matchDay: number) {
    const matchRepository = AppDataSource.getRepository(Match);
    // Fetch matches based on timezone and startEpoch
    return await matchRepository.find({
        where: {
            timezone_idx: timezone,
            league_idx: league,
            match_day_idx: matchDay
        }
    });
  }

  private async playMatch(match: any) {
    console.log(match);
    return "ok"
  }
}