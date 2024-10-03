import { DataSource } from "typeorm";
import { Match, MatchEvent, Country, Timezone, League, Team } from "./entity";
import * as dotenv from "dotenv";
import * as url from 'url';
import { Player } from "./entity/Player";

// Load environment variables from .env file
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "25060", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // If you're using an SSL connection, ensure it's configured correctly
    ca: process.env.SSL_CA_CERT || "certs/ca-certificate.crt"
  },
  synchronize: false,  // Set to true if you want to automatically sync schema changes in development
  logging: false,
  entities: [ MatchEvent, Country, Timezone, League, Team,  Match, Player],
  migrations: [],
  subscribers: [],
});

