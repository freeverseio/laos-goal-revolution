import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDefined, IsNumber, IsString } from "class-validator";
import { PLAYERS_PER_TEAM_MAX, PLAYERS_PER_TEAM_MIN } from "../../../utils/constants";

export class RankingPointsInput {
  @IsDefined()
  @IsNumber()
  leagueRanking!: number;

  @IsDefined()
  @IsNumber()
  prevPerfPoints!: number;

  @IsDefined()
  @IsString()
  teamId!: string;

  @IsDefined()
  @IsBoolean()
  isBot!: boolean;


  @IsDefined()
  @IsArray()
  @ArrayMaxSize(PLAYERS_PER_TEAM_MAX)
  @ArrayMinSize(PLAYERS_PER_TEAM_MIN)
  skills!: string[];
}
