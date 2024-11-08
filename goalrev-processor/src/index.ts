// Import necessary modules and libraries
import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import dotenv from "dotenv";
import * as cron from 'node-cron';

import { AppDataSource } from "./db/AppDataSource";
import { MatchController } from "./controller/MatchController";
import { LeagueController } from "./controller/LeagueController";
import { CalendarController } from "./controller/CalendarController";
import { TeamController } from "./controller/TeamController";

import { MatchFactory } from "./factories/MatchFactory";
import { TeamFactory } from "./factories/TeamFactory";
import { TransferFactory } from "./factories/TransferFactory";
import { LockState } from "./types";

// Initialize environment variables
dotenv.config();

// Create the Express app with routing controllers
const app = createExpressServer({
  controllers: [MatchController, CalendarController, LeagueController, TeamController], // register controllers here
});


const locks: { [key: string]: LockState } = {};


async function runWithLock(taskName: string, task: () => Promise<void>, lockDurationMinutes = 10) {
  const lock = locks[taskName] || { isRunning: false, lastRunTime: new Date(0) };
  const now = new Date();
  const lockExpired = new Date(now.getTime() - lockDurationMinutes * 60 * 1000);

  // If task is already running and lock hasn't expired, skip execution
  if (lock.isRunning && lock.lastRunTime > lockExpired) {
    console.log(`[${taskName}] -- Skipping. Last run time: ${lock.lastRunTime.toLocaleString('en-GB', { timeZoneName: 'short' })}`);
    return;
  }

  // Lock the task and update last run time
  locks[taskName] = { isRunning: true, lastRunTime: now };

  try {
    console.log(`[${taskName}] -- Starting task at ${now.toISOString()}`);
    await task();
  } catch (error) {
    console.error(`[${taskName}] -- Error: `, error);
  } finally {
    // Release the lock after task completion
    locks[taskName].isRunning = false;
  }
}

/**
 * Plays the matches based on the defined logic
 */
async function playMatches() {
  const matchService = MatchFactory.createMatchService();
  const result = await matchService.playMatches();

  if (result && result.verseTimestamp) {
    console.log(`verseNumber: ${result.verseNumber}, timezoneIdx: ${result.timezoneIdx}, matchDay ${result.matchDay}, halfTime: ${result.halfTime}, verseTimestamp to Date: ` +
                new Date(result.verseTimestamp * 1000).toLocaleString('en-GB', { timeZone: 'Europe/Madrid' }));
    console.log(`message: ${result.message}`);
  }

  const timeElapsed = new Date().getTime() - locks["playMatches"].lastRunTime.getTime();
  const seconds = (timeElapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  console.log(`Time elapsed to play matches: ${hours}:${minutes}:${seconds} (h:m:s)`);
}

/**
 * Initializes scheduled tasks based on environment variables
 */
function initializeSchedulers() {
  // Play Matches Scheduler
  const playMatchesScheduler = process.env.PLAY_MATCHES_SCHEDULER;
  if (!playMatchesScheduler) throw new Error("PLAY_MATCHES_SCHEDULER is not set");
  cron.schedule(playMatchesScheduler, () => runWithLock("playMatches", playMatches));

  // Mint Pending Teams Scheduler
  const mintPendingTeamsScheduler = process.env.MINT_PENDING_TEAMS_SCHEDULER;
  if (!mintPendingTeamsScheduler) throw new Error("MINT_PENDING_TEAMS_SCHEDULER is not set");
  cron.schedule(mintPendingTeamsScheduler, () => runWithLock("mintPendingTeams", async () => {
    const teamService = TeamFactory.createTeamService();
    const result = await teamService.mintPendingTeams();
    console.log(`[mintPendingTeams] Result: ${result}`);
  }));

  // Sync Transfers Scheduler
  const syncTransfersScheduler = process.env.SYNC_TRANSFERS_SCHEDULER;
  if (!syncTransfersScheduler) throw new Error("SYNC_TRANSFERS_SCHEDULER is not set");
  cron.schedule(syncTransfersScheduler, () => runWithLock("syncTransfers", async () => {
    const transferService = TransferFactory.create();
    const result = await transferService.syncTransfers();
    console.log(`[syncTransfers] Result: ${result}`);
  }));
}

/**
 * Starts the application server
 */
function startServer() {
  const port = process.env.APP_PORT || 3000; // default port if not specified
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Initialize the data source and start the application
AppDataSource.initialize()
  .then(() => {
    initializeSchedulers();
    startServer();
  })
  .catch((error) => console.log("Error: ", error));
