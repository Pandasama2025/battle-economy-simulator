
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BalanceAnalyzer from './BalanceAnalyzer';
import EconomyPanel from './EconomyPanel';
import SimulationControls from './SimulationControls';
import BattleView from './BattleView';
import UnitEditor from './UnitEditor';
import BondEditor from './BondEditor';
import { useGameContext } from '@/context/GameContext';

const Dashboard = () => {
  const { units, bonds } = useGameContext();
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>平衡状态</CardTitle>
              <CardDescription>胜率偏差仅±2.6%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96.5%</div>
              <p className="text-xs text-muted-foreground">
                +1.2% 相比上次平衡修改
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>用户活跃度</CardTitle>
              <CardDescription>过去30天内的活跃用户</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,680</div>
              <p className="text-xs text-muted-foreground">
                +8.5% 相比上个月
              </p>
            </CardContent>
            <CardFooter className="text-right">
              <a href="#" className="text-blue-500 hover:underline">
                查看详细报告
              </a>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>会话时长</CardTitle>
              <CardDescription>平均用户会话时长</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4m 32s</div>
              <p className="text-xs text-muted-foreground">
                -1.4% 相比上个月
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>单位与羁绊</CardTitle>
              <CardDescription>可用单位和羁绊组合</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{units.length} / {bonds.length}</div>
              <p className="text-xs text-muted-foreground">
                单位 / 羁绊数量
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-7">
            <CardHeader className="pb-0">
              <CardTitle>游戏平衡分析</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="units">
                <TabsList className="mb-4">
                  <TabsTrigger value="units">单位编辑</TabsTrigger>
                  <TabsTrigger value="bonds">羁绊系统</TabsTrigger>
                  <TabsTrigger value="battle">战斗模拟</TabsTrigger>
                  <TabsTrigger value="analyzer">平衡分析</TabsTrigger>
                  <TabsTrigger value="economy">经济系统</TabsTrigger>
                  <TabsTrigger value="simulation">模拟控制</TabsTrigger>
                </TabsList>
                <TabsContent value="units" className="space-y-4">
                  <UnitEditor />
                </TabsContent>
                <TabsContent value="bonds" className="space-y-4">
                  <BondEditor />
                </TabsContent>
                <TabsContent value="battle" className="space-y-4">
                  <BattleView />
                </TabsContent>
                <TabsContent value="analyzer" className="space-y-4">
                  <BalanceAnalyzer />
                </TabsContent>
                <TabsContent value="economy" className="space-y-4">
                  <EconomyPanel />
                </TabsContent>
                <TabsContent value="simulation" className="space-y-4">
                  <SimulationControls />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
