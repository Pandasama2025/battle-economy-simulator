
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Unit, TerrainType, BattleState, BattleLogEntry } from '@/types/battle';
import { BattleSystem } from '@/lib/simulation/BattleSystem';
import { toast } from '@/hooks/use-toast';

// 羁绊类型定义
export interface Bond {
  id: string;
  name: string;
  description: string;
  requiredTypes: string[];
  minUnits: number;
  effects: {
    type: string;
    value: number;
    target: 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate';
  }[];
}

interface GameContextType {
  units: Unit[];
  bonds: Bond[];
  activeTerrain: TerrainType;
  battleSystem: BattleSystem;
  battleLog: BattleLogEntry[];
  battleState: BattleState | null;
  isSimulationRunning: boolean;
  
  // 单位操作
  addUnit: (unit: Omit<Unit, 'id'>) => string;
  updateUnit: (unitId: string, updates: Partial<Unit>) => void;
  deleteUnit: (unitId: string) => void;
  
  // 羁绊操作
  addBond: (bond: Omit<Bond, 'id'>) => string;
  updateBond: (bondId: string, updates: Partial<Bond>) => void;
  deleteBond: (bondId: string) => void;
  
  // 战斗相关
  setTerrain: (terrain: TerrainType) => void;
  startBattle: () => void;
  pauseBattle: () => void;
  resetBattle: () => void;
  advanceBattleRound: () => void;
  getBattleLog: () => BattleLogEntry[];
  
  // 应用羁绊效果到单位
  applyBondEffects: (units: Unit[]) => Unit[];
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [activeTerrain, setActiveTerrain] = useState<TerrainType>('plains');
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  // 初始化战斗系统
  const [battleSystem] = useState(() => new BattleSystem());
  
  // 加载初始演示数据
  useEffect(() => {
    // 初始单位
    const demoUnits: Unit[] = [
      {
        id: 'unit-1',
        name: '骑士',
        type: 'Knight',
        level: 2,
        team: 'alpha',
        maxHP: 450,
        currentHP: 450,
        maxMana: 120,
        currentMana: 60,
        attack: 65,
        defense: 45,
        magicPower: 30,
        magicResistance: 25,
        speed: 12,
        critRate: 0.08,
        critDamage: 1.4,
        position: { x: 0, y: 0 },
        status: 'idle',
        skills: [],
        items: []
      },
      {
        id: 'unit-2',
        name: '法师',
        type: 'Mage',
        level: 2,
        team: 'alpha',
        maxHP: 320,
        currentHP: 320,
        maxMana: 200,
        currentMana: 150,
        attack: 40,
        defense: 25,
        magicPower: 80,
        magicResistance: 40,
        speed: 14,
        critRate: 0.12,
        critDamage: 1.6,
        position: { x: 0, y: 0 },
        status: 'idle',
        skills: [],
        items: []
      },
      {
        id: 'unit-3',
        name: '战士',
        type: 'Warrior',
        level: 2,
        team: 'beta',
        maxHP: 400,
        currentHP: 400,
        maxMana: 100,
        currentMana: 50,
        attack: 70,
        defense: 40,
        magicPower: 25,
        magicResistance: 30,
        speed: 11,
        critRate: 0.1,
        critDamage: 1.5,
        position: { x: 0, y: 0 },
        status: 'idle',
        skills: [],
        items: []
      },
      {
        id: 'unit-4',
        name: '牧师',
        type: 'Priest',
        level: 2,
        team: 'beta',
        maxHP: 300,
        currentHP: 300,
        maxMana: 180,
        currentMana: 120,
        attack: 35,
        defense: 30,
        magicPower: 70,
        magicResistance: 45,
        speed: 13,
        critRate: 0.08,
        critDamage: 1.3,
        position: { x: 0, y: 0 },
        status: 'idle',
        skills: [],
        items: []
      }
    ];
    setUnits(demoUnits);
    
    // 初始羁绊
    const demoBonds: Bond[] = [
      {
        id: 'bond-1',
        name: '元素掌控',
        description: '魔法单位组合提高魔法攻击',
        requiredTypes: ['Mage', 'Priest'],
        minUnits: 2,
        effects: [
          {
            type: 'buff',
            value: 0.15,
            target: 'magicPower'
          }
        ]
      },
      {
        id: 'bond-2',
        name: '坚固壁垒',
        description: '近战单位组合提高防御',
        requiredTypes: ['Knight', 'Warrior'],
        minUnits: 2,
        effects: [
          {
            type: 'buff',
            value: 0.2,
            target: 'defense'
          }
        ]
      }
    ];
    setBonds(demoBonds);
  }, []);
  
  // 添加新单位
  const addUnit = (unitData: Omit<Unit, 'id'>): string => {
    const newId = `unit-${Date.now()}`;
    const newUnit: Unit = {
      ...unitData,
      id: newId,
    };
    setUnits(prevUnits => [...prevUnits, newUnit]);
    toast({
      title: "单位已添加",
      description: `${newUnit.name} 已成功添加到游戏中`
    });
    return newId;
  };
  
  // 更新现有单位
  const updateUnit = (unitId: string, updates: Partial<Unit>) => {
    setUnits(prevUnits => 
      prevUnits.map(unit => 
        unit.id === unitId ? { ...unit, ...updates } : unit
      )
    );
  };
  
  // 删除单位
  const deleteUnit = (unitId: string) => {
    const unitToDelete = units.find(u => u.id === unitId);
    if (unitToDelete) {
      setUnits(prevUnits => prevUnits.filter(unit => unit.id !== unitId));
      toast({
        title: "单位已删除",
        description: `${unitToDelete.name} 已从游戏中移除`
      });
    }
  };
  
