import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Settings, Save } from 'lucide-react';
import { ConfigVersioner } from '@/lib/utils/ConfigVersioner';
import { useToast } from '@/hooks/use-toast';
import { BattleSystem } from '@/lib/simulation/BattleSystem';
import { EconomyManager } from '@/lib/economy/EconomyManager';
import { SimulationAnalyzer } from '@/lib/analytics/SimulationAnalyzer';

// 初始化系统实例
const configVersioner = new ConfigVersioner();
const battleSystem = new BattleSystem();
const economyManager = new EconomyManager({
  startingGold: 100,
  interestThresholds: [10, 20, 30, 40, 50],
  interestCap: 5,
  levelCosts: [4, 8, 12, 16, 20],
  unitPoolSize: { common: 10, rare: 5, epic: 3 },
  itemPoolSize: { weapon: 5, armor: 5, accessory: 3 },
  roundIncome: { base: 5, winBonus: 1, loseBonus: 1 },
  sellingReturn: 0.7
});
const analyzer = new SimulationAnalyzer();

const SimulationControls = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [params, setParams] = useState({
    physicalDefense: 0.035,
    magicResistance: 0.028,
    criticalRate: 0.15,
    healingEfficiency: 1.0,
    goldScaling: 1.2,
    unitCost: 3,
  });
  const { toast } = useToast();

  // 加载保存的配置
  useEffect(() => {
    const savedConfig = configVersioner.getLatestConfig();
    if (savedConfig) {
      setParams(prevParams => ({
        ...prevParams,
        ...savedConfig,
      }));
    }
  }, []);

  // 模拟开始/暂停
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
    
    toast({
      title: isRunning ? "模拟已暂停" : "模拟已开始",
      description: isRunning 
        ? "您可以随时继续模拟" 
        : `模拟速度: ${speed[0]}%`,
    });
  };

  // 重置模拟
  const resetSimulation = () => {
    setIsRunning(false);
    
    toast({
      title: "模拟已重置",
      description: "所有数据已恢复到初始状态",
    });
  };

  // 保存当前配置
  const saveConfig = () => {
    const hash = configVersioner.commitChange(params, `Manual save at ${new Date().toLocaleTimeString()}`);
    
    toast({
      title: "配置已保存",
      description: `版本哈希: ${hash.substring(0, 8)}`,
    });
  };

  // 更新参数
  const updateParam = (key: string, value: number) => {
    setParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">模拟控制</h3>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            模拟速度
          </label>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            max={100}
            step={1}
            className="mb-6"
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={toggleSimulation}>
            {isRunning ? (
              <><Pause className="w-4 h-4 mr-2" />暂停</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />开始</>
            )}
          </Button>
          <Button variant="outline" onClick={resetSimulation}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={saveConfig}>
            <Save className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-muted-foreground">
              参数配置
            </label>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>物理防御系数:</div>
            <div className="text-right">
              <input 
                type="number" 
                className="w-16 bg-background text-right border rounded px-1" 
                value={params.physicalDefense} 
                onChange={(e) => updateParam('physicalDefense', parseFloat(e.target.value))} 
                step="0.001"
                min="0"
                max="1"
              />
            </div>
            
            <div>魔法抗性系数:</div>
            <div className="text-right">
              <input 
                type="number" 
                className="w-16 bg-background text-right border rounded px-1" 
                value={params.magicResistance} 
                onChange={(e) => updateParam('magicResistance', parseFloat(e.target.value))} 
                step="0.001"
                min="0"
                max="1"
              />
            </div>
            
            <div>暴击率系数:</div>
            <div className="text-right">
              <input 
                type="number" 
                className="w-16 bg-background text-right border rounded px-1" 
                value={params.criticalRate} 
                onChange={(e) => updateParam('criticalRate', parseFloat(e.target.value))} 
                step="0.01"
                min="0"
                max="1"
              />
            </div>
            
            <div>治疗效率:</div>
            <div className="text-right">
              <input 
                type="number" 
                className="w-16 bg-background text-right border rounded px-1" 
                value={params.healingEfficiency} 
                onChange={(e) => updateParam('healingEfficiency', parseFloat(e.target.value))} 
                step="0.1"
                min="0.1"
                max="5"
              />
            </div>
            
            <div>金币收益系数:</div>
            <div className="text-right">
              <input 
                type="number" 
                className="w-16 bg-background text-right border rounded px-1" 
                value={params.goldScaling} 
                onChange={(e) => updateParam('goldScaling', parseFloat(e.target.value))} 
                step="0.1"
                min="0.5"
                max="3"
              />
            </div>
            
            <div>单位基础成本:</div>
            <div className="text-right">
              <input 
                type="number" 
                className="w-16 bg-background text-right border rounded px-1" 
                value={params.unitCost} 
                onChange={(e) => updateParam('unitCost', parseFloat(e.target.value))} 
                step="1"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
        
        {isRunning && (
          <div className="mt-4 p-3 bg-muted/10 rounded-lg">
            <div className="text-sm font-medium mb-1">模拟状态</div>
            <div className="text-xs text-muted-foreground">
              正在进行: 第 {Math.floor(Math.random() * 10) + 1} 轮
              <div className="w-full h-1 bg-secondary mt-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-simulator-accent" 
                  style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SimulationControls;
