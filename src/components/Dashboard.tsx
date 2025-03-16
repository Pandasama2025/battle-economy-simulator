
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnitCreator from '@/components/UnitCreator';
import BattleView from '@/components/BattleView';
import BondEditor from '@/components/BondEditor';
import BalanceAnalyzer from '@/components/BalanceAnalyzer';
import EconomyPanel from '@/components/EconomyPanel';
import ConfigManager from '@/components/ConfigManager';
import UpdateManager from '@/components/UpdateManager';
import FactionEditor from '@/components/FactionEditor';
import { Button } from '@/components/ui/button';
import { useGameContext } from '@/context/GameContext';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('battle');
  const { saveUnits, loadUnits } = useGameContext();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">自走棋战斗系统设计工具</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          <TabsTrigger value="battle">战斗模拟</TabsTrigger>
          <TabsTrigger value="units">单位创建</TabsTrigger>
          <TabsTrigger value="bonds">羁绊编辑</TabsTrigger>
          <TabsTrigger value="factions">派系编辑</TabsTrigger>
          <TabsTrigger value="balance">平衡分析</TabsTrigger>
          <TabsTrigger value="economy">经济系统</TabsTrigger>
          <TabsTrigger value="config">配置管理</TabsTrigger>
          <TabsTrigger value="updates">更新日志</TabsTrigger>
        </TabsList>
        
        <div className="flex justify-end mb-4">
          <Button onClick={saveUnits} variant="outline" className="mr-2">
            保存所有单位
          </Button>
          <Button onClick={loadUnits} variant="outline">
            加载保存的单位
          </Button>
        </div>
        
        <TabsContent value="battle">
          <BattleView />
        </TabsContent>
        
        <TabsContent value="units">
          <UnitCreator />
        </TabsContent>
        
        <TabsContent value="bonds">
          <BondEditor />
        </TabsContent>
        
        <TabsContent value="factions">
          <FactionEditor />
        </TabsContent>
        
        <TabsContent value="balance">
          <BalanceAnalyzer />
        </TabsContent>
        
        <TabsContent value="economy">
          <EconomyPanel />
        </TabsContent>
        
        <TabsContent value="config">
          <ConfigManager />
        </TabsContent>
        
        <TabsContent value="updates">
          <UpdateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
