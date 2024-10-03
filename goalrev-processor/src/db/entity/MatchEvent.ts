import { Entity, PrimaryColumn, Column, ManyToOne,  JoinColumn } from "typeorm";
import { Match } from "./Match";
import { Team } from "./Team"; // Assuming you have a Team entity
import { Player } from "./Player"; // Assuming you have a Player entity

@Entity("match_events")
export class MatchEvent {

  // Composite primary keys
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

  @PrimaryColumn({ type: 'int' })
  minute!: number;

  @Column({ type: "enum", enum: ["attack", "yellow_card", "red_card", "injury_soft", "injury_hard", "substitution"] })
  type!: string;

  @Column()
  team_id!: string;

  @Column()
  manage_to_shoot!: boolean;

  @Column()
  is_goal!: boolean;

  @Column({ nullable: true })
  primary_player_id?: string;

  @Column({ nullable: true })
  secondary_player_id?: string;

  // ManyToOne relationship to Match, using composite keys
  @ManyToOne(() => Match, (match) => match.matchEvents)
  @JoinColumn([
    { name: "timezone_idx", referencedColumnName: "timezone_idx" },
    { name: "country_idx", referencedColumnName: "country_idx" },
    { name: "league_idx", referencedColumnName: "league_idx" },
    { name: "match_day_idx", referencedColumnName: "match_day_idx" },
    { name: "match_idx", referencedColumnName: "match_idx" }
  ])
  match!: Match;

  // ManyToOne relationship to Team
  @ManyToOne(() => Team)
  @JoinColumn({ name: "team_id", referencedColumnName: "team_id" })
  team!: Team;

  // ManyToOne relationships to Player for primary and secondary players
  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: "primary_player_id" })
  primaryPlayer?: Player;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: "secondary_player_id" })
  secondaryPlayer?: Player;
}
