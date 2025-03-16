
export type UnitType = string;
export type RaceType = string;
export type ProfessionType = string;
export type FactionType = string;
export type TerrainType = "plains" | "forest" | "mountains" | "desert" | "snow" | "swamp" | "city" | "fire";
export type ActionType = 'move' | 'attack' | 'defend' | 'cast' | 'skill' | 'heal' | 'buff' | 'retreat' | 'recover' | 'passive';
export type TargetType = 'self' | 'ally' | 'enemy' | 'all';

export interface SkillEffect {
  type: 'stun' | 'debuff' | 'dot' | 'buff';
  value: number;
  chance?: number;
  duration?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  damage: number;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  effects?: SkillEffect[];
}

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
  skills?: Skill[];
  team: "alpha" | "beta";
  position?: {
    x: number;
    y: number;
  };
  status?: 'idle' | 'attacking' | 'defending' | 'casting' | 'moving' | 'stunned' | 'dead';
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
  action: ActionType;
  value?: number;
  message: string;
  skillId?: string;
}

export interface BattleConfiguration {
  combatParameters: {
    physicalDefense: number;
    magicResistance: number;
    criticalRate: number;
    healingEfficiency: number;
    [key: string]: number;
  };
  matchParameters?: {
    maxRounds: number;
    teamSize: number;
    environmentEffects: boolean;
  };
  terrainParameters?: {
    terrainEffectMultiplier: number;
  };
}
