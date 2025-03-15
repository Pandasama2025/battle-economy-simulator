
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BattleState, Unit } from '@/types/battle';
import { useToast } from '@/hooks/use-toast';
import { PerformanceMonitor } from '@/lib/utils/PerformanceMonitor';

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
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const performanceMonitor = useRef(new PerformanceMonitor()).current;
  const { toast } = useToast();

  // 初始化战斗状态
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

  // 初始化战斗状态
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

  // 添加单位
  const addUnit = useCallback((unit: Unit) => {
    setBattleState(prev => {
      if (!prev) return prev;
      
      // 添加到相应队伍
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

  // 移除单位
  const removeUnit = useCallback((unitId: string) => {
    setBattleState(prev => {
      if (!prev) return prev;
      
      // 从两个队伍中查找并移除
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

  // 开始战斗模拟
  const startBattle = useCallback(() => {
    if (!battleState || isSimulating) return;
    
    // 检查两个队伍是否都有单位
    if (battleState.teams.alpha.length === 0 || battleState.teams.beta.length === 0) {
      toast({
        title: "无法开始战斗",
        description: "请确保两个队伍都至少有一个单位",
        variant: "destructive",
      });
      return;
    }
    
    // 更新战斗状态为进行中
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
    
    // 启动模拟循环
    simulateBattle();
  }, [battleState, isSimulating]);

  // 暂停战斗模拟
  const pauseBattle = useCallback(() => {
    if (simulationRef.current) {
      clearTimeout(simulationRef.current);
      simulationRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  // 继续战斗模拟
  const resumeBattle = useCallback(() => {
    if (!isSimulating && battleState?.status === 'inProgress') {
      setIsSimulating(true);
      simulateBattle();
    }
  }, [isSimulating, battleState]);

  // 重置战斗
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

  // 模拟战斗逻辑
  const simulateBattle = useCallback(() => {
    if (!battleState) return;
    
    // 记录性能
    const startLogicTime = performance.now();
    
    setBattleState(prev => {
      if (!prev) return prev;
      
      // 检查是否已经结束
      if (prev.status === 'completed') {
        setIsSimulating(false);
        return prev;
      }
      
      // 检查是否超过最大回合数
      if (prev.round >= prev.maxRounds) {
        // 确定胜者（基于剩余生命值）
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
      
      // 简单的战斗逻辑模拟 - 双方随机攻击
      const alphaTeam = [...prev.teams.alpha];
      const betaTeam = [...prev.teams.beta];
      
      // 检查双方是否都有存活单位
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
      
      // 按照速度排序所有单位
      const allUnits = [...alphaAlive, ...betaAlive].sort((a, b) => b.speed - a.speed);
      
      // 战斗回合日志
      const newLogs = []; 
      
      // 每个单位按照速度顺序行动
      allUnits.forEach(unit => {
        if (unit.currentHP <= 0) return; // 跳过已经死亡的单位
        
        // 确定攻击目标 - 敌方随机一个存活单位
        const targetTeam = unit.team === 'alpha' ? betaAlive : alphaAlive;
        if (targetTeam.length === 0) return;
        
        const targetIndex = Math.floor(Math.random() * targetTeam.length);
        const target = targetTeam[targetIndex];
        
        // 计算伤害
        const baseDamage = unit.attack * (1 - target.defense * 0.035);
        const isCrit = Math.random() < unit.critRate;
        const damage = Math.max(1, Math.round(isCrit ? baseDamage * unit.critDamage : baseDamage));
        
        // 应用伤害
        target.currentHP = Math.max(0, target.currentHP - damage);
        
        // 添加战斗日志
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
        
        // 如果目标死亡，从存活列表中移除
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
      
      // 更新所有单位状态
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
    
    // 记录性能
    const endLogicTime = performance.now();
    performanceMonitor.recordLogicTime(endLogicTime - startLogicTime);
    performanceMonitor.frameRendered();
    
    // 根据模拟速度设置下一帧的延迟
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
      performance: performanceMonitor
    }}>
      {children}
    </GameContext.Provider>
  );
};
