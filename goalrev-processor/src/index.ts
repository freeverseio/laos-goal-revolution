import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import { MatchController } from "./controller/MatchController";

import { AppDataSource } from "./db/AppDataSource";
import { MatchEvent } from "./db/entity/MatchEvent";
import { countryRepository, CountryCustomRepository } from "./db/repository/CountryRepository";

const app = createExpressServer({
  controllers: [MatchController], // register controllers here
});

AppDataSource.initialize()
  .then(async () => {
   
    const port = 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log("Error: ", error));
