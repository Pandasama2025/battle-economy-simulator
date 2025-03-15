import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, ErrorBar } from 'recharts';

import { OptimizationEngine } from '@/lib/balance/advanced/OptimizationEngine';
import { SimulationResult, AdvancedOptimizationConfig } from '@/types/balance';
import { BattleConfiguration } from '@/types/battle';
import { EconomyConfiguration } from '@/types/economy';

interface BalanceOptimizationPanelProps {
  onOptimizationComplete?: (result: SimulationResult) => void;
  initialParams?: Record<string, number>;
}

const BalanceOptimizationPanel: React.FC<BalanceOptimizationPanelProps> = ({ 
  onOptimizationComplete,
  initialParams
}) => {
  const { toast } = useToast();
  
  // 状态管理
  const [currentTab, setCurrentTab] = useState('advanced');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [optimizationResults, setOptimizationResults] = useState<SimulationResult[]>([]);
  const [bestResult, setBestResult] = useState<SimulationResult | null>(null);
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  
  // 高级配置
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedOptimizationConfig>({
    useDeterministicMode: true,
    optimizationMethod: 'gradientBoosting',
    configuration: {
      iterationsPerTrial: 10,
      maxTrials: 20,
      explorationWeight: 0.3,
      learningRate: 0.05,
      regularizationStrength: 0.01,
      convergenceTolerance: 0.001,
      earlyStopping: true,
      parallelTrials: 1
    },
    objectiveWeights: {
      balanceScore: 1.0,
      unitDiversity: 0.7,
      strategyDiversity: 0.7,
      matchDuration: 0.3,
      economyProgression: 0.5
    },
    constraints: {
      maxWinRateDeviation: 0.15,
      minEffectiveUnitPercentage: 0.85,
      maxMatchDurationVariance: 0.3,
      requireAllUnitsViable: true
    }
  });
  
  // 参数配置
  const [parameterConfig, setParameterConfig] = useState({
    physicalDefense: initialParams?.physicalDefense || 0.035,
    magicResistance: initialParams?.magicResistance || 0.028,
    criticalRate: initialParams?.criticalRate || 0.15,
    healingEfficiency: initialParams?.healingEfficiency || 1.0,
    goldScaling: initialParams?.goldScaling || 1.2,
    interestRate: initialParams?.interestRate || 0.1,
    counterMultiplier: initialParams?.counterMultiplier || 1.5,
    bondBonus: initialParams?.bondBonus || 0.2
  });
  
  // 随机种子管理
  const [randomSeed, setRandomSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [useSeed, setUseSeed] = useState<boolean>(true);
  
  // 优化引擎参考
  const [engine, setEngine] = useState<OptimizationEngine | null>(null);
  
  // 派系配置
  const [selectedFactions, setSelectedFactions] = useState<string[]>(['龙族', '精灵']);
  const [factionMechanics, setFactionMechanics] = useState<Record<string, number>>({
    'dragon_evolution_rounds': 4,
    'elf_elemental_reaction': 0.3,
    'mechanical_heat_generation': 2.5
  });
  
  // 初始化优化引擎
  useEffect(() => {
    const engineConfig = {
      ...advancedConfig,
      randomSeed: useSeed ? randomSeed : undefined
    };
    
    const newEngine = new OptimizationEngine(engineConfig);
    setEngine(newEngine);
    
    return () => {
      // 清理资源
    };
  }, [randomSeed, useSeed, advancedConfig]);
  
  /**
   * 更新参数配置
   */
  const updateParameter = (param: string, value: number) => {
    setParameterConfig(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  /**
   * 更新高级配置
   */
  const updateAdvancedConfig = (path: string[], value: any) => {
    setAdvancedConfig(prev => {
      const newConfig = { ...prev };
      let current = newConfig as any;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      const lastKey = path[path.length - 1];
      current[lastKey] = value;
      
      return newConfig;
    });
  };
  
  /**
   * 开始优化过程
   */
  const startOptimization = async () => {
    if (!engine) return;
    
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setCurrentScore(0);
    setOptimizationResults([]);
    setBestResult(null);
    
    try {
      toast({
        title: "开始高级平衡优化",
        description: `使用${getMethodName(advancedConfig.optimizationMethod)}方法，随机种子: ${useSeed ? randomSeed : '未启用'}`
      });
      
      // 参数范围定义
      const paramRanges: Record<string, [number, number]> = {
        physicalDefense: [0.01, 0.05],
        magicResistance: [0.01, 0.04],
        criticalRate: [0.1, 0.2],
        healingEfficiency: [0.8, 1.2],
        goldScaling: [0.9, 1.5],
        interestRate: [0.05, 0.15],
        counterMultiplier: [1.2, 2.0],
        bondBonus: [0.1, 0.3]
      };
      
      // 评估函数
      const evaluateParameters = async (params: Record<string, number>): Promise<number> => {
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // 结合派系机制的评估
        const factionImpact = calculateFactionImpact();
        
        // 基础平衡性评估 (简化示例)
        let score = 70 + factionImpact;
        
        // 参数影响评估
        if (params.physicalDefense > 0.04) score -= (params.physicalDefense - 0.04) * 200;
        if (params.physicalDefense < 0.02) score -= (0.02 - params.physicalDefense) * 200;
        
        if (params.magicResistance > 0.035) score -= (params.magicResistance - 0.035) * 250;
        if (params.magicResistance < 0.015) score -= (0.015 - params.magicResistance) * 250;
        
        // 暴击率评估
        const optimalCrit = 0.15;
        score -= Math.abs(params.criticalRate - optimalCrit) * 100;
        
        // 治疗效率评估
        const optimalHealing = 1.0;
        score -= Math.abs(params.healingEfficiency - optimalHealing) * 30;
        
        // 经济参数评估
        if (params.goldScaling > 1.3) score -= (params.goldScaling - 1.3) * 50;
        if (params.goldScaling < 1.0) score -= (1.0 - params.goldScaling) * 40;
        
        // 利息率评估
        const optimalInterest = 0.1;
        score -= Math.abs(params.interestRate - optimalInterest) * 80;
        
        // 克制倍率评估
        if (params.counterMultiplier > 1.7) score -= (params.counterMultiplier - 1.7) * 60;
        if (params.counterMultiplier < 1.3) score -= (1.3 - params.counterMultiplier) * 60;
        
        // 羁绊加成评估
        const optimalBond = 0.2;
        score -= Math.abs(params.bondBonus - optimalBond) * 120;
        
        // 添加一点随机性 (但如果使用种子则保持确定性)
        if (useSeed && params._testSeed) {
          // 使用专用的伪随机数生成器
          const seededRandom = getSeededRandom(Number(params._testSeed));
          score += (seededRandom() * 2 - 1) * 3;
        } else if (!useSeed) {
          score += (Math.random() * 2 - 1) * 3;
        }
        
        // 确保得分在合理范围内
        return Math.max(0, Math.min(100, score));
      };
      
      // 开始优化
      const best = await engine.optimize(
        parameterConfig,
        paramRanges,
        evaluateParameters,
        (progress, bestScore) => {
          setOptimizationProgress(progress * 100);
          setCurrentScore(bestScore);
        }
      );
      
      // 更新结果
      setBestResult(best);
      setOptimizationResults(engine.getSimulationResults());
      
      // 计算优化改进百分比
      const initialScore = engine.getSimulationResults()[0]?.balanceScore || 0;
      const improvement = ((best.balanceScore - initialScore) / initialScore) * 100;
      
      toast({
        title: "优化完成",
        description: `最佳平衡得分: ${best.balanceScore.toFixed(1)}，提升了 ${improvement.toFixed(1)}%`
      });
      
      // 回调
      if (onOptimizationComplete) {
        onOptimizationComplete(best);
      }
    } catch (e) {
      console.error("优化过程中出错:", e);
      toast({
        title: "优化错误",
        description: `发生错误: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(100);
    }
  };
  
  /**
   * 生成随机种子
   */
  const generateRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setRandomSeed(newSeed);
    
    toast({
      title: "已生成新的随机种子",
      description: `种子值: ${newSeed}`,
    });
  };
  
  /**
   * 计算派系机制的影响
   */
  const calculateFactionImpact = (): number => {
    let impact = 0;
    
    // 龙族进化机制影响
    if (selectedFactions.includes('龙族')) {
      const evolutionRounds = factionMechanics.dragon_evolution_rounds;
      // 龙族进化机制的最佳回合数为4
      impact += 5 - Math.abs(evolutionRounds - 4) * 2;
    }
    
    // 精灵元素共鸣影响
    if (selectedFactions.includes('精灵')) {
      const elementalReaction = factionMechanics.elf_elemental_reaction;
      // 精灵元素共鸣最佳值为0.3
      impact += 4 - Math.abs(elementalReaction - 0.3) * 20;
    }
    
    // 机械派热量系统影响
    if (selectedFactions.includes('机械师')) {
      const heatGeneration = factionMechanics.mechanical_heat_generation;
      // 机械派热量生成最佳值为2.5
      impact += 4 - Math.abs(heatGeneration - 2.5) * 2;
    }
    
    return impact;
  };
  
  /**
   * 获取优化方法名称
   */
  const getMethodName = (method: string): string => {
    switch (method) {
      case 'gradientBoosting': return '梯度提升';
      case 'bayesian': return '贝叶斯';
      case 'evolution': return '进化算法';
      case 'reinforcementLearning': return '强化学习';
      default: return method;
    }
  };
  
  /**
   * 获取确定性随机数生成器
   */
  const getSeededRandom = (seed: number): () => number => {
    let _seed = seed;
    return function() {
      _seed = (_seed * 9301 + 49297) % 233280;
      return _seed / 233280;
    };
  };
  
  /**
   * 应用最佳参数
   */
  const applyBestParameters = () => {
    if (!bestResult) return;
    
    setParameterConfig(prev => ({
      ...prev,
      ...bestResult.params
    }));
    
    toast({
      title: "已应用最佳参数",
      description: "优化后的平衡参数已设置为当前配置"
    });
  };
  
  /**
   * 导出结果报告
   */
  const exportResults = () => {
    if (!engine || !bestResult) return;
    
    try {
      const report = engine.generateBalanceReport();
      
      // 将报告转换为JSON字符串
      const reportJson = JSON.stringify({
        results: optimizationResults,
        bestResult,
        report,
        metadata: {
          timestamp: Date.now(),
          method: advancedConfig.optimizationMethod,
          seed: useSeed ? randomSeed : "none"
        }
      }, null, 2);
      
      // 创建下载
      const blob = new Blob([reportJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "报告已导出",
        description: "平衡报告已成功导出为JSON文件",
      });
    } catch (e) {
      console.error("导出报告时出错:", e);
      toast({
        title: "导出错误",
        description: `导出报告时发生错误: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>高级平衡优化系统</CardTitle>
        <CardDescription>使用确定性算法和精确模拟优化游戏平衡参数</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="advanced">高级优化</TabsTrigger>
            <TabsTrigger value="factions">派系机制</TabsTrigger>
            <TabsTrigger value="results">结果分析</TabsTrigger>
          </TabsList>
          
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="use-seed" 
                    checked={useSeed}
                    onCheckedChange={setUseSeed}
                  />
                  <label htmlFor="use-seed" className="text-sm font-medium">启用随机种子</label>
                </div>
                
                {useSeed && (
                  <>
                    <div className="text-sm">种子值: {randomSeed}</div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={generateRandomSeed}
                    >
                      生成新种子
                    </Button>
                  </>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">优化方法</h4>
                <ToggleGroup type="single" value={advancedConfig.optimizationMethod} onValueChange={(value) => {
                  if (value) updateAdvancedConfig(['optimizationMethod'], value);
                }}>
                  <ToggleGroupItem value="gradientBoosting">梯度提升</ToggleGroupItem>
                  <ToggleGroupItem value="bayesian">贝叶斯</ToggleGroupItem>
                  <ToggleGroupItem value="evolution">进化算法</ToggleGroupItem>
                  <ToggleGroupItem value="reinforcementLearning">强化学习</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">优化配置</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">最大试验次数</label>
                    <div className="flex items-center">
                      <Slider
                        value={[advancedConfig.configuration.maxTrials]}
                        onValueChange={(v) => updateAdvancedConfig(['configuration', 'maxTrials'], v[0])}
                        min={5}
                        max={50}
                        step={5}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{advancedConfig.configuration.maxTrials}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">每次试验迭代数</label>
                    <div className="flex items-center">
                      <Slider
                        value={[advancedConfig.configuration.iterationsPerTrial]}
                        onValueChange={(v) => updateAdvancedConfig(['configuration', 'iterationsPerTrial'], v[0])}
                        min={5}
                        max={20}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{advancedConfig.configuration.iterationsPerTrial}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">探索权重</label>
                    <div className="flex items-center">
                      <Slider
                        value={[advancedConfig.configuration.explorationWeight * 100]}
                        onValueChange={(v) => updateAdvancedConfig(['configuration', 'explorationWeight'], v[0] / 100)}
                        min={5}
                        max={70}
                        step={5}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{(advancedConfig.configuration.explorationWeight * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">学习率</label>
                    <div className="flex items-center">
                      <Slider
                        value={[advancedConfig.configuration.learningRate! * 100]}
                        onValueChange={(v) => updateAdvancedConfig(['configuration', 'learningRate'], v[0] / 100)}
                        min={1}
                        max={30}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{(advancedConfig.configuration.learningRate! * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="early-stopping" 
                  checked={advancedConfig.configuration.earlyStopping}
                  onCheckedChange={(checked) => updateAdvancedConfig(['configuration', 'earlyStopping'], checked)}
                />
                <label htmlFor="early-stopping" className="text-sm">启用早停（收敛后停止优化）</label>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">平衡参数</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">物理防御系数</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.physicalDefense * 1000]}
                        onValueChange={(v) => updateParameter('physicalDefense', v[0] / 1000)}
                        max={50}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{parameterConfig.physicalDefense.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">魔法抗性系数</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.magicResistance * 1000]}
                        onValueChange={(v) => updateParameter('magicResistance', v[0] / 1000)}
                        max={50}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{parameterConfig.magicResistance.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">暴击率系数</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.criticalRate * 100]}
                        onValueChange={(v) => updateParameter('criticalRate', v[0] / 100)}
                        max={30}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{(parameterConfig.criticalRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">治疗效率</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.healingEfficiency * 100]}
                        onValueChange={(v) => updateParameter('healingEfficiency', v[0] / 100)}
                        min={50}
                        max={150}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{parameterConfig.healingEfficiency.toFixed(2)}x</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">金币收益系数</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.goldScaling * 100]}
                        onValueChange={(v) => updateParameter('goldScaling', v[0] / 100)}
                        min={50}
                        max={200}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{parameterConfig.goldScaling.toFixed(2)}x</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">利息率</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.interestRate * 100]}
                        onValueChange={(v) => updateParameter('interestRate', v[0] / 100)}
                        min={0}
                        max={30}
                        step={1}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{(parameterConfig.interestRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">克制倍率</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.counterMultiplier * 100]}
                        onValueChange={(v) => updateParameter('counterMultiplier', v[0] / 100)}
                        min={100}
                        max={250}
                        step={5}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{parameterConfig.counterMultiplier.toFixed(2)}x</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">羁绊加成</label>
                    <div className="flex items-center">
                      <Slider
                        value={[parameterConfig.bondBonus * 100]}
                        onValueChange={(v) => updateParameter('bondBonus', v[0] / 100)}
                        min={5}
                        max={50}
                        step={5}
                        className="flex-1 mr-2"
                      />
                      <span className="text-xs">{(parameterConfig.bondBonus * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={startOptimization} 
                  disabled={isOptimizing}
                  className="w-full"
                >
                  {isOptimizing ? '优化中...' : '开始平衡优化'}
                </Button>
                
                {isOptimizing && (
                  <div className="mt-2">
                    <div className="text-xs mb-1 flex justify-between">
                      <span>优化进度: {Math.round(optimizationProgress)}%</span>
                      <span>当前最佳得分: {currentScore.toFixed(1)}</span>
                    </div>
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${optimizationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="factions" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">选择派系</h4>
                <ToggleGroup type="multiple" 
                  value={selectedFactions}
                  onValueChange={(value) => {
                    if (value.length > 0) setSelectedFactions(value);
                  }}
                  className="justify-start flex-wrap"
                >
                  <ToggleGroupItem value="龙族">龙族</ToggleGroupItem>
                  <ToggleGroupItem value="精灵">精灵</ToggleGroupItem>
                  <ToggleGroupItem value="机械师">机械师</ToggleGroupItem>
                  <ToggleGroupItem value="亡灵">亡灵</ToggleGroupItem>
                  <ToggleGroupItem value="元素">元素</ToggleGroupItem>
                  <ToggleGroupItem value="人类">人类</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">派系机制</h4>
                
                {selectedFactions.includes('龙族') && (
                  <div className="bg-muted/30 p-3 rounded-lg mb-3">
                    <h5 className="text-sm font-medium mb-2">龙族进化机制</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      龙族单位在存活特定回合数后进化，获得额外属性加成。
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">进化所需回合数</label>
                      <div className="flex items-center">
                        <Slider
                          value={[factionMechanics.dragon_evolution_rounds]}
                          onValueChange={(v) => setFactionMechanics(prev => ({...prev, dragon_evolution_rounds: v[0]}))}
                          min={2}
                          max={8}
                          step={1}
                          className="flex-1 mr-2"
                        />
                        <span className="text-xs">{factionMechanics.dragon_evolution_rounds} 回合</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedFactions.includes('精灵') && (
                  <div className="bg-muted/30 p-3 rounded-lg mb-3">
                    <h5 className="text-sm font-medium mb-2">精灵元素共鸣</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      精灵单位能够触发元素共鸣效果，提高法术伤害。
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">元素共鸣强度</label>
                      <div className="flex items-center">
                        <Slider
                          value={[factionMechanics.elf_elemental_reaction * 100]}
                          onValueChange={(v) => setFactionMechanics(prev => ({...prev, elf_elemental_reaction: v[0] / 100}))}
                          min={10}
                          max={50}
                          step={5}
                          className="flex-1 mr-2"
                        />
                        <span className="text-xs">{(factionMechanics.elf_elemental_reaction * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedFactions.includes('机械师') && (
                  <div className="bg-muted/30 p-3 rounded-lg mb-3">
                    <h5 className="text-sm font-medium mb-2">机械热量系统</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      机械单位每次攻击积累热量，达到阈值后触发过载效果。
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">热量生成速率</label>
                      <div className="flex items-center">
                        <Slider
                          value={[factionMechanics.mechanical_heat_generation * 10]}
                          onValueChange={(v) => setFactionMechanics(prev => ({...prev, mechanical_heat_generation: v[0] / 10}))}
                          min={10}
                          max={50}
                          step={5}
                          className="flex-1 mr-2"
                        />
                        <span className="text-xs">{factionMechanics.mechanical_heat_generation.toFixed(1)}/攻击</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedFactions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    请选择至少一个派系来查看其机制设置
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">羁绊效果</h4>
                
                {selectedFactions.map(faction => (
                  <div key={faction} className="bg-muted/20 p-2 rounded-lg text-xs mb-2">
                    <div className="font-medium">{faction} 羁绊</div>
                    <div className="grid grid-cols-3 gap-x-2 mt-1">
                      <div>
                        <span className="text-muted-foreground">初级 (2):</span> 
                        {faction === '龙族' && ' +15% 最大生命值'}
                        {faction === '精灵' && ' +10% 法术伤害'}
                        {faction === '机械师' && ' +20% 攻击速度'}
                        {faction === '亡灵' && ' +15% 伤害吸血'}
                        {faction === '元素' && ' +15% 元素伤害'}
                        {faction === '人类' && ' +2 金币/回合'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">中级 (4):</span>
                        {faction === '龙族' && ' +30% 攻击力'}
                        {faction === '精灵' && ' 技能冷却时间-20%'}
                        {faction === '机械师' && ' 热量阈值-30%'}
                        {faction === '亡灵' && ' 死亡单位复活一次'}
                        {faction === '元素' && ' 额外元素伤害+20%'}
                        {faction === '人类' && ' 物品价格-15%'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">高级 (6):</span>
                        {faction === '龙族' && ' 每3回合进化一次'}
                        {faction === '精灵' && ' 法术伤害+40%'}
                        {faction === '机械师' && ' 过载伤害+100%'}
                        {faction === '亡灵' && ' 敌人-25%治疗效果'}
                        {faction === '元素' && ' 元素伤害穿透抗性'}
                        {faction === '人类' && ' 每回合额外刷新一个单位'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedFactions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    请选择派系来查看羁绊效果
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {optimizationResults.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">优化结果趋势</h4>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="show-confidence" 
                        checked={showConfidenceIntervals}
                        onCheckedChange={setShowConfidenceIntervals}
                      />
                      <label htmlFor="show-confidence" className="text-xs">显示置信区间</label>
                    </div>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={optimizationResults.map((r, i) => ({
                          iteration: i,
                          score: r.balanceScore,
                          lower: r.confidenceInterval?.lower || r.balanceScore * 0.95,
                          upper: r.confidenceInterval?.upper || r.balanceScore * 1.05
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="iteration" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" name="平衡得分" />
                        {showConfidenceIntervals && (
                          <Line 
                            type="monotone" 
                            dataKey="upper" 
                            stroke="#82ca9d" 
                            strokeDasharray="3 3" 
                            strokeWidth={1}
                            name="置信区间上限" 
                          />
                        )}
                        {showConfidenceIntervals && (
                          <Line 
                            type="monotone" 
                            dataKey="lower" 
                            stroke="#ffc658" 
                            strokeDasharray="3 3" 
                            strokeWidth={1}
                            name="置信区间下限" 
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {bestResult && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">最佳参数配置</h4>
                    <div className="bg-muted/10 p-3 rounded-lg text-xs">
                      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                        {Object.entries(bestResult.params).filter(([key]) => !key.startsWith('_')).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="font-medium">{typeof value === 'number' && value < 1 ? value.toFixed(4) : value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <div className="text-muted-foreground">平衡得分</div>
                          <div className="text-xl font-semibold">{bestResult.balanceScore.toFixed(1)}</div>
                        </div>
                        
                        <Button 
                          onClick={applyBestParameters}
                          variant="outline"
                          size="sm"
                        >
                          应用最佳参数
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {optimizationResults.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">参数影响分析</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid />
                          <XAxis 
                            type="number" 
                            dataKey="physicalDefense" 
                            name="物理防御" 
                            domain={[0.01, 0.05]}
                            tickFormatter={(val: number) => val.toFixed(3)} 
                          />
                          <YAxis 
                            type="number" 
                            dataKey="balanceScore" 
                            name="平衡得分"
                            domain={[50, 100]} 
                          />
                          <ZAxis 
                            type="number" 
                            dataKey="iterationCount" 
                            range={[50, 400]} 
                            name="迭代次数" 
                          />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            formatter={(value: any, name: any) => {
                              if (name === 'balanceScore') return [typeof value === 'number' ? value.toFixed(2) : value, '平衡得分'];
                              if (name === 'physicalDefense') return [typeof value === 'number' ? value.toFixed(4) : value, '物理防御'];
                              return [value, name];
                            }} 
                          />
                          <Scatter 
                            name="参数影响" 
                            data={optimizationResults.map(r => ({
                              ...r.params,
                              balanceScore: r.balanceScore,
                              iterationCount: r.metadata.iterationCount || 1
                            }))} 
                            fill="#8884d8" 
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        onClick={exportResults}
                        variant="outline"
                        className="w-full"
                      >
                        导出详细报告
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>请先运行优化来生成结果</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BalanceOptimizationPanel;

