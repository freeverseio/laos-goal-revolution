import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("teams_histories")
export class TeamHistory {
  @PrimaryColumn({ type: "bigint" })
  block_number!: number;

  @PrimaryColumn({ type: "text" })
  team_id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "int" })
  timezone_idx!: number;

  @Column({ type: "int" })
  country_idx!: number;

  @Column({ type: "text" })
  owner!: string;

  @Column({ type: "int" })
  league_idx!: number;

  @Column({ type: "int" })
  team_idx_in_league!: number;

  @Column({ type: "int", default: 0 })
  points!: number;

  @Column({ type: "int", default: 0 })
  w!: number;

  @Column({ type: "int", default: 0 })
  d!: number;

  @Column({ type: "int", default: 0 })
  l!: number;

  @Column({ type: "int", default: 0 })
  goals_forward!: number;

  @Column({ type: "int", default: 0 })
  goals_against!: number;

  @Column({ type: "text", default: "0" })
  prev_perf_points!: string;

  @Column({ type: "text", default: "0" })
  ranking_points!: string;

  @Column({ type: "int", default: 0 })
  training_points!: number;

  @Column({ type: "text", default: "" })
  tactic!: string;

  @Column({ type: "text" })
  match_log!: string;

  @Column({ type: "boolean", default: false })
  is_zombie!: boolean;
}
