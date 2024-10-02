import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity('leagues')
export class League {
  
  @PrimaryColumn({ type: 'int' })
  timezone_idx!: number; 

  @PrimaryColumn({ type: 'int' })
  country_idx!: number;  

  @PrimaryColumn({ type: 'int' })
  league_idx!: number; 
}