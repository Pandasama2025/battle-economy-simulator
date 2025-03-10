
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Swords, Zap } from 'lucide-react';
import { Unit, BattleLogEntry } from '@/types/battle';
import { Button } from '@/components/ui/button';

// 模拟数据
const generateMockUnit = (name: string, type: string, team: 'alpha' | 'beta'): Unit => ({
  id: Math.random().toString(36).substring(2, 9),
  name,
  type: type as any,
  level: Math.floor(Math.random() * 3) + 1,
  team,
  maxHP: Math.floor(Math.random() * 100) + 300,
  currentHP: Math.floor(Math.random() * 100) + 250,
  maxMana: 100,
  currentMana: Math.floor(Math.random() * 100),
  attack: Math.floor(Math.random() * 20) + 40,
  defense: Math.floor(Math.random() * 10) + 20,
  magicPower: Math.floor(Math.random() * 30) + 30,
  magicResistance: Math.floor(Math.random() * 15) + 15,
  speed: Math.floor(Math.random() * 10) + 10,
  critRate: 0.1 + Math.random() * 0.2,
  critDamage: 1.5 + Math.random() * 0.5,
  position: { x: 0, y: 0 },
  status: 'idle',
  skills: [],
  items: []
});

const generateMockLog = (round: number): BattleLogEntry[] => {
  const actions = ['attack', 'skill', 'heal', 'defend'];
  const units = ['Knight', 'Mage', 'Archer', 'Warrior', 'Priest', 'Assassin'];
  const effects = ['damage', 'critical hit', 'dodged', 'healed'];
  
  return Array.from({ length: 3 }, (_, i) => ({
    round,
    timestamp: Date.now() - (i * 1000),
    actorId: Math.random().toString(36).substring(2, 9),
    action: actions[Math.floor(Math.random() * actions.length)] as any,
    targetId: Math.random().toString(36).substring(2, 9),
    value: Math.floor(Math.random() * 100) + 50,
    skillId: Math.random() > 0.5 ? Math.random().toString(36).substring(2, 9) : undefined,
    message: `[Round ${round}] ${units[Math.floor(Math.random() * units.length)]} ${
      actions[Math.floor(Math.random() * actions.length)]
    }s ${units[Math.floor(Math.random() * units.length)]} for ${
      Math.floor(Math.random() * 100) + 50
    } ${effects[Math.floor(Math.random() * effects.length)]}`
  }));
};

const BattleView = () => {
  const [round, setRound] = useState(3);
  const [maxRounds, setMaxRounds] = useState(10);
  const [teamAlpha, setTeamAlpha] = useState<Unit[]>([
    generateMockUnit('Knight', 'Knight', 'alpha'),
    generateMockUnit('Mage', 'Mage', 'alpha'),
    generateMockUnit('Archer', 'Archer', 'alpha')
  ]);
  const [teamBeta, setTeamBeta] = useState<Unit[]>([
    generateMockUnit('Warrior', 'Warrior', 'beta'),
    generateMockUnit('Priest', 'Priest', 'beta'),
    generateMockUnit('Assassin', 'Assassin', 'beta')
  ]);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>(generateMockLog(round));
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [activeTerrain, setActiveTerrain] = useState('forest');

  // 模拟战斗进展
  const advanceBattle = () => {
    if (round < maxRounds) {
      setRound(round + 1);
      
      // 更新生命值
      setTeamAlpha(team => team.map(unit => ({
        ...unit,
        currentHP: Math.max(1, unit.currentHP + (Math.random() > 0.7 ? -50 : 20))
      })));
      
      setTeamBeta(team => team.map(unit => ({
        ...unit,
        currentHP: Math.max(1, unit.currentHP + (Math.random() > 0.6 ? -40 : 30))
      })));
      
      // 添加新的战斗日志
      setBattleLog(log => [...generateMockLog(round + 1), ...log.slice(0, 12)]);
    }
  };

  // 显示单位详情
  const showUnitDetails = (unit: Unit) => {
    setActiveUnit(unit);
  };

  return (
    <Card className="p-6 animate-fade-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">战斗模拟</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm px-2 py-1 bg-muted/20 rounded-md">
            回合: {round}/{maxRounds}
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

      <div className="flex justify-end mt-4">
        <Button 
          size="sm" 
          onClick={advanceBattle}
          disabled={round >= maxRounds}
          className="flex items-center gap-1"
        >
          <Zap className="w-3 h-3" /> 
          下一回合
        </Button>
      </div>

      <div className="mt-4 p-4 bg-muted/10 rounded-lg">
        <h4 className="font-medium mb-2">战斗日志</h4>
        <div className="space-y-1 text-sm text-muted-foreground max-h-40 overflow-y-auto">
          {battleLog.map((entry, i) => (
            <p key={i}>{entry.message}</p>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default BattleView;
