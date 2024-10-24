export interface CreateTeamResponse {
  id: string;
  players: Player[];
}

export interface Player {
  id: string;
  skills: PlayerSkill;
  dayOfBirth: number;
  birthTraits: BirthTraits;
}

export interface PlayerSkill {
  playerId: string;
  defence: number;
  speed: number;
  pass: number;
  shoot: number;
  endurance: number;
  encodedSkills: string;
}

export interface BirthTraits {
  potential: number;
  forwardness: number;
  leftishness: number;
  aggressiveness: number;
}