
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, Download, CheckCircle, Clock, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  releaseDate: string;
  status: 'available' | 'installed' | 'coming_soon';
  features: string[];
}

// 模拟的游戏更新数据
const MOCK_UPDATES: GameUpdate[] = [
  {
    id: 'update-1',
    version: '1.1.0',
    title: '装备系统更新',
    description: '引入全新的装备系统，单位现在可以装备武器、防具和饰品来增强属性。',
    releaseDate: '2023-08-15',
    status: 'installed',
    features: ['装备系统', '10种新武器', '8种新防具', '装备强化功能']
  },
  {
    id: 'update-2',
    version: '1.2.0',
    title: '元素系统',
    description: '添加元素属性和元素反应系统，使战斗更加丰富多样。',
    releaseDate: '2023-09-22',
    status: 'available',
    features: ['6种元素属性', '15种元素反应', '元素平衡调整', '新单位:元素使']
  },
  {
    id: 'update-3',
    version: '1.3.0',
    title: '公会战',
    description: '加入公会系统和公会战功能，与其他玩家一起组队征战。',
    releaseDate: '2023-11-10',
    status: 'coming_soon',
    features: ['公会系统', '公会战', '公会技能树', '公会商店']
  }
];

const UpdateManager: React.FC = () => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<GameUpdate[]>(MOCK_UPDATES);
  
  const installUpdate = (updateId: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === updateId 
        ? {...update, status: 'installed'} 
        : update
    ));
    
    toast({
      title: "更新已安装",
      description: "游戏已更新到最新版本",
    });
  };
  
  const getStatusBadge = (status: GameUpdate['status']) => {
    switch (status) {
      case 'installed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">已安装</Badge>;
      case 'available':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">可更新</Badge>;
      case 'coming_soon':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">即将推出</Badge>;
    }
  };
  
  const getStatusIcon = (status: GameUpdate['status']) => {
    switch (status) {
      case 'installed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'available':
        return <Download className="h-5 w-5 text-blue-500" />;
      case 'coming_soon':
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Package className="mr-2" />
        <h2 className="text-2xl font-bold">更新管理</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {updates.map(update => (
          <Card key={update.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    {update.title} 
                    <span className="ml-2 text-sm text-gray-500">v{update.version}</span>
                  </CardTitle>
                  <CardDescription>发布日期: {update.releaseDate}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(update.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{update.description}</p>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">主要功能:</h4>
                <div className="flex flex-wrap gap-1">
                  {update.features.map(feature => (
                    <Badge key={feature} variant="secondary" className="mr-1 mb-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                {update.status === 'available' && (
                  <Button onClick={() => installUpdate(update.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    安装更新
                  </Button>
                )}
                
                {update.status === 'installed' && (
                  <Button variant="outline" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    已安装
                  </Button>
                )}
                
                {update.status === 'coming_soon' && (
                  <Button variant="outline" disabled>
                    <Bell className="mr-2 h-4 w-4" />
                    通知我
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpdateManager;
