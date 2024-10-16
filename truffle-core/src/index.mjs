import ganache from 'ganache';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

let ganacheServer;

// Ganache configuration with deterministic mnemonic
const ganacheOptions = {
  port: 8545,
  gasLimit: 8000000,  // Set a fixed gas limit for consistency
  gasPrice: 20000000000,  // Fixed gas price (20 Gwei)
  mnemonic: "myth like bonus scare over problem client lizard pioneer submit female collect", // Fixed mnemonic
  network_id: 5777,  // Fixed network id
};

// Start Ganache Programmatically
async function startGanache() {
  return new Promise((resolve, reject) => {
    ganacheServer = ganache.server(ganacheOptions);
    ganacheServer.listen(8545, (err) => {
      if (err) return reject(err);
      console.log("Ganache started on port 8545 with deterministic settings");
      resolve();
    });
  });
}

// Run Truffle Migrations
async function runMigrations() {
  try {
    const { stdout, stderr } = await execPromise('truffle migrate --network ganache');
    if (stderr) {
      console.error(`Migration error: ${stderr}`);
    }
    console.log(`Migration output: ${stdout}`);
    return stdout; // Return migration output for logging
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Main function to orchestrate the process
async function main() {
  try {
    // Start Ganache and run migrations sequentially
    await startGanache();
    await runMigrations();

    // Keep Ganache running and available on port 8545
    console.log("Ganache is running. You can now query it on http://localhost:8545");

  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1); // Exit with error code if something goes wrong
  }
}

// Start everything: Ganache -> Migrations
main();
