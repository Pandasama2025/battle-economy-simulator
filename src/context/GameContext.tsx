
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BattleState, Unit, UnitType, RaceType, ProfessionType, TerrainType } from '@/types/battle';
import { useToast } from '@/hooks/use-toast';
import { PerformanceMonitor } from '@/lib/utils/PerformanceMonitor';

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

// 添加平衡参数接口
export interface BalanceParameters {
  physicalDefense: number;
  magicResistance: number;
  criticalRate: number;
  healingEfficiency: number;
  goldScaling: number;
  interestRate: number;
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
  units: Unit[];
  updateUnit: (id: string, unit: Unit) => void;
  deleteUnit: (id: string) => void;
  isSimulationRunning: boolean;
  activeTerrain: TerrainType;
  setTerrain: (terrain: TerrainType) => void;
  advanceBattleRound: () => void;
  battleLog: Array<{message: string}>;
  // 添加平衡参数相关属性
  balanceParameters: BalanceParameters;
  setBalanceParameters: React.Dispatch<React.SetStateAction<BalanceParameters>>;
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
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [activeTerrain, setActiveTerrain] = useState<TerrainType>("plains");
  const [battleLog, setBattleLog] = useState<Array<{message: string}>>([]);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const performanceMonitor = useRef(new PerformanceMonitor()).current;
  const { toast } = useToast();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  // 添加平衡参数状态
  const [balanceParameters, setBalanceParameters] = useState<BalanceParameters>(() => {
    // 尝试从本地存储加载参数
    const savedParams = localStorage.getItem('battleConfig');
    if (savedParams) {
      try {
        return {...DEFAULT_BALANCE_PARAMETERS, ...JSON.parse(savedParams)};
      } catch (e) {
        console.error('无法解析保存的平衡参数:', e);
      }
    }
    return DEFAULT_BALANCE_PARAMETERS;
  });

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
    initBattleState();
    
    toast({
      title: "战斗已重置",
      description: "所有单位和状态已清空",
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
      
      allUnits.forEach(unit => {
        if (unit.currentHP <= 0) return;
        
        const targetTeam = unit.team === 'alpha' ? betaAlive : alphaAlive;
        if (targetTeam.length === 0) return;
        
        const targetIndex = Math.floor(Math.random() * targetTeam.length);
        const target = targetTeam[targetIndex];
        
        // 使用当前的平衡参数
        const baseDamage = unit.attack * (1 - target.defense * balanceParameters.physicalDefense);
        const isCrit = Math.random() < (unit.critRate * balanceParameters.criticalRate);
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
    
    const delay = Math.max(50, 500 / simulationSpeed);
    simulationRef.current = setTimeout(() => {
      simulateBattle();
    }, delay);
  }, [battleState, simulationSpeed, balanceParameters]);

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
      units,
      updateUnit,
      deleteUnit,
      isSimulationRunning: isSimulating,
      activeTerrain,
      setTerrain,
      advanceBattleRound,
      battleLog,
      // 添加平衡参数相关属性
      balanceParameters,
      setBalanceParameters
    }}>
      {children}
    </GameContext.Provider>
  );
};
