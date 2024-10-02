import { DataSource } from "typeorm";
import { Match, MatchEvent, Country, Timezone, League, Team } from "./entity";
import * as dotenv from "dotenv";
import * as url from 'url';

// Load environment variables from .env file
dotenv.config();

// // Parse the DATABASE_URL
// const dbUrl = process.env.DATABASE_URL || "";
// const parsedUrl = url.parse(dbUrl);
// const [username, password] = (parsedUrl.auth || "").split(":");
// const host = parsedUrl.hostname;
// const port = parseInt(parsedUrl.port || "5432", 10);
// const database = parsedUrl.pathname ? parsedUrl.pathname.substr(1) : "defaultdb"; // Removes the leading '/'

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "db-postgresql-ams3-02994-do-user-14140340-0.j.db.ondigitalocean.com",
  port: 25060,
  username: "doadmin",
  password: "AVNS_Wi_dnDYPUVK4FF791iW",
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: false, // If you're using an SSL connection, ensure it's configured correctly
    ca: process.env.SSL_CA_CERT || "certs/ca-certificate.crt"
  },
  synchronize: false,  // Set to true if you want to automatically sync schema changes in development
  logging: false,
  entities: [ MatchEvent, Country, Timezone, League, Team,  Match],
  migrations: [],
  subscribers: [],
});

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: "localhost",
//   port: 5432,
//   username: "postgres",
//   password: "123456",
//   database: "cryptosoccer",
//   synchronize: false,
//   logging: false,
//   entities: [Match, MatchEvent, Country, Timezone, League],
//   migrations: [],
//   subscribers: [],
// });
