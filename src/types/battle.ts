
// 战斗系统类型定义

export type UnitType = "Warrior" | "Mage" | "Archer" | "Knight" | "Priest" | "Assassin" | "Merchant";

export type ActionType = "attack" | "skill" | "defend" | "retreat" | "move" | "heal" | "buff" | "recover";

export type TargetType = "single" | "area" | "all" | "self" | "ally";

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

export interface BattleState {
  id: string;
  round: number;
  status: "preparing" | "inProgress" | "completed";
  teams: {
    alpha: Unit[];
    beta: Unit[];
  };
  terrain: {
    type: string;
    effects: {
      [key: string]: number;
    };
  };
  log: BattleLogEntry[];
  winner?: "alpha" | "beta" | "draw";
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
