import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
} from "typeorm";

@Entity("match_events")
export class MatchEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  timezone_idx!: number;

  @Column()
  country_idx!: number;

  @Column()
  league_idx!: number;

  @Column()
  match_day_idx!: number;

  @Column()
  match_idx!: number;

  @Column()
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
}
