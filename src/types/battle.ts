export type UnitType = string;
export type RaceType = string;
export type ProfessionType = string;
export type FactionType = string;
export type TerrainType = "plains" | "forest" | "mountains" | "desert" | "snow" | "swamp" | "city";

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  race?: RaceType;
  profession?: ProfessionType;
  faction?: FactionType;
  level: number;
  attack: number;
  defense: number;
  magicPower: number;
  magicResistance: number;
  speed: number;
  maxHP: number;
  currentHP: number;
  maxMana?: number;
  currentMana?: number;
  critRate: number;
  critDamage: number;
  abilities?: string[];
  team: "alpha" | "beta";
  position?: {
    x: number;
    y: number;
  };
}

export interface BattleState {
  id: string;
  round: number;
  maxRounds: number;
  status: 'preparing' | 'inProgress' | 'completed';
  teams: {
    alpha: Unit[];
    beta: Unit[];
  };
  terrain: {
    type: TerrainType;
    effects: Record<string, number>;
  };
  log: BattleLogEntry[];
  environmentEffects: boolean;
  turnPhase: 'preparation' | 'action';
  phaseTime: number;
  matchups: {
    alpha: string;
    beta: string;
  }[];
  winner?: 'alpha' | 'beta' | 'draw';
}

export interface BattleLogEntry {
  round: number;
  timestamp: number;
  actorId: string;
  targetId?: string;
  action: 'move' | 'attack' | 'defend' | 'cast' | 'item' | 'passive';
  value?: number;
  message: string;
}
