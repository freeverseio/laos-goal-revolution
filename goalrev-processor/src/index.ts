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
    const lockExpired = new Date(now.getTime() - 10 * 60 * 1000);
    if (lastPlayMatches > lockExpired) {
      console.log(`[playMatches] -- Skipping playMatches. Last play matches: ${lastPlayMatches.toLocaleString('en-GB', { timeZoneName: 'short' })}`);
      return;
    }
  }

  playMatchesRunning = true;
  lastPlayMatches = new Date();
  const date = lastPlayMatches.toISOString();
  try {
    console.log('[playMatches] Begin playing matches at ' + date);
    const matchService = MatchFactory.createMatchService();
    const result = await matchService.playMatches();
    
    console.log('[playMatches] End calling playMatches at ', date, result);
    const timeElapsed = new Date().getTime() - lastPlayMatches.getTime();
    const seconds = Math.floor(timeElapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    console.log(`[playMatches] Time elapsed to play matches: ${hours}:${minutes}:${seconds} (h:m:s)`);       
    playMatchesRunning = false;

  } catch (error) {    
    console.error('[playMatches] Error calling playMatches at ', date);
    console.error('[playMatches] Error: ', error);
    playMatchesRunning = false;
  }
}

AppDataSource.initialize()
  .then(async () => { 
    const playMatchesScheduler = process.env.PLAY_MATCHES_SCHEDULER;
    if (!playMatchesScheduler) {
      throw new Error("PLAY_MATCHES_SCHEDULER is not set");
    }
    cron.schedule(playMatchesScheduler, () => { // 50 seconds
      playMatches();
    });
   
    app.listen(process.env.APP_PORT, () => {
      console.log(`Server is running on port ${process.env.APP_PORT}`);
    });
  })
  .catch((error) => console.log("Error: ", error));
