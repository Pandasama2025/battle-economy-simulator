
// ���斗系统类型定义

export type UnitType = "Warrior" | "Mage" | "Archer" | "Knight" | "Priest" | "Assassin" | "Merchant";

export type ActionType = "attack" | "skill" | "defend" | "retreat" | "move" | "heal" | "buff" | "recover";

export type TargetType = "single" | "area" | "all" | "self" | "ally";

export type TerrainType = "plains" | "forest" | "mountain" | "desert" | "swamp" | "fire";

export interface Position {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  level: number;
  team: "alpha" | "beta";
  
  // 基础属性
  maxHP: number;
  currentHP: number;
  maxMana: number;
  currentMana: number;
  
  // 战斗属性
  attack: number;
  defense: number;
  magicPower: number;
  magicResistance: number;
  speed: number;
  critRate: number;
  critDamage: number;
  
  // 位置信息
  position: Position;
  
  // 战斗状态
  status: "idle" | "attacking" | "casting" | "defending" | "moving" | "stunned" | "dead";
  
  // 技能列表
  skills: Skill[];
  
  // 携带物品
  items: Item[];
  
  // 状态效果
  statusEffects?: StatusEffect[];
  
  // 战斗AI偏好
  aiPreferences?: {
    aggressiveness: number; // 0-1, 决定进攻倾向
    supportiveness: number; // 0-1, 决定辅助倾向
    targetSelection: "weakest" | "strongest" | "nearest" | "random";
    skillUsageThreshold: number; // 0-1, 使用技能的阈值
  };
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  damage: number;
  targetType: TargetType;
  range: number;
  areaOfEffect: number;
  effects: SkillEffect[];
}

export interface SkillEffect {
  type: "damage" | "heal" | "buff" | "debuff" | "stun" | "movement";
  value: number;
  duration?: number;
  chance?: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: "buff" | "debuff" | "dot" | "hot" | "stun" | "root";
  value: number;
  duration: number;
  sourceId: string; // 效果来源单位ID
  skillId?: string; // 效果来源技能ID
}

export interface Item {
  id: string;
  name: string;
  type: "weapon" | "armor" | "accessory" | "consumable";
  stats: {
    [key: string]: number;
  };
  effects?: {
    type: string;
    value: number;
    chance?: number;
  }[];
}

export interface TerrainEffect {
  type: TerrainType;
  name: string;
  description: string;
  unitTypeModifiers: {
    [key in UnitType]?: {
      attack?: number;
      defense?: number;
      speed?: number;
      magicPower?: number;
      magicResistance?: number;
    };
  };
  globalModifiers?: {
    visibility?: number;
    movementCost?: number;
    recoveryRate?: number;
  };
}

export interface BattleState {
  id: string;
  round: number;
  maxRounds: number;
  status: "preparing" | "inProgress" | "completed";
  teams: {
    alpha: Unit[];
    beta: Unit[];
  };
  terrain: {
    type: TerrainType;
    effects: {
      [key: string]: number;
    };
  };
  log: BattleLogEntry[];
  winner?: "alpha" | "beta" | "draw";
  environmentEffects: boolean;
}

export interface BattleLogEntry {
  round: number;
  timestamp: number;
  actorId: string;
  action: ActionType;
  targetId?: string;
  value?: number;
  skillId?: string;
  message: string;
}

export interface BattleConfiguration {
  roundTimeLimit: number;
  maxRounds: number;
  terrain: string;
  environmentEffects: boolean;
  combatParameters: {
    physicalDefense: number;
    magicResistance: number;
    criticalRate: number;
    healingEfficiency: number;
  };
}

export interface BattleStatistics {
  totalDamageDealt: {
    [unitId: string]: number;
  };
  totalDamageTaken: {
    [unitId: string]: number;
  };
  totalHealing: {
    [unitId: string]: number;
  };
  skillsUsed: {
    [skillId: string]: number;
  };
  statusEffectsApplied: {
    [effectType: string]: number;
  };
  criticalHits: {
    [unitId: string]: number;
  };
  killCount: {
    [unitId: string]: number;
  };
  deathCount: {
    [unitId: string]: number;
  };
  averageBattleDuration: number;
  roundsDistribution: {
    [round: number]: number;
  };
}
