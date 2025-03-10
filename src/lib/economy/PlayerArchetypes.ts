
// 玩家策略模拟

export interface PlayerArchetype {
  name: string;
  reRollRate: number;       // 重抽概率
  levelUpThreshold: number; // 升级阈值
  saveGoldThreshold: number; // 保留金币阈值
  buyUnitRatio: number;     // 购买单位意愿
  preferredUnits: string[]; // 偏好单位类型
  riskTolerance: number;    // 风险承受度 (0-1)
}

// 定义玩家原型
export const PLAYER_ARCHETYPES: Record<string, PlayerArchetype> = {
  "aggressive": {
    name: "Aggressive",
    reRollRate: 0.7,
    levelUpThreshold: 0.3,
    saveGoldThreshold: 10,
    buyUnitRatio: 0.8,
    preferredUnits: ["Warrior", "Assassin", "Mage"],
    riskTolerance: 0.8
  },
  "economy": {
    name: "Economy",
    reRollRate: 0.3,
    levelUpThreshold: 0.6,
    saveGoldThreshold: 30,
    buyUnitRatio: 0.4,
    preferredUnits: ["Merchant", "Knight", "Priest"],
    riskTolerance: 0.3
  },
  "balanced": {
    name: "Balanced",
    reRollRate: 0.5,
    levelUpThreshold: 0.5,
    saveGoldThreshold: 20,
    buyUnitRatio: 0.6,
    preferredUnits: ["Knight", "Archer", "Mage"],
    riskTolerance: 0.5
  },
  "flexible": {
    name: "Flexible",
    reRollRate: 0.6,
    levelUpThreshold: 0.4,
    saveGoldThreshold: 15,
    buyUnitRatio: 0.7,
    preferredUnits: ["Archer", "Assassin", "Priest"],
    riskTolerance: 0.6
  },
  "conservative": {
    name: "Conservative",
    reRollRate: 0.2,
    levelUpThreshold: 0.7,
    saveGoldThreshold: 40,
    buyUnitRatio: 0.3,
    preferredUnits: ["Knight", "Priest", "Merchant"],
    riskTolerance: 0.2
  },
  "opportunist": {
    name: "Opportunist",
    reRollRate: 0.8,
    levelUpThreshold: 0.2,
    saveGoldThreshold: 5,
    buyUnitRatio: 0.9,
    preferredUnits: ["Assassin", "Mage", "Warrior"],
    riskTolerance: 0.9
  }
};

// 玩家行为模拟器
export class PlayerBehaviorSimulator {
  constructor(private archetype: PlayerArchetype) {}

  // 模拟玩家回合决策
  simulateTurn(currentGold: number, currentLevel: number, availableUnits: string[]): { 
    action: "buy" | "reroll" | "levelup" | "save";
    unitToBuy?: string;
  } {
    // 决定是否优先储蓄
    if (currentGold < this.archetype.saveGoldThreshold) {
      return { action: "save" };
    }
    
    // 计算升级决策
    const shouldLevelUp = Math.random() < this.archetype.levelUpThreshold;
    if (shouldLevelUp && currentGold >= 4) {
      return { action: "levelup" };
    }
    
    // 查找偏好单位
    const preferredAvailable = availableUnits.filter(unit => 
      this.archetype.preferredUnits.includes(unit));
    
    // 如果有偏好单位且有足够金币
    if (preferredAvailable.length > 0 && Math.random() < this.archetype.buyUnitRatio && currentGold >= 3) {
      return { 
        action: "buy", 
        unitToBuy: preferredAvailable[Math.floor(Math.random() * preferredAvailable.length)]
      };
    }
    
    // 决定是否重抽
    if (Math.random() < this.archetype.reRollRate && currentGold >= 2) {
      return { action: "reroll" };
    }
    
    // 默认保存金币
    return { action: "save" };
  }
}
