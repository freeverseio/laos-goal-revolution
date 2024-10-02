import express from "express";
import { AppDataSource } from "./db/AppDataSource";
import { MatchEvent } from "./db/entity/MatchEvent";
import { countryRepository, CountryCustomRepository } from "./db/repository/CountryRepository";

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");

    // Routes
    app.get("/users", async (req, res) => {
      const matchEvents = await AppDataSource.getRepository(MatchEvent).find();
      res.json(matchEvents);
    });

    app.get("/countries", async (req, res) => {
      const totalCountries = await countryRepository.count();
      res.json(totalCountries);
    });

    app.post("/match-events", async (req, res) => {
      const matchEvent = new MatchEvent();
      matchEvent.timezone_idx = 1;
      matchEvent.country_idx = 2;
      matchEvent.league_idx = 3;
      matchEvent.match_day_idx = 4;
      matchEvent.match_idx = 5;
      matchEvent.minute = 10;
      matchEvent.type = "attack";
      matchEvent.team_id = "teamA";
      matchEvent.manage_to_shoot = true;
      matchEvent.is_goal = true;
      matchEvent.primary_player_id = "player1";
      matchEvent.secondary_player_id = "player2";

      const savedMatchEvent = await AppDataSource.getRepository(MatchEvent).save(matchEvent);
      res.json(savedMatchEvent);
    });

    const port = 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log("Error: ", error));
