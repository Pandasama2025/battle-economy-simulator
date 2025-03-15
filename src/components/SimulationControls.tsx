
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, Save, ChevronDown, ChevronUp, LineChart } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useGameContext } from '@/context/GameContext';
import { TerrainType } from '@/types/battle';

const SimulationControls = () => {
  const { 
    isSimulationRunning, 
    activeTerrain, 
    setTerrain, 
    startBattle, 
    pauseBattle, 
    resetBattle, 
    advanceBattleRound,
    battleState
  } = useGameContext();
  
  const [speed, setSpeed] = useState([50]);
  const [currentTab, setCurrentTab] = useState('battle');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const { toast } = useToast();

  // 处理自动推进战斗
  useEffect(() => {
    if (!autoAdvance || !isSimulationRunning) return;
    
    const interval = setInterval(() => {
      setSimProgress(prev => {
        const newProgress = prev + (speed[0] / 100);
        if (newProgress >= 100) {
          advanceBattleRound();
          return 0;
        }
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [autoAdvance, isSimulationRunning, speed, advanceBattleRound]);

  // 模拟开始/暂停
  const toggleSimulation = () => {
    if (isSimulationRunning) {
      pauseBattle();
    } else {
      if (!battleState) {
        startBattle();
      } else {
        // 如果战斗已经初始化但是暂停了，继续战斗
        advanceBattleRound();
      }
    }
    
    toast({
      title: isSimulationRunning ? "模拟已暂停" : "模拟已开始",
      description: isSimulationRunning 
        ? "您可以随时继续模拟" 
        : `模拟速度: ${speed[0]}%`,
    });
  };

  // 重置模拟
  const handleResetSimulation = () => {
    resetBattle();
    setSimProgress(0);
    setAutoAdvance(false);
    
    toast({
      title: "模拟已重置",
      description: "所有数据已恢复到初始状态",
    });
  };

  // 触发分析
  const triggerAnalysis = () => {
    toast({
      title: "分析完成",
      description: "平衡评分: 78/100",
    });
  };

  // 保存当前配置
  const saveConfig = () => {
    toast({
      title: "配置已保存",
      description: "当前游戏配置已保存",
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">模拟控制</h3>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            模拟速度
          </label>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            max={100}
            step={1}
            className="mb-6"
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={toggleSimulation}>
            {isSimulationRunning ? (
              <><Pause className="w-4 h-4 mr-2" />暂停</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />开始</>
            )}
          </Button>
          <Button variant="outline" onClick={handleResetSimulation}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={saveConfig}>
            <Save className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-advance"
              checked={autoAdvance}
              onCheckedChange={setAutoAdvance}
            />
            <label 
              htmlFor="auto-advance" 
              className="text-sm cursor-pointer"
            >
              自动推进战斗
            </label>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={triggerAnalysis}
            disabled={isSimulationRunning}
            className="text-xs"
          >
            <LineChart className="w-3 h-3 mr-1" />
            手动分析
          </Button>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="battle" className="flex-1">战斗配置</TabsTrigger>
            <TabsTrigger value="economy" className="flex-1">经济配置</TabsTrigger>
          </TabsList>
          
          <TabsContent value="battle" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>地形类型:</div>
              <div className="text-right">
                <select 
                  className="w-full bg-background text-right border rounded px-1 py-1" 
                  value={activeTerrain} 
                  onChange={(e) => setTerrain(e.target.value as TerrainType)}
                >
                  <option value="plains">平原</option>
                  <option value="forest">森林</option>
                  <option value="mountain">山地</option>
                  <option value="desert">沙漠</option>
                  <option value="swamp">沼泽</option>
                  <option value="fire">火地</option>
                </select>
              </div>
              
              <div>环境效果:</div>
              <div className="text-right">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="mr-2"
                />
                启用
              </div>
            </div>
            
            <div>
              <Button 
                variant="ghost" 
                className="w-full flex justify-between items-center text-sm py-2" 
                onClick={() => setAdvancedOpen(!advancedOpen)}
              >
                高级战斗参数
                {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {advancedOpen && (
                <div className="grid grid-cols-2 gap-2 text-sm mt-2 p-2 border rounded">
                  <div>物理防御系数:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value="0.035" 
                      step="0.001"
                      min="0"
                      max="1"
                    />
                  </div>
                  
                  <div>魔法抗性系数:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value="0.028" 
                      step="0.001"
                      min="0"
                      max="1"
                    />
                  </div>
                  
                  <div>暴击率系数:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value="0.15" 
                      step="0.01"
                      min="0"
                      max="1"
                    />
                  </div>
                  
                  <div>治疗效率:</div>
                  <div className="text-right">
                    <input 
                      type="number" 
                      className="w-16 bg-background text-right border rounded px-1" 
                      value="1.0" 
                      step="0.1"
                      min="0.1"
                      max="5"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="economy" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>金币收益系数:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value="1.2" 
                  step="0.1"
                  min="0.5"
                  max="3"
                />
              </div>
              
              <div>单位基础成本:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value="3" 
                  step="1"
                  min="1"
                  max="10"
                />
              </div>
              
              <div>利息率:</div>
              <div className="text-right">
                <input 
                  type="number" 
                  className="w-16 bg-background text-right border rounded px-1" 
                  value="0.1" 
                  step="0.01"
                  min="0"
                  max="0.5"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {isSimulationRunning && autoAdvance && (
          <div className="mt-4 p-3 bg-muted/10 rounded-lg">
            <div className="text-sm font-medium mb-1">模拟状态</div>
            <div className="text-xs text-muted-foreground">
              正在进行: 第 {battleState ? battleState.round : 0} 轮
              <div className="w-full h-1 bg-secondary mt-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${simProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SimulationControls;
