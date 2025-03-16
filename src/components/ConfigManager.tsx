
import React, { useState } from 'react';
import { useGameConfig } from '@/hooks/use-game-config';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, RotateCcw, Flag, Activity, Lightbulb, Package } from 'lucide-react';

const ConfigManager: React.FC = () => {
  const { config, configManager } = useGameConfig();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('balance');
  
  // 平衡参数临时状态
  const [balanceParams, setBalanceParams] = useState({...config.balanceParameters});
  
  // 保存平衡参数
  const saveBalanceParams = () => {
    configManager.updateBalanceParameters(balanceParams, "手动更新平衡参数");
    toast({
      title: "已保存平衡参数",
      description: "游戏平衡参数已更新",
    });
  };
  
  // 切换特性开关
  const toggleFeature = (key: string, enabled: boolean) => {
    configManager.toggleFeatureFlag(key, enabled);
    toast({
      title: enabled ? "已启用功能" : "已禁用功能",
      description: `${config.featureFlags[key].name}已${enabled ? '启用' : '禁用'}`,
    });
  };
  
  // 更新UI选项
  const updateUIOption = (key: keyof typeof config.uiOptions, value: any) => {
    configManager.updateUIOptions({ [key]: value });
  };
  
  // 历史版本记录
  const configHistory = configManager.getConfigHistory();
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Settings className="mr-2" />
        <h2 className="text-2xl font-bold">配置管理器</h2>
      </div>
      
      <Tabs defaultValue="balance" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="balance"><Activity className="w-4 h-4 mr-1" /> 平衡参数</TabsTrigger>
          <TabsTrigger value="features"><Flag className="w-4 h-4 mr-1" /> 功能开关</TabsTrigger>
          <TabsTrigger value="ui"><Lightbulb className="w-4 h-4 mr-1" /> 界面选项</TabsTrigger>
          <TabsTrigger value="history"><RotateCcw className="w-4 h-4 mr-1" /> 历史记录</TabsTrigger>
        </TabsList>
        
        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>平衡参数设置</CardTitle>
              <CardDescription>调整游戏的核心平衡参数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="physicalDefense">物理防御系数 ({balanceParams.physicalDefense.toFixed(3)})</Label>
                    <Slider 
                      id="physicalDefense"
                      value={[balanceParams.physicalDefense]}
                      min={0.01}
                      max={0.05}
                      step={0.001}
                      onValueChange={([value]) => setBalanceParams({...balanceParams, physicalDefense: value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="magicResistance">魔法抗性系数 ({balanceParams.magicResistance.toFixed(3)})</Label>
                    <Slider 
                      id="magicResistance"
                      value={[balanceParams.magicResistance]}
                      min={0.01}
                      max={0.05}
                      step={0.001}
                      onValueChange={([value]) => setBalanceParams({...balanceParams, magicResistance: value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="criticalRate">暴击率系数 ({balanceParams.criticalRate.toFixed(3)})</Label>
                    <Slider 
                      id="criticalRate"
                      value={[balanceParams.criticalRate]}
                      min={0.1}
                      max={0.3}
                      step={0.01}
                      onValueChange={([value]) => setBalanceParams({...balanceParams, criticalRate: value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="healingEfficiency">治疗效率 ({balanceParams.healingEfficiency.toFixed(2)})</Label>
                    <Slider 
                      id="healingEfficiency"
                      value={[balanceParams.healingEfficiency]}
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      onValueChange={([value]) => setBalanceParams({...balanceParams, healingEfficiency: value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goldScaling">金币缩放系数 ({balanceParams.goldScaling.toFixed(2)})</Label>
                    <Slider 
                      id="goldScaling"
                      value={[balanceParams.goldScaling]}
                      min={0.8}
                      max={1.5}
                      step={0.05}
                      onValueChange={([value]) => setBalanceParams({...balanceParams, goldScaling: value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="interestRate">利息率 ({balanceParams.interestRate.toFixed(2)})</Label>
                    <Slider 
                      id="interestRate"
                      value={[balanceParams.interestRate]}
                      min={0.05}
                      max={0.2}
                      step={0.01}
                      onValueChange={([value]) => setBalanceParams({...balanceParams, interestRate: value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={saveBalanceParams} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  保存平衡参数
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>功能开关</CardTitle>
              <CardDescription>启用或禁用游戏功能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(config.featureFlags).map(([key, feature]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <Switch 
                      checked={feature.enabled}
                      onCheckedChange={(checked) => toggleFeature(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle>界面设置</CardTitle>
              <CardDescription>自定义游戏界面选项</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showDetailedStats">显示详细状态</Label>
                  <Switch 
                    id="showDetailedStats"
                    checked={config.uiOptions.showDetailedStats}
                    onCheckedChange={(checked) => updateUIOption('showDetailedStats', checked)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="animationSpeed">动画速度 ({config.uiOptions.animationSpeed.toFixed(1)}x)</Label>
                  <Slider 
                    id="animationSpeed"
                    value={[config.uiOptions.animationSpeed]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) => updateUIOption('animationSpeed', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showBattleEffects">显示战斗效果</Label>
                  <Switch 
                    id="showBattleEffects"
                    checked={config.uiOptions.showBattleEffects}
                    onCheckedChange={(checked) => updateUIOption('showBattleEffects', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode">暗黑模式</Label>
                  <Switch 
                    id="darkMode"
                    checked={config.uiOptions.darkMode}
                    onCheckedChange={(checked) => updateUIOption('darkMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>配置历史记录</CardTitle>
              <CardDescription>查看和恢复之前的配置</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {configHistory.map((version, index) => (
                    <div key={version.hash} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{new Date(version.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{version.comment}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            configManager.rollbackToVersion(version.hash);
                            setBalanceParams({...version.params as any});
                            toast({
                              title: "已恢复配置",
                              description: `已恢复到 ${new Date(version.timestamp).toLocaleString()} 的配置`,
                            });
                          }}
                        >
                          恢复此版本
                        </Button>
                      </div>
                      <Separator className="my-2" />
                      <div className="text-sm">
                        {Object.entries(version.params).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-2 gap-2">
                            <span className="text-gray-500">{key}:</span>
                            <span>{typeof value === 'number' ? value.toFixed(3) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigManager;
