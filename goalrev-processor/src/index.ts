import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import { MatchController } from "./controller/MatchController";
import { AppDataSource } from "./db/AppDataSource";
import dotenv from "dotenv";
import { LeagueController } from "./controller/LeagueController";
import { CalendarController } from "./controller/CalendarController";
import * as cron from 'node-cron';
import { MatchFactory } from "./factories/MatchFactory";
import { TeamController } from "./controller/TeamController";

dotenv.config();

const app = createExpressServer({
  controllers: [MatchController, CalendarController, LeagueController, TeamController], // register controllers here
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

    if (result && result.verseTimestamp) {
      console.log(` verseNumber: ${result.verseNumber}, timezoneIdx: ${result.timezoneIdx}, matchDay ${result.matchDay}, halfTime: ${result.halfTime}, verseTimestamp to Date: ` + new Date(result.verseTimestamp * 1000).toLocaleString('en-GB', { timeZone: 'Europe/Madrid' }));
      console.log(` message: ${result.message}`);
    }
    const timeElapsed = new Date().getTime() - lastPlayMatches.getTime();
    const seconds = (timeElapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    console.log(` Time elapsed to play matches: ${hours}:${minutes}:${seconds} (h:m:s)`);
    playMatchesRunning = false;

  } catch (error) {
    console.error('[playMatches] Error calling playMatches at ', date);
    console.error('[playMatches] Error: ', error);
    playMatchesRunning = false;
  }
}

AppDataSource.initialize()
  .then(async () => {
    // const playMatchesScheduler = process.env.PLAY_MATCHES_SCHEDULER;
    // if (!playMatchesScheduler) {
    //   throw new Error("PLAY_MATCHES_SCHEDULER is not set");
    // }
    // cron.schedule(playMatchesScheduler, () => {
    //   playMatches();
    // });

    app.listen(process.env.APP_PORT, () => {
      console.log(`Server is running on port ${process.env.APP_PORT}`);
    });
  })
  .catch((error) => console.log("Error: ", error));
