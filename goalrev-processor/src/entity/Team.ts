import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("teams")
export class Team {
  @PrimaryColumn({ type: 'string' })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;
}