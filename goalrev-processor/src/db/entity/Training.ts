import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Team } from "./Team"; // Assuming you have a Team entity

@Entity("trainings")
export class Training {
  
  @PrimaryColumn({ type: 'text' })
  team_id!: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: "team_id", referencedColumnName: "team_id" })
  team!: Team;

  @Column({ type: 'int', default: 0 })
  special_player_shirt!: number;

  @Column({ type: 'int', default: 0 })
  goalkeepers_defence!: number;

  @Column({ type: 'int', default: 0 })
  goalkeepers_speed!: number;

  @Column({ type: 'int', default: 0 })
  goalkeepers_pass!: number;

  @Column({ type: 'int', default: 0 })
  goalkeepers_shoot!: number;

  @Column({ type: 'int', default: 0 })
  goalkeepers_endurance!: number;

  @Column({ type: 'int', default: 0 })
  defenders_defence!: number;

  @Column({ type: 'int', default: 0 })
  defenders_speed!: number;

  @Column({ type: 'int', default: 0 })
  defenders_pass!: number;

  @Column({ type: 'int', default: 0 })
  defenders_shoot!: number;

  @Column({ type: 'int', default: 0 })
  defenders_endurance!: number;

  @Column({ type: 'int', default: 0 })
  midfielders_defence!: number;

  @Column({ type: 'int', default: 0 })
  midfielders_speed!: number;

  @Column({ type: 'int', default: 0 })
  midfielders_pass!: number;

  @Column({ type: 'int', default: 0 })
  midfielders_shoot!: number;

  @Column({ type: 'int', default: 0 })
  midfielders_endurance!: number;

  @Column({ type: 'int', default: 0 })
  attackers_defence!: number;

  @Column({ type: 'int', default: 0 })
  attackers_speed!: number;

  @Column({ type: 'int', default: 0 })
  attackers_pass!: number;

  @Column({ type: 'int', default: 0 })
  attackers_shoot!: number;

  @Column({ type: 'int', default: 0 })
  attackers_endurance!: number;

  @Column({ type: 'int', default: 0 })
  special_player_defence!: number;

  @Column({ type: 'int', default: 0 })
  special_player_speed!: number;

  @Column({ type: 'int', default: 0 })
  special_player_pass!: number;

  @Column({ type: 'int', default: 0 })
  special_player_shoot!: number;

  @Column({ type: 'int', default: 0 })
  special_player_endurance!: number;
}
