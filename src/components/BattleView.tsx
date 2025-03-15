
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Swords, Zap } from 'lucide-react';
import { Unit } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { useGameContext } from '@/context/GameContext';

const BattleView = () => {
  const { 
    units, 
    activeTerrain, 
    battleLog, 
    battleState, 
    isSimulationRunning,
    advanceBattleRound, 
    startBattle, 
    pauseBattle, 
    resetBattle 
  } = useGameContext();
  
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  
  // 获取当前战斗中的单位
  const getBattleUnits = () => {
    if (battleState) {
      return {
        teamAlpha: battleState.teams.alpha,
        teamBeta: battleState.teams.beta
      };
    }
    
    // 如果战斗未开始，显示编辑中的单位
    return {
      teamAlpha: units.filter(unit => unit.team === 'alpha'),
      teamBeta: units.filter(unit => unit.team === 'beta')
    };
  };
  
  const { teamAlpha, teamBeta } = getBattleUnits();
  
  // 显示单位详情
  const showUnitDetails = (unit: Unit) => {
    setActiveUnit(unit);
  };
  
  // 处理战斗相关操作
  const handleBattleAction = () => {
    if (!battleState) {
      startBattle();
    } else if (isSimulationRunning) {
      pauseBattle();
    } else {
      advanceBattleRound();
    }
  };
  
  // 重置战斗
  const handleResetBattle = () => {
    resetBattle();
    setActiveUnit(null);
  };

  return (
    <Card className="p-6 animate-fade-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">战斗模拟</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm px-2 py-1 bg-muted/20 rounded-md">
            回合: {battleState ? battleState.round : 0}/{battleState?.maxRounds || 10}
          </div>
          <div className="text-sm px-2 py-1 bg-muted/20 rounded-md">
            地形: {activeTerrain}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            Team Alpha
          </h4>
          
          {teamAlpha.map((unit, i) => (
            <div key={i} className="space-y-2" onClick={() => showUnitDetails(unit)}>
              <div className="flex justify-between text-sm cursor-pointer hover:bg-muted/10 p-1 rounded">
                <div className="flex items-center gap-1">
                  <span>{unit.name}</span>
                  <span className="text-xs text-muted-foreground ml-1">Lv.{unit.level}</span>
                </div>
                <span>HP: {unit.currentHP}/{unit.maxHP}</span>
              </div>
              <Progress value={(unit.currentHP / unit.maxHP) * 100} className="h-2" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Swords className="w-4 h-4 text-red-500" />
            Team Beta
          </h4>
          
          {teamBeta.map((unit, i) => (
            <div key={i} className="space-y-2" onClick={() => showUnitDetails(unit)}>
              <div className="flex justify-between text-sm cursor-pointer hover:bg-muted/10 p-1 rounded">
                <div className="flex items-center gap-1">
                  <span>{unit.name}</span>
                  <span className="text-xs text-muted-foreground ml-1">Lv.{unit.level}</span>
                </div>
                <span>HP: {unit.currentHP}/{unit.maxHP}</span>
              </div>
              <Progress value={(unit.currentHP / unit.maxHP) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {activeUnit && (
        <div className="mt-4 p-3 bg-muted/10 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">单位详情</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveUnit(null)}
              className="h-7 text-xs"
            >
              关闭
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>类型:</div>
            <div>{activeUnit.type}</div>
            <div>攻击力:</div>
            <div>{activeUnit.attack}</div>
            <div>防御力:</div>
            <div>{activeUnit.defense}</div>
            <div>魔法力:</div>
            <div>{activeUnit.magicPower}</div>
            <div>速度:</div>
            <div>{activeUnit.speed}</div>
            <div>暴击率:</div>
            <div>{(activeUnit.critRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          onClick={handleResetBattle}
          disabled={!battleState}
        >
          重置战斗
        </Button>
        
        <Button 
          onClick={handleBattleAction}
          disabled={battleState?.status === 'completed'}
          className="flex items-center gap-1"
        >
          {!battleState ? (
            <>开始战斗</>
          ) : isSimulationRunning ? (
            <>暂停</>
          ) : (
            <><Zap className="w-3 h-3" /> 下一回合</>
          )}
        </Button>
      </div>

      <div className="mt-4 p-4 bg-muted/10 rounded-lg">
        <h4 className="font-medium mb-2">战斗日志</h4>
        <div className="space-y-1 text-sm text-muted-foreground max-h-40 overflow-y-auto">
          {battleLog.length === 0 ? (
            <p>战斗尚未开始</p>
          ) : (
            battleLog.map((entry, i) => (
              <p key={i}>{entry.message}</p>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default BattleView;
