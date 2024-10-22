export enum PlayerPosition {
  GOALKEEPER = "GK",
  DEFENDER_LEFT = "D L",
  DEFENDER_RIGHT = "D R",
  DEFENDER_CENTER = "D C",
  MIDFIELDER_LEFT = "M L",
  MIDFIELDER_RIGHT = "M R",
  MIDFIELDER_CENTER = "M C",
  FORWARD_LEFT = "F L",
  FORWARD_RIGHT = "F R",
  FORWARD_CENTER = "FC",
}

export interface Player {
  id: string;
  skills: PlayerSkill;
  dayOfBirth: number;
  birthTraits: BirthTraits;
}

export interface PlayerSkill {
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