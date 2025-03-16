
import { Unit, ActionType, TargetType } from "@/types/battle";

// 战斗单位AI决策系统
export class UnitAI {
  constructor(private unit: Unit) {}

  decideAction(): { action: ActionType; targetId?: string } {
    // 低生命值时的防御或逃跑行为
    if (this.unit.currentHP / this.unit.maxHP < 0.3) {
      return {
        action: Math.random() < 0.7 ? "defend" : "retreat",
      };
    }

    // 检查是否有敌人在攻击范围内
    const target = this.findTarget();
    if (target) {
      // 根据魔法值决定使用普通攻击还是技能
      if (this.unit.currentMana > 50) {
        return {
          action: "skill",
          targetId: target.id,
        };
      } else {
        return {
          action: "attack",
          targetId: target.id,
        };
      }
    }

    // 没有目标时前进
    return { action: "move" };
  }

  private findTarget(): Unit | null {
    // 这里会连接到战场状态来查找合适的目标
    // 简化实现，实际项目中需要连接到战场单位管理器
    return null;
  }

  // 评估当前场上威胁
  evaluateThreat(): number {
    // 根据敌方单位数量、类型和生命值计算威胁度
    return Math.random() * 100; // 示例实现
  }
}
