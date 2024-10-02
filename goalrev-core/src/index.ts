import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import { MatchController } from "./controller/MatchController";

const app = createExpressServer({
  controllers: [MatchController], // register controllers here
  validation: true,
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});