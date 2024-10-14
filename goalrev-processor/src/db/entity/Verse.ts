import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Timezone } from "./Timezone"; // Assuming you have a Timezone entity already defined

@Entity("verses")
export class Verse {
  @PrimaryColumn({ name: 'verse_number', type: 'int' })
  verseNumber!: number;

  @Column({ name: 'verse_timestamp', type: 'bigint' })
  verseTimestamp!: number;

  @Column({ name: 'timezone_idx', type: 'int' })
  timezoneIdx!: number;

  @Column({ name: 'root', type: 'varchar', length: 255, default: '0' })
  root!: string;

  @ManyToOne(() => Timezone)
  @JoinColumn({ name: 'timezone_idx', referencedColumnName: 'timezone_idx' })
  timezone!: Timezone;
}
