import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BattleState, Unit, UnitType, RaceType, ProfessionType, TerrainType } from '@/types/battle';
import { useToast } from '@/hooks/use-toast';
import { PerformanceMonitor } from '@/lib/utils/PerformanceMonitor';
import { useGameConfig } from '@/hooks/use-game-config';

export interface Bond {
  id: string;
  name: string;
  description: string;
  requiredTypes: string[];
  minUnits: number;
  effects: {
    type: 'buff' | 'debuff';
    value: number;
    target: 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate';
  }[];
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  color: string;
  bonuses: {
    type: 'buff' | 'debuff';
    value: number;
    target: 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate';
  }[];
}

// 修改平衡参数接口，添加索引签名
export interface BalanceParameters {
  physicalDefense: number;
  magicResistance: number;
  criticalRate: number;
  healingEfficiency: number;
  goldScaling: number;
  interestRate: number;
  [key: string]: number; // 添加索引签名
}

interface GameContextProps {
  battleState: BattleState | null;
  setBattleState: React.Dispatch<React.SetStateAction<BattleState | null>>;
  addUnit: (unit: Omit<Unit, "id">) => void;
  removeUnit: (unitId: string) => void;
  startBattle: () => void;
  pauseBattle: () => void;
  resumeBattle: () => void;
  resetBattle: () => void;
  isSimulating: boolean;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  performance: PerformanceMonitor;
  bonds: Bond[];
  addBond: (bond: Omit<Bond, 'id'>) => void;
  updateBond: (id: string, bond: Bond) => void;
  deleteBond: (id: string) => void;
  factions: Faction[];
  addFaction: (faction: Omit<Faction, 'id'>) => void;
  updateFaction: (id: string, faction: Faction) => void;
  deleteFaction: (id: string) => void;
  units: Unit[];
  updateUnit: (id: string, unit: Unit) => void;
  deleteUnit: (id: string) => void;
  isSimulationRunning: boolean;
  activeTerrain: TerrainType;
  setTerrain: (terrain: TerrainType) => void;
  advanceBattleRound: () => void;
  battleLog: Array<{message: string}>;
  balanceParameters: BalanceParameters;
  setBalanceParameters: React.Dispatch<React.SetStateAction<BalanceParameters>>;
  saveUnits: () => void;
  loadUnits: () => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const useGameContext = useGame;

// 默认平衡参数
const DEFAULT_BALANCE_PARAMETERS: BalanceParameters = {
  physicalDefense: 0.035,
  magicResistance: 0.028,
  criticalRate: 0.15,
  healingEfficiency: 1.0,
  goldScaling: 1.2,
  interestRate: 0.1
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useGameConfig();
  
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [activeTerrain, setActiveTerrain] = useState<TerrainType>("plains");
  const [battleLog, setBattleLog] = useState<Array<{message: string}>>([]);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const performanceMonitor = useRef(new PerformanceMonitor()).current;
  const { toast } = useToast();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  // 使用游戏配置中的平衡参数
  const [balanceParameters, setBalanceParameters] = useState<BalanceParameters>(
    config.balanceParameters || DEFAULT_BALANCE_PARAMETERS
  );
  
  // 当配置的平衡参数变化时更新本地状态
  useEffect(() => {
    setBalanceParameters(config.balanceParameters);
  }, [config.balanceParameters]);

  // Load units from localStorage on initialization
  useEffect(() => {
    loadUnits();
  }, []);

  const initBattleState = useCallback(() => {
    const initialState: BattleState = {
      id: `battle-${Math.random().toString(36).substring(2, 9)}`,
      round: 1,
      maxRounds: 20,
      status: 'preparing',
      teams: {
        alpha: [],
        beta: [],
      },
      terrain: {
        type: activeTerrain,
        effects: {},
      },
      log: [],
      environmentEffects: true,
      turnPhase: 'preparation',
      phaseTime: 30,
      matchups: []
    };
    
    setBattleState(initialState);
  }, [activeTerrain]);

  const addUnit = useCallback((unit: Omit<Unit, "id">) => {
    const newUnit: Unit = {
      ...unit,
      id: `unit-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setUnits(prev => [...prev, newUnit]);
    setBattleState(prev => {
      if (!prev) return prev;
      
      const team = newUnit.team;
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [team]: [...prev.teams[team], newUnit]
        }
      };
    });
  }, []);

  const removeUnit = useCallback((unitId: string) => {
    setUnits(prev => prev.filter(u => u.id !== unitId));
    setBattleState(prev => {
      if (!prev) return prev;
      
      const alphaFiltered = prev.teams.alpha.filter(u => u.id !== unitId);
      const betaFiltered = prev.teams.beta.filter(u => u.id !== unitId);
      
      return {
        ...prev,
        teams: {
          alpha: alphaFiltered,
          beta: betaFiltered
        }
      };
    });
  }, []);

  const updateUnit = useCallback((id: string, updatedUnit: Unit) => {
    setUnits(prev => prev.map(unit => unit.id === id ? updatedUnit : unit));
    setBattleState(prev => {
      if (!prev) return prev;
      
      const alphaUpdated = prev.teams.alpha.map(unit => unit.id === id ? updatedUnit : unit);
      const betaUpdated = prev.teams.beta.map(unit => unit.id === id ? updatedUnit : unit);
      
      return {
        ...prev,
        teams: {
          alpha: alphaUpdated,
          beta: betaUpdated
        }
      };
    });
  }, []);

  const deleteUnit = useCallback((id: string) => {
    removeUnit(id);
  }, [removeUnit]);

  const addBond = useCallback((bond: Omit<Bond, 'id'>) => {
    const newBond: Bond = {
      ...bond,
      id: `bond-${Math.random().toString(36).substring(2, 9)}`
    };
    setBonds(prev => [...prev, newBond]);
  }, []);

  const updateBond = useCallback((id: string, updatedBond: Bond) => {
    setBonds(prev => prev.map(bond => bond.id === id ? updatedBond : bond));
  }, []);

  const deleteBond = useCallback((id: string) => {
    setBonds(prev => prev.filter(bond => bond.id !== id));
  }, []);

  // Faction management functions
  const addFaction = useCallback((faction: Omit<Faction, 'id'>) => {
    const newFaction: Faction = {
      ...faction,
      id: `faction-${Math.random().toString(36).substring(2, 9)}`
    };
    setFactions(prev => [...prev, newFaction]);
  }, []);

  const updateFaction = useCallback((id: string, updatedFaction: Faction) => {
    setFactions(prev => prev.map(faction => faction.id === id ? updatedFaction : faction));
  }, []);

  const deleteFaction = useCallback((id: string) => {
    setFactions(prev => prev.filter(faction => faction.id !== id));
  }, []);

  // Save units to localStorage
  const saveUnits = useCallback(() => {
    try {
      const unitsToSave = JSON.stringify(units);
      localStorage.setItem('savedUnits', unitsToSave);
      toast({
        title: "已保存单位",
        description: `成功保存了 ${units.length} 个单位`,
      });
    } catch (error) {
      console.error("Error saving units:", error);
      toast({
        title: "保存单位失败",
        description: "无法保存单位数据",
        variant: "destructive",
      });
    }
  }, [units, toast]);

  // Load units from localStorage
  const loadUnits = useCallback(() => {
    try {
      const savedUnits = localStorage.getItem('savedUnits');
      if (savedUnits) {
        const parsedUnits = JSON.parse(savedUnits) as Unit[];
        setUnits(parsedUnits);
        toast({
          title: "已加载单位",
          description: `成功加载了 ${parsedUnits.length} 个单位`,
        });
      }
    } catch (error) {
      console.error("Error loading units:", error);
      toast({
        title: "加载单位失败",
        description: "无法加载保存的单位数据",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!battleState) {
      initBattleState();
    }
    
    return () => {
      if (simulationRef.current) {
        clearTimeout(simulationRef.current);
      }
    };
  }, []);

  const startBattle = useCallback(() => {
    if (!battleState || isSimulating) return;
    
    if (battleState.teams.alpha.length === 0 || battleState.teams.beta.length === 0) {
      toast({
        title: "无法开始战斗",
        description: "请确保两个队伍都至少有一个单位",
        variant: "destructive",
      });
      return;
    }
    
    setBattleState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'inProgress',
        log: [
          ...prev.log,
          {
            round: prev.round,
            timestamp: Date.now(),
            actorId: 'system',
            action: 'attack',
            message: `回合 ${prev.round} 战斗开始！`
          }
        ]
      };
    });
    
    setIsSimulating(true);
    
    simulateBattle();
  }, [battleState, isSimulating]);

  const pauseBattle = useCallback(() => {
    if (simulationRef.current) {
      clearTimeout(simulationRef.current);
      simulationRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  const resumeBattle = useCallback(() => {
    if (!isSimulating && battleState?.status === 'inProgress') {
      setIsSimulating(true);
      simulateBattle();
    }
  }, [isSimulating, battleState]);

  const resetBattle = useCallback(() => {
    if (simulationRef.current) {
      clearTimeout(simulationRef.current);
      simulationRef.current = null;
    }
    
    setIsSimulating(false);
    
    // Don't remove units, just reset their health and other battle-specific properties
    setBattleState(prev => {
      if (!prev) return prev;
      
      // Reset teams with full health units
      const resetAlphaTeam = prev.teams.alpha.map(unit => ({
        ...unit,
        currentHP: unit.maxHP,
        currentMana: unit.maxMana || 100,
      }));
      
      const resetBetaTeam = prev.teams.beta.map(unit => ({
        ...unit,
        currentHP: unit.maxHP,
        currentMana: unit.maxMana || 100,
      }));
      
      return {
        ...prev,
        round: 1,
        status: 'preparing',
        teams: {
          alpha: resetAlphaTeam,
          beta: resetBetaTeam
        },
        log: []
      };
    });
    
    toast({
      title: "战斗已重置",
      description: "所有单位已恢复满血并重置状态",
    });
  }, []);

  const simulateBattle = useCallback(() => {
    if (!battleState) return;
    
    const startLogicTime = performance.now();
    
    setBattleState(prev => {
      if (!prev) return prev;
      
      if (prev.status === 'completed') {
        setIsSimulating(false);
        return prev;
      }
      
      if (prev.round >= prev.maxRounds) {
        const alphaHpSum = prev.teams.alpha.reduce((sum, unit) => sum + unit.currentHP, 0);
        const betaHpSum = prev.teams.beta.reduce((sum, unit) => sum + unit.currentHP, 0);
        
        let winner: 'alpha' | 'beta' | 'draw' = 'draw';
        if (alphaHpSum > betaHpSum) {
          winner = 'alpha';
        } else if (betaHpSum > alphaHpSum) {
          winner = 'beta';
        }
        
        const newLogEntry = {
          round: prev.round,
          timestamp: Date.now(),
          actorId: 'system',
          action: 'attack' as const,
          message: `战斗结束！${
            winner === 'alpha' ? 'A队获胜!' : 
            winner === 'beta' ? 'B队获胜!' : 
            '战斗平局!'
          }`
        };
        
        setBattleLog(oldLog => [...oldLog, { message: newLogEntry.message }]);
        
        return {
          ...prev,
          status: 'completed',
          winner,
          log: [
            ...prev.log,
            newLogEntry
          ]
        };
      }
      
      const alphaTeam = [...prev.teams.alpha];
      const betaTeam = [...prev.teams.beta];
      
      const alphaAlive = alphaTeam.filter(unit => unit.currentHP > 0);
      const betaAlive = betaTeam.filter(unit => unit.currentHP > 0);
      
      if (alphaAlive.length === 0 || betaAlive.length === 0) {
        let winner: 'alpha' | 'beta' | 'draw' = 'draw';
        if (alphaAlive.length > 0) winner = 'alpha';
        if (betaAlive.length > 0) winner = 'beta';
        
        return {
          ...prev,
          status: 'completed',
          winner,
          log: [
            ...prev.log,
            {
              round: prev.round,
              timestamp: Date.now(),
              actorId: 'system',
              action: 'attack',
              message: `战斗结束！${
                winner === 'alpha' ? 'A队获胜!' : 
                winner === 'beta' ? 'B队获胜!' : 
                '战斗平局!'
              }`
            }
          ]
        };
      }
      
      const allUnits = [...alphaAlive, ...betaAlive].sort((a, b) => b.speed - a.speed);
      
      const newLogs = [];
      
      // 应用羁绊效果
      const appliedBonds = applyBondEffects(bonds, alphaAlive, betaAlive);
      
      // 为每个单位执行行动
      allUnits.forEach(unit => {
        if (unit.currentHP <= 0) return;
        
        const targetTeam = unit.team === 'alpha' ? betaAlive : alphaAlive;
        if (targetTeam.length === 0) return;
        
        const targetIndex = Math.floor(Math.random() * targetTeam.length);
        const target = targetTeam[targetIndex];
        
        // 使用配置系统的UI选项
        const showEffects = config.uiOptions.showBattleEffects;
        
        // 计算攻击者的修正攻击力
        const attackModifier = getBondModifier(appliedBonds, unit, 'attack');
        const modifiedAttack = unit.attack * (1 + attackModifier);
        
        // 计算防御者的修正防御力
        const defenseModifier = getBondModifier(appliedBonds, target, 'defense');
        const modifiedDefense = target.defense * (1 + defenseModifier);
        
        // 应用伤害计算公式，注意每个单位的防御系数可能不同
        const baseDamage = modifiedAttack * (1 - modifiedDefense * balanceParameters.physicalDefense);
        
        // 计算暴击率和暴击伤害
        const critModifier = getBondModifier(appliedBonds, unit, 'critRate');
        const modifiedCritRate = unit.critRate * (1 + critModifier) * balanceParameters.criticalRate;
        const isCrit = Math.random() < modifiedCritRate;
        const damage = Math.max(1, Math.round(isCrit ? baseDamage * unit.critDamage : baseDamage));
        
        target.currentHP = Math.max(0, target.currentHP - damage);
        
        newLogs.push({
          round: prev.round,
          timestamp: Date.now(),
          actorId: unit.id,
          action: 'attack',
          targetId: target.id,
          value: damage,
          message: `${unit.name} ${isCrit ? '暴击' : '攻击'} ${target.name}，造成 ${damage} 点伤害${isCrit ? '(暴击)' : ''}！${
            target.currentHP <= 0 ? `${target.name} 已击败！` : ''
          }`
        });
        
        if (target.currentHP <= 0) {
          if (target.team === 'alpha') {
            const index = alphaAlive.findIndex(u => u.id === target.id);
            if (index !== -1) alphaAlive.splice(index, 1);
          } else {
            const index = betaAlive.findIndex(u => u.id === target.id);
            if (index !== -1) betaAlive.splice(index, 1);
          }
        }
      });
      
      return {
        ...prev,
        teams: {
          alpha: alphaTeam,
          beta: betaTeam
        },
        round: prev.round + 1,
        log: [...prev.log, ...newLogs]
      };
    });
    
    const endLogicTime = performance.now();
    performanceMonitor.recordLogicTime(endLogicTime - startLogicTime);
    performanceMonitor.frameRendered();
    
    // 使用配置的动画速度调整模拟速度
    const configSpeed = config.uiOptions.animationSpeed;
    const delay = Math.max(50, 500 / (simulationSpeed * configSpeed));
    
    simulationRef.current = setTimeout(() => {
      simulateBattle();
    }, delay);
  }, [battleState, simulationSpeed, balanceParameters, config.uiOptions, bonds]);

  // 应用羁绊效果的辅助函数
  const applyBondEffects = (bondsList: Bond[], alphaUnits: Unit[], betaUnits: Unit[]) => {
    const result = {
      alpha: [] as Bond[],
      beta: [] as Bond[]
    };
    
    bondsList.forEach(bond => {
      // 检查A队是否满足羁绊要求
      const alphaMatches = alphaUnits.filter(unit => 
        bond.requiredTypes.includes(unit.type)
      ).length;
      
      // 检查B队是否满足羁绊要求
      const betaMatches = betaUnits.filter(unit => 
        bond.requiredTypes.includes(unit.type)
      ).length;
      
      // 如果满足要求，将羁绊添加到相应队伍
      if (alphaMatches >= bond.minUnits) {
        result.alpha.push(bond);
      }
      
      if (betaMatches >= bond.minUnits) {
        result.beta.push(bond);
      }
    });
    
    return result;
  };
  
  // 获取羁绊修正值的辅助函数
  const getBondModifier = (
    appliedBonds: {alpha: Bond[], beta: Bond[]}, 
    unit: Unit, 
    statType: 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate'
  ) => {
    let modifier = 0;
    
    // 确定检查哪个队伍的羁绊
    const teamBonds = unit.team === 'alpha' ? appliedBonds.alpha : appliedBonds.beta;
    
    // 累计所有适用羁绊的效果
    teamBonds.forEach(bond => {
      bond.effects.forEach(effect => {
        if (effect.target === statType) {
          modifier += effect.type === 'buff' ? effect.value : -effect.value;
        }
      });
    });
    
    return modifier;
  };

  const setTerrain = useCallback((terrain: TerrainType) => {
    setActiveTerrain(terrain);
    if (battleState) {
      setBattleState(prev => ({
        ...prev!,
        terrain: {
          ...prev!.terrain,
          type: terrain
        }
      }));
    }
  }, [battleState]);

  const advanceBattleRound = useCallback(() => {
    if (!battleState || battleState.status === 'completed') return;
    
    if (battleState.status === 'preparing') {
      startBattle();
      return;
    }
    
    if (!isSimulating) {
      simulateBattle();
    }
  }, [battleState, isSimulating, startBattle, simulateBattle]);

  return (
    <GameContext.Provider value={{
      battleState,
      setBattleState,
      addUnit,
      removeUnit,
      startBattle,
      pauseBattle,
      resumeBattle,
      resetBattle,
      isSimulating,
      simulationSpeed,
      setSimulationSpeed,
      performance: performanceMonitor,
      bonds,
      addBond,
      updateBond,
      deleteBond,
      factions,
      addFaction,
      updateFaction,
      deleteFaction,
      units,
      updateUnit,
      deleteUnit,
      isSimulationRunning: isSimulating,
      activeTerrain,
      setTerrain,
      advanceBattleRound,
      battleLog,
      balanceParameters,
      setBalanceParameters,
      saveUnits,
      loadUnits
    }}>
      {children}
    </GameContext.Provider>
  );
};
