import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import dotenv from "dotenv";
import { MatchController } from "./controller/MatchController";

dotenv.config();

// Create and export the app
export const app = createExpressServer({
  controllers: [MatchController],
  validation: true,
});
