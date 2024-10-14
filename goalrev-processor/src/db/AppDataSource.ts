import { DataSource } from "typeorm";
import { Match, MatchEvent, Country, Timezone, League, Team, Player, Tactics, Training, Verse, MatchHistory, PlayerHistory, TacticsHistory, TeamHistory } from "./entity";
import * as dotenv from "dotenv";

dotenv.config();

const isSSLEnabled = process.env.SSL_ENABLED !== "false"; // Check if SSL is enabled, defaults to true if not set

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "25060", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: isSSLEnabled
    ? {
        rejectUnauthorized: false,
        ca: process.env.SSL_CA_CERT || "certs/ca-certificate.crt",
      }
    : false, // Disable SSL if not enabled
  synchronize: false,  // Set to true if you want to automatically sync schema changes in development
  logging: false,
  entities: [ 
    MatchEvent, 
    Country, 
    Timezone, 
    League, 
    Team,
    TeamHistory,
    Match, 
    MatchHistory,
    Player, 
    PlayerHistory,
    Tactics, 
    TacticsHistory,
    Training, 
    Verse
  ],
  migrations: [],
  subscribers: [],
});
