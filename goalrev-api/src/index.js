const express = require("express");
const { postgraphile } = require("postgraphile");
const program = require("commander");
const version = require("../package.json").version;
const mutationsPlugin = require("./mutations_plugin");
const mutationsWrapperPlugin =  require("./mutation_wrapper_plugin");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const permissionWrapperPlugin = require("./permission_wrapper_plugin");
const config = require('dotenv').config();

function obfuscatePasswordInConnectionString(connectionString) {
  const parts = connectionString.split('@');
  let isOfuscated = false;
  let obfuscatedCredentials = '';
  if (parts.length === 2) {
    const beforeAt = parts[0];
    const credentials = beforeAt.split(':');

    if (credentials.length === 3) {
      obfuscatedCredentials += credentials[0];
      obfuscatedCredentials += ':';
      obfuscatedCredentials += credentials[1];
      obfuscatedCredentials += '***';
      obfuscatedCredentials += `@${parts[1]}`;
      isOfuscated = true;
    } else {
      console.log(`Weird db string - credentials.length: ${credentials.length}`);
    }
  } else {
    console.log(`Weird db string - parts.length: ${parts.length}`);
  }
  if (isOfuscated) {
    return obfuscatedCredentials;
  }
  // Return the original connection string if it doesn't match the expected format
  return connectionString;
}

// Parsing command line arguments
const db_url = process.env.DATABASE_URL
program
  .version(version)
  .option("-p, --port <port>", "server port", "4000")
  // .option("-d, --databaseUrl <url>", "set the database url", "postgres://freeverse:freeverse@localhost:5432/cryptosoccer?sslmode=disable")
  .option("-d, --databaseUrl <url>", "set the database url", db_url)
  .option("-o, --enableCors <bool>", "enables some generous CORS settings for the GraphQL endpoint. There are some costs associated when enabling this, if at all possible try to put your API behind a reverse proxy", "false")
  .parse(process.argv)

const { port, databaseUrl, enableCors } = program;

console.log("--------------------------------------------------------");
console.log("port              : ", port);
console.log("databaseUrl       : ", obfuscatePasswordInConnectionString(databaseUrl));
console.log("enable CORS       : ", enableCors);
console.log("--------------------------------------------------------");

const app = express();

app.use(
  postgraphile(
    databaseUrl,
    "public",
    {
      enableCors: enableCors,
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      retryOnInitFail: true,
      appendPlugins: [
        ConnectionFilterPlugin,
        mutationsPlugin,
        mutationsWrapperPlugin,
        permissionWrapperPlugin,
      ],
      additionalGraphQLContextFromRequest: async (req, res) => {
        return {
          req,
          res
        };
      },
    }
  )
);

app.listen(port);
