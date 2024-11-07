import { Column, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity("last_transfer")
export class LastTransfer {
  
  // Primary key with auto-increment (equivalent to SERIAL in SQL)
  @PrimaryGeneratedColumn()
  id!: number;

  // Block number stored as a BIGINT in the database
  @Column({ type: "bigint" })
  block_number!: number;

  // Transaction hash as a VARCHAR with a max length of 255
  @Column({ type: "varchar", length: 255 })
  tx_hash!: string;

  // Timestamp stored as a timestamp (date and time without timezone)
  @Column({ type: "timestamp" })
  timestamp!: Date;
}
