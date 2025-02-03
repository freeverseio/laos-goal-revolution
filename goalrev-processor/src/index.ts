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
import { PlayerFactory } from "./factories/PlayerFactory";

// Initialize environment variables
dotenv.config();

// Create the Express app with routing controllers
const app = createExpressServer({
  controllers: [MatchController, CalendarController, LeagueController, TeamController], // register controllers here
});


const locks: { [key: string]: LockState } = {};


async function runWithLock(taskName: string, task: () => Promise<void>, lockDurationMinutes: number = 10) {
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
  const seconds = Math.floor(timeElapsed / 1000);
  console.log(`Time elapsed to play matches: ${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')} (h:mm:ss)`);
}

async function mintTeamsPending() {
  const teamService = TeamFactory.createTeamService();
  const result = await teamService.mintTeamsPending();
  console.log(`[mintTeamsPending] Result: ${result}`);
  return result > 0;
}

async function evolvePlayersPending() {
  const playerService = PlayerFactory.createPlayerService();
  const resultEvolve = await playerService.evolvePlayersPending();
  console.log(`[evolvePlayersPending] Result: ${resultEvolve}`);
  return resultEvolve > 0;
}

/**
 * Initializes scheduled tasks based on environment variables
 */
function initializeSchedulers() {
  // Play Matches Scheduler
  const playMatchesScheduler = process.env.PLAY_MATCHES_SCHEDULER;
  if (playMatchesScheduler && playMatchesScheduler !== "*/0 * * * * *" && playMatchesScheduler !== "") {
    cron.schedule(playMatchesScheduler, () => runWithLock("playMatches", playMatches, 5760)); // 4 days
  }

  // Mint Pending Teams Scheduler
  const mintTeamsPendingScheduler = process.env.MINT_PENDING_TEAMS_SCHEDULER;
  if (mintTeamsPendingScheduler && mintTeamsPendingScheduler !== "*/0 * * * * *" && mintTeamsPendingScheduler !== "") {
    cron.schedule(mintTeamsPendingScheduler, () => runWithLock("mintTeamsPendingAndEvolvePlayers", async () => {
      while (true) {
        const teamsMinted = await mintTeamsPending();
        if (teamsMinted){
          // Extend lock time and trigger mintTeamsPending again
          locks["mintTeamsPendingAndEvolvePlayers"].lastRunTime = new Date();
          continue;
        }

        const playersEvolved = await evolvePlayersPending(); 
        if (playersEvolved) {
          // Extend lock time and trigger mintTeamsPending again
          locks["mintTeamsPendingAndEvolvePlayers"].lastRunTime = new Date();
          continue;
        }
        
        break; // No teams or players pending to process -> exit loop
      }      
    }));
  }
  
  // Broadcast Players Pending Scheduler
  const broadcastPlayersPendingScheduler = process.env.BROADCAST_PLAYERS_PENDING_SCHEDULER;
  if (broadcastPlayersPendingScheduler && broadcastPlayersPendingScheduler !== "*/0 * * * * *" && broadcastPlayersPendingScheduler !== "") {
    cron.schedule(broadcastPlayersPendingScheduler, () => runWithLock("broadcastPlayersPending", async () => {
      const playerService = PlayerFactory.createPlayerService();
      const result = await playerService.broadcastPlayersPending();
      console.log(`[broadcastPlayersPending] Result: ${result}`);
    }));
  }

  // Sync Transfers Scheduler
  const syncTransfersScheduler = process.env.TRANSFER_SCHEDULER;
  if (syncTransfersScheduler && syncTransfersScheduler !== "*/0 * * * * *" && syncTransfersScheduler !== "") {
    cron.schedule(syncTransfersScheduler, () => runWithLock("syncTransfers", async () => {
      const transferService = TransferFactory.create();
      const result = await transferService.syncTransfers();
      console.log(`[syncTransfers] Result: ${result}`);
    }));
  }  

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