  // 添加新羁绊
  const addBond = (bondData: Omit<Bond, 'id'>): string => {
    const newId = `bond-${Date.now()}`;
    const newBond: Bond = {
      ...bondData,
      id: newId,
    };
    setBonds(prevBonds => [...prevBonds, newBond]);
    toast({
      title: "羁绊已添加",
      description: `${newBond.name} 羁绊已成功添加到游戏中`
    });
    return newId;
  };
  
  // 更新羁绊
  const updateBond = (bondId: string, updates: Partial<Bond>) => {
    setBonds(prevBonds => 
      prevBonds.map(bond => 
        bond.id === bondId ? { ...bond, ...updates } : bond
      )
    );
  };
  
  // 删除羁绊
  const deleteBond = (bondId: string) => {
    const bondToDelete = bonds.find(b => b.id === bondId);
    if (bondToDelete) {
      setBonds(prevBonds => prevBonds.filter(bond => bond.id !== bondId));
      toast({
        title: "羁绊已删除",
        description: `${bondToDelete.name} 已从游戏中移除`
      });
    }
  };
  
  // 设置地形
  const setTerrain = (terrain: TerrainType) => {
    setActiveTerrain(terrain);
    battleSystem.setTerrain(terrain);
  };
  
  // 应用羁绊效果到单位
  const applyBondEffects = (battleUnits: Unit[]): Unit[] => {
    // 深拷贝单位以避免直接修改原始单位
    const processedUnits = JSON.parse(JSON.stringify(battleUnits)) as Unit[];
    
    // 按队伍分组
    const alphaTeam = processedUnits.filter(unit => unit.team === 'alpha');
    const betaTeam = processedUnits.filter(unit => unit.team === 'beta');
    
    // 处理每个队伍的羁绊
    [alphaTeam, betaTeam].forEach(team => {
      // 检查每个羁绊
      bonds.forEach(bond => {
        const qualifyingUnits = team.filter(unit => 
          bond.requiredTypes.includes(unit.type)
        );
        
        // 如果满足羁绊的最小单位数量要求
        if (qualifyingUnits.length >= bond.minUnits) {
          // 应用效果到所有符合条件的单位
          qualifyingUnits.forEach(unit => {
            bond.effects.forEach(effect => {
              if (effect.type === 'buff') {
                const currentValue = unit[effect.target];
                if (typeof currentValue === 'number') {
                  unit[effect.target] = 
                    effect.target === 'critRate' 
                      ? Math.min(1.0, currentValue + effect.value) // 暴击率不超过100%
                      : currentValue * (1 + effect.value); // 其他属性增加百分比
                }
              }
            });
          });
        }
      });
    });
    
    return processedUnits;
  };
  
  // 开始战斗
  const startBattle = () => {
    // 根据单位的队伍划分单位
    const alphaTeam = units.filter(unit => unit.team === 'alpha');
    const betaTeam = units.filter(unit => unit.team === 'beta');
    
    if (alphaTeam.length === 0 || betaTeam.length === 0) {
      toast({
        title: "无法开始战斗",
        description: "每个队伍至少需要一个单位",
        variant: "destructive"
      });
      return;
    }
    
    // 应用羁绊效果
    const processedAlpha = applyBondEffects(alphaTeam);
    const processedBeta = applyBondEffects(betaTeam);
    
    // 初始化战斗系统
    battleSystem.initializeBattle(processedAlpha, processedBeta, activeTerrain);
    
    // 更新战斗状态
    setBattleState(battleSystem.getState());
    setBattleLog(battleSystem.getBattleLog());
    
    setIsSimulationRunning(true);
    
    toast({
      title: "战斗已开始",
      description: `地形: ${activeTerrain}, 单位数: ${processedAlpha.length} vs ${processedBeta.length}`
    });
  };
  
  // 暂停战斗
  const pauseBattle = () => {
    setIsSimulationRunning(false);
    toast({
      title: "战斗已暂停",
      description: "您可以随时继续战斗",
    });
  };
  
  // 重置战斗
  const resetBattle = () => {
    setIsSimulationRunning(false);
    setBattleState(null);
    setBattleLog([]);
    
    toast({
      title: "战斗已重置",
      description: "所有单位状态已恢复初始值",
    });
  };
  
  // 推进战斗回合
  const advanceBattleRound = () => {
    if (!battleState) {
      startBattle();
      return;
    }
    
    if (battleState.status === 'completed') {
      toast({
        title: "战斗已结束",
        description: `胜利队伍: ${battleState.winner === 'alpha' ? 'Alpha' : 'Beta'}`,
      });
      return;
    }
    
    // 执行一个回合
    battleSystem.executeTurn();
    
    // 更新状态
    setBattleState(battleSystem.getState());
    setBattleLog(battleSystem.getBattleLog());
    
    // 检查战斗是否结束
    const updatedState = battleSystem.getState();
    if (updatedState.status === 'completed') {
      setIsSimulationRunning(false);
      toast({
        title: "战斗结束",
        description: `${updatedState.winner === 'alpha' ? 'Alpha' : 'Beta'} 队伍获胜!`,
      });
    }
  };
  
  // 获取战斗日志
  const getBattleLog = () => {
    return battleSystem.getBattleLog();
  };
  
  const contextValue: GameContextType = {
    units,
    bonds,
    activeTerrain,
    battleSystem,
    battleLog,
    battleState,
    isSimulationRunning,
    
    addUnit,
    updateUnit,
    deleteUnit,
    
    addBond,
    updateBond,
    deleteBond,
    
    setTerrain,
    startBattle,
    pauseBattle,
    resetBattle,
    advanceBattleRound,
    getBattleLog,
    
    applyBondEffects
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
