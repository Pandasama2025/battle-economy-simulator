
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/types/battle';
import { X, Save, Trash } from 'lucide-react';

interface UnitEditorProps {
  unit: Unit;
  onClose: () => void;
}

const UnitEditor: React.FC<UnitEditorProps> = ({ unit, onClose }) => {
  const { updateUnit, deleteUnit, factions } = useGameContext();
  const { toast } = useToast();
  
  const [editedUnit, setEditedUnit] = useState<Unit>({ ...unit });
  
  const handleUpdateField = (field: keyof Unit, value: any) => {
    setEditedUnit(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    if (!editedUnit.name.trim()) {
      toast({
        title: "保存失败",
        description: "单位名称不能为空",
        variant: "destructive"
      });
      return;
    }
    
    // 更新当前生命值以匹配最大生命值（如果最大生命值有变化）
    if (editedUnit.maxHP !== unit.maxHP) {
      editedUnit.currentHP = editedUnit.maxHP;
    }
    
    updateUnit(unit.id, editedUnit);
    
    toast({
      title: "单位已更新",
      description: `${editedUnit.name} 的属性已更新`,
    });
    
    onClose();
  };
  
  const handleDelete = () => {
    deleteUnit(unit.id);
    
    toast({
      title: "单位已删除",
      description: `${unit.name} 已从游戏中删除`,
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>编辑单位: {unit.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-unit-name">单位名称</Label>
              <Input 
                id="edit-unit-name" 
                value={editedUnit.name} 
                onChange={(e) => handleUpdateField('name', e.target.value)} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-unit-type">单位类型</Label>
                <Select value={editedUnit.type} onValueChange={(value) => handleUpdateField('type', value)}>
                  <SelectTrigger id="edit-unit-type">
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
                <Label htmlFor="edit-unit-race">种族</Label>
                <Select 
                  value={editedUnit.race || ''}
                  onValueChange={(value) => handleUpdateField('race', value)}
                >
                  <SelectTrigger id="edit-unit-race">
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
                <Label htmlFor="edit-unit-profession">职业</Label>
                <Select 
                  value={editedUnit.profession || ''}
                  onValueChange={(value) => handleUpdateField('profession', value)}
                >
                  <SelectTrigger id="edit-unit-profession">
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
                <Label htmlFor="edit-unit-faction">派系</Label>
                <Select 
                  value={editedUnit.faction || ''}
                  onValueChange={(value) => handleUpdateField('faction', value || undefined)}
                >
                  <SelectTrigger id="edit-unit-faction">
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
              <Label htmlFor="edit-unit-level">等级: {editedUnit.level}</Label>
              <Slider 
                id="edit-unit-level" 
                min={1} 
                max={10} 
                step={1} 
                value={[editedUnit.level]} 
                onValueChange={(value) => handleUpdateField('level', value[0])} 
              />
            </div>
            
            <Tabs defaultValue="combat">
              <TabsList className="w-full">
                <TabsTrigger value="combat" className="flex-1">战斗属性</TabsTrigger>
                <TabsTrigger value="other" className="flex-1">其他属性</TabsTrigger>
              </TabsList>
              <TabsContent value="combat" className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="edit-unit-attack">攻击力: {editedUnit.attack}</Label>
                  <Slider 
                    id="edit-unit-attack" 
                    min={1} 
                    max={50} 
                    step={1} 
                    value={[editedUnit.attack]} 
                    onValueChange={(value) => handleUpdateField('attack', value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit-defense">防御力: {editedUnit.defense}</Label>
                  <Slider 
                    id="edit-unit-defense" 
                    min={0} 
                    max={30} 
                    step={1} 
                    value={[editedUnit.defense]} 
                    onValueChange={(value) => handleUpdateField('defense', value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit-magic-power">魔法攻击: {editedUnit.magicPower}</Label>
                  <Slider 
                    id="edit-unit-magic-power" 
                    min={0} 
                    max={50} 
                    step={1} 
                    value={[editedUnit.magicPower]} 
                    onValueChange={(value) => handleUpdateField('magicPower', value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit-magic-resistance">魔法抗性: {editedUnit.magicResistance}</Label>
                  <Slider 
                    id="edit-unit-magic-resistance" 
                    min={0} 
                    max={30} 
                    step={1} 
                    value={[editedUnit.magicResistance]} 
                    onValueChange={(value) => handleUpdateField('magicResistance', value[0])} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="other" className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="edit-unit-hp">生命值: {editedUnit.maxHP}</Label>
                  <Slider 
                    id="edit-unit-hp" 
                    min={50} 
                    max={500} 
                    step={10} 
                    value={[editedUnit.maxHP]} 
                    onValueChange={(value) => handleUpdateField('maxHP', value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit-speed">速度: {editedUnit.speed}</Label>
                  <Slider 
                    id="edit-unit-speed" 
                    min={1} 
                    max={20} 
                    step={1} 
                    value={[editedUnit.speed]} 
                    onValueChange={(value) => handleUpdateField('speed', value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit-crit-rate">暴击率: {(editedUnit.critRate * 100).toFixed(0)}%</Label>
                  <Slider 
                    id="edit-unit-crit-rate" 
                    min={0} 
                    max={0.5} 
                    step={0.01} 
                    value={[editedUnit.critRate]} 
                    onValueChange={(value) => handleUpdateField('critRate', value[0])} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit-crit-damage">暴击伤害: {editedUnit.critDamage.toFixed(1)}x</Label>
                  <Slider 
                    id="edit-unit-crit-damage" 
                    min={1.1} 
                    max={3} 
                    step={0.1} 
                    value={[editedUnit.critDamage]} 
                    onValueChange={(value) => handleUpdateField('critDamage', value[0])} 
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-team-toggle">队伍:</Label>
              <div className="flex items-center space-x-2">
                <span className={editedUnit.team === 'alpha' ? 'font-bold' : ''}>A队</span>
                <Switch 
                  id="edit-team-toggle" 
                  checked={editedUnit.team === 'beta'} 
                  onCheckedChange={(checked) => handleUpdateField('team', checked ? 'beta' : 'alpha')}
                />
                <span className={editedUnit.team === 'beta' ? 'font-bold' : ''}>B队</span>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                删除单位
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                保存修改
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitEditor;
