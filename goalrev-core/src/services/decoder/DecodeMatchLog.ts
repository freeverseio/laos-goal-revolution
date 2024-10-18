import { MatchLog } from "../../types";

export class DecodeMatchLog {
  static decode(encodedMatchLog: string): MatchLog {
    try {
      if (!encodedMatchLog || isNaN(Number(encodedMatchLog))) {
        throw new Error("Invalid encoded match log input.");
      }

      const log = BigInt(encodedMatchLog);

      const numberOfGoals = Number(log & BigInt(15));
      if (numberOfGoals < 0 || numberOfGoals > 15) {
        throw new Error("Number of goals is out of valid range (0-15).");
      }

      const winner = Number((log >> BigInt(210)) & BigInt(3));
      const gamePoints = winner;

      const teamSumSkills = Number((log >> BigInt(212)) & BigInt(16777215)); // 2^24 - 1
      if (teamSumSkills < 0 || teamSumSkills > 16777215) {
        throw new Error("Team sum skills is out of valid range (0-16777215).");
      }

      const trainingPoints = Number((log >> BigInt(236)) & BigInt(4095)); // 2^12 - 1
      if (trainingPoints < 0 || trainingPoints > 4095) {
        throw new Error("Training points are out of valid range (0-4095).");
      }

      const isHomeStadium = ((log >> BigInt(248)) & BigInt(1)) === BigInt(1);
      const changesAtHalftime = Number((log >> BigInt(249)) & BigInt(3));
      if (changesAtHalftime < 0 || changesAtHalftime > 3) {
        throw new Error("Changes at halftime value is out of valid range (0-3).");
      }

      const isCancelled = ((log >> BigInt(251)) & BigInt(1)) === BigInt(1);

      return {
        numberOfGoals,
        gamePoints,
        teamSumSkills,
        trainingPoints,
        isHomeStadium,
        changesAtHalftime,
        isCancelled,
        encodedMatchLog: encodedMatchLog.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode match log: ${error}`);
    }
  }
}
