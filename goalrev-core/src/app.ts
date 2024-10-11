import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import dotenv from "dotenv";
import { MatchController } from "./controller/MatchController";
import { LeagueController } from "./controller/LeagueController";

dotenv.config();

// Create and export the app
export const app = createExpressServer({
  controllers: [MatchController, LeagueController],
  validation: true,
});
