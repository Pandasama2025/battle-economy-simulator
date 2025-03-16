import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BattleState, Unit, UnitType, RaceType, ProfessionType } from '@/types/battle';
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

interface GameContextProps {
  battleState: BattleState | null;
  setBattleState: React.Dispatch<React.SetStateAction<BattleState | null>>;
  addUnit: (unit: Unit) => void;
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

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const performanceMonitor = useRef(new PerformanceMonitor()).current;
  const { toast } = useToast();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

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
        type: 'plains',
        effects: {},
      },
      log: [],
      environmentEffects: true,
      turnPhase: 'preparation',
      phaseTime: 30,
      matchups: []
    };
    
    setBattleState(initialState);
  }, []);

  const addUnit = useCallback((unit: Unit) => {
    setUnits(prev => [...prev, unit]);
    setBattleState(prev => {
      if (!prev) return prev;
      
      const team = unit.team;
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [team]: [...prev.teams[team], unit]
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
        
        const baseDamage = unit.attack * (1 - target.defense * 0.035);
        const isCrit = Math.random() < unit.critRate;
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
  }, [battleState, simulationSpeed]);

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
      deleteUnit
    }}>
      {children}
    </GameContext.Provider>
  );
};
