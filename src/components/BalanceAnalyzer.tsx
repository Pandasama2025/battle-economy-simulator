
import React, { useState } from 'react';
import { BattleConfiguration } from '@/types/battle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Sliders, BarChart3, RefreshCw, Save } from 'lucide-react';

const BalanceAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('parameters');
  
  // Example battle configuration that follows the correct type
  const battleConfig: BattleConfiguration = {
    combatParameters: {
      physicalDefense: 0.035,
      magicResistance: 0.028,
      criticalRate: 0.15,
      healingEfficiency: 1.0
    },
    matchParameters: {
      maxRounds: 20,
      teamSize: 5,
      environmentEffects: true
    }
  };

  const parameterScoreMap = {
    'physicalDefense': { score: 85, trend: 'stable' },
    'magicResistance': { score: 73, trend: 'decreasing' },
    'criticalRate': { score: 92, trend: 'increasing' },
    'healingEfficiency': { score: 80, trend: 'stable' }
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
                    <TableHead>平衡得分</TableHead>
                    <TableHead>趋势</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(battleConfig.combatParameters).map(([param, value]) => (
                    <TableRow key={param}>
                      <TableCell className="font-medium">{param}</TableCell>
                      <TableCell>{value}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-secondary h-2 rounded-full">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${parameterScoreMap[param]?.score || 50}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs">{parameterScoreMap[param]?.score || 50}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          parameterScoreMap[param]?.trend === 'increasing' 
                            ? 'bg-green-100 text-green-800' 
                            : parameterScoreMap[param]?.trend === 'decreasing'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {parameterScoreMap[param]?.trend || 'stable'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-md">
              <h3 className="font-medium mb-2">对局参数</h3>
              <div className="grid grid-cols-2 gap-4">
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
              <Button variant="outline">重置</Button>
              <Button>应用更改</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="simulation">
            <div className="text-center py-8">
              <p className="text-muted-foreground">请先运行战斗模拟以查看结果</p>
              <Button className="mt-4">开始模拟</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="text-center py-8">
              <p className="text-muted-foreground">模拟分析后将提供平衡性建议</p>
              <Button className="mt-4" variant="outline">查看最佳实践</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BalanceAnalyzer;
