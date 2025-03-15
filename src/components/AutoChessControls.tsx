
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useGame } from '@/context/GameContext';

const AutoChessControls = () => {
  const { battleState, startBattle, resetBattle, isSimulating, simulationSpeed, setSimulationSpeed } = useGame();
  const { toast } = useToast();
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<'preparation' | 'battle'>('preparation');
  const [maxRounds, setMaxRounds] = useState(20);
  const [preparationTime, setPreparationTime] = useState(30);
  const [enableBonuses, setEnableBonuses] = useState(true);
  const [terrainEffects, setTerrainEffects] = useState(true);
  
  const handleStartSimulation = () => {
    if (!battleState) {
      toast({
        title: "无法开始模拟",
        description: "请先添加单位到两个队伍",
        variant: "destructive",
      });
      return;
    }
    
    if (battleState.teams.alpha.length === 0 || battleState.teams.beta.length === 0) {
      toast({
        title: "队伍不完整",
        description: "请确保两个队伍都至少有一个单位",
        variant: "destructive",
      });
      return;
    }
    
    startBattle();
    
    toast({
      title: "模拟开始",
      description: "自动棋战斗模拟已开始",
    });
  };
  
  const handleResetSimulation = () => {
    resetBattle();
    
    toast({
      title: "模拟已重置",
      description: "战斗状态已重置，可以重新添加单位",
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>自动棋模拟控制台</CardTitle>
        <CardDescription>控制战斗流程和参数</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="basic" className="flex-1">基础控制</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">高级设置</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">实时数据</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-medium">当前状态</h3>
                  <p className="text-sm text-muted-foreground">
                    {!battleState ? '未初始化' : 
                      battleState.status === 'preparing' ? '准备中' :
                      battleState.status === 'inProgress' ? '战斗中' : '已完成'}
                  </p>
                </div>
                
                <div className="space-y-0.5 text-right">
                  <h3 className="text-base font-medium">回合</h3>
                  <p className="text-sm text-muted-foreground">
                    {battleState ? `${battleState.round} / ${maxRounds}` : '0 / 0'}
                  </p>
                </div>
              </div>
              
              {battleState && battleState.status === 'inProgress' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>战斗进度</span>
                    <span>{Math.round((battleState.round / maxRounds) * 100)}%</span>
                  </div>
                  <Progress value={(battleState.round / maxRounds) * 100} />
                </div>
              )}
              
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">模拟速度</span>
                  <span className="text-sm text-muted-foreground">{simulationSpeed}x</span>
                </div>
                <Slider
                  value={[simulationSpeed]}
                  min={0.5}
                  max={4}
                  step={0.5}
                  onValueChange={(value) => setSimulationSpeed(value[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="phase-switch"
                  checked={selectedPhase === 'battle'}
                  onCheckedChange={(checked) => setSelectedPhase(checked ? 'battle' : 'preparation')}
                />
                <Label htmlFor="phase-switch">
                  {selectedPhase === 'preparation' ? '准备阶段' : '战斗阶段'}
                </Label>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm">最大回合数</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[maxRounds]}
                    min={5}
                    max={50}
                    step={5}
                    onValueChange={(value) => setMaxRounds(value[0])}
                    disabled={isSimulating}
                  />
                  <span className="text-sm w-8 text-center">{maxRounds}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preparation-time">准备阶段时间 (秒)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="preparation-time"
                    value={[preparationTime]}
                    min={10}
                    max={60}
                    step={5}
                    onValueChange={(value) => setPreparationTime(value[0])}
                    disabled={isSimulating}
                  />
                  <span className="text-sm w-8 text-center">{preparationTime}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="terrain-type">地形类型</Label>
                <Select defaultValue="plains" disabled={isSimulating}>
                  <SelectTrigger id="terrain-type">
                    <SelectValue placeholder="选择地形" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plains">平原</SelectItem>
                    <SelectItem value="forest">森林</SelectItem>
                    <SelectItem value="mountain">山地</SelectItem>
                    <SelectItem value="desert">沙漠</SelectItem>
                    <SelectItem value="swamp">沼泽</SelectItem>
                    <SelectItem value="fire">火山</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-bonuses"
                  checked={enableBonuses}
                  onCheckedChange={setEnableBonuses}
                  disabled={isSimulating}
                />
                <Label htmlFor="enable-bonuses">启用种族/职业羁绊</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="terrain-effects"
                  checked={terrainEffects}
                  onCheckedChange={setTerrainEffects}
                  disabled={isSimulating}
                />
                <Label htmlFor="terrain-effects">启用地形效果</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">战斗参数</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>物理防御系数</span>
                    <span>0.035</span>
                  </div>
                  <Slider value={[3.5]} min={1} max={7} step={0.5} disabled={isSimulating} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>魔法抗性系数</span>
                    <span>0.028</span>
                  </div>
                  <Slider value={[2.8]} min={1} max={5} step={0.2} disabled={isSimulating} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>暴击率</span>
                    <span>15%</span>
                  </div>
                  <Slider value={[15]} min={5} max={30} step={1} disabled={isSimulating} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>治疗效率</span>
                    <span>1.0x</span>
                  </div>
                  <Slider value={[10]} min={5} max={15} step={1} disabled={isSimulating} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            {battleState ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">A队状态</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm">单位数量: {battleState.teams.alpha.length}</p>
                      <p className="text-sm">
                        存活单位: {battleState.teams.alpha.filter(u => u.currentHP > 0).length}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">B队状态</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm">单位数量: {battleState.teams.beta.length}</p>
                      <p className="text-sm">
                        存活单位: {battleState.teams.beta.filter(u => u.currentHP > 0).length}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">战斗日志</h3>
                  <div className="max-h-32 overflow-y-auto bg-muted/30 rounded-md p-2 text-xs space-y-1">
                    {battleState.log.length > 0 ? (
                      battleState.log.slice().reverse().map((entry, index) => (
                        <div key={index} className="text-xs">
                          <span className="text-muted-foreground">回合 {entry.round}:</span> {entry.message}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground">暂无战斗日志</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-full h-32" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant={isSimulating ? "destructive" : "default"}
            onClick={isSimulating ? handleResetSimulation : handleStartSimulation}
            className="w-full"
          >
            {isSimulating ? "停止模拟" : "开始模拟"}
          </Button>
          <Button
            variant="outline"
            onClick={handleResetSimulation}
            className="w-full"
            disabled={isSimulating}
          >
            重置状态
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AutoChessControls;
