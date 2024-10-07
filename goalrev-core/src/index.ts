import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import { MatchController } from "./controller/MatchController";
import { app } from "./app";
import dotenv from "dotenv";

dotenv.config();


app.listen(process.env.APP_PORT, () => {
  console.log(`Server is running on port ${process.env.APP_PORT}`);
});