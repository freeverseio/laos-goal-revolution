import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Team } from "./Team";
import { MatchState } from "./Match"; // Assuming MatchState is defined as an enum

@Entity("matches_histories")
export class MatchHistory {
  @PrimaryColumn({ type: "int" })
  block_number!: number;

  @PrimaryColumn({ type: "int" })
  timezone_idx!: number;

  @PrimaryColumn({ type: "int" })
  country_idx!: number;

  @PrimaryColumn({ type: "int" })
  league_idx!: number;

  @PrimaryColumn({ type: "int" })
  match_day_idx!: number;

  @PrimaryColumn({ type: "int" })
  match_idx!: number;

  @Column({ type: "text" })
  home_team_id!: string;

  @Column({ type: "text" })
  visitor_team_id!: string;

  @Column({ type: "text" })
  seed!: string;

  @Column({ type: "int", default: 0 })
  home_goals!: number;

  @Column({ type: "int", default: 0 })
  visitor_goals!: number;

  @Column({ type: "int", default: 0 })
  home_teamsumskills!: number;

  @Column({ type: "int", default: 0 })
  visitor_teamsumskills!: number;

  @Column({ type: "enum", enum: MatchState })
  state!: MatchState;

  @Column({ type: "text" })
  state_extra!: string;

  @Column({ type: "bigint" })
  start_epoch!: number;


}
