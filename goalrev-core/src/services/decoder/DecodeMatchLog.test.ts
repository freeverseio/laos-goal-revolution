import { DecodeMatchLog } from './DecodeMatchLog';

describe('DecodeMatchLog', () => {
  const testData = [
    {
      encodedLog: "904625697166429907578684580254429362549174092576235409827636622758600564479",
      expected: {
        numberOfGoals: "15",
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
     
    }, {
      encodedLog: "452312848583337244297713205707748466433728451888360259471082036387425289570",
      expected: {
        numberOfGoals: "2",
        penalties: [
              false,
              false,
              false,
              false,
              false,
              false,
              false,
        ],
        outOfGamePlayers: ["9", "0"],
        outOfGameTypes: ["3", "0"],
        outOfGameRounds: ["9", "0"],
        yellowCards: ["9", "14", "0", "0"],
        inGameSubsHappened: ["0", "0", "0", "0", "0", "0"],
        halfTimeSubstitutions: ["0", "0", "0"],
        nDefs: ["6", "0"],
        nTotHalf: ["11", "0"],
        winner: "0",
        gamePoints: "0",
        teamSumSkills: "0",
        trainingPoints: "0",
        isHomeStadium: true,
        changesAtHalftime: "0",
        isCancelled: false,
        encodedMatchLog: "452312848583337244297713205707748466433728451888360259471082036387425289570",
      }
    }
    // Update the remaining test cases similarly...
  ];

  testData.forEach(({ encodedLog, expected }, index) => {
    it(`should decode match log correctly for test case ${index + 1}`, () => {
      const result = DecodeMatchLog.decode(encodedLog);
      expect(result).toEqual(expected);
    });

    
  });
  it(`should decode match log correctly`, () => {
    const result = DecodeMatchLog.decode("455736703290365295140561448264374212021790334002775954726606799009497524883");
    //console.log(result);
  });

});
