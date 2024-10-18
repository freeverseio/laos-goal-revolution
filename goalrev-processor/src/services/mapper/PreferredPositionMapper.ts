import { BirthTraits } from "../../types";


export class PreferredPositionMapper {
  static getPreferredPosition(birthTraits: BirthTraits): string | Error {
    const { forwardness, leftishness } = birthTraits;

    const forwardnessString = this.forwardnessToString(forwardness);
    if (forwardnessString instanceof Error) {
      return forwardnessString;
    }

    const leftishnessString = this.leftishnessToString(leftishness);
    if (leftishnessString instanceof Error) {
      return leftishnessString;
    }

    if (leftishnessString.length === 0) {
      return forwardnessString;
    }

    return `${forwardnessString} ${leftishnessString}`;
  }

  private static forwardnessToString(value: number): string | Error {
    switch (value) {
      case 0:
        return "GK";
      case 1:
        return "D";
      case 2:
        return "M";
      case 3:
        return "F";
      case 4:
        return "MD";
      case 5:
        return "MF";
      default:
        return new Error("unexistent forwardness");
    }
  }
  //  1	"R"
  // 2	"C"
  // 3	"CR"
  // 4	"L"
  // 5	"LR"
  // 6	"LC"
  // 7	"LCR"
  public static leftishnessToString(value: number): string | Error {
    if (value >= 8) {
      return new Error("unexistent leftishness");
    }

    let result = "";

    if ((value & (0x1 << 2)) !== 0) {
      result += "L";
    }
    if ((value & (0x1 << 1)) !== 0) {
      result += "C";
    }
    if ((value & 0x1) !== 0) {
      result += "R";
    }

    return result;
  }
}