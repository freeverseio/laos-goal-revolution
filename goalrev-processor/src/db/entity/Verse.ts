import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Timezone } from "./Timezone"; // Assuming you have a Timezone entity already defined

@Entity("verses")
export class Verse {
  @PrimaryGeneratedColumn({ name: 'verse_id' })
  verseId!: number;

  @Column({ name: 'verse_number', type: 'int' })
  verseNumber!: number;

  @Column({ name: 'verse_timestamp', type: 'timestamp' })
  verseTimestamp!: Date;

  @Column({ name: 'timezone_idx', type: 'int' })
  timezoneIdx!: number;

  @Column({ name: 'root', type: 'varchar', length: 255, default: '0' })
  root!: string;

  @ManyToOne(() => Timezone)
  @JoinColumn({ name: 'timezone_idx', referencedColumnName: 'timezone_idx' })
  timezone!: Timezone;
}
