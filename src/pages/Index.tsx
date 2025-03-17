
import Dashboard from '@/components/Dashboard';
import { GameProvider } from '@/context/GameContext';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home, Info } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-3.5 w-3.5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>自走棋设计工具</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbItem className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowIntro(!showIntro)} 
                className="flex items-center gap-1 h-7"
              >
                <Info className="w-3.5 h-3.5" />
                <span>工具介绍</span>
              </Button>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {showIntro && (
          <Card className="mb-6 bg-gradient-to-r from-card to-secondary/10">
            <CardHeader>
              <CardTitle>自走棋设计工具使用指南</CardTitle>
              <CardDescription>这个工具可以帮助你设计和测试自走棋游戏的各项功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h3 className="font-semibold">战斗模拟</h3>
                  <p className="text-muted-foreground">在这里你可以模拟两队单位之间的战斗，观察战斗过程并查看详细日志。</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">单位创建</h3>
                  <p className="text-muted-foreground">你可以创建各种类型的单位，设置它们的属性、技能和所属队伍。</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">羁绊系统</h3>
                  <p className="text-muted-foreground">设计不同的羁绊关系，当单位满足特定条件时会获得增益效果。</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">派系编辑</h3>
                  <p className="text-muted-foreground">创建不同的派系，每个派系可以拥有独特的特性和加成。</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">平衡分析</h3>
                  <p className="text-muted-foreground">分析游戏平衡性，调整各项参数以获得最佳游戏体验。</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">经济系统</h3>
                  <p className="text-muted-foreground">模拟游戏中的经济系统，包括金币获取、利息计算等。</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  说明：本工具所有数据都保存在浏览器中，你可以使用保存按钮将数据永久保存。更新日志页面展示了工具的开发进展。
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <GameProvider>
          <Dashboard />
        </GameProvider>
      </div>
    </div>
  );
};

export default Index;
