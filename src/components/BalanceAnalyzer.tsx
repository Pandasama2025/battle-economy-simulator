
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { PlusCircle, Play, Save } from 'lucide-react';

import { BalanceSimulator } from '@/lib/balance/BalanceSimulator';
import { AutoBalancer } from '@/lib/balance/AutoBalancer';
import { SimulationResult } from '@/types/balance';
import { BattleConfiguration } from '@/types/battle';
import { EconomyConfiguration } from '@/types/economy';
import { useGameContext } from '@/context/GameContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BalanceAnalyzer = () => {
  const { toast } = useToast();
  const { balanceParameters, setBalanceParameters, bonds, addBond, updateBond, deleteBond } = useGameContext();
  const [currentTab, setCurrentTab] = useState('simulator');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [batchSize, setBatchSize] = useState([50]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [sensitivityData, setSensitivityData] = useState<{ name: string, value: number }[]>([]);
  const [bestParameters, setBestParameters] = useState<Record<string, number> | null>(null);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [parameterConfig, setParameterConfig] = useState({
    physicalDefense: balanceParameters.physicalDefense,
    magicResistance: balanceParameters.magicResistance,
    criticalRate: balanceParameters.criticalRate,
    healingEfficiency: balanceParameters.healingEfficiency,
    goldScaling: balanceParameters.goldScaling,
    interestRate: balanceParameters.interestRate,
  });
  
  // 新增状态用于自动应用优化结果
  const [autoApplyOptimization, setAutoApplyOptimization] = useState(true);
  
  // 新增状态用于编辑羁绊
  const [isAddingBond, setIsAddingBond] = useState(false);
  const [newBond, setNewBond] = useState({
    name: '',
    description: '',
    requiredTypes: [] as string[],
    minUnits: 2,
    effects: [{
      type: 'buff' as 'buff' | 'debuff',
      value: 0.1,
      target: 'attack' as 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate'
    }]
  });
  
  // 同步GameContext中的参数
  useEffect(() => {
    setParameterConfig({
      physicalDefense: balanceParameters.physicalDefense,
      magicResistance: balanceParameters.magicResistance,
      criticalRate: balanceParameters.criticalRate,
      healingEfficiency: balanceParameters.healingEfficiency,
      goldScaling: balanceParameters.goldScaling,
      interestRate: balanceParameters.interestRate,
    });
  }, [balanceParameters]);
  
  const simulatorRef = useRef<BalanceSimulator | null>(null);
  const optimizerRef = useRef<AutoBalancer | null>(null);
  
  useEffect(() => {
    const battleConfig: BattleConfiguration = {
      roundTimeLimit: 60,
      maxRounds: 20,
      terrain: "plains",
      environmentEffects: true,
      combatParameters: {
        physicalDefense: parameterConfig.physicalDefense,
        magicResistance: parameterConfig.magicResistance,
        criticalRate: parameterConfig.criticalRate,
        healingEfficiency: parameterConfig.healingEfficiency,
      }
    };
    
    const economyConfig: EconomyConfiguration = {
      startingGold: 10,
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
      },
      sellingReturn: 0.7,
      
      // Optional configurations
      goldScaling: parameterConfig.goldScaling,
      interestRate: parameterConfig.interestRate,
      unitCost: 3,
      marketVolatility: 0.3,
      priceFluctuation: 0.2,
    };
    
    simulatorRef.current = new BalanceSimulator(battleConfig, economyConfig);
    optimizerRef.current = new AutoBalancer(simulatorRef.current);
    
    if (optimizerRef.current) {
      optimizerRef.current.setIterationCallback((result, iteration) => {
        setSimulationResults(prev => [...prev, result]);
        setOptimizationProgress(iteration);
      });
    }
  }, []);
  
  const startBatchSimulation = async () => {
    if (!simulatorRef.current) return;
    
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationResults([]);
    
    try {
      toast({
        title: "开始批量模拟",
        description: `将模拟 ${batchSize[0]} 种参数组合`,
      });
      
      // 更新模拟器中使用的配置参数
      updateSimulatorConfig();
      
      const results = await simulatorRef.current.batchTest(batchSize[0]);
      setSimulationResults(results);
      
      analyzeSensitivity(results);
      
      toast({
        title: "模拟完成",
        description: `已完成 ${results.length} 个模拟`,
      });
    } catch (e) {
      console.error("模拟过程中出错:", e);
      toast({
        title: "模拟错误",
        description: `发生错误: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
      setSimulationProgress(100);
    }
  };
  
  // 更新模拟器配置
  const updateSimulatorConfig = () => {
    if (!simulatorRef.current) return;
    
    const battleConfig: BattleConfiguration = {
      roundTimeLimit: 60,
      maxRounds: 20,
      terrain: "plains",
      environmentEffects: true,
      combatParameters: {
        physicalDefense: parameterConfig.physicalDefense,
        magicResistance: parameterConfig.magicResistance,
        criticalRate: parameterConfig.criticalRate,
        healingEfficiency: parameterConfig.healingEfficiency,
      }
    };
    
    const economyConfig: EconomyConfiguration = {
      startingGold: 10,
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
      },
      sellingReturn: 0.7,
      
      goldScaling: parameterConfig.goldScaling,
      interestRate: parameterConfig.interestRate,
      unitCost: 3,
    };
    
    simulatorRef.current = new BalanceSimulator(battleConfig, economyConfig);
    if (optimizerRef.current) {
      optimizerRef.current = new AutoBalancer(simulatorRef.current);
      optimizerRef.current.setIterationCallback((result, iteration) => {
        setSimulationResults(prev => [...prev, result]);
        setOptimizationProgress(iteration);
      });
    }
  };
  
  const startOptimization = async () => {
    if (!optimizerRef.current) return;
    
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setSimulationResults([]);
    
    try {
      toast({
        title: "开始参数优化",
        description: "使用贝叶斯优化寻找最佳平衡参数",
      });
      
      // 更新模拟器中使用的配置参数
      updateSimulatorConfig();
      
      const paramSpace: Record<string, [number, number]> = {
        physicalDefense: [0.01, 0.05] as [number, number],
        magicResistance: [0.01, 0.04] as [number, number],
        criticalRate: [0.1, 0.2] as [number, number],
        healingEfficiency: [0.8, 1.2] as [number, number],
        goldScaling: [0.9, 1.5] as [number, number],
        interestRate: [0.05, 0.15] as [number, number]
      };
      
      const bestParams = await optimizerRef.current.optimize(
        parameterConfig, 
        paramSpace,
        20
      );
      
      setBestParameters(bestParams);
      
      // 自动应用最佳参数（如果启用）
      if (autoApplyOptimization && bestParams) {
        applyRecommendedParameters();
      }
      
      if (optimizerRef.current) {
        try {
          const sensitivity = optimizerRef.current.generateSensitivityReport();
          const sensitivityArray = Object.entries(sensitivity.parameters).map(([name, value]) => ({
            name,
            value: Math.abs(value)
          })).sort((a, b) => b.value - a.value);
          
          setSensitivityData(sensitivityArray);
        } catch (e) {
          console.warn('无法生成敏感度报告:', e);
        }
      }
      
      toast({
        title: "优化完成",
        description: "已找到最佳参数配置" + (autoApplyOptimization ? "并已自动应用" : ""),
      });
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
  
  const stopOptimization = () => {
    if (optimizerRef.current) {
      optimizerRef.current.stop();
      toast({
        title: "优化已停止",
        description: "已手动停止优化过程",
      });
    }
  };
  
  const applyRecommendedParameters = () => {
    if (bestParameters) {
      // 更新本地状态
      setParameterConfig(prev => ({
        ...prev,
        ...bestParameters
      }));
      
      // 更新全局游戏上下文
      setBalanceParameters({
        ...balanceParameters,
        ...bestParameters
      });
      
      toast({
        title: "已应用推荐参数",
        description: "优化参数已应用到模拟配置",
      });
    }
  };
  
  const analyzeSensitivity = (results: SimulationResult[]) => {
    const params = Object.keys(results[0]?.params || {});
    const correlations: Record<string, number[]> = {};
    
    params.forEach(param => {
      correlations[param] = [];
    });
    
    results.forEach(result => {
      params.forEach(param => {
        correlations[param].push(result.params[param] * result.balanceScore);
      });
    });
    
    const sensitivity = params.map(param => {
      const values = correlations[param];
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      return { name: param, value: Math.abs(average) };
    }).sort((a, b) => b.value - a.value);
    
    setSensitivityData(sensitivity);
  };
  
  const updateParameter = (param: string, value: number) => {
    setParameterConfig(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  const runMonteCarloSimulation = async () => {
    if (!simulatorRef.current) return;
    
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationResults([]);
    
    try {
      toast({
        title: "开始蒙特卡罗模拟",
        description: "将进行参数随机扰动模拟",
      });
      
      // 更新模拟器中使用的配置参数
      updateSimulatorConfig();
      
      const results = await simulatorRef.current.monteCarloSimulation(
        parameterConfig,
        30,
        0.15
      );
      
      setSimulationResults(results);
      
      toast({
        title: "模拟完成",
        description: `已完成 ${results.length} 次蒙特卡罗模拟`,
      });
    } catch (e) {
      console.error("模拟过程中出错:", e);
      toast({
        title: "模拟错误",
        description: `发生错误: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
      setSimulationProgress(100);
    }
  };

  // 添加新羁绊到游戏
  const handleAddBond = () => {
    if (!newBond.name || newBond.requiredTypes.length === 0) {
      toast({
        title: "无法添加羁绊",
        description: "请确保填写了羁绊名称并选择了所需单位类型",
        variant: "destructive"
      });
      return;
    }
    
    addBond({
      name: newBond.name,
      description: newBond.description,
      requiredTypes: newBond.requiredTypes,
      minUnits: newBond.minUnits,
      effects: newBond.effects.map(effect => ({
        type: effect.type,
        value: effect.value,
        target: effect.target
      }))
    });
    
    // 重置表单
    setNewBond({
      name: '',
      description: '',
      requiredTypes: [],
      minUnits: 2,
      effects: [{
        type: 'buff' as 'buff' | 'debuff',
        value: 0.1,
        target: 'attack' as 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate'
      }]
    });
    
    setIsAddingBond(false);
    
    toast({
      title: "羁绊已添加",
      description: `新羁绊 "${newBond.name}" 已添加到游戏`,
    });
  };
  
  // 更新新羁绊状态
  const updateNewBond = (field: string, value: any) => {
    setNewBond(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 更新羁绊效果
  const updateBondEffect = (index: number, field: string, value: any) => {
    setNewBond(prev => {
      const updatedEffects = [...prev.effects];
      updatedEffects[index] = {
        ...updatedEffects[index],
        [field]: value
      };
      return {
        ...prev,
        effects: updatedEffects
      };
    });
  };
  
  // 添加新效果
  const addBondEffect = () => {
    setNewBond(prev => ({
      ...prev,
      effects: [
        ...prev.effects,
        {
          type: 'buff' as 'buff' | 'debuff',
          value: 0.1,
          target: 'attack' as 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate'
        }
      ]
    }));
  };
  
  // 应用当前参数到游戏中
  const applyCurrentParameters = () => {
    setBalanceParameters({
      ...balanceParameters,
      ...parameterConfig
    });
    
    toast({
      title: "参数已应用",
      description: "当前参数已应用到游戏中",
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">平衡分析系统</h3>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="simulator">参数模拟</TabsTrigger>
          <TabsTrigger value="optimizer">智能调优</TabsTrigger>
          <TabsTrigger value="visualizer">数据可视化</TabsTrigger>
          <TabsTrigger value="bonds">羁绊管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulator" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">参数配置</h4>
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
              </div>
              
              <Button 
                onClick={applyCurrentParameters} 
                className="mt-4 text-xs w-full"
                variant="outline"
              >
                <Save className="w-3 h-3 mr-2" />
                将这些参数应用到游戏
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-2">模拟控制</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <label className="text-xs text-muted-foreground mr-2">批量大小</label>
                  <Slider
                    value={batchSize}
                    onValueChange={setBatchSize}
                    min={10}
                    max={100}
                    step={10}
                    className="w-36 mr-2"
                  />
                  <span className="text-xs">{batchSize[0]}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={startBatchSimulation} 
                    disabled={isSimulating}
                    className="text-xs"
                  >
                    批量模拟
                  </Button>
                  <Button 
                    onClick={runMonteCarloSimulation}
                    disabled={isSimulating}
                    variant="outline"
                    className="text-xs"
                  >
                    蒙特卡罗模拟
                  </Button>
                </div>
                
                {isSimulating && (
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${simulationProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
            
            {simulationResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">模拟结果</h4>
                <div className="bg-muted/10 p-3 rounded-lg text-xs">
                  <div className="font-medium mb-1">平衡得分统计</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-muted-foreground">平均分</div>
                      <div className="text-base font-semibold">
                        {(simulationResults.reduce((sum, r) => sum + r.balanceScore, 0) / simulationResults.length).toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">最高分</div>
                      <div className="text-base font-semibold">
                        {Math.max(...simulationResults.map(r => r.balanceScore)).toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">最低分</div>
                      <div className="text-base font-semibold">
                        {Math.min(...simulationResults.map(r => r.balanceScore)).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {sensitivityData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">参数敏感度</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sensitivityData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" name="敏感度" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="optimizer" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">自动调优</h4>
              <p className="text-xs text-muted-foreground mb-4">
                使用贝叶斯优化算法自动寻找最佳参数组合，以获得最高的平衡性得分。
              </p>
              
              <div className="flex items-center mb-4">
                <Switch 
                  id="auto-apply"
                  checked={autoApplyOptimization}
                  onCheckedChange={setAutoApplyOptimization}
                />
                <label 
                  htmlFor="auto-apply" 
                  className="text-sm cursor-pointer ml-2"
                >
                  优化完成后自动应用最佳参数
                </label>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <Button 
                  onClick={startOptimization} 
                  disabled={isOptimizing}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  开始优化
                </Button>
                {isOptimizing && (
                  <Button 
                    onClick={stopOptimization}
                    variant="destructive"
                    className="text-xs"
                  >
                    停止优化
                  </Button>
                )}
              </div>
              
              {isOptimizing && (
                <div className="mb-4">
                  <div className="text-xs mb-1">优化进度: {optimizationProgress} / 20</div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(optimizationProgress / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {bestParameters && (
                <div className="bg-muted/10 p-3 rounded-lg text-xs mb-4">
                  <div className="font-medium mb-2">推荐参数</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(bestParameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{value.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={applyRecommendedParameters}
                    variant="outline"
                    className="w-full mt-3 text-xs"
                  >
                    应用推荐参数
                  </Button>
                </div>
              )}
            </div>
            
            {simulationResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">优化趋势</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationResults.map((r, i) => ({ 
                      iteration: i, 
                      score: r.balanceScore,
                      goldEfficiency: r.economyMetrics.goldEfficiency * 50,
                      itemUtilization: r.economyMetrics.itemUtilization * 50,
                      winRateDeviation: Math.sqrt(
                        Object.values(r.winRates).reduce(
                          (sum, rate) => sum + Math.pow(rate - 0.5, 2), 0
                        ) / Object.values(r.winRates).length
                      ) * 50
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="iteration" />
                      <YAxis 
                        yAxisId="left" 
                        domain={[0, 100]} 
                        label={{ value: '平衡得分', angle: -90, position: 'insideLeft' }} 
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        domain={[0, 100]} 
                        label={{ value: '指标', angle: 90, position: 'insideRight' }} 
                      />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="score" stroke="#8884d8" name="平衡得分" />
                      <Line yAxisId="right" type="monotone" dataKey="goldEfficiency" stroke="#82ca9d" name="金币效率" />
                      <Line yAxisId="right" type="monotone" dataKey="itemUtilization" stroke="#ffc658" name="物品利用率" />
                      <Line yAxisId="right" type="monotone" dataKey="winRateDeviation" stroke="#ff8042" name="胜率偏差" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {sensitivityData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">参数影响分析</h4>
                <div className="text-xs text-muted-foreground mb-2">
                  参数影响度排名 (从高到低):
                </div>
                <div className="text-xs grid grid-cols-2 gap-2">
                  {sensitivityData.map((item, index) => (
                    <div key={item.name} className="flex justify-between">
                      <div>
                        <span className="font-medium text-primary">{index + 1}.</span> {item.name}
                      </div>
                      <div className="font-medium">
                        {item.value.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="visualizer" className="space-y-6">
          {simulationResults.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">单位胜率雷达图</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      outerRadius={90} 
                      data={Object.entries(simulationResults[simulationResults.length - 1].winRates).map(([name, rate]) => ({
                        unit: name,
                        winRate: rate * 100
                      }))}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="unit" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar 
                        name="胜率 (%)" 
                        dataKey="winRate" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">经济指标对比</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[{
                        name: '当前配置',
                        goldEfficiency: simulationResults[simulationResults.length - 1].economyMetrics.goldEfficiency * 100,
                        itemUtilization: simulationResults[simulationResults.length - 1].economyMetrics.itemUtilization * 100,
                        resourceBalance: (1 - simulationResults[simulationResults.length - 1].economyMetrics.resourceBalance) * 100
                      }]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="goldEfficiency" fill="#8884d8" name="金币效率 (%)" />
                      <Bar dataKey="itemUtilization" fill="#82ca9d" name="物品利用率 (%)" />
                      <Bar dataKey="resourceBalance" fill="#ffc658" name="资源平衡 (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">平衡评分分布</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...Array(10)].map((_, i) => {
                        const min = i * 10;
                        const max = (i + 1) * 10;
                        return {
                          range: `${min}-${max}`,
                          count: simulationResults.filter(r => r.balanceScore >= min && r.balanceScore < max).length
                        };
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" name="样本数" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>请先运行批量模拟或优化以生成可视化数据</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bonds" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">羁绊管理</h4>
            <Dialog open={isAddingBond} onOpenChange={setIsAddingBond}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs">
                  <PlusCircle className="w-3 h-3 mr-1" />
                  添加新羁绊
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加新羁绊</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="name" className="text-right">羁绊名称</Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      value={newBond.name}
                      onChange={(e) => updateNewBond('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="description" className="text-right">描述</Label>
                    <Input
                      id="description"
                      className="col-span-3"
                      value={newBond.description}
                      onChange={(e) => updateNewBond('description', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="minUnits" className="text-right">所需单位数</Label>
                    <Input
                      id="minUnits"
                      type="number"
                      min={1}
                      max={10}
                      className="col-span-3"
                      value={newBond.minUnits}
                      onChange={(e) => updateNewBond('minUnits', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label className="text-right">所需类型</Label>
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {['战士', '法师', '弓箭手', '骑士', '牧师', '刺客', '商人'].map(type => (
                        <Button
                          key={type}
                          variant={newBond.requiredTypes.includes(type) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const types = newBond.requiredTypes.includes(type)
                              ? newBond.requiredTypes.filter(t => t !== type)
                              : [...newBond.requiredTypes, type];
                            updateNewBond('requiredTypes', types);
                          }}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-2 flex justify-between items-center">
                      <Label>效果</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={addBondEffect}
                      >
                        添加效果
                      </Button>
                    </div>
                    
                    {newBond.effects.map((effect, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                        <div className="col-span-3">
                          <Select
                            value={effect.type}
                            onValueChange={(value) => updateBondEffect(index, 'type', value as 'buff' | 'debuff')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buff">增益</SelectItem>
                              <SelectItem value="debuff">减益</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="1"
                            value={effect.value}
                            onChange={(e) => updateBondEffect(index, 'value', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="col-span-6">
                          <Select
                            value={effect.target}
                            onValueChange={(value) => updateBondEffect(index, 'target', value as 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="attack">攻击力</SelectItem>
                              <SelectItem value="defense">防御力</SelectItem>
                              <SelectItem value="magicPower">魔法强度</SelectItem>
                              <SelectItem value="magicResistance">魔法抗性</SelectItem>
                              <SelectItem value="speed">速度</SelectItem>
                              <SelectItem value="maxHP">最大生命</SelectItem>
                              <SelectItem value="critRate">暴击率</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsAddingBond(false)} variant="outline">取消</Button>
                  <Button onClick={handleAddBond}>添加羁绊</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {bonds.length > 0 ? (
            <div className="space-y-4">
              {bonds.map((bond) => (
                <Card key={bond.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">{bond.name}</h5>
                      <p className="text-xs text-muted-foreground">{bond.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => deleteBond(bond.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs">
                    <div className="mb-2">
                      <span className="text-muted-foreground">所需: </span>
                      <span className="font-medium">{bond.minUnits}+ 单位</span>
                      <span className="text-muted-foreground ml-2">类型: </span>
                      <span className="font-medium">{bond.requiredTypes.join('、')}</span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">效果:</span>
                      <ul className="mt-1 pl-4 space-y-1 list-disc">
                        {bond.effects.map((effect, i) => (
                          <li key={i}>
                            {effect.type === 'buff' ? '增加' : '减少'} 
                            {' '}{(effect.value * 100).toFixed(0)}% 
                            {' '}{(() => {
                              switch(effect.target) {
                                case 'attack': return '攻击力';
                                case 'defense': return '防御力';
                                case 'magicPower': return '魔法强度';
                                case 'magicResistance': return '魔法抗性';
                                case 'speed': return '速度';
                                case 'maxHP': return '最大生命';
                                case 'critRate': return '暴击率';
                                default: return effect.target;
                              }
                            })()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>尚未添加任何羁绊，点击"添加新羁绊"按钮创建</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default BalanceAnalyzer;
