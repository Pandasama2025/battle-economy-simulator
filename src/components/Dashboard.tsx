
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UnitCreator from './UnitCreator';
import AutoChessControls from './AutoChessControls';
import BattleField from './BattleField';
import BalanceOptimizationPanel from './advanced/BalanceOptimizationPanel';
import { useGame } from '@/context/GameContext';

const Dashboard = () => {
  const { battleState } = useGame();
  const [activeTab, setActiveTab] = useState('simulation');
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>自动棋战斗系统模拟器</CardTitle>
            <CardDescription>
              创建单位、管理战斗、优化平衡性
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs
        defaultValue="simulation"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 h-auto p-1">
          <TabsTrigger value="simulation" className="py-2">战斗模拟</TabsTrigger>
          <TabsTrigger value="units" className="py-2">单位编辑</TabsTrigger>
          <TabsTrigger value="balance" className="py-2">平衡分析</TabsTrigger>
          <TabsTrigger value="advanced" className="py-2">高级设置</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <BattleField />
            </div>
            <div>
              <AutoChessControls />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="units" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <UnitCreator />
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>单位列表</CardTitle>
                  <CardDescription>已创建的单位</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">A队 ({battleState?.teams.alpha.length || 0}名单位)</h3>
                    {battleState?.teams.alpha.length === 0 ? (
                      <p className="text-sm text-muted-foreground">暂无单位</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {battleState?.teams.alpha.map(unit => (
                          <div key={unit.id} className="text-sm p-2 bg-muted/30 rounded-md">
                            <div className="font-medium">{unit.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {unit.race} | {unit.profession} | Lv.{unit.level}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">B队 ({battleState?.teams.beta.length || 0}名单位)</h3>
                    {battleState?.teams.beta.length === 0 ? (
                      <p className="text-sm text-muted-foreground">暂无单位</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {battleState?.teams.beta.map(unit => (
                          <div key={unit.id} className="text-sm p-2 bg-muted/30 rounded-md">
                            <div className="font-medium">{unit.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {unit.race} | {unit.profession} | Lv.{unit.level}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="balance" className="space-y-4">
          <div className="grid gap-4">
            <BalanceOptimizationPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>羁绊效果设置</CardTitle>
                <CardDescription>配置种族和职业羁绊效果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">种族羁绊</h3>
                    <div className="space-y-2">
                      {['人类', '精灵', '龙族', '亡灵', '机械', '元素'].map(race => (
                        <div key={race} className="bg-muted/30 p-2 rounded-md">
                          <div className="font-medium text-sm">{race}</div>
                          <div className="grid grid-cols-3 gap-x-2 mt-1 text-xs">
                            <div>
                              <span className="text-muted-foreground">(2):</span> +10% 属性
                            </div>
                            <div>
                              <span className="text-muted-foreground">(4):</span> +20% 属性
                            </div>
                            <div>
                              <span className="text-muted-foreground">(6):</span> 特殊效果
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">职业羁绊</h3>
                    <div className="space-y-2">
                      {['坦克', '输出', '辅助', '控制', '刺客'].map(profession => (
                        <div key={profession} className="bg-muted/30 p-2 rounded-md">
                          <div className="font-medium text-sm">{profession}</div>
                          <div className="grid grid-cols-3 gap-x-2 mt-1 text-xs">
                            <div>
                              <span className="text-muted-foreground">(2):</span> +10% 能力
                            </div>
                            <div>
                              <span className="text-muted-foreground">(4):</span> +25% 能力
                            </div>
                            <div>
                              <span className="text-muted-foreground">(6):</span> 职业特效
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>游戏参数配置</CardTitle>
                <CardDescription>修改游戏核心参数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">战斗参数</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="text-sm">回合时间</div>
                        <div className="text-xs text-muted-foreground">准备阶段: 30秒</div>
                        <div className="text-xs text-muted-foreground">战斗阶段: 自动</div>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="text-sm">行动顺序</div>
                        <div className="text-xs text-muted-foreground">先攻 {'>'} 普通 {'>'} 迟缓</div>
                        <div className="text-xs text-muted-foreground">基于速度属性</div>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="text-sm">伤害计算</div>
                        <div className="text-xs text-muted-foreground">物伤系数: 0.035</div>
                        <div className="text-xs text-muted-foreground">法伤系数: 0.028</div>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="text-sm">战斗限制</div>
                        <div className="text-xs text-muted-foreground">最大回合: 20</div>
                        <div className="text-xs text-muted-foreground">超时判定: 剩余生命值</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">经济参数</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="text-sm">金币获取</div>
                        <div className="text-xs text-muted-foreground">基础: 5/回合</div>
                        <div className="text-xs text-muted-foreground">利息: 10%</div>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="text-sm">商店机制</div>
                        <div className="text-xs text-muted-foreground">刷新费用: 2金币</div>
                        <div className="text-xs text-muted-foreground">升级费用: 4金币</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
