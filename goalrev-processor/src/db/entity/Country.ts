import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('countries')
export class Country {
  @PrimaryColumn({ type: 'integer' })
  timezone_idx!: number;

  @PrimaryColumn({ type: 'integer' })
  country_idx!: number;
}
