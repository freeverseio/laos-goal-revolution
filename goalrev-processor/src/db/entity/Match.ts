import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Team } from "./Team";
import { League } from "./League";
import { MatchEvent } from "./MatchEvent";

export enum MatchState {
  BEGIN = "begin",
  HALF = "half",
  END = "end",
  CANCELLED = "cancelled",
}

@Entity("matches")
export class Match {

  @PrimaryColumn({ type: 'int' })
  timezone_idx!: number;

  @PrimaryColumn({ type: 'int' })
  country_idx!: number;

  @PrimaryColumn({ type: 'int' })
  league_idx!: number;

  @PrimaryColumn({ type: 'int' })
  match_day_idx!: number;

  @PrimaryColumn({ type: 'int' })
  match_idx!: number;

  @Column({ type: 'text' })
  home_team_id!: string;

  @Column({ type: 'text' })
  visitor_team_id!: string;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: "home_team_id", referencedColumnName: "team_id" })
  homeTeam?: Team;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: "visitor_team_id", referencedColumnName: "team_id" })
  visitorTeam?: Team;

  @Column({ type: 'text', default: '' })
  seed!: string;

  @Column({ type: 'int', default: 0 })
  home_goals!: number;

  @Column({ type: 'int', default: 0 })
  visitor_goals!: number;

  @Column({ type: 'int', default: 0 })
  home_teamsumskills!: number;

  @Column({ type: 'int', default: 0 })
  visitor_teamsumskills!: number;

  @Column({
    type: "enum",
    enum: MatchState,
  })
  state!: MatchState;

  @Column({ type: 'text', default: '' })
  state_extra!: string;

  @Column({ type: 'bigint' })
  start_epoch!: number;

  @ManyToOne(() => League)
  @JoinColumn([{ name: "timezone_idx" }, { name: "country_idx" }, { name: "league_idx" }])
  league!: League;
}
