import { IsArray, ArrayMinSize, ArrayMaxSize, IsString, IsNumber, IsDefined, ValidateNested, Min } from "class-validator";
import { Type } from "class-transformer"; 
import { PLAYERS_PER_TEAM_MAX, PLAYERS_PER_TEAM_MIN } from "../../../utils/constants";

export class PlayInput {
  @IsDefined()
  @IsString()
  verseSeed!: string;

  @IsDefined()
  @IsNumber()
  matchStartTime!: number;

  @IsDefined()
  @IsArray()
  @ArrayMinSize(PLAYERS_PER_TEAM_MIN, { each: true })
  @ArrayMaxSize(PLAYERS_PER_TEAM_MAX, { each: true })
  skills!: [string[], string[]];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  teamIds!: [number, number];

  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true }) // Validate each nested TacticRequest object
  @Type(() => TacticRequest) // Specify the class for the nested objects
  tactics!: [TacticRequest, TacticRequest];

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
  trainings!: [TrainingRequest, TrainingRequest];
}

class TacticRequest {
  @IsDefined()
  @IsArray()
  @ArrayMinSize(11)
  @ArrayMaxSize(11)
  lineup!: number[];

  @IsDefined()
  @IsArray()
  @ArrayMaxSize(3)
  substitutions!: { shirt: number; target: number; minute: number }[];

  @IsDefined()
  @IsArray()
  @ArrayMaxSize(11)
  extraAttack!: boolean[];
}

class TrainingRequest {
  specialPlayerShirt?: number;
  goalkeepers?: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  defenders?: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  midfielders?: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  attackers?: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  specialPlayer?: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
}



