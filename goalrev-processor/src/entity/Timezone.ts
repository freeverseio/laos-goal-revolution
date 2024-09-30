import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('timezones')
export class Timezone {
  @PrimaryGeneratedColumn()
  timezone_idx!: number; // Primary key for the timezone table
}
