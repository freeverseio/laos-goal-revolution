import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import { MatchController } from "./controller/MatchController";
import { AppDataSource } from "./db/AppDataSource";
import dotenv from "dotenv";
import { LeagueController } from "./controller/LeagueController";
import { CalendarController } from "./controller/CalendarController";
import * as cron from 'node-cron';
import { MatchFactory } from "./factories/MatchFactory";

dotenv.config();

const app = createExpressServer({
  controllers: [MatchController, CalendarController, LeagueController], // register controllers here
});

let lastPlayMatches = new Date();
let playMatchesRunning = false;
async function playMatches() {
  // check lock
  if (playMatchesRunning) {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (lastPlayMatches > fiveMinutesAgo) {
      return;
    }
  }

  playMatchesRunning = true;
  lastPlayMatches = new Date();
  const date = lastPlayMatches.toISOString();
  try {
    console.log('Start playing matches at ' + date);
    const matchService = MatchFactory.createMatchService();
    const result = await matchService.playMatches();
    console.log('End calling playMatches at ', date, result);
    playMatchesRunning = false;
  } catch (error) {    
    console.error('Error calling playMatches at ', date , error);
    playMatchesRunning = false;
  }
}

AppDataSource.initialize()
  .then(async () => {    
    cron.schedule('*/50 * * * * *', () => { // 50 seconds
    //cron.schedule('*/2 * * * *', () => { // 2 minutes
      playMatches();
    });
   
    app.listen(process.env.APP_PORT, () => {
      console.log(`Server is running on port ${process.env.APP_PORT}`);
    });
  })
  .catch((error) => console.log("Error: ", error));
