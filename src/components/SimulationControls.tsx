
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, Save, ChevronDown, ChevronUp, LineChart, BarChart2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useGameContext } from '@/context/GameContext';
import { TerrainType } from '@/types/battle';

// 导入平衡分析相关类
import { BalanceSimulator } from '@/lib/balance/BalanceSimulator';
import { SimulationResult } from '@/types/balance';

const SimulationControls = () => {
  const { 
    isSimulationRunning, 
    activeTerrain, 
    setTerrain, 
    startBattle, 
    pauseBattle, 
    resetBattle, 
    advanceBattleRound,
    battleState,
    setBalanceParameters,
    balanceParameters
  } = useGameContext();
  
  const [speed, setSpeed] = useState([50]);
  const [currentTab, setCurrentTab] = useState('battle');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [showSimulationResults, setShowSimulationResults] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const { toast } = useToast();

  // 处理自动推进战斗
  useEffect(() => {
    if (!autoAdvance || !isSimulationRunning) return;
    
    const interval = setInterval(() => {
      setSimProgress(prev => {
        const newProgress = prev + (speed[0] / 100);
        if (newProgress >= 100) {
          advanceBattleRound();
          return 0;
        }
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [autoAdvance, isSimulationRunning, speed, advanceBattleRound]);

  // 模拟开始/暂停
  const toggleSimulation = () => {
    if (isSimulationRunning) {
      pauseBattle();
    } else {
      if (!battleState) {
        startBattle();
      } else {
        // 如果战斗已经初始化但是暂停了，继续战斗
        advanceBattleRound();
      }
    }
    
    toast({
      title: isSimulationRunning ? "模拟已暂停" : "模拟已开始",
      description: isSimulationRunning 
        ? "您可以随时继续模拟" 
        : `模拟速度: ${speed[0]}%`,
    });
  };

  // 重置模拟
  const handleResetSimulation = () => {
    resetBattle();
    setSimProgress(0);
    setAutoAdvance(false);
    setShowSimulationResults(false);
    
    toast({
      title: "模拟已重置",
      description: "所有数据已恢复到初始状态",
    });
  };

  // 触发分析并连接到平衡分析系统
  const triggerAnalysis = async () => {
    if (!battleState) {
      toast({
        title: "无法分析",
        description: "请先进行一次完整的战斗模拟",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "正在分析战斗数据",
      description: "请稍候...",
    });
    
    try {
      // 创建平衡模拟器实例
      const battleConfig = {
        roundTimeLimit: 60,
        maxRounds: battleState.maxRounds,
        terrain: activeTerrain,
        environmentEffects: battleState.environmentEffects,
        combatParameters: {
          physicalDefense: balanceParameters.physicalDefense,
          magicResistance: balanceParameters.magicResistance,
          criticalRate: balanceParameters.criticalRate,
          healingEfficiency: balanceParameters.healingEfficiency,
        }
      };
      
      const economyConfig = {
        startingGold: 10,
        interestRate: balanceParameters.interestRate,
        goldScaling: balanceParameters.goldScaling,
        unitCost: 3,
        sellingReturn: 0.7,
        interestThresholds: [10, 20, 30, 40, 50],
        interestCap: 5,
        levelCosts: [4, 8, 12, 16, 24, 36, 56],
        unitPoolSize: {
          "common": 30,
          "uncommon": 20,
          "rare": 12,
          "epic": 8,
          "legendary": 5
        },
        itemPoolSize: {
          "unit": 20,
          "equipment": 15,
          "consumable": 10,
          "upgrade": 5
        },
        roundIncome: {
          base: 5,
          winBonus: 1,
          loseBonus: 1
        }
      };
      
      const simulator = new BalanceSimulator(battleConfig, economyConfig);
      
      // 根据当前战斗结果生成模拟数据
      const results = await simulator.monteCarloSimulation(
        balanceParameters,
        10, // 小规模模拟
        0.05 // 小扰动
      );
      
      setSimulationResults(results);
      setShowSimulationResults(true);
      
      // 计算平均平衡分数
      const avgScore = results.reduce((sum, r) => sum + r.balanceScore, 0) / results.length;
      
      toast({
        title: "分析完成",
        description: `平衡评分: ${avgScore.toFixed(1)}/100`,
      });
    } catch (error) {
      console.error("分析过程中出错:", error);
      toast({
        title: "分析失败",
        description: "处理数据时出现错误",
        variant: "destructive"
      });
    }
  };

  // 保存当前配置
  const saveConfig = () => {
    const configToSave = {
      physicalDefense: balanceParameters.physicalDefense,
      magicResistance: balanceParameters.magicResistance,
      criticalRate: balanceParameters.criticalRate,
      healingEfficiency: balanceParameters.healingEfficiency,
      goldScaling: balanceParameters.goldScaling,
      interestRate: balanceParameters.interestRate
    };
    
    // 保存到本地存储
    localStorage.setItem('battleConfig', JSON.stringify(configToSave));
    
    toast({
      title: "配置已保存",
      description: "当前游戏配置已保存",
    });
  };

  // 更新平衡参数
  const updateBalanceParameter = (param: string, value: number) => {
    setBalanceParameters({
      ...balanceParameters,
      [param]: value
    });
  };

  // 打开平衡分析系统
  const openBalanceAnalyzer = () => {
    // 这里可以通过全局状态或路由导航到平衡分析系统
    window.location.href = '#balance-analyzer';
    toast({
      title: "已打开平衡分析系统",
      description: "您现在可以查看完整的平衡分析和优化工具",
    });
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
            {isSimulationRunning ? (
              <><Pause className="w-4 h-4 mr-2" />暂停</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />开始</>
            )}
          </Button>
          <Button variant="outline" onClick={handleResetSimulation}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={saveConfig}>
            <Save className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-advance"
              checked={autoAdvance}
              onCheckedChange={setAutoAdvance}
            />
            <label 
              htmlFor="auto-advance" 
              className="text-sm cursor-pointer"
            >
              自动推进战斗
            </label>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={triggerAnalysis}
              disabled={isSimulationRunning}
              className="text-xs"
            >
              <LineChart className="w-3 h-3 mr-1" />
              战斗分析
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={openBalanceAnalyzer}
              className="text-xs"
            >
              <BarChart2 className="w-3 h-3 mr-1" />
              平衡系统
            </Button>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="battle" className="flex-1">战斗配置</TabsTrigger>
            <TabsTrigger value="economy" className="flex-1">经济配置</TabsTrigger>
          </TabsList>
          
          <TabsContent value="battle" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>地形类型:</div>
              <div className="text-right">
                <select 
                  className="w-full bg-background text-right border rounded px-1 py-1" 
                  value={activeTerrain} 
                  onChange={(e) => setTerrain(e.target.value as TerrainType)}
                >
                  <option value="plains">平原</option>
                  <option value="forest">森林</option>
                  <option value="mountain">山地</option>
                  <option value="desert">沙漠</option>
                  <option value="swamp">沼泽</option>
                  <option value="fire">火地</option>
                </select>
              </div>
              
              <div>环境效果:</div>
              <div className="text-right">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="mr-2"
                />
                启用
              </div>
            </div>
            
            <div>
              <Button 
                variant="ghost" 
                className="w-full flex justify-between items-center text-sm py-2" 
                onClick={() => setAdvancedOpen(!advancedOpen)}
              >
                高级战斗参数
                {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {advancedOpen && (
                <div className="grid grid-cols-2 gap-2 text-sm mt-2 p-2 border rounded">
                  <div>物理防御系数:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value={balanceParameters.physicalDefense} 
                      step="0.001"
                      min="0"
                      max="1"
                      onChange={(e) => updateBalanceParameter('physicalDefense', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>魔法抗性系数:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value={balanceParameters.magicResistance} 
                      step="0.001"
                      min="0"
                      max="1"
                      onChange={(e) => updateBalanceParameter('magicResistance', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>暴击率系数:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value={balanceParameters.criticalRate} 
                      step="0.01"
                      min="0"
                      max="1"
                      onChange={(e) => updateBalanceParameter('criticalRate', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div>治疗效率:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value={balanceParameters.healingEfficiency} 
                      step="0.1"
                      min="0.1"
                      max="5"
                      onChange={(e) => updateBalanceParameter('healingEfficiency', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="economy" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>金币收益系数:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value={balanceParameters.goldScaling} 
                  step="0.1"
                  min="0.5"
                  max="3"
                  onChange={(e) => updateBalanceParameter('goldScaling', parseFloat(e.target.value))}
                />
              </div>
              
              <div>单位基础成本:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value="3" 
                  step="1"
                  min="1"
                  max="10"
                  readOnly
                />
              </div>
              
              <div>利息率:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value={balanceParameters.interestRate} 
                  step="0.01"
                  min="0"
                  max="0.5"
                  onChange={(e) => updateBalanceParameter('interestRate', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {isSimulationRunning && autoAdvance && (
          <div className="mt-4 p-3 bg-muted/10 rounded-lg">
            <div className="text-sm font-medium mb-1">模拟状态</div>
            <div className="text-xs text-muted-foreground">
              正在进行: 第 {battleState ? battleState.round : 0} 轮
              <div className="w-full h-1 bg-secondary mt-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${simProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {showSimulationResults && simulationResults.length > 0 && (
          <div className="mt-4 p-3 bg-muted/10 rounded-lg">
            <div className="text-sm font-medium mb-2">分析结果</div>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-muted-foreground">平衡得分: </span>
                <span className="font-medium">{(simulationResults.reduce((sum, r) => sum + r.balanceScore, 0) / simulationResults.length).toFixed(1)}/100</span>
              </div>
              <div>
                <span className="text-muted-foreground">最佳参数组合: </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs mt-2 w-full"
                  onClick={openBalanceAnalyzer}
                >
                  查看详细分析
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SimulationControls;
