
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

import { BalanceSimulator } from '@/lib/balance/BalanceSimulator';
import { AutoBalancer } from '@/lib/balance/AutoBalancer';
import { SimulationResult } from '@/types/balance';
import { BattleConfiguration } from '@/types/battle';

const BalanceAnalyzer = () => {
  const { toast } = useToast();
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
    physicalDefense: 0.035,
    magicResistance: 0.028,
    criticalRate: 0.15,
    healingEfficiency: 1.0,
    goldScaling: 1.2,
    interestRate: 0.1,
  });
  
  // 模拟器和优化器实例
  const simulatorRef = useRef<BalanceSimulator | null>(null);
  const optimizerRef = useRef<AutoBalancer | null>(null);
  
  useEffect(() => {
    // 创建模拟器和优化器实例
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
    
    const economyConfig = {
      goldScaling: parameterConfig.goldScaling,
      interestRate: parameterConfig.interestRate,
      unitCost: 3,
      marketVolatility: 0.3,
      priceFluctuation: 0.2,
    };
    
    simulatorRef.current = new BalanceSimulator(battleConfig, economyConfig);
    optimizerRef.current = new AutoBalancer(simulatorRef.current);
    
    // 设置优化器迭代回调
    if (optimizerRef.current) {
      optimizerRef.current.setIterationCallback((result, iteration) => {
        setSimulationResults(prev => [...prev, result]);
        setOptimizationProgress(iteration);
      });
    }
  }, []);
  
  // 启动批量模拟
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
      
      // 启动批量模拟
      const results = await simulatorRef.current.batchTest(batchSize[0]);
      setSimulationResults(results);
      
      // 分析参数敏感度
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
  
  // 启动参数优化
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
      
      // 定义参数空间
      const paramSpace = {
        physicalDefense: [0.01, 0.05],
        magicResistance: [0.01, 0.04],
        criticalRate: [0.1, 0.2],
        healingEfficiency: [0.8, 1.2],
        goldScaling: [0.9, 1.5],
        interestRate: [0.05, 0.15]
      };
      
      // 启动优化
      const bestParams = await optimizerRef.current.optimize(
        parameterConfig, 
        paramSpace,
        20 // 迭代次数
      );
      
      setBestParameters(bestParams);
      
      // 分析参数敏感度
      if (optimizerRef.current) {
        try {
          const sensitivity = optimizerRef.current.generateSensitivityReport();
          const sensitivityArray = Object.entries(sensitivity).map(([name, value]) => ({
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
        description: "已找到最佳参数配置",
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
  
  // 停止优化
  const stopOptimization = () => {
    if (optimizerRef.current) {
      optimizerRef.current.stop();
      toast({
        title: "优化已停止",
        description: "已手动停止优化过程",
      });
    }
  };
  
  // 应用推荐参数
  const applyRecommendedParameters = () => {
    if (bestParameters) {
      setParameterConfig(prev => ({
        ...prev,
        ...bestParameters
      }));
      
      toast({
        title: "已应用推荐参数",
        description: "优化参数已应用到模拟配置",
      });
    }
  };
  
  // 分析参数敏感度
  const analyzeSensitivity = (results: SimulationResult[]) => {
    // 简单实现：计算每个参数与平衡得分的相关性
    const params = Object.keys(results[0]?.params || {});
    const correlations: Record<string, number[]> = {};
    
    // 初始化相关性数组
    params.forEach(param => {
      correlations[param] = [];
    });
    
    // 计算每个参数与得分的相关性
    results.forEach(result => {
      params.forEach(param => {
        correlations[param].push(result.params[param] * result.balanceScore);
      });
    });
    
    // 计算平均相关性并排序
    const sensitivity = params.map(param => {
      const values = correlations[param];
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      return { name: param, value: Math.abs(average) };
    }).sort((a, b) => b.value - a.value);
    
    setSensitivityData(sensitivity);
  };
  
  // 更新参数
  const updateParameter = (param: string, value: number) => {
    setParameterConfig(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  // 生成蒙特卡罗模拟
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
      
      // 启动蒙特卡罗模拟
      const results = await simulatorRef.current.monteCarloSimulation(
        parameterConfig,
        30, // 迭代次数
        0.15 // 扰动因子
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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">平衡分析系统</h3>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="simulator">参数模拟</TabsTrigger>
          <TabsTrigger value="optimizer">智能调优</TabsTrigger>
          <TabsTrigger value="visualizer">数据可视化</TabsTrigger>
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
              
              <div className="flex space-x-2 mb-4">
                <Button 
                  onClick={startOptimization} 
                  disabled={isOptimizing}
                  className="text-xs"
                >
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
      </Tabs>
    </Card>
  );
};

export default BalanceAnalyzer;
