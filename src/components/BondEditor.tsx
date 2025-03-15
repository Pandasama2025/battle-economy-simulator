
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash, Save, X, Edit, Link, Unlink } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { Bond } from '@/context/GameContext';
import { UnitType } from '@/types/battle';

const UNIT_TYPES: UnitType[] = [
  'Warrior', 'Mage', 'Archer', 'Knight', 'Priest', 'Assassin', 'Merchant'
];

const STAT_TARGETS = [
  { value: 'attack', label: '攻击力' },
  { value: 'defense', label: '防御力' },
  { value: 'magicPower', label: '魔法攻击' },
  { value: 'magicResistance', label: '魔法抗性' },
  { value: 'speed', label: '速度' },
  { value: 'maxHP', label: '生命值' },
  { value: 'critRate', label: '暴击率' }
];

const DEFAULT_BOND: Omit<Bond, 'id'> = {
  name: '',
  description: '',
  requiredTypes: [],
  minUnits: 2,
  effects: [
    {
      type: 'buff',
      value: 0.1,
      target: 'attack'
    }
  ]
};

const BondEditor: React.FC = () => {
  const { bonds, addBond, updateBond, deleteBond, units } = useGameContext();
  const [editingBond, setEditingBond] = useState<Bond | null>(null);
  const [newBond, setNewBond] = useState<Omit<Bond, 'id'>>(DEFAULT_BOND);
  const [activeTab, setActiveTab] = useState('bonds');

  // 处理添加新羁绊
  const handleAddBond = () => {
    if (!newBond.name.trim() || newBond.requiredTypes.length === 0) {
      return; // 防止创建无效羁绊
    }
    
    addBond(newBond);
    setNewBond(DEFAULT_BOND); // 重置表单
  };

  // 处理删除羁绊
  const handleDeleteBond = (id: string) => {
    deleteBond(id);
    if (editingBond && editingBond.id === id) {
      setEditingBond(null);
    }
  };

  // 处理编辑羁绊
  const handleEditBond = (bond: Bond) => {
    setEditingBond({ ...bond });
  };

  // 处理保存编辑后的羁绊
  const handleSaveBond = () => {
    if (!editingBond) return;
    
    updateBond(editingBond.id, editingBond);
    setEditingBond(null);
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingBond(null);
  };

  // 处理新羁绊字段更改
  const handleNewBondChange = (field: keyof Omit<Bond, 'id'>, value: any) => {
    setNewBond({
      ...newBond,
      [field]: value
    });
  };

  // 处理编辑中的羁绊字段更改
  const handleEditingBondChange = (field: keyof Bond, value: any) => {
    if (!editingBond) return;
    
    setEditingBond({
      ...editingBond,
      [field]: value
    });
  };

  // 处理单位类型选择/取消选择
  const handleTypeToggle = (type: string, isNewBond: boolean) => {
    if (isNewBond) {
      const currentTypes = [...newBond.requiredTypes];
      const typeIndex = currentTypes.indexOf(type);
      
      if (typeIndex === -1) {
        currentTypes.push(type);
      } else {
        currentTypes.splice(typeIndex, 1);
      }
      
      handleNewBondChange('requiredTypes', currentTypes);
    } else if (editingBond) {
      const currentTypes = [...editingBond.requiredTypes];
      const typeIndex = currentTypes.indexOf(type);
      
      if (typeIndex === -1) {
        currentTypes.push(type);
      } else {
        currentTypes.splice(typeIndex, 1);
      }
      
      handleEditingBondChange('requiredTypes', currentTypes);
    }
  };

  // 添加效果到新羁绊
  const addEffectToNew = () => {
    const newEffect = {
      type: 'buff',
      value: 0.1,
      target: 'attack' as 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate'
    };
    
    setNewBond({
      ...newBond,
      effects: [...newBond.effects, newEffect]
    });
  };

  // 添加效果到编辑中的羁绊
  const addEffectToEditing = () => {
    if (!editingBond) return;
    
    const newEffect = {
      type: 'buff',
      value: 0.1,
      target: 'attack' as 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate'
    };
    
    setEditingBond({
      ...editingBond,
      effects: [...editingBond.effects, newEffect]
    });
  };

  // 更新新羁绊的效果
  const updateNewEffect = (index: number, field: string, value: any) => {
    const updatedEffects = [...newBond.effects];
    updatedEffects[index] = {
      ...updatedEffects[index],
      [field]: field === 'value' ? parseFloat(value) : value
    };
    
    setNewBond({
      ...newBond,
      effects: updatedEffects
    });
  };

  // 更新编辑中羁绊的效果
  const updateEditingEffect = (index: number, field: string, value: any) => {
    if (!editingBond) return;
    
    const updatedEffects = [...editingBond.effects];
    updatedEffects[index] = {
      ...updatedEffects[index],
      [field]: field === 'value' ? parseFloat(value) : value
    };
    
    setEditingBond({
      ...editingBond,
      effects: updatedEffects
    });
  };

  // 删除新羁绊中的效果
  const removeNewEffect = (index: number) => {
    const updatedEffects = [...newBond.effects];
    updatedEffects.splice(index, 1);
    
    setNewBond({
      ...newBond,
      effects: updatedEffects
    });
  };

  // 删除编辑中羁绊的效果
  const removeEditingEffect = (index: number) => {
    if (!editingBond) return;
    
    const updatedEffects = [...editingBond.effects];
    updatedEffects.splice(index, 1);
    
    setEditingBond({
      ...editingBond,
      effects: updatedEffects
    });
  };

  // 计算羁绊的当前激活状态
  const calculateBondStatus = (bond: Bond) => {
    const teamAlpha = units.filter(unit => unit.team === 'alpha');
    const teamBeta = units.filter(unit => unit.team === 'beta');
    
    const alphaMatches = teamAlpha.filter(unit => 
      bond.requiredTypes.includes(unit.type)
    ).length;
    
    const betaMatches = teamBeta.filter(unit => 
      bond.requiredTypes.includes(unit.type)
    ).length;
    
    return {
      alpha: alphaMatches >= bond.minUnits,
      beta: betaMatches >= bond.minUnits
    };
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>羁绊编辑器</CardTitle>
        <CardDescription>创建和管理单位之间的羁绊关系</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="bonds">羁绊列表</TabsTrigger>
            <TabsTrigger value="add">添加羁绊</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bonds" className="space-y-4">
            {bonds.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                未添加任何羁绊，请切换到"添加羁绊"选项卡创建羁绊
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bonds.map(bond => {
                  const status = calculateBondStatus(bond);
                  
                  return (
                    <div 
                      key={bond.id} 
                      className="border rounded-md p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{bond.name}</div>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleEditBond(bond)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDeleteBond(bond.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm">{bond.description}</div>
                      
                      <div className="text-xs text-muted-foreground">
                        需要单位类型: {bond.requiredTypes.join(', ')}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        最小单位数量: {bond.minUnits}
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <div className="text-xs font-medium">效果:</div>
                        {bond.effects.map((effect, idx) => (
                          <div key={idx} className="text-xs pl-2 border-l-2 border-muted">
                            {effect.type === 'buff' ? '增益' : '减益'} {STAT_TARGETS.find(t => t.value === effect.target)?.label} 
                            {(effect.value > 0 ? '+' : '') + (effect.value * 100).toFixed(0)}%
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <div className={`text-xs px-2 py-1 rounded ${
                          status.alpha ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Team Alpha: {status.alpha ? '已激活' : '未激活'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          status.beta ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Team Beta: {status.beta ? '已激活' : '未激活'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bond-name">羁绊名称</Label>
                <Input 
                  id="bond-name" 
                  value={newBond.name} 
                  onChange={(e) => handleNewBondChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="bond-description">描述</Label>
                <Textarea 
                  id="bond-description" 
                  value={newBond.description} 
                  onChange={(e) => handleNewBondChange('description', e.target.value)}
                  className="min-h-20"
                />
              </div>
              
              <div>
                <Label className="mb-2 block">需要单位类型</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {UNIT_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`type-${type}`} 
                        checked={newBond.requiredTypes.includes(type)}
                        onCheckedChange={() => handleTypeToggle(type, true)}
                      />
                      <label 
                        htmlFor={`type-${type}`}
                        className="text-sm cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="min-units">最小单位数量</Label>
                <Input 
                  id="min-units" 
                  type="number" 
                  min="1"
                  max="7"
                  value={newBond.minUnits} 
                  onChange={(e) => handleNewBondChange('minUnits', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>效果</Label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addEffectToNew}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加效果
                  </Button>
                </div>
                
                {newBond.effects.map((effect, index) => (
                  <div key={index} className="flex gap-2 items-end mb-2 p-2 border rounded-md">
                    <div className="flex-1">
                      <Label htmlFor={`effect-type-${index}`} className="text-xs">类型</Label>
                      <select 
                        id={`effect-type-${index}`}
                        value={effect.type}
                        onChange={(e) => updateNewEffect(index, 'type', e.target.value)}
                        className="w-full bg-background text-sm border rounded px-2 py-1"
                      >
                        <option value="buff">增益</option>
                        <option value="debuff">减益</option>
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor={`effect-target-${index}`} className="text-xs">目标属性</Label>
                      <select 
                        id={`effect-target-${index}`}
                        value={effect.target}
                        onChange={(e) => updateNewEffect(index, 'target', e.target.value)}
                        className="w-full bg-background text-sm border rounded px-2 py-1"
                      >
                        {STAT_TARGETS.map(target => (
                          <option key={target.value} value={target.value}>
                            {target.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor={`effect-value-${index}`} className="text-xs">数值 (%)</Label>
                      <Input 
                        id={`effect-value-${index}`}
                        type="number"
                        step="0.05"
                        min="-1"
                        max="1"
                        value={effect.value}
                        onChange={(e) => updateNewEffect(index, 'value', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeNewEffect(index)}
                      className="h-8 w-8"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleAddBond}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加羁绊
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {editingBond && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>编辑羁绊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-bond-name">羁绊名称</Label>
                    <Input 
                      id="edit-bond-name" 
                      value={editingBond.name} 
                      onChange={(e) => handleEditingBondChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-bond-description">描述</Label>
                    <Textarea 
                      id="edit-bond-description" 
                      value={editingBond.description} 
                      onChange={(e) => handleEditingBondChange('description', e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">需要单位类型</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {UNIT_TYPES.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-type-${type}`} 
                            checked={editingBond.requiredTypes.includes(type)}
                            onCheckedChange={() => handleTypeToggle(type, false)}
                          />
                          <label 
                            htmlFor={`edit-type-${type}`}
                            className="text-sm cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-min-units">最小单位数量</Label>
                    <Input 
                      id="edit-min-units" 
                      type="number" 
                      min="1"
                      max="7"
                      value={editingBond.minUnits} 
                      onChange={(e) => handleEditingBondChange('minUnits', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>效果</Label>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={addEffectToEditing}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        添加效果
                      </Button>
                    </div>
                    
                    {editingBond.effects.map((effect, index) => (
                      <div key={index} className="flex gap-2 items-end mb-2 p-2 border rounded-md">
                        <div className="flex-1">
                          <Label htmlFor={`edit-effect-type-${index}`} className="text-xs">类型</Label>
                          <select 
                            id={`edit-effect-type-${index}`}
                            value={effect.type}
                            onChange={(e) => updateEditingEffect(index, 'type', e.target.value)}
                            className="w-full bg-background text-sm border rounded px-2 py-1"
                          >
                            <option value="buff">增益</option>
                            <option value="debuff">减益</option>
                          </select>
                        </div>
                        
                        <div className="flex-1">
                          <Label htmlFor={`edit-effect-target-${index}`} className="text-xs">目标属性</Label>
                          <select 
                            id={`edit-effect-target-${index}`}
                            value={effect.target}
                            onChange={(e) => updateEditingEffect(index, 'target', e.target.value)}
                            className="w-full bg-background text-sm border rounded px-2 py-1"
                          >
                            {STAT_TARGETS.map(target => (
                              <option key={target.value} value={target.value}>
                                {target.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex-1">
                          <Label htmlFor={`edit-effect-value-${index}`} className="text-xs">数值 (%)</Label>
                          <Input 
                            id={`edit-effect-value-${index}`}
                            type="number"
                            step="0.05"
                            min="-1"
                            max="1"
                            value={effect.value}
                            onChange={(e) => updateEditingEffect(index, 'value', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => removeEditingEffect(index)}
                          className="h-8 w-8"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      取消
                    </Button>
                    <Button onClick={handleSaveBond}>
                      <Save className="h-4 w-4 mr-2" />
                      保存
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BondEditor;
