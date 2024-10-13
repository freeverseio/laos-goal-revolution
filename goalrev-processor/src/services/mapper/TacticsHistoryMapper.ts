
import { Tactics, TacticsHistory } from "../../db/entity/";

export class TacticsHistoryMapper {
  static mapToTacticsHistory(tactics: Tactics, blockNumber: number): TacticsHistory {
    const tacticsHistory = new TacticsHistory();

    tacticsHistory.block_number = blockNumber;
    tacticsHistory.team_id = tactics.team_id;
    tacticsHistory.tactic_id = tactics.tactic_id;
    tacticsHistory.shirt_0 = tactics.shirt_0;
    tacticsHistory.shirt_1 = tactics.shirt_1;
    tacticsHistory.shirt_2 = tactics.shirt_2;
    tacticsHistory.shirt_3 = tactics.shirt_3;
    tacticsHistory.shirt_4 = tactics.shirt_4;
    tacticsHistory.shirt_5 = tactics.shirt_5;
    tacticsHistory.shirt_6 = tactics.shirt_6;
    tacticsHistory.shirt_7 = tactics.shirt_7;
    tacticsHistory.shirt_8 = tactics.shirt_8;
    tacticsHistory.shirt_9 = tactics.shirt_9;
    tacticsHistory.shirt_10 = tactics.shirt_10;
    tacticsHistory.substitution_0_shirt = tactics.substitution_0_shirt;
    tacticsHistory.substitution_0_target = tactics.substitution_0_target;
    tacticsHistory.substitution_0_minute = tactics.substitution_0_minute;
    tacticsHistory.substitution_1_shirt = tactics.substitution_1_shirt;
    tacticsHistory.substitution_1_target = tactics.substitution_1_target;
    tacticsHistory.substitution_1_minute = tactics.substitution_1_minute;
    tacticsHistory.substitution_2_shirt = tactics.substitution_2_shirt;
    tacticsHistory.substitution_2_target = tactics.substitution_2_target;
    tacticsHistory.substitution_2_minute = tactics.substitution_2_minute;
    tacticsHistory.extra_attack_1 = tactics.extra_attack_1;
    tacticsHistory.extra_attack_2 = tactics.extra_attack_2;
    tacticsHistory.extra_attack_3 = tactics.extra_attack_3;
    tacticsHistory.extra_attack_4 = tactics.extra_attack_4;
    tacticsHistory.extra_attack_5 = tactics.extra_attack_5;
    tacticsHistory.extra_attack_6 = tactics.extra_attack_6;
    tacticsHistory.extra_attack_7 = tactics.extra_attack_7;
    tacticsHistory.extra_attack_8 = tactics.extra_attack_8;
    tacticsHistory.extra_attack_9 = tactics.extra_attack_9;
    tacticsHistory.extra_attack_10 = tactics.extra_attack_10;

    return tacticsHistory;
  }
}
