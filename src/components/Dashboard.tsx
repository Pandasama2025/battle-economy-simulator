
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
import { 
  Swords, 
  Shield, 
  Users, 
  Link2, 
  BarChart, 
  Coins, 
  Settings, 
  History,
  Save, 
  Download
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('battle');
  const { saveUnits, loadUnits } = useGameContext();
  const isMobile = useIsMobile();

  const tabItems = [
    { id: 'battle', label: '战斗模拟', icon: <Swords className="w-4 h-4" /> },
    { id: 'units', label: '单位创建', icon: <Shield className="w-4 h-4" /> },
    { id: 'bonds', label: '羁绊编辑', icon: <Link2 className="w-4 h-4" /> },
    { id: 'factions', label: '派系编辑', icon: <Users className="w-4 h-4" /> },
    { id: 'balance', label: '平衡分析', icon: <BarChart className="w-4 h-4" /> },
    { id: 'economy', label: '经济系统', icon: <Coins className="w-4 h-4" /> },
    { id: 'config', label: '配置管理', icon: <Settings className="w-4 h-4" /> },
    { id: 'updates', label: '更新日志', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            自走棋战斗系统设计工具
          </h1>
          
          <div className="flex space-x-2">
            <Button 
              onClick={saveUnits} 
              variant="outline" 
              className="flex items-center gap-1"
              size={isMobile ? "sm" : "default"}
            >
              <Save className="w-4 h-4" />
              {!isMobile && <span>保存所有单位</span>}
            </Button>
            <Button 
              onClick={loadUnits} 
              variant="outline"
              className="flex items-center gap-1"
              size={isMobile ? "sm" : "default"}
            >
              <Download className="w-4 h-4" />
              {!isMobile && <span>加载保存的单位</span>}
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex w-full justify-start overflow-x-auto p-1 bg-muted/30 rounded-lg">
            {tabItems.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-1 px-3 py-2"
              >
                {tab.icon}
                <span className={isMobile ? "hidden" : "inline"}>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="bg-card rounded-lg shadow-sm border p-4">
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
          </div>
        </Tabs>
      </header>
    </div>
  );
};

export default Dashboard;
