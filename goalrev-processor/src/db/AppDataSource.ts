import { DataSource } from "typeorm";
import { Match, MatchEvent, Country, Timezone, League, Team, Player, Tactics, Training } from "./entity";
import * as dotenv from "dotenv";

dotenv.config();


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "25060", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.SSL_CA_CERT || "certs/ca-certificate.crt"
  },
  synchronize: false,  // Set to true if you want to automatically sync schema changes in development
  logging: false,
  entities: [ MatchEvent, Country, Timezone, League, Team,  Match, Player, Tactics, Training],
  migrations: [],
  subscribers: [],
});

