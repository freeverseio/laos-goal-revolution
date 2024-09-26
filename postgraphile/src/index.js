const express = require("express");
const { postgraphile } = require("postgraphile");
const program = require("commander");
const version = require("../package.json").version;
const mutationsPlugin = require("./mutations_plugin");
const mutationsWrapperPlugin =  require("./mutation_wrapper_plugin");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const config = require('dotenv').config();

// Parsing command line arguments
const db_url = process.env.DATABASE_URL
console.log("db_url: ", db_url)
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
console.log("databaseUrl       : ", databaseUrl);
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
      // disableDefaultMutations: true,
      appendPlugins: [
        ConnectionFilterPlugin,
        mutationsPlugin,
        mutationsWrapperPlugin,
      ],
    }
  )
);

app.listen(port);
