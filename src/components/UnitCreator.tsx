
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Unit, UnitType, RaceType, ProfessionType } from '@/types/battle';
import { useGame } from '@/context/GameContext';

const generateUnitId = () => `unit-${Math.random().toString(36).substr(2, 9)}`;

const UnitCreator = () => {
  const { addUnit } = useGame();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<UnitType>('战士');
  const [race, setRace] = useState<RaceType>('人类');
  const [profession, setProfession] = useState<ProfessionType>('坦克');
  const [level, setLevel] = useState(1);
  const [team, setTeam] = useState<'alpha' | 'beta'>('alpha');
  
  const [health, setHealth] = useState(100);
  const [mana, setMana] = useState(50);
  const [attack, setAttack] = useState(25);
  const [defense, setDefense] = useState(15);
  const [magicPower, setMagicPower] = useState(20);
  const [magicResistance, setMagicResistance] = useState(10);
  const [speed, setSpeed] = useState(10);

  const unitTypes: UnitType[] = ['战士', '法师', '射手', '骑士', '牧师', '刺客', '商人'];
  const raceTypes: RaceType[] = ['人类', '精灵', '龙族', '亡灵', '机械', '元素'];
  const professionTypes: ProfessionType[] = ['坦克', '输出', '辅助', '控制', '刺客'];

  const createUnit = () => {
    if (!name) {
      toast({
        title: "错误",
        description: "请输入单位名称",
        variant: "destructive",
      });
      return;
    }

    const newUnit: Unit = {
      id: generateUnitId(),
      name,
      type,
      race,
      profession,
      level,
      team,
      maxHP: health,
      currentHP: health,
      maxMana: mana,
      currentMana: mana,
      attack,
      defense,
      magicPower,
      magicResistance,
      speed,
      critRate: 0.05,
      critDamage: 1.5,
      position: { x: 0, y: 0 },
      status: "idle",
      skills: [],
      items: [],
    };
    
    addUnit(newUnit);
    
    toast({
      title: "创建成功",
      description: `单位 ${name} 已创建并添加到${team === 'alpha' ? 'A队' : 'B队'}`,
    });
    
    // 自动切换到下一个队伍，确保两队均衡
    setTeam(team === 'alpha' ? 'beta' : 'alpha');
    setName('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>创建单位</CardTitle>
        <CardDescription>设置单位属性以添加到模拟战斗中</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">单位名称</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="输入单位名称" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="level">单位等级</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="level"
                value={[level]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setLevel(value[0])}
              />
              <span className="w-12 text-center">{level}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">单位类型</Label>
            <Select value={type} onValueChange={(value: UnitType) => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {unitTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="race">种族</Label>
            <Select value={race} onValueChange={(value: RaceType) => setRace(value)}>
              <SelectTrigger id="race">
                <SelectValue placeholder="选择种族" />
              </SelectTrigger>
              <SelectContent>
                {raceTypes.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profession">职业</Label>
            <Select value={profession} onValueChange={(value: ProfessionType) => setProfession(value)}>
              <SelectTrigger id="profession">
                <SelectValue placeholder="选择职业" />
              </SelectTrigger>
              <SelectContent>
                {professionTypes.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>所属队伍</Label>
          <RadioGroup
            value={team}
            onValueChange={(value: 'alpha' | 'beta') => setTeam(value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alpha" id="team-alpha" />
              <Label htmlFor="team-alpha">A队</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beta" id="team-beta" />
              <Label htmlFor="team-beta">B队</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>属性设置</Label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="health">生命值</Label>
                <span className="text-sm">{health}</span>
              </div>
              <Slider
                id="health"
                value={[health]}
                min={50}
                max={500}
                step={10}
                onValueChange={(value) => setHealth(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="mana">法力值</Label>
                <span className="text-sm">{mana}</span>
              </div>
              <Slider
                id="mana"
                value={[mana]}
                min={0}
                max={200}
                step={5}
                onValueChange={(value) => setMana(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="attack">攻击力</Label>
                <span className="text-sm">{attack}</span>
              </div>
              <Slider
                id="attack"
                value={[attack]}
                min={5}
                max={100}
                step={5}
                onValueChange={(value) => setAttack(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="defense">防御力</Label>
                <span className="text-sm">{defense}</span>
              </div>
              <Slider
                id="defense"
                value={[defense]}
                min={0}
                max={80}
                step={5}
                onValueChange={(value) => setDefense(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="magicPower">法术强度</Label>
                <span className="text-sm">{magicPower}</span>
              </div>
              <Slider
                id="magicPower"
                value={[magicPower]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setMagicPower(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="magicResistance">魔法抗性</Label>
                <span className="text-sm">{magicResistance}</span>
              </div>
              <Slider
                id="magicResistance"
                value={[magicResistance]}
                min={0}
                max={80}
                step={5}
                onValueChange={(value) => setMagicResistance(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="speed">速度</Label>
                <span className="text-sm">{speed}</span>
              </div>
              <Slider
                id="speed"
                value={[speed]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => setSpeed(value[0])}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={createUnit} className="w-full">创建单位</Button>
      </CardFooter>
    </Card>
  );
};

export default UnitCreator;
