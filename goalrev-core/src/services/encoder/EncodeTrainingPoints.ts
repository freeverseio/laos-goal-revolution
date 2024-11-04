import { TrainingRequest } from "../../types";

export class EncodeTrainingPoints {
  static encode(trainingRequest: TrainingRequest): string {
    let encoded = BigInt(0);

    // Encode trainingPoints (9 bits)
    encoded |= BigInt(trainingRequest.trainingPoints) << BigInt(225);

    // Encode specialPlayerShirt (5 bits)
    const specialPlayer = (trainingRequest.specialPlayerShirt != null && trainingRequest.specialPlayerShirt >= 0)
      ? trainingRequest.specialPlayerShirt
      : 25;
    encoded |= BigInt(specialPlayer) << BigInt(234);

    // Helper function to encode skills
    const encodeSkills = (skills: { defence: number; speed: number; pass: number; shoot: number; endurance: number } | undefined, offset: number) => {
      if (!skills) return;
      encoded |= BigInt(skills.shoot) << BigInt(offset + 0 * 9);
      encoded |= BigInt(skills.speed) << BigInt(offset + 1 * 9);
      encoded |= BigInt(skills.pass) << BigInt(offset + 2 * 9);
      encoded |= BigInt(skills.defence) << BigInt(offset + 3 * 9);
      encoded |= BigInt(skills.endurance) << BigInt(offset + 4 * 9);
    };

    // Encode skills for each bucket (9 bits per skill)
    encodeSkills(trainingRequest.goalkeepers, 0);
    encodeSkills(trainingRequest.defenders, 45);
    encodeSkills(trainingRequest.midfielders, 90);
    encodeSkills(trainingRequest.attackers, 135);
    encodeSkills(trainingRequest.specialPlayer, 180);

    return encoded.toString();
  }
}