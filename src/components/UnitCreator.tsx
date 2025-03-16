
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import UnitEditor from './UnitEditor';
import { Unit } from '@/types/battle';

const UnitCreator: React.FC = () => {
  const { addUnit, units, factions } = useGameContext();
  const { toast } = useToast();
  const [showEditor, setShowEditor] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState('战士');
  const [unitRace, setUnitRace] = useState('人类');
  const [unitProfession, setUnitProfession] = useState('战士');
  const [unitFaction, setUnitFaction] = useState('');
  const [unitLevel, setUnitLevel] = useState(1);
  const [unitAttack, setUnitAttack] = useState(10);
  const [unitDefense, setUnitDefense] = useState(5);
  const [unitMagicPower, setUnitMagicPower] = useState(0);
  const [unitMagicResistance, setUnitMagicResistance] = useState(5);
  const [unitSpeed, setUnitSpeed] = useState(5);
  const [unitMaxHP, setUnitMaxHP] = useState(100);
  const [unitCritRate, setUnitCritRate] = useState(0.05);
  const [unitCritDamage, setUnitCritDamage] = useState(1.5);
  const [unitTeam, setUnitTeam] = useState<'alpha' | 'beta'>('alpha');
  
  const handleAddUnit = () => {
    if (!unitName.trim()) {
      toast({
        title: "创建失败",
        description: "单位名称不能为空",
        variant: "destructive"
      });
      return;
    }
    
    const newUnit = {
      name: unitName,
      type: unitType,
      race: unitRace,
      profession: unitProfession,
      faction: unitFaction || undefined,
      level: unitLevel,
      attack: unitAttack,
      defense: unitDefense,
      magicPower: unitMagicPower,
      magicResistance: unitMagicResistance,
      speed: unitSpeed,
      maxHP: unitMaxHP,
      currentHP: unitMaxHP,
      critRate: unitCritRate,
      critDamage: unitCritDamage,
      team: unitTeam
    };
    
    addUnit(newUnit);
    
    toast({
      title: "单位创建成功",
      description: `${unitName} 已添加到 ${unitTeam === 'alpha' ? 'A' : 'B'} 队`,
    });
  };
  
  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowEditor(true);
  };
  
  const handleCloseEditor = () => {
    setEditingUnit(null);
    setShowEditor(false);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>创建单位</CardTitle>
          <CardDescription>设计一个新的战斗单位</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="unit-name">单位名称</Label>
              <Input 
                id="unit-name" 
                value={unitName} 
                onChange={(e) => setUnitName(e.target.value)} 
                placeholder="输入单位名称" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit-type">单位类型</Label>
                <Select value={unitType} onValueChange={setUnitType}>
                  <SelectTrigger id="unit-type">
                    <SelectValue placeholder="选择单位类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="战士">战士</SelectItem>
                    <SelectItem value="法师">法师</SelectItem>
                    <SelectItem value="射手">射手</SelectItem>
                    <SelectItem value="骑士">骑士</SelectItem>
                    <SelectItem value="牧师">牧师</SelectItem>
                    <SelectItem value="刺客">刺客</SelectItem>
                    <SelectItem value="商人">商人</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="unit-race">种族</Label>
                <Select value={unitRace} onValueChange={setUnitRace}>
                  <SelectTrigger id="unit-race">
                    <SelectValue placeholder="选择种族" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="人类">人类</SelectItem>
                    <SelectItem value="精灵">精灵</SelectItem>
                    <SelectItem value="兽人">兽人</SelectItem>
                    <SelectItem value="矮人">矮人</SelectItem>
                    <SelectItem value="亡灵">亡灵</SelectItem>
                    <SelectItem value="龙族">龙族</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit-profession">职业</Label>
                <Select value={unitProfession} onValueChange={setUnitProfession}>
                  <SelectTrigger id="unit-profession">
                    <SelectValue placeholder="选择职业" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="战士">战士</SelectItem>
                    <SelectItem value="法师">法师</SelectItem>
                    <SelectItem value="猎人">猎人</SelectItem>
                    <SelectItem value="骑士">骑士</SelectItem>
                    <SelectItem value="牧师">牧师</SelectItem>
                    <SelectItem value="刺客">刺客</SelectItem>
                    <SelectItem value="商人">商人</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="unit-faction">派系</Label>
                <Select value={unitFaction} onValueChange={setUnitFaction}>
                  <SelectTrigger id="unit-faction">
                    <SelectValue placeholder="选择派系" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无派系</SelectItem>
                    {factions.map(faction => (
                      <SelectItem key={faction.id} value={faction.name}>
                        {faction.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="unit-level">等级: {unitLevel}</Label>
              <Slider 
                id="unit-level" 
                min={1} 
                max={10} 
                step={1} 
                value={[unitLevel]} 
                onValueChange={(value) => setUnitLevel(value[0])} 
              />
            </div>
            
            <Tabs defaultValue="combat">
              <TabsList className="w-full">
                <TabsTrigger value="combat" className="flex-1">战斗属性</TabsTrigger>
                <TabsTrigger value="other" className="flex-1">其他属性</TabsTrigger>
              </TabsList>
              <TabsContent value="combat" className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="unit-attack">攻击力: {unitAttack}</Label>
                  <Slider 
                    id="unit-attack" 
                    min={1} 
                    max={50} 
                    step={1} 
                    value={[unitAttack]} 
                    onValueChange={(value) => setUnitAttack(value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit-defense">防御力: {unitDefense}</Label>
                  <Slider 
                    id="unit-defense" 
                    min={0} 
                    max={30} 
                    step={1} 
                    value={[unitDefense]} 
                    onValueChange={(value) => setUnitDefense(value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit-magic-power">魔法攻击: {unitMagicPower}</Label>
                  <Slider 
                    id="unit-magic-power" 
                    min={0} 
                    max={50} 
                    step={1} 
                    value={[unitMagicPower]} 
                    onValueChange={(value) => setUnitMagicPower(value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit-magic-resistance">魔法抗性: {unitMagicResistance}</Label>
                  <Slider 
                    id="unit-magic-resistance" 
                    min={0} 
                    max={30} 
                    step={1} 
                    value={[unitMagicResistance]} 
                    onValueChange={(value) => setUnitMagicResistance(value[0])} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="other" className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="unit-hp">生命值: {unitMaxHP}</Label>
                  <Slider 
                    id="unit-hp" 
                    min={50} 
                    max={500} 
                    step={10} 
                    value={[unitMaxHP]} 
                    onValueChange={(value) => setUnitMaxHP(value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit-speed">速度: {unitSpeed}</Label>
                  <Slider 
                    id="unit-speed" 
                    min={1} 
                    max={20} 
                    step={1} 
                    value={[unitSpeed]} 
                    onValueChange={(value) => setUnitSpeed(value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit-crit-rate">暴击率: {(unitCritRate * 100).toFixed(0)}%</Label>
                  <Slider 
                    id="unit-crit-rate" 
                    min={0} 
                    max={0.5} 
                    step={0.01} 
                    value={[unitCritRate]} 
                    onValueChange={(value) => setUnitCritRate(value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit-crit-damage">暴击伤害: {unitCritDamage.toFixed(1)}x</Label>
                  <Slider 
                    id="unit-crit-damage" 
                    min={1.1} 
                    max={3} 
                    step={0.1} 
                    value={[unitCritDamage]} 
                    onValueChange={(value) => setUnitCritDamage(value[0])} 
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="team-toggle">队伍:</Label>
              <div className="flex items-center space-x-2">
                <span className={unitTeam === 'alpha' ? 'font-bold' : ''}>A队</span>
                <Switch 
                  id="team-toggle" 
                  checked={unitTeam === 'beta'} 
                  onCheckedChange={(checked) => setUnitTeam(checked ? 'beta' : 'alpha')}
                />
                <span className={unitTeam === 'beta' ? 'font-bold' : ''}>B队</span>
              </div>
            </div>
            
            <Button className="w-full" onClick={handleAddUnit}>创建单位</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>单位列表</CardTitle>
          <CardDescription>管理已创建的单位</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {units.length === 0 ? (
              <div className="text-center p-4 bg-muted rounded-md text-muted-foreground">
                还没有创建任何单位
              </div>
            ) : (
              <div className="space-y-2">
                {units.map((unit) => (
                  <div 
                    key={unit.id} 
                    className="border rounded-md p-3 flex justify-between items-center hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleEditUnit(unit)}
                  >
                    <div>
                      <div className="font-medium">{unit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {unit.race} {unit.profession} · Lv.{unit.level} · {unit.team === 'alpha' ? 'A队' : 'B队'}
                        {unit.faction && ` · ${unit.faction}`}
                      </div>
                    </div>
                    <div className="text-sm">
                      HP: {unit.maxHP} | ATK: {unit.attack} | DEF: {unit.defense}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showEditor && editingUnit && (
        <UnitEditor 
          unit={editingUnit} 
          onClose={handleCloseEditor} 
        />
      )}
    </div>
  );
};

export default UnitCreator;
