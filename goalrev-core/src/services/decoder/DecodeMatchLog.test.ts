import { DecodeMatchLog } from './DecodeMatchLog';

describe('DecodeMatchLog', () => {
  const testData = [
    {
      encodedLog: "904625697166429907578684580254429362549174092576235409827636622758600564479",
      expected: {
        numberOfGoals: "15",
        assisters: ["15", "14", "13", "12", "15", "14", "13", "12", "15", "14", "13", "12"],
        shooters: ["15", "14", "13", "12", "15", "14", "13", "12", "15", "14", "13", "12"],
        forwardPositions: ["0", "1", "2", "3", "0", "1", "2", "3", "0", "1", "2", "3"],
        penalties: [true, false, true, false, true, false, true],
        outOfGamePlayers: ["14", "13"],
        outOfGameTypes: ["2", "3"],
        outOfGameRounds: ["14", "15"],
        yellowCards: ["14", "15", "15", "14"],
        inGameSubsHappened: ["3", "2", "3", "2", "3", "2"],
        halfTimeSubstitutions: ["31", "30", "31"],
        nDefs: ["14", "15"],
        nTotHalf: ["15", "14"],
        winner: "3",
        gamePoints: "3",
        teamSumSkills: "16777215",
        trainingPoints: "4095",
        isHomeStadium: true,
        changesAtHalftime: "0",
        isCancelled: false,
        encodedMatchLog: "904625697166429907578684580254429362549174092576235409827636622758600564479",
      },
    },
    // Update the remaining test cases similarly...
  ];

  testData.forEach(({ encodedLog, expected }, index) => {
    it(`should decode match log correctly for test case ${index + 1}`, () => {
      const result = DecodeMatchLog.decode(encodedLog);
      expect(result).toEqual(expected);
    });

    it(`should decode match log correctly and log the output for test case ${index + 1}`, () => {
      const result = DecodeMatchLog.decode(encodedLog);
      console.log(result);
    });
  });
});
