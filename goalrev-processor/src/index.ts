import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import { MatchController } from "./controller/MatchController";
import { AppDataSource } from "./db/AppDataSource";
import dotenv from "dotenv";
import { CalendarController } from "./controller/CalendarController";

dotenv.config();

const app = createExpressServer({
  controllers: [MatchController, CalendarController], // register controllers here
});

AppDataSource.initialize()
  .then(async () => {
   
    app.listen(process.env.APP_PORT, () => {
      console.log(`Server is running on port ${process.env.APP_PORT}`);
    });
  })
  .catch((error) => console.log("Error: ", error));
