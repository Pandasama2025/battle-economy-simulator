
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/types/battle';
import BattleUnitCard from './BattleUnitCard';
import { useGame } from '@/context/GameContext';

const BattleField = () => {
  const { battleState, resetBattle } = useGame();
  const { toast } = useToast();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  
  // 清除选中的单位（如果它已经死亡或不在战场上）
  useEffect(() => {
    if (selectedUnit && (!battleState || 
        (!battleState.teams.alpha.some(u => u.id === selectedUnit.id) && 
         !battleState.teams.beta.some(u => u.id === selectedUnit.id)))) {
      setSelectedUnit(null);
    }
  }, [battleState, selectedUnit]);
  
  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(prev => prev?.id === unit.id ? null : unit);
    
    toast({
      title: `${unit.name}`,
      description: `${unit.race} ${unit.profession} | 生命: ${unit.currentHP}/${unit.maxHP}`,
    });
  };
  
  const getTeamRaceCounts = (team: Unit[]) => {
    const counts: Record<string, number> = {};
    team.forEach(unit => {
      counts[unit.race] = (counts[unit.race] || 0) + 1;
    });
    return counts;
  };
  
  const getTeamProfessionCounts = (team: Unit[]) => {
    const counts: Record<string, number> = {};
    team.forEach(unit => {
      counts[unit.profession] = (counts[unit.profession] || 0) + 1;
    });
    return counts;
  };
  
  const renderRaceBadges = (raceCounts: Record<string, number>) => {
    return Object.entries(raceCounts).map(([race, count]) => (
      <Badge key={race} variant="outline" className="text-xs">
        {race} ({count})
      </Badge>
    ));
  };
  
  const renderProfessionBadges = (professionCounts: Record<string, number>) => {
    return Object.entries(professionCounts).map(([profession, count]) => (
      <Badge key={profession} variant="outline" className="text-xs">
        {profession} ({count})
      </Badge>
    ));
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>战斗场地</CardTitle>
            <CardDescription>自动棋战斗模拟</CardDescription>
          </div>
          {battleState?.status === 'completed' && (
            <Badge variant={battleState.winner === 'draw' ? 'outline' : 'default'}>
              {battleState.winner === 'alpha' ? 'A队获胜' : 
               battleState.winner === 'beta' ? 'B队获胜' : '战平'}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!battleState || (battleState.teams.alpha.length === 0 && battleState.teams.beta.length === 0) ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="mb-2">请先添加单位到两个队伍</p>
            <Button variant="outline" size="sm" onClick={() => window.location.hash = 'units'}>
              前往单位编辑
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">B队 ({battleState.teams.beta.length}名单位)</h3>
                <div className="flex flex-wrap gap-1">
                  {renderRaceBadges(getTeamRaceCounts(battleState.teams.beta))}
                  {renderProfessionBadges(getTeamProfessionCounts(battleState.teams.beta))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {battleState.teams.beta.map(unit => (
                  <BattleUnitCard
                    key={unit.id}
                    unit={unit}
                    isSelected={selectedUnit?.id === unit.id}
                    onClick={() => handleUnitClick(unit)}
                  />
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">A队 ({battleState.teams.alpha.length}名单位)</h3>
                <div className="flex flex-wrap gap-1">
                  {renderRaceBadges(getTeamRaceCounts(battleState.teams.alpha))}
                  {renderProfessionBadges(getTeamProfessionCounts(battleState.teams.alpha))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {battleState.teams.alpha.map(unit => (
                  <BattleUnitCard
                    key={unit.id}
                    unit={unit}
                    isSelected={selectedUnit?.id === unit.id}
                    onClick={() => handleUnitClick(unit)}
                  />
                ))}
              </div>
            </div>
            
            {selectedUnit && (
              <div className="p-3 bg-muted/20 rounded-md">
                <h3 className="text-sm font-medium mb-2">单位详情: {selectedUnit.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">基本信息</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>种族:</div>
                      <div>{selectedUnit.race}</div>
                      <div>职业:</div>
                      <div>{selectedUnit.profession}</div>
                      <div>等级:</div>
                      <div>{selectedUnit.level}</div>
                      <div>队伍:</div>
                      <div>{selectedUnit.team === 'alpha' ? 'A队' : 'B队'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">战斗属性</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>攻击力:</div>
                      <div>{selectedUnit.attack}</div>
                      <div>防御力:</div>
                      <div>{selectedUnit.defense}</div>
                      <div>法术力:</div>
                      <div>{selectedUnit.magicPower}</div>
                      <div>魔抗:</div>
                      <div>{selectedUnit.magicResistance}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">其他属性</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>速度:</div>
                      <div>{selectedUnit.speed}</div>
                      <div>暴击率:</div>
                      <div>{(selectedUnit.critRate * 100).toFixed(1)}%</div>
                      <div>暴击伤害:</div>
                      <div>{selectedUnit.critDamage}x</div>
                      <div>状态:</div>
                      <div>{selectedUnit.status}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BattleField;
