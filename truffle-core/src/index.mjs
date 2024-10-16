import ganache from "ganache";
import { exec } from "child_process";
import { promisify } from "util";

// Promisify exec for modern async/await usage
const execPromise = promisify(exec);

let server;

// Start Ganache Programmatically
async function startGanache() {
  return new Promise((resolve, reject) => {
    server = ganache.server({ port: 8545 });
    server.listen(8545, (err) => {
      if (err) return reject(err);
      console.log("Ganache started on port 8545");
      resolve();
    });
  });
}

// Run Truffle Migrations
async function runMigrations() {
  try {
    const { stdout, stderr } = await execPromise("truffle migrate --network ganache");
    if (stderr) {
      console.error(`Migration error: ${stderr}`);
    }
    console.log(`Migration output: ${stdout}`);
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

// Main Function
async function main() {
  try {
    await startGanache();
    await runMigrations();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (server) {
      server.close(() => {
        console.log("Ganache server stopped.");
      });
    }
  }
}

main();
