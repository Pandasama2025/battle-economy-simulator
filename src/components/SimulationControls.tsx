
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, Save, ChevronDown, ChevronUp, LineChart, BarChart } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ConfigVersioner } from '@/lib/utils/ConfigVersioner';
import { useToast } from '@/hooks/use-toast';
import { BattleSystem } from '@/lib/simulation/BattleSystem';
import { EconomyManager } from '@/lib/economy/EconomyManager';
import { SimulationAnalyzer } from '@/lib/analytics/SimulationAnalyzer';
import { BattleConfiguration, TerrainType } from '@/types/battle';
import { BalanceData } from '@/types/economy';

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
  const [currentTab, setCurrentTab] = useState('battle');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<BalanceData | null>(null);
  const [battleParams, setBattleParams] = useState<BattleConfiguration>({
    roundTimeLimit: 60,
    maxRounds: 20,
    terrain: "plains" as TerrainType,
    environmentEffects: true,
    combatParameters: {
      physicalDefense: 0.035,
      magicResistance: 0.028,
      criticalRate: 0.15,
      healingEfficiency: 1.0,
    }
  });
  const [economyParams, setEconomyParams] = useState({
    goldScaling: 1.2,
    unitCost: 3,
    interestRate: 0.1,
    marketVolatility: 0.3,
    priceFluctuation: 0.2,
  });
  const { toast } = useToast();

  // 模拟回合计数
  const [currentRound, setCurrentRound] = useState(0);
  const [simProgress, setSimProgress] = useState(0);

  // 加载保存的配置
  useEffect(() => {
    const savedConfig = configVersioner.getLatestConfig();
    if (savedConfig) {
      if (savedConfig.battleParams) {
        const battleConfig = savedConfig.battleParams as Partial<BattleConfiguration>;
        setBattleParams(prevParams => ({
          ...prevParams,
          ...battleConfig,
        }));
      }
      if (savedConfig.economyParams) {
        const economyConfig = savedConfig.economyParams as Record<string, number>;
        setEconomyParams(prevParams => ({
          ...prevParams,
          ...economyConfig,
        }));
      }
    }
  }, []);

  // 处理自动分析开关
  useEffect(() => {
    if (autoAnalysis) {
      analyzer.enableAutoAnalysis(3000, (data) => {
        setAnalyticsData(data);
        
        // 显示分析通知
        if (isRunning) {
          toast({
            title: "自动分析完成",
            description: `单位平衡度: ${(Object.values(data.unitWinRates).length > 0 
              ? Object.values(data.unitWinRates).reduce((sum, rate) => sum + Math.abs(rate - 0.5), 0) / Object.values(data.unitWinRates).length 
              : 0).toFixed(2)}`,
          });
        }
      });
    } else {
      analyzer.disableAutoAnalysis();
    }
    
    return () => {
      analyzer.disableAutoAnalysis();
    };
  }, [autoAnalysis, isRunning, toast]);

  // 模拟进度更新
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setSimProgress(prev => {
        const newProgress = prev + (speed[0] / 100);
        if (newProgress >= 100) {
          const battleState = battleSystem.getState();
          analyzer.addBattleData(battleState);
          
          const economyState = economyManager.getState();
          analyzer.addEconomyData(economyState);
          
          setCurrentRound(prev => prev + 1);
          return 0;
        }
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isRunning, speed]);

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
    setCurrentRound(0);
    setSimProgress(0);
    analyzer.clearHistory();
    setAnalyticsData(null);
    
    toast({
      title: "模拟已重置",
      description: "所有数据已恢复到初始状态",
    });
  };

  // 手动触发分析
  const triggerAnalysis = () => {
    const data = analyzer.generateBalanceReport();
    setAnalyticsData(data);
    
    const recommendations = analyzer.getBalanceRecommendations();
    
    toast({
      title: "分析完成",
      description: `平衡评分: ${recommendations.balanceScore}/100`,
    });
  };

  // 保存当前配置
  const saveConfig = () => {
    const configToSave = {
      battleParams,
      economyParams
    };
    
    const hash = configVersioner.commitChange(configToSave, `Manual save at ${new Date().toLocaleTimeString()}`);
    
    toast({
      title: "配置已保存",
      description: `版本哈希: ${hash.substring(0, 8)}`,
    });
  };

  // 更新战斗参数
  const updateBattleParam = (key: string, value: any) => {
    setBattleParams(prev => {
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        return {
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof BattleConfiguration] as Record<string, any>),
            [childKey]: value
          }
        };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  // 更新经济参数
  const updateEconomyParam = (key: string, value: number) => {
    setEconomyParams(prev => ({
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-analysis"
              checked={autoAnalysis}
              onCheckedChange={setAutoAnalysis}
            />
            <label 
              htmlFor="auto-analysis" 
              className="text-sm cursor-pointer"
            >
              自动分析
            </label>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={triggerAnalysis}
            disabled={isRunning}
            className="text-xs"
          >
            <LineChart className="w-3 h-3 mr-1" />
            手动分析
          </Button>
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
                  value={battleParams.terrain} 
                  onChange={(e) => updateBattleParam('terrain', e.target.value as TerrainType)}
                >
                  <option value="plains">平原</option>
                  <option value="forest">森林</option>
                  <option value="mountain">山地</option>
                  <option value="desert">沙漠</option>
                  <option value="swamp">沼泽</option>
                  <option value="fire">火地</option>
                </select>
              </div>
              
              <div>最大回合数:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value={battleParams.maxRounds} 
                  onChange={(e) => updateBattleParam('maxRounds', parseInt(e.target.value))} 
                  step="1"
                  min="5"
                  max="100"
                />
              </div>
              
              <div>环境效果:</div>
              <div className="text-right">
                <input 
                  type="checkbox" 
                  checked={battleParams.environmentEffects} 
                  onChange={(e) => updateBattleParam('environmentEffects', e.target.checked)} 
                  className="mr-2"
                />
                {battleParams.environmentEffects ? "启用" : "禁用"}
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
                      value={battleParams.combatParameters.physicalDefense} 
                      onChange={(e) => updateBattleParam('combatParameters.physicalDefense', parseFloat(e.target.value))} 
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
                      value={battleParams.combatParameters.magicResistance} 
                      onChange={(e) => updateBattleParam('combatParameters.magicResistance', parseFloat(e.target.value))} 
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
                      value={battleParams.combatParameters.criticalRate} 
                      onChange={(e) => updateBattleParam('combatParameters.criticalRate', parseFloat(e.target.value))} 
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
                      value={battleParams.combatParameters.healingEfficiency} 
                      onChange={(e) => updateBattleParam('combatParameters.healingEfficiency', parseFloat(e.target.value))} 
                      step="0.1"
                      min="0.1"
                      max="5"
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
                  value={economyParams.goldScaling} 
                  onChange={(e) => updateEconomyParam('goldScaling', parseFloat(e.target.value))} 
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
                  value={economyParams.unitCost} 
                  onChange={(e) => updateEconomyParam('unitCost', parseFloat(e.target.value))} 
                  step="1"
                  min="1"
                  max="10"
                />
              </div>
              
              <div>利息率:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value={economyParams.interestRate} 
                  onChange={(e) => updateEconomyParam('interestRate', parseFloat(e.target.value))} 
                  step="0.01"
                  min="0"
                  max="0.5"
                />
              </div>
              
              <div>市场波动性:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value={economyParams.marketVolatility} 
                  onChange={(e) => updateEconomyParam('marketVolatility', parseFloat(e.target.value))} 
                  step="0.05"
                  min="0.1"
                  max="1"
                />
              </div>
              
              <div>价格波动范围:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value={economyParams.priceFluctuation} 
                  onChange={(e) => updateEconomyParam('priceFluctuation', parseFloat(e.target.value))} 
                  step="0.05"
                  min="0.1"
                  max="0.5"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {isRunning && (
          <div className="mt-4 p-3 bg-muted/10 rounded-lg">
            <div className="text-sm font-medium mb-1">模拟状态</div>
            <div className="text-xs text-muted-foreground">
              正在进行: 第 {currentRound + 1} 轮
              <div className="w-full h-1 bg-secondary mt-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-simulator-accent" 
                  style={{ width: `${simProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {analyticsData && (
          <div className="mt-4 p-3 bg-muted/10 rounded-lg">
            <div className="text-sm font-medium mb-1 flex items-center justify-between">
              <span>分析结果</span>
              <BarChart className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>平均战斗时长:</span>
                <span>{analyticsData.averageBattleDuration.toFixed(1)}秒</span>
              </div>
              <div className="flex justify-between">
                <span>翻盘率:</span>
                <span>{(analyticsData.comebackRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>阵容多样性:</span>
                <span>{analyticsData.compositionDiversity.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SimulationControls;
