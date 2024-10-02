import { IsArray, ArrayMinSize, ArrayMaxSize, IsString, IsNumber, IsDefined } from "class-validator";
import { PLAYERS_PER_TEAM_MAX } from "../../../utils/constants";

export class PlayInput {
  @IsDefined()
  @IsString()
  verseSeed!: string;

  @IsDefined()
  @IsNumber()
  matchStartTime!: number;

  @IsDefined()
  @IsArray()
  @ArrayMinSize(PLAYERS_PER_TEAM_MAX, { each: true })  // Each sub-array should have at least 25 elements
  @ArrayMaxSize(PLAYERS_PER_TEAM_MAX, { each: true })  // Each sub-array should have at most 25 elements
  skills!: [number[], number[]];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  teamIds!: [number, number];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  tactics!: [number, number];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  matchLogs!: [string, string];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  matchBools!: [boolean, boolean, boolean, boolean, boolean];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  assignedTPs!: [string, string];
}
