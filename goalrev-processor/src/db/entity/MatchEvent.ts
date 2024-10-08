import { Entity, PrimaryColumn, Column, ManyToOne,  JoinColumn } from "typeorm";


enum EventType {
  ATTACK = "attack",
  YELLOW_CARD = "yellow_card",
  RED_CARD = "red_card",
  INJURY_SOFT = "injury_soft",
  INJURY_HARD = "injury_hard",
  SUBSTITUTION = "substitution"
}
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

  @PrimaryColumn({ type: 'text' })
  team_id!: string;

  @Column({ type: "enum", enum: EventType })
  type!: EventType;

  @Column()
  manage_to_shoot!: boolean;

  @Column()
  is_goal!: boolean;

  @Column({ nullable: true })
  primary_player_id?: string;

  @Column({ nullable: true })
  secondary_player_id?: string;


}
