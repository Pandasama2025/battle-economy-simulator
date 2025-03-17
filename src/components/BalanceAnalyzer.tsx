
import React, { useState, useEffect } from 'react';
import { BattleConfiguration } from '@/types/battle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Sliders, BarChart3, RefreshCw, Save } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { SimulationAnalyzer } from '@/lib/analytics/SimulationAnalyzer';
import { useToast } from '@/hooks/use-toast';

const BalanceAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('parameters');
  const { battleState, balanceParameters, setBalanceParameters } = useGame();
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [analyzer] = useState(() => new SimulationAnalyzer());
  const { toast } = useToast();
  
  // 监控战斗状态变化，更新分析数据
  useEffect(() => {
    if (battleState && battleState.status === 'completed') {
      // 添加战斗数据到分析器
      analyzer.addBattleData(battleState);
      
      // 生成分析报告
      const report = analyzer.generateBalanceReport();
      setSimulationResults(report);
      
      // 获取平衡建议
      const recommendations = analyzer.getBalanceRecommendations();
      setRecommendations(recommendations);
      
      // 自动切换到模拟结果标签
      setActiveTab('simulation');
      
      toast({
        title: "战斗分析完成",
        description: "战斗数据已分析，可以查看分析结果",
      });
    }
  }, [battleState, analyzer, toast]);
  
  // 战斗配置从当前平衡参数生成
  const battleConfig: BattleConfiguration = {
    combatParameters: {
      physicalDefense: balanceParameters.physicalDefense,
      magicResistance: balanceParameters.magicResistance,
      criticalRate: balanceParameters.criticalRate,
      healingEfficiency: balanceParameters.healingEfficiency
    },
    matchParameters: {
      maxRounds: battleState?.maxRounds || 20,
      teamSize: Math.max(
        battleState?.teams?.alpha?.length || 0,
        battleState?.teams?.beta?.length || 0
      ),
      environmentEffects: battleState?.environmentEffects || true
    }
  };

  // 处理参数调整
  const handleParameterChange = (param: string, value: number) => {
    setBalanceParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  // 应用推荐的平衡修改
  const applyRecommendations = () => {
    if (!recommendations) return;
    
    // 根据建议自动调整参数
    const newParameters = { ...balanceParameters };
    
    recommendations.unitAdjustments.forEach(adjustment => {
      if (adjustment.issue.includes('胜率过高')) {
        // 降低高胜率单位的效果
        if (adjustment.recommendation.includes('攻击力')) {
          newParameters.physicalDefense += 0.003;
        } else if (adjustment.recommendation.includes('技能')) {
          newParameters.magicResistance += 0.002;
        }
      } else if (adjustment.issue.includes('胜率过低')) {
        // 提高低胜率单位的效果
        if (adjustment.recommendation.includes('攻击力')) {
          newParameters.physicalDefense -= 0.002;
        } else if (adjustment.recommendation.includes('技能')) {
          newParameters.magicResistance -= 0.002;
        }
      }
    });
    
    recommendations.economyAdjustments.forEach(adjustment => {
      if (adjustment.parameter.includes('物品') && adjustment.issue.includes('使用率过高')) {
        newParameters.goldScaling += 0.1;
      } else if (adjustment.parameter.includes('物品') && adjustment.issue.includes('使用率过低')) {
        newParameters.goldScaling -= 0.05;
      } else if (adjustment.parameter.includes('翻盘机制')) {
        newParameters.interestRate = adjustment.issue.includes('过低') 
          ? newParameters.interestRate + 0.02
          : newParameters.interestRate - 0.01;
      }
    });
    
    // 确保参数在合理范围内
    Object.keys(newParameters).forEach(key => {
      newParameters[key] = Math.max(0.01, Math.min(2, newParameters[key]));
    });
    
    setBalanceParameters(newParameters);
    
    toast({
      title: "已应用平衡建议",
      description: "游戏参数已根据分析建议进行调整",
    });
  };
  
  // 重置分析器数据
  const resetAnalyzer = () => {
    analyzer.clearHistory();
    setSimulationResults(null);
    setRecommendations(null);
    toast({
      title: "分析数据已重置",
      description: "所有战斗分析数据已清除",
    });
  };

  return (
    <Card className="w-full animate-fade-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          平衡分析工具
        </CardTitle>
        <CardDescription>
          分析和优化自走棋战斗系统的平衡性
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="parameters">
              <Sliders className="h-4 w-4 mr-2" />
              战斗参数
            </TabsTrigger>
            <TabsTrigger value="simulation">
              <RefreshCw className="h-4 w-4 mr-2" />
              模拟结果
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Save className="h-4 w-4 mr-2" />
              平衡建议
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="space-y-4">
            <div className="bg-muted/20 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">当前战斗配置</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>参数</TableHead>
                    <TableHead>值</TableHead>
                    <TableHead>调整</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(battleConfig.combatParameters).map(([param, value]) => (
                    <TableRow key={param}>
                      <TableCell className="font-medium">
                        {param === 'physicalDefense' ? '物理防御系数' :
                         param === 'magicResistance' ? '魔法抗性系数' :
                         param === 'criticalRate' ? '暴击率系数' :
                         param === 'healingEfficiency' ? '治疗效率' : param}
                      </TableCell>
                      <TableCell>{value.toFixed(3)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleParameterChange(param, value * 0.9)}
                          >-</Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleParameterChange(param, value * 1.1)}
                          >+</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium">金币缩放系数</TableCell>
                    <TableCell>{balanceParameters.goldScaling.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleParameterChange('goldScaling', balanceParameters.goldScaling * 0.9)}
                        >-</Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleParameterChange('goldScaling', balanceParameters.goldScaling * 1.1)}
                        >+</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">利息系数</TableCell>
                    <TableCell>{balanceParameters.interestRate.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleParameterChange('interestRate', balanceParameters.interestRate * 0.9)}
                        >-</Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleParameterChange('interestRate', balanceParameters.interestRate * 1.1)}
                        >+</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-md">
              <h3 className="font-medium mb-2">对局参数</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">最大回合数</span>
                  <p className="font-medium">{battleConfig.matchParameters.maxRounds}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">队伍大小</span>
                  <p className="font-medium">{battleConfig.matchParameters.teamSize}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">环境效果</span>
                  <p className="font-medium">{battleConfig.matchParameters.environmentEffects ? '开启' : '关闭'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={resetAnalyzer}>重置分析数据</Button>
              <Button>应用更改</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="simulation">
            {simulationResults ? (
              <div className="space-y-6">
                <div className="bg-muted/20 p-4 rounded-md">
                  <h3 className="font-medium mb-3">单位胜率分析</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>单位类型</TableHead>
                        <TableHead>胜率</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(simulationResults.unitWinRates).map(([unitType, winRate]: [string, number]) => (
                        <TableRow key={unitType}>
                          <TableCell>{unitType}</TableCell>
                          <TableCell>{(winRate * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              winRate > 0.6 ? 'bg-red-100 text-red-800' : 
                              winRate < 0.4 ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {winRate > 0.6 ? '过强' : winRate < 0.4 ? '较弱' : '平衡'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-md">
                  <h3 className="font-medium mb-3">战斗数据</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">平均战斗时长</span>
                      <p className="font-medium">{simulationResults.averageBattleDuration.toFixed(1)}秒</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">翻盘率</span>
                      <p className="font-medium">{(simulationResults.comebackRate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">阵容多样性</span>
                      <p className="font-medium">{(simulationResults.compositionDiversity * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-md">
                  <h3 className="font-medium mb-3">热门阵容</h3>
                  <div className="space-y-3">
                    {simulationResults.topCompositions.map((comp, index) => (
                      <div key={index} className="p-3 bg-background rounded-md">
                        <div className="flex justify-between">
                          <span className="font-medium">阵容 #{index + 1}</span>
                          <span className="text-sm">胜率: {(comp.winRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {comp.units.map((unit, i) => (
                            <span key={i} className="px-2 py-1 bg-primary/10 rounded text-xs">
                              {unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">请先运行战斗模拟以查看结果</p>
                <p className="text-muted-foreground text-sm mt-2">完成一场战斗后，数据将自动分析</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations">
            {recommendations ? (
              <div className="space-y-6">
                <div className="bg-muted/20 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">平衡评分</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-secondary h-3 rounded-full">
                        <div 
                          className={`h-3 rounded-full ${
                            recommendations.balanceScore > 70 ? 'bg-green-500' :
                            recommendations.balanceScore > 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${recommendations.balanceScore}%` }}
                        />
                      </div>
                      <span className="font-medium">{recommendations.balanceScore}/100</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-3 mt-6">单位调整建议</h3>
                  {recommendations.unitAdjustments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>单位类型</TableHead>
                          <TableHead>问题</TableHead>
                          <TableHead>建议</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recommendations.unitAdjustments.map((adjustment, i) => (
                          <TableRow key={i}>
                            <TableCell>{adjustment.unitType}</TableCell>
                            <TableCell>{adjustment.issue}</TableCell>
                            <TableCell>{adjustment.recommendation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">目前单位间平衡性良好，无需调整</p>
                  )}
                  
                  <h3 className="font-medium mb-3 mt-6">经济系统调整建议</h3>
                  {recommendations.economyAdjustments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>参数</TableHead>
                          <TableHead>问题</TableHead>
                          <TableHead>建议</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recommendations.economyAdjustments.map((adjustment, i) => (
                          <TableRow key={i}>
                            <TableCell>{adjustment.parameter}</TableCell>
                            <TableCell>{adjustment.issue}</TableCell>
                            <TableCell>{adjustment.recommendation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">经济系统运行良好，无需调整</p>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={resetAnalyzer}>重置分析</Button>
                  <Button onClick={applyRecommendations}>应用建议</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">完成战斗模拟后将提供平衡性建议</p>
                <Button className="mt-4" variant="outline">查看最佳实践</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BalanceAnalyzer;
