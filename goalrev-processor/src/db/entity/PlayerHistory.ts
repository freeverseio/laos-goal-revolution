import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("players_histories")
export class PlayerHistory {
  @PrimaryColumn({ type: "text" })
  player_id!: string;

  @PrimaryColumn({ type: "bigint" })
  block_number!: number;

  @Column({ type: "text" })
  team_id!: string;

  @Column({ type: "int" })
  defence!: number;

  @Column({ type: "int" })
  speed!: number;

  @Column({ type: "int" })
  pass!: number;

  @Column({ type: "int" })
  shoot!: number;

  @Column({ type: "int" })
  endurance!: number;

  @Column({ type: "int" })
  shirt_number!: number;

  @Column({ type: "text" })
  preferred_position!: string;

  @Column({ type: "int" })
  potential!: number;

  @Column({ type: "int" })
  day_of_birth!: number;

  @Column({ type: "text" })
  encoded_skills!: string;

  @Column({ type: "text" })
  encoded_state!: string;

  @Column({ type: "boolean", default: false })
  red_card!: boolean;

  @Column({ type: "int", default: 0 })
  injury_matches_left!: number;

  @Column({ type: "int" })
  tiredness!: number;

  @Column({ type: "text" })
  country_of_birth!: string;

  @Column({ type: "text" })
  race!: string;

  @Column({ type: "boolean", default: false })
  yellow_card_1st_half!: boolean;
}
