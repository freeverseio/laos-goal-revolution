import { IsArray, ArrayMinSize, ArrayMaxSize, IsString, IsNumber, IsDefined, ValidateNested, Min, IsOptional, IsBoolean } from "class-validator";
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
  @ValidateNested({ each: true })
  @Type(() => MatchLogRequest)
  matchLogs!: [MatchLogRequest, MatchLogRequest];

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

  getMatchLogs(): string[] {
    return this.matchLogs.map((matchLog) => matchLog.encodedMatchLog ?? "0");
  }
}

class TacticRequest {

  @IsDefined()
  @IsNumber()
  tacticsId!: number;


  @IsDefined()
  @IsArray()
  @ArrayMinSize(14)
  @ArrayMaxSize(14)
  lineup!: number[];

  @IsDefined()
  @IsArray()
  @ArrayMaxSize(3)
  substitutions!: { shirt: number; target: number; minute: number }[];

  @IsDefined()
  @IsArray()
  @ArrayMaxSize(11)
  extraAttack!: boolean[];

  getSubstitutions(): string[] {
    return this.substitutions.map((substitution) => substitution.target.toString());
  }

  getSubstitutionRounds(): number[] {
    return this.substitutions.map((substitution) => Math.floor(substitution.minute / 12));
  }

  
  
  
}

export class TrainingRequest {
  trainingPoints!: number;

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

class MatchLogRequest {
  @IsOptional()
  @IsString()
  encodedMatchLog?: string;
}

class MatchEventRequest {
  @IsOptional()
  @IsNumber()
  minute!: number;

  @IsOptional()
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  team_id!: string;

  @IsOptional()
  @IsString()
  primary_player_id?: string;
  
  @IsOptional()
  @IsString()
  secondary_player_id?: string;

  @IsOptional()
  @IsBoolean()
  manage_to_shoot!: boolean;

  @IsOptional()
  @IsBoolean()
  is_goal!: boolean;
}