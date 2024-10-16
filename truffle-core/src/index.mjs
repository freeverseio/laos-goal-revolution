import express from 'express';
import ganache from 'ganache';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec for modern async/await usage
const execPromise = promisify(exec);

let ganacheServer;
const app = express();
const PORT = 3000;  // The port for your Express server

// Start Ganache Programmatically
async function startGanache() {
  return new Promise((resolve, reject) => {
    ganacheServer = ganache.server({ port: 8545 });
    ganacheServer.listen(8545, (err) => {
      if (err) return reject(err);
      console.log('Ganache started on port 8545');
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

// Stop Ganache
function stopGanache() {
  return new Promise((resolve) => {
    if (ganacheServer) {
      ganacheServer.close(() => {
        console.log('Ganache server stopped.');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Main function to orchestrate the process
async function main() {
  try {
    // Start Ganache and run migrations sequentially
    await startGanache();
    await runMigrations();

    // After migrations, start the Express server
    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1); // Exit with error code if something goes wrong
  }
}

// Express Routes
app.get('/stop-ganache', async (req, res) => {
  try {
    await stopGanache();
    res.send('Ganache stopped');
  } catch (error) {
    res.status(500).send(`Error stopping Ganache: ${error}`);
  }
});

// Start everything: Ganache -> Migrations -> Express
main();
