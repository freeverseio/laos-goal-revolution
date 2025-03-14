export interface PlayMatchesInput {
  timeZone: number,
  matchDay: number
}

export interface PlayMatchRequest {
  
  verseSeed: string

  matchStartTime: number

  skills: [string[], string[]]

  teamIds: [number, number]

  tactics: [TacticRequest, TacticRequest]

  matchLogs: [MatchLogRequest, MatchLogRequest]

  matchBools: [boolean, boolean, boolean, boolean, boolean]

  trainings: [TrainingRequest, TrainingRequest]

}

export interface TacticRequest {
  tacticsId: number;
  lineup: number[];
  substitutions: { shirt: number; target: number; minute: number }[];
  extraAttack: boolean[];
}

export interface TrainingRequest {
  trainingPoints: number;
  specialPlayerShirt: number;
  goalkeepers: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  defenders: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  midfielders: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  attackers: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
  specialPlayer: {
    defence: number;
    speed: number;
    pass: number;
    shoot: number;
    endurance: number;
  };
}

export interface MatchEventRequest {
  minute: number;
  type: string;
  team_id: string;
  primary_player_id?: string;
  secondary_player_id?: string;
  manage_to_shoot: boolean;
  is_goal: boolean;
}

export interface MatchLogRequest {
  encodedMatchLog?: string;
}