import { DecodeMatchLog } from './DecodeMatchLog';
import { MatchLog } from '../../types';

describe('DecodeMatchLog', () => {
  const testData = [
    {
      encodedLog: "904625697166429907578684580254429362549174092576235409827636622758600564479",
      expected: {
        numberOfGoals: 15,
        gamePoints: 3,
        teamSumSkills: 16777215,
        trainingPoints: 4095,
        isHomeStadium: true,
        changesAtHalftime: 0,
        isCancelled: false,
        encodedMatchLog: "904625697166429907578684580254429362549174092576235409827636622758600564479",
      },
    },
    {
      encodedLog: "452312848583163519205360420064242222497338214976076956548505435227689901823",
      expected: {
        numberOfGoals: 15,
        gamePoints: 3,
        teamSumSkills: 16777215,
        trainingPoints: 4095,
        isHomeStadium: false,
        changesAtHalftime: 0,
        isCancelled: false,
        encodedMatchLog: "452312848583163519205360420064242222497338214976076956548505435227689901823",
      },
    },
    {
      encodedLog: "3166189940082761849445305381205365062808353480577027676223292560413153877759",
      expected: {
        numberOfGoals: 15,
        gamePoints: 3,
        teamSumSkills: 16777215,
        trainingPoints: 4095,
        isHomeStadium: false,
        changesAtHalftime: 3,
        isCancelled: false,
        encodedMatchLog: "3166189940082761849445305381205365062808353480577027676223292560413153877759",
      },
    },
  ];

  testData.forEach(({ encodedLog, expected }, index) => {
    it(`should decode match log correctly for test case ${index + 1}`, () => {
      const result = DecodeMatchLog.decode(encodedLog);
      expect(result).toEqual(expected);
    });
  });
});
