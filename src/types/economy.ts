
// 经济系统类型定义

export interface Player {
  id: string;
  name: string;
  gold: number;
  level: number;
  experience: number;
  units: PlayerUnit[];
  items: PlayerItem[];
  archetype: PlayerArchetype;
  winStreak: number;
  loseStreak: number;
  rank: number;
}

export interface PlayerUnit {
  id: string;
  unitId: string;
  level: number;
  stars: number;
  position?: { x: number; y: number; };
  items: string[]; // 装备的物品ID
}

export interface PlayerItem {
  id: string;
  itemId: string;
  count: number;
  equipped: boolean;
  equippedOn?: string; // 装备在哪个单位上
}

export type PlayerArchetype = "aggressive" | "economy" | "balanced" | "flexible" | "conservative" | "opportunist";

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  quantity: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  type: "unit" | "equipment" | "consumable" | "upgrade";
  stats?: {
    [key: string]: number;
  };
}

export interface EconomyState {
  roundNumber: number;
  phase: "preparation" | "combat" | "shopping";
  players: Player[];
  market: MarketItem[];
  interestRate: number;
  incomeBase: number;
  streakBonus: {
    win: number[];
    lose: number[];
  };
  globalEvents: EconomyEvent[];
}

export interface EconomyEvent {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: {
    type: "marketPrice" | "dropRate" | "unitStats" | "goldIncome" | "expGain";
    target: string; // 目标ID或"all"
    modifier: number;
  }[];
  active: boolean;
  roundsLeft: number;
}

export interface EconomyConfiguration {
  // Required properties
  startingGold: number;
  interestThresholds: number[];
  interestCap: number;
  levelCosts: number[];
  unitPoolSize: {
    [key: string]: number;
  };
  itemPoolSize: {
    [key: string]: number;
  };
  roundIncome: {
    base: number;
    winBonus: number;
    loseBonus: number;
  };
  sellingReturn: number; // 卖出回收比例，如0.7表示70%
  
  // Optional extended economy configuration
  goldScaling?: number;
  unitCost?: number;
  interestRate?: number;
  marketVolatility?: number;
  priceFluctuation?: number;
}

export interface BalanceData {
  unitWinRates: {
    [key: string]: number;
  };
  itemUsage: {
    [key: string]: number;
  };
  averageGoldPerRound: number[];
  compositionDiversity: number;
  comebackRate: number;
  economyImpact: number;
  averageBattleDuration: number;
  topCompositions: {
    units: string[];
    winRate: number;
    playRate: number;
  }[];
}
