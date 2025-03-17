
import Dashboard from '@/components/Dashboard';
import { GameProvider } from '@/context/GameContext';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpdateManager from '@/components/UpdateManager';
import { MainNav } from '@/components/MainNav';
import { FeatureCard } from '@/components/FeatureCard';
import { 
  Swords, 
  Shield, 
  Users, 
  Link2, 
  BarChart, 
  Coins, 
  AlertTriangle,
  Info
} from 'lucide-react';

const Index = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <MainNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          showIntro={showIntro} 
          setShowIntro={setShowIntro} 
        />
        
        {showIntro && (
          <Card className="mb-6 bg-gradient-to-r from-card to-secondary/40 animate-in">
            <CardHeader>
              <CardTitle>自走棋设计工具使用指南</CardTitle>
              <CardDescription>这个工具可以帮助你设计和测试自走棋游戏的各项功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <FeatureCard
                  title="战斗模拟"
                  description="模拟两队单位之间的战斗，观察战斗过程并查看详细日志。"
                  icon={<Swords className="h-5 w-5 text-primary" />}
                />
                <FeatureCard
                  title="单位创建"
                  description="创建各种类型的单位，设置它们的属性、技能和所属队伍。"
                  icon={<Shield className="h-5 w-5 text-primary" />}
                />
                <FeatureCard
                  title="羁绊系统"
                  description="设计不同的羁绊关系，当单位满足特定条件时会获得增益效果。"
                  icon={<Link2 className="h-5 w-5 text-primary" />}
                />
                <FeatureCard
                  title="派系编辑"
                  description="创建不同的派系，每个派系可以拥有独特的特性和加成。"
                  icon={<Users className="h-5 w-5 text-primary" />}
                />
                <FeatureCard
                  title="平衡分析"
                  description="分析游戏平衡性，调整各项参数以获得最佳游戏体验。"
                  icon={<BarChart className="h-5 w-5 text-primary" />}
                />
                <FeatureCard
                  title="经济系统"
                  description="模拟游戏中的经济系统，包括金币获取、利息计算等。"
                  icon={<Coins className="h-5 w-5 text-primary" />}
                />
              </div>
              
              <div className="flex gap-4 items-start mt-6 bg-muted/30 p-4 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">重要说明</h4>
                  <p className="text-sm text-muted-foreground">
                    本工具所有数据都保存在浏览器中，你可以使用保存按钮将数据永久保存。更新日志页面展示了工具的开发进展。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="mt-0 animate-up">
            <GameProvider>
              <Dashboard />
            </GameProvider>
          </TabsContent>
          <TabsContent value="updates" className="mt-0 animate-up">
            <UpdateManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
