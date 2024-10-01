import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('params')
export class Param {
  
  @PrimaryColumn({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  value!: string;
}
