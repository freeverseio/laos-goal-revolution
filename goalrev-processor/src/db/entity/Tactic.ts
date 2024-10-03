import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Team } from "./Team";

@Entity("tactics")
export class Tactics {

  @PrimaryColumn({ type: 'text' })
  team_id!: string;

  @Column({ type: 'int' })
  tactic_id!: number;

  @Column({ type: 'int' })
  shirt_0!: number;

  @Column({ type: 'int' })
  shirt_1!: number;

  @Column({ type: 'int' })
  shirt_2!: number;

  @Column({ type: 'int' })
  shirt_3!: number;

  @Column({ type: 'int' })
  shirt_4!: number;

  @Column({ type: 'int' })
  shirt_5!: number;

  @Column({ type: 'int' })
  shirt_6!: number;

  @Column({ type: 'int' })
  shirt_7!: number;

  @Column({ type: 'int' })
  shirt_8!: number;

  @Column({ type: 'int' })
  shirt_9!: number;

  @Column({ type: 'int' })
  shirt_10!: number;

  @Column({ type: 'int' })
  substitution_0_shirt!: number;

  @Column({ type: 'int' })
  substitution_0_target!: number;

  @Column({ type: 'int' })
  substitution_0_minute!: number;

  @Column({ type: 'int' })
  substitution_1_shirt!: number;

  @Column({ type: 'int' })
  substitution_1_target!: number;

  @Column({ type: 'int' })
  substitution_1_minute!: number;

  @Column({ type: 'int' })
  substitution_2_shirt!: number;

  @Column({ type: 'int' })
  substitution_2_target!: number;

  @Column({ type: 'int' })
  substitution_2_minute!: number;

  @Column({ type: 'boolean' })
  extra_attack_1!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_2!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_3!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_4!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_5!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_6!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_7!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_8!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_9!: boolean;

  @Column({ type: 'boolean' })
  extra_attack_10!: boolean;

  // Define the foreign key relationship to the Team entity
  @ManyToOne(() => Team)
  @JoinColumn({ name: "team_id", referencedColumnName: "team_id" })
  team!: Team;
}
