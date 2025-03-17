import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Swords, Zap, Play, Pause, RotateCcw, ArrowRight } from 'lucide-react';
import { Unit } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { useGameContext } from '@/context/GameContext';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState<string>('teams');
  const isMobile = useIsMobile();
  
  const getBattleUnits = () => {
    if (battleState) {
      return {
        teamAlpha: battleState.teams.alpha,
        teamBeta: battleState.teams.beta
      };
    }
    
    return {
      teamAlpha: units.filter(unit => unit.team === 'alpha'),
      teamBeta: units.filter(unit => unit.team === 'beta')
    };
  };
  
  const { teamAlpha, teamBeta } = getBattleUnits();
  
  const showUnitDetails = (unit: Unit) => {
    setActiveUnit(unit);
  };
  
  const handleBattleAction = () => {
    if (!battleState) {
      startBattle();
    } else if (isSimulationRunning) {
      pauseBattle();
    } else {
      advanceBattleRound();
    }
  };
  
  const handleResetBattle = () => {
    resetBattle();
    setActiveUnit(null);
  };

  const calculateTeamHealth = (team: Unit[]) => {
    if (!team.length) return 0;
    const totalCurrentHP = team.reduce((sum, unit) => sum + unit.currentHP, 0);
    const totalMaxHP = team.reduce((sum, unit) => sum + unit.maxHP, 0);
    return Math.floor((totalCurrentHP / totalMaxHP) * 100);
  };

  const alphaHealthPercent = calculateTeamHealth(teamAlpha);
  const betaHealthPercent = calculateTeamHealth(teamBeta);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3 bg-gradient-to-r from-card to-secondary/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" /> 
                战斗模拟
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background/50">
                  回合: {battleState ? battleState.round : 0}/{battleState?.maxRounds || 10}
                </Badge>
                <Badge variant="outline" className="bg-background/50">
                  地形: {activeTerrain}
                </Badge>
              </div>
            </div>
            <CardDescription>
              管理和模拟自走棋战斗过程，查看单位状态和战斗日志
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm font-medium">战���进度</div>
              {battleState && (
                <div className="text-sm text-muted-foreground">
                  {Math.round((battleState.round / battleState.maxRounds) * 100)}%
                </div>
              )}
            </div>
            <Progress 
              value={battleState ? (battleState.round / battleState.maxRounds) * 100 : 0} 
              className="h-2 mt-2"
            />
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={handleResetBattle}
              disabled={!battleState}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              重置战斗
            </Button>
            
            <Button 
              onClick={handleBattleAction}
              disabled={battleState?.status === 'completed'}
              className="flex items-center gap-1"
            >
              {!battleState ? (
                <><Play className="w-4 h-4" /> 开始战斗</>
              ) : isSimulationRunning ? (
                <><Pause className="w-4 h-4" /> 暂停</>
              ) : (
                <><ArrowRight className="w-4 h-4" /> 下一回合</>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="teams">队伍</TabsTrigger>
              <TabsTrigger value="logs">战斗日志</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Team Alpha
                      <Badge 
                        variant="outline" 
                        className="ml-auto text-xs"
                      >
                        {teamAlpha.filter(u => u.currentHP > 0).length}/{teamAlpha.length}
                      </Badge>
                    </CardTitle>
                    <div className="w-full mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>团队生命值</span>
                        <span>{alphaHealthPercent}%</span>
                      </div>
                      <Progress 
                        value={alphaHealthPercent}
                        className="h-1.5"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto pt-0">
                    <div className="space-y-3">
                      {teamAlpha.map((unit, i) => (
                        <div 
                          key={i} 
                          className={`p-2 rounded-md transition-colors cursor-pointer ${
                            activeUnit?.id === unit.id 
                              ? 'bg-primary/10' 
                              : 'hover:bg-muted/40'
                          }`}
                          onClick={() => showUnitDetails(unit)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{unit.name}</span>
                              <span className="text-xs text-muted-foreground">Lv.{unit.level}</span>
                            </div>
                            <span className="text-xs">{unit.currentHP}/{unit.maxHP}</span>
                          </div>
                          <Progress 
                            value={(unit.currentHP / unit.maxHP) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Swords className="w-4 h-4 text-red-500" />
                      Team Beta
                      <Badge 
                        variant="outline" 
                        className="ml-auto text-xs"
                      >
                        {teamBeta.filter(u => u.currentHP > 0).length}/{teamBeta.length}
                      </Badge>
                    </CardTitle>
                    <div className="w-full mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>团队生命值</span>
                        <span>{betaHealthPercent}%</span>
                      </div>
                      <Progress 
                        value={betaHealthPercent} 
                        className="h-1.5"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto pt-0">
                    <div className="space-y-3">
                      {teamBeta.map((unit, i) => (
                        <div 
                          key={i} 
                          className={`p-2 rounded-md transition-colors cursor-pointer ${
                            activeUnit?.id === unit.id 
                              ? 'bg-primary/10' 
                              : 'hover:bg-muted/40'
                          }`}
                          onClick={() => showUnitDetails(unit)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{unit.name}</span>
                              <span className="text-xs text-muted-foreground">Lv.{unit.level}</span>
                            </div>
                            <span className="text-xs">{unit.currentHP}/{unit.maxHP}</span>
                          </div>
                          <Progress 
                            value={(unit.currentHP / unit.maxHP) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="logs">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">战斗日志</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/20 rounded-md p-3 max-h-[300px] overflow-y-auto space-y-1 text-sm">
                    {battleLog.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">战斗尚未开始</p>
                    ) : (
                      battleLog.map((entry, i) => (
                        <div key={i} className="border-b border-muted/30 last:border-0 pb-1 last:pb-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            回合 {battleState?.round || '?'}:
                          </span> {entry.message}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">单位详情</CardTitle>
            </CardHeader>
            <CardContent>
              {activeUnit ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{activeUnit.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{activeUnit.type}</Badge>
                        {activeUnit.race && <Badge variant="outline">{activeUnit.race}</Badge>}
                        {activeUnit.profession && <Badge variant="outline">{activeUnit.profession}</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">等级 {activeUnit.level}</div>
                      <div className="text-xs text-muted-foreground">{activeUnit.team === 'alpha' ? 'Team Alpha' : 'Team Beta'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>生命值</span>
                      <span>{activeUnit.currentHP}/{activeUnit.maxHP}</span>
                    </div>
                    <Progress 
                      value={(activeUnit.currentHP / activeUnit.maxHP) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {activeUnit.maxMana && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>魔法值</span>
                        <span>{activeUnit.currentMana}/{activeUnit.maxMana}</span>
                      </div>
                      <Progress 
                        value={(activeUnit.currentMana / activeUnit.maxMana) * 100} 
                        className="h-2 bg-blue-100"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">攻击力</span>
                      <p className="font-medium">{activeUnit.attack}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">防御力</span>
                      <p className="font-medium">{activeUnit.defense}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">魔法力</span>
                      <p className="font-medium">{activeUnit.magicPower}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">法术抗性</span>
                      <p className="font-medium">{activeUnit.magicResistance}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">速度</span>
                      <p className="font-medium">{activeUnit.speed}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">暴击率</span>
                      <p className="font-medium">{(activeUnit.critRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  {activeUnit.skills && activeUnit.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">技能</h4>
                      <div className="space-y-2">
                        {activeUnit.skills.map((skill, index) => (
                          <div key={index} className="p-2 bg-muted/20 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded">
                                冷却: {skill.currentCooldown}/{skill.cooldown}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>选择一个单位查看详情</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BattleView;
