import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, OneToOne, DeepPartial } from "typeorm";
import { Country, League, Player, Tactics, Training } from "./"; 


export enum MintStatus {
  NOT_MINTED = "not_minted",
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

@Entity("teams")
export class Team {

  @PrimaryColumn({ type: 'text' })
  team_id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', default: '' })
  manager_name!: string;

  @ManyToOne(() => Country)
  @JoinColumn([
    { name: "timezone_idx", referencedColumnName: "timezone_idx" },
    { name: "country_idx", referencedColumnName: "country_idx" }
  ])
  country!: Country;

  @ManyToOne(() => League, { cascade: true })
  @JoinColumn([
    { name: "timezone_idx", referencedColumnName: "timezone_idx" },
    { name: "country_idx", referencedColumnName: "country_idx" },
    { name: "league_idx", referencedColumnName: "league_idx" }
  ])
  league!: League;

  @OneToMany(() => Player, (player) => player.team, { cascade: true })
  players!: Player[];

  @OneToOne(() => Tactics, (tactic) => tactic.team, { cascade: true })
  tactics!: Tactics;

  @OneToOne(() => Training, (training) => training.team, { cascade: true })
  trainings!: Training;

  @Column({ type: 'int' })
  timezone_idx!: number;

  @Column({ type: 'int' })
  country_idx!: number;

  @Column({ type: 'text' })
  owner!: string;

  @Column({ type: 'int' })
  league_idx!: number;

  @Column({ type: 'int' })
  team_idx_in_league!: number;

  @Column({ type: 'int', default: 0 })
  leaderboard_position!: number;

  @Column({ type: 'int', default: 0 })
  points!: number;

  @Column({ type: 'int', default: 0 })
  w!: number;  // wins

  @Column({ type: 'int', default: 0 })
  d!: number;  // draws

  @Column({ type: 'int', default: 0 })
  l!: number;  // losses

  @Column({ type: 'int', default: 0 })
  goals_forward!: number;

  @Column({ type: 'int', default: 0 })
  goals_against!: number;

  @Column({ type: 'text', default: '0' })
  prev_perf_points!: string;

  @Column({ type: 'text', default: '0' })
  ranking_points!: string;

  @Column({ type: 'int', default: 0 })
  training_points!: number;

  @Column({ type: 'text', default: '' })
  tactic!: string;

  @Column({ type: 'text' })
  match_log!: string;

  @Column({ type: 'boolean', default: false })
  is_zombie!: boolean;

  @Column({ type: 'int', default: 0 })
  promo_timeout!: number;

  @Column({
    type: "enum",
    enum: MintStatus,
  })
  mint_status!: MintStatus;

}

export type TeamPartialUpdate = DeepPartial<Team>; 