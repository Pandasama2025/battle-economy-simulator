
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnitCreator from '@/components/UnitCreator';
import BattleView from '@/components/BattleView';
import BondEditor from '@/components/BondEditor';
import BalanceAnalyzer from '@/components/BalanceAnalyzer';
import EconomyPanel from '@/components/EconomyPanel';
import ConfigManager from '@/components/ConfigManager';
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
  Save, 
  Download,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { GlassPanel } from './ui/glass-panel';
import { Card } from './ui/card';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('battle');
  const { saveUnits, loadUnits } = useGameContext();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showTabInfo, setShowTabInfo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = () => {
    saveUnits();
    setHasUnsavedChanges(false);
    toast({
      title: "保存成功",
      description: "所有单位数据已成功保存",
    });
  };

  const handleLoad = () => {
    loadUnits();
    toast({
      title: "加载成功",
      description: "已加载保存的单位数据",
    });
  };

  // Set unsaved changes after a delay to simulate changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasUnsavedChanges(true);
    }, 60000); // Check for unsaved changes after 1 minute
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to remind users to save if there are unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        toast({
          title: "未保存的更改",
          description: "你有未保存的更改，请记得保存",
          variant: "default"
        });
      }, 30000); // Remind after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, toast]);

  const tabItems = [
    { id: 'battle', label: '战斗模拟', icon: <Swords className="w-4 h-4" />, description: '模拟两支队伍之间的对战，观察战斗过程' },
    { id: 'units', label: '单位创建', icon: <Shield className="w-4 h-4" />, description: '创建、编辑和管理游戏中的各类单位' },
    { id: 'bonds', label: '羁绊编辑', icon: <Link2 className="w-4 h-4" />, description: '设计单位之间的羁绊关系和增益效果' },
    { id: 'factions', label: '派系编辑', icon: <Users className="w-4 h-4" />, description: '管理游戏中的不同派系及其特性' },
    { id: 'balance', label: '平衡分析', icon: <BarChart className="w-4 h-4" />, description: '通过数据分析优化游戏平衡性' },
    { id: 'economy', label: '经济系统', icon: <Coins className="w-4 h-4" />, description: '设计游戏中的经济机制与资源管理' },
    { id: 'config', label: '配置管理', icon: <Settings className="w-4 h-4" />, description: '调整游戏的全局配置与设置' },
  ];

  // Get current tab info
  const currentTabInfo = tabItems.find(tab => tab.id === activeTab);

  return (
    <div className="container mx-auto p-4 max-w-7xl animate-in">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
              {currentTabInfo?.label || '战斗系统设计面板'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {currentTabInfo?.description || '设计与测试自走棋游戏的各项功能'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowTabInfo(!showTabInfo)}
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              {!isMobile && <span>功能说明</span>}
            </Button>
            <Button 
              onClick={handleSave}
              variant={hasUnsavedChanges ? "default" : "outline"} 
              className={cn("flex items-center gap-1", hasUnsavedChanges && "animate-pulse")}
              size={isMobile ? "sm" : "default"}
            >
              <Save className="w-4 h-4" />
              {!isMobile && <span>保存数据</span>}
            </Button>
            <Button 
              onClick={handleLoad}
              variant="outline"
              className="flex items-center gap-1"
              size={isMobile ? "sm" : "default"}
            >
              <Download className="w-4 h-4" />
              {!isMobile && <span>加载数据</span>}
            </Button>
          </div>
        </div>
        
        {showTabInfo && (
          <GlassPanel className="mb-4 p-3 animate-in flex gap-2 items-center">
            <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm">
              <span className="font-medium">{currentTabInfo?.label}：</span>
              {currentTabInfo?.description} — 使用下方选项卡切换不同功能模块
            </p>
          </GlassPanel>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex w-full justify-start overflow-x-auto p-1 rounded-lg bg-muted/30">
            {tabItems.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-1 px-3 py-2"
              >
                {tab.icon}
                <span className={isMobile ? "hidden sm:inline" : "inline"}>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Card className="rounded-lg shadow-sm border p-0 overflow-hidden">
            <TabsContent value="battle" className="m-0">
              <BattleView />
            </TabsContent>
            
            <TabsContent value="units" className="m-0">
              <UnitCreator />
            </TabsContent>
            
            <TabsContent value="bonds" className="m-0">
              <BondEditor />
            </TabsContent>
            
            <TabsContent value="factions" className="m-0">
              <FactionEditor />
            </TabsContent>
            
            <TabsContent value="balance" className="m-0">
              <BalanceAnalyzer />
            </TabsContent>
            
            <TabsContent value="economy" className="m-0">
              <EconomyPanel />
            </TabsContent>
            
            <TabsContent value="config" className="m-0">
              <ConfigManager />
            </TabsContent>
          </Card>
        </Tabs>
      </header>
    </div>
  );
};

export default Dashboard;
