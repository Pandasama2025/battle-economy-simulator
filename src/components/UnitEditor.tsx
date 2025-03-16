
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash, Edit, Save, X, Heart } from 'lucide-react';
import { Unit, UnitType } from '@/types/battle';
import { useGameContext } from '@/context/GameContext';

const DEFAULT_UNIT: Omit<Unit, 'id'> = {
  name: '',
  type: '战士',
  level: 1,
  team: 'alpha',
  maxHP: 300,
  currentHP: 300,
  maxMana: 100,
  currentMana: 50,
  attack: 50,
  defense: 30,
  magicPower: 40,
  magicResistance: 20,
  speed: 15,
  critRate: 0.1,
  critDamage: 1.5,
  position: { x: 0, y: 0 },
  status: 'idle',
  skills: [],
  items: []
};

const UNIT_TYPES: UnitType[] = [
  '战士', '法师', '射手', '骑士', '牧师', '刺客', '商人'
];

const UnitEditor: React.FC = () => {
  const { units, addUnit, updateUnit, deleteUnit } = useGameContext();
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState<Omit<Unit, 'id'>>(DEFAULT_UNIT);
  const [activeTab, setActiveTab] = useState('units');

  const handleAddUnit = () => {
    if (!newUnit.name.trim()) {
      return; // 防止创建无名单位
    }
    
    addUnit({
      ...newUnit,
      currentHP: newUnit.maxHP, // 确保当前生命值等于最大生命值
      currentMana: newUnit.maxMana / 2, // 初始魔法值设为最大值的一半
    });
    
    setNewUnit(DEFAULT_UNIT); // 重置表单
  };

  const handleDeleteUnit = (id: string) => {
    deleteUnit(id);
    if (editingUnit && editingUnit.id === id) {
      setEditingUnit(null);
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit({ ...unit });
  };

  const handleSaveUnit = () => {
    if (!editingUnit) return;
    
    updateUnit(editingUnit.id, editingUnit);
    setEditingUnit(null);
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
  };

  const handleNewUnitChange = (field: keyof Omit<Unit, 'id'>, value: any) => {
    setNewUnit({
      ...newUnit,
      [field]: value
    });
  };

  const handleEditingUnitChange = (field: keyof Unit, value: any) => {
    if (!editingUnit) return;
    
    setEditingUnit({
      ...editingUnit,
      [field]: value
    });
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>单位编辑器</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="units">单位列表</TabsTrigger>
            <TabsTrigger value="add">添加单位</TabsTrigger>
          </TabsList>
          
          <TabsContent value="units" className="space-y-4">
            {units.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                未添加任何单位，请切换到"添加单位"选项卡创建单位
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {units.map(unit => (
                  <div 
                    key={unit.id} 
                    className="border rounded-md p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{unit.name}</div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleEditUnit(unit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDeleteUnit(unit.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">类型: {unit.type}</div>
                    <div className="text-sm text-muted-foreground">生命值: {unit.maxHP}</div>
                    <div className="text-sm text-muted-foreground">攻击力: {unit.attack}</div>
                    <div className="text-sm text-muted-foreground">防御力: {unit.defense}</div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">单位名称</Label>
                  <Input 
                    id="name" 
                    value={newUnit.name} 
                    onChange={(e) => handleNewUnitChange('name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">单位类型</Label>
                  <select 
                    id="type" 
                    value={newUnit.type}
                    onChange={(e) => handleNewUnitChange('type', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {UNIT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="team">队伍</Label>
                  <select 
                    id="team" 
                    value={newUnit.team}
                    onChange={(e) => handleNewUnitChange('team', e.target.value as 'alpha' | 'beta')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="alpha">Alpha</option>
                    <option value="beta">Beta</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="level">等级</Label>
                  <Input 
                    id="level" 
                    type="number" 
                    value={newUnit.level}
                    onChange={(e) => handleNewUnitChange('level', parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="hp">生命值</Label>
                  <Input 
                    id="hp" 
                    type="number" 
                    value={newUnit.maxHP}
                    onChange={(e) => handleNewUnitChange('maxHP', parseInt(e.target.value))} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="attack">攻击力</Label>
                  <Input 
                    id="attack" 
                    type="number" 
                    value={newUnit.attack}
                    onChange={(e) => handleNewUnitChange('attack', parseInt(e.target.value))} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="defense">防御力</Label>
                  <Input 
                    id="defense" 
                    type="number" 
                    value={newUnit.defense}
                    onChange={(e) => handleNewUnitChange('defense', parseInt(e.target.value))} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="speed">速度</Label>
                  <Input 
                    id="speed" 
                    type="number" 
                    value={newUnit.speed}
                    onChange={(e) => handleNewUnitChange('speed', parseInt(e.target.value))} 
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleAddUnit}>
                <Plus className="h-4 w-4 mr-2" />
                添加单位
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {editingUnit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>编辑单位</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-name">单位名称</Label>
                      <Input 
                        id="edit-name" 
                        value={editingUnit.name} 
                        onChange={(e) => handleEditingUnitChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-type">单位类型</Label>
                      <select 
                        id="edit-type" 
                        value={editingUnit.type}
                        onChange={(e) => handleEditingUnitChange('type', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {UNIT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-team">队伍</Label>
                      <select 
                        id="edit-team" 
                        value={editingUnit.team}
                        onChange={(e) => handleEditingUnitChange('team', e.target.value as 'alpha' | 'beta')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="alpha">Alpha</option>
                        <option value="beta">Beta</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-level">等级</Label>
                      <Input 
                        id="edit-level" 
                        type="number" 
                        value={editingUnit.level}
                        onChange={(e) => handleEditingUnitChange('level', parseInt(e.target.value))} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-hp">生命值</Label>
                      <Input 
                        id="edit-hp" 
                        type="number" 
                        value={editingUnit.maxHP}
                        onChange={(e) => handleEditingUnitChange('maxHP', parseInt(e.target.value))} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-attack">攻击力</Label>
                      <Input 
                        id="edit-attack" 
                        type="number" 
                        value={editingUnit.attack}
                        onChange={(e) => handleEditingUnitChange('attack', parseInt(e.target.value))} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-defense">防御力</Label>
                      <Input 
                        id="edit-defense" 
                        type="number" 
                        value={editingUnit.defense}
                        onChange={(e) => handleEditingUnitChange('defense', parseInt(e.target.value))} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-magic">魔法攻击</Label>
                      <Input 
                        id="edit-magic" 
                        type="number" 
                        value={editingUnit.magicPower}
                        onChange={(e) => handleEditingUnitChange('magicPower', parseInt(e.target.value))} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-resistance">魔法抗性</Label>
                      <Input 
                        id="edit-resistance" 
                        type="number" 
                        value={editingUnit.magicResistance}
                        onChange={(e) => handleEditingUnitChange('magicResistance', parseInt(e.target.value))} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-speed">速度</Label>
                      <Input 
                        id="edit-speed" 
                        type="number" 
                        value={editingUnit.speed}
                        onChange={(e) => handleEditingUnitChange('speed', parseInt(e.target.value))} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-crit">暴击率</Label>
                      <Input 
                        id="edit-crit" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="1"
                        value={editingUnit.critRate}
                        onChange={(e) => handleEditingUnitChange('critRate', parseFloat(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button onClick={handleSaveUnit}>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitEditor;
