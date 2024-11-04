import { TrainingRequest } from "../../types";
import { EncodeTrainingPoints } from "./EncodeTrainingPoints";

describe('EncodeTrainingPoints', () => {
  const testData = [
    {
      encodedTPAssignment: "579854532917076746873910624714946855702109768676713012977276363397399041",
      TPperSkill: [
        1, 1, 0, 0, 0,
        1, 1, 0, 0, 0,
        1, 1, 0, 0, 0,
        1, 1, 0, 0, 0,
        1, 1, 0, 0, 0
      ],
      specialPlayer: 21,
      TP: 2,
      err: 0
    },
    {
      encodedTPAssignment: "579800613023741660956604367327376591768553336462730086632520089805520897",
      TPperSkill: [
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0
      ],
      specialPlayer: 21,
      TP: 1,
      err: 0
    },
    {
      encodedTPAssignment: "579854532917075963768689242223483045531213519263147702631388144811900930",
      TPperSkill: [
        2, 0, 0, 0, 0,
        2, 0, 0, 0, 0,
        2, 0, 0, 0, 0,
        2, 0, 0, 0, 0,
        2, 0, 0, 0, 0
      ],
      specialPlayer: 21,
      TP: 2,
      err: 0
    },
    {
      encodedTPAssignment: "579908452810410266580774117119589499293873702063565318630256199818280963",
      TPperSkill: [
        3, 0, 0, 0, 0,
        3, 0, 0, 0, 0,
        3, 0, 0, 0, 0,
        3, 0, 0, 0, 0,
        3, 0, 0, 0, 0
      ],
      specialPlayer: 21,
      TP: 3,
      err: 0
    },
    {
      encodedTPAssignment: "579908452810411049685995499611053309464769951477130628976144418403779074",
      TPperSkill: [
        2, 1, 0, 0, 0,
        2, 1, 0, 0, 0,
        2, 1, 0, 0, 0,
        2, 1, 0, 0, 0,
        2, 1, 0, 0, 0
      ],
      specialPlayer: 21,
      TP: 3,
      err: 0
    },
    {
      encodedTPAssignment: "579962372703744564795372369417898709552595159329265330067406711467016193",
      TPperSkill: [
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0,
        1, 0, 0, 0, 0
      ],
      specialPlayer: 21,
      TP: 4,
      err: 0
    },
    {
      encodedTPAssignment: "581904333010837480581002275697412515336674102113005658994096679113723912",
      TPperSkill: [
        8, 8, 8, 8, 8,
        8, 8, 8, 8, 8,
        8, 8, 8, 8, 8,
        8, 8, 8, 8, 8,
        8, 8, 8, 8, 8
      ],
      specialPlayer: 21,
      TP: 40,
      err: 0
    },
    {
      encodedTPAssignment: "581904438529218954846900017319585695708207551931882777114590236735705096",
      TPperSkill: [
        8, 8, 8, 8, 8,
        8, 8, 8, 8, 8,
        8, 8, 8, 8, 8,
        8, 8, 8, 8, 8,
        9, 8, 9, 9, 9
      ],
      specialPlayer: 21,
      TP: 40,
      err: 0
    },
    {
      encodedTPAssignment: "581905596551040918655833326684946888213903033721653058205969989931895811",
      TPperSkill: [
        3, 6, 4, 7, 20,
        3, 6, 4, 7, 20,
        3, 6, 4, 7, 20,
        3, 6, 4, 7, 20,
        3, 6, 4, 7, 20
      ],
      specialPlayer: 21,
      TP: 40,
      err: 0
    }
  ];

  testData.forEach(({ encodedTPAssignment, TPperSkill, specialPlayer, TP }, index) => {
    it(`should encode training points correctly for test case ${index + 1}`, () => {
      const trainingRequest = new TrainingRequest();
      trainingRequest.trainingPoints = TP;
      trainingRequest.specialPlayerShirt = specialPlayer;

      const [goalkeepers, defenders, midfielders, attackers, specialPlayerSkills] = [0, 1, 2, 3, 4].map(bucket => ({
        shoot: TPperSkill[bucket * 5 + 0],
        speed: TPperSkill[bucket * 5 + 1],
        pass: TPperSkill[bucket * 5 + 2],
        defence: TPperSkill[bucket * 5 + 3],
        endurance: TPperSkill[bucket * 5 + 4]
      }));

      trainingRequest.goalkeepers = goalkeepers;
      trainingRequest.defenders = defenders;
      trainingRequest.midfielders = midfielders;
      trainingRequest.attackers = attackers;
      trainingRequest.specialPlayer = specialPlayerSkills;

      const encodedTP = EncodeTrainingPoints.encode(trainingRequest);
      expect(encodedTP).toBe(encodedTPAssignment);
    });
  });
});
