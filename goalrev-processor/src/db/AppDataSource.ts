import { DataSource } from "typeorm";
import { MatchEvent, Country, Timezone, League } from "./entity";


export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "123456",
  database: "cryptosoccer",
  synchronize: false,
  logging: false,
  entities: [MatchEvent, Country, Timezone, League],
  migrations: [],
  subscribers: [],
});
