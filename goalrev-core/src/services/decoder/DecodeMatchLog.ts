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

      const assisters = Array.from({ length: 12 }, (_, i) =>
        Number((log >> BigInt(4 + 4 * i)) & BigInt(15))
      );

      const shooters = Array.from({ length: 12 }, (_, i) =>
        Number((log >> BigInt(52 + 4 * i)) & BigInt(15))
      );

      const forwardPositions = Array.from({ length: 12 }, (_, i) =>
        Number((log >> BigInt(100 + 2 * i)) & BigInt(3))
      );

      const penalties = Array.from({ length: 7 }, (_, i) =>
        ((log >> BigInt(124 + i)) & BigInt(1)) === BigInt(1)
      );

      const outOfGamePlayers = [
        Number((log >> BigInt(131)) & BigInt(15)),
        Number((log >> BigInt(141)) & BigInt(15)),
      ];

      const outOfGameTypes = [
        Number((log >> BigInt(135)) & BigInt(3)),
        Number((log >> BigInt(145)) & BigInt(3)),
      ];

      const outOfGameRounds = [
        Number((log >> BigInt(137)) & BigInt(15)),
        Number((log >> BigInt(147)) & BigInt(15)),
      ];

      const yellowCards = Array.from({ length: 4 }, (_, i) =>
        Number((log >> BigInt(151 + 4 * i)) & BigInt(15))
      );

      const inGameSubsHappened = Array.from({ length: 6 }, (_, i) =>
        Number((log >> BigInt(167 + 2 * i)) & BigInt(3))
      );

      const halfTimeSubstitutions = Array.from({ length: 3 }, (_, i) =>
        Number((log >> BigInt(179 + 5 * i)) & BigInt(31))
      );

      const nDefs = [
        Number((log >> BigInt(194)) & BigInt(15)),
        Number((log >> BigInt(198)) & BigInt(15)),
      ];

      const nTotHalf = [
        Number((log >> BigInt(202)) & BigInt(15)),
        Number((log >> BigInt(206)) & BigInt(15)),
      ];

      const winner = Number((log >> BigInt(210)) & BigInt(3));

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
        penalties,
        outOfGamePlayers: outOfGamePlayers.map(String),
        outOfGameTypes: outOfGameTypes.map(String),
        outOfGameRounds: outOfGameRounds.map(String),
        yellowCards: yellowCards.map(String),
        inGameSubsHappened: inGameSubsHappened.map(String),
        halfTimeSubstitutions: halfTimeSubstitutions.map(String),
        nDefs: nDefs.map(String),
        nTotHalf: nTotHalf.map(String),
        winner: winner,
        teamSumSkills: teamSumSkills.toString(),
        trainingPoints: trainingPoints.toString(),
        isHomeStadium,
        changesAtHalftime: changesAtHalftime.toString(),
        isCancelled,
        encodedMatchLog: encodedMatchLog.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode match log: ${error}`);
    }
  }
}
