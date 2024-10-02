import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Team } from "./Team";
import { League } from "./League";
import { MatchState } from "./Match"; 

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

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: "home_team_id" })
  homeTeam?: Team;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: "visitor_team_id" })
  visitorTeam?: Team;

  @Column({ type: "text" })
  seed!: string;

  @Column({ type: "int" })
  home_goals!: number;

  @Column({ type: "int" })
  visitor_goals!: number;

  @Column({ type: "int" })
  home_teamsumskills!: number;

  @Column({ type: "int" })
  visitor_teamsumskills!: number;

  @Column({
    type: "enum",
    enum: MatchState,
  })
  state!: MatchState;

  @Column({ type: "text" })
  state_extra!: string;

  @Column({ type: "bigint" })
  start_epoch!: number;

  @ManyToOne(() => League)
  @JoinColumn([
    { name: "timezone_idx" },
    { name: "country_idx" },
    { name: "league_idx" },
  ])
  league!: League;
}
