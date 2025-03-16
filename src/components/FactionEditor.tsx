
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash, Save, X, Edit } from 'lucide-react';
import { useGameContext, Faction } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';

const STAT_TARGETS = [
  { value: 'attack', label: '攻击力' },
  { value: 'defense', label: '防御力' },
  { value: 'magicPower', label: '魔法攻击' },
  { value: 'magicResistance', label: '魔法抗性' },
  { value: 'speed', label: '速度' },
  { value: 'maxHP', label: '生命值' },
  { value: 'critRate', label: '暴击率' }
];

type EffectType = 'buff' | 'debuff';
type TargetType = 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed' | 'maxHP' | 'critRate';

interface FactionEffect {
  type: EffectType;
  value: number;
  target: TargetType;
}

const DEFAULT_FACTION: Omit<Faction, 'id'> = {
  name: '',
  description: '',
  color: '#3b82f6',
  bonuses: [
    {
      type: 'buff',
      value: 0.1,
      target: 'attack'
    }
  ]
};

const FactionEditor: React.FC = () => {
  const { factions, addFaction, updateFaction, deleteFaction } = useGameContext();
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
  const [newFaction, setNewFaction] = useState<Omit<Faction, 'id'>>(DEFAULT_FACTION);
  const [activeTab, setActiveTab] = useState('factions');
  const { toast } = useToast();

  useEffect(() => {
    // 当打开组件时，如果还没有派系，显示一个提示
    if (factions.length === 0 && activeTab === 'factions') {
      toast({
        title: "派系系统",
        description: "您还未创建任何派系，请切换到\"添加派系\"选项卡创建",
      });
    }
  }, [activeTab, factions.length, toast]);

  // 处理添加新派系
  const handleAddFaction = () => {
    if (!newFaction.name.trim()) {
      toast({
        title: "创建失败",
        description: "派系名称是必须的",
        variant: "destructive"
      });
      return;
    }
    
    addFaction(newFaction);
    toast({
      title: "派系创建成功",
      description: `派系 "${newFaction.name}" 已成功创建`
    });
    setNewFaction(DEFAULT_FACTION); // 重置表单
  };

  // 处理删除派系
  const handleDeleteFaction = (id: string) => {
    deleteFaction(id);
    if (editingFaction && editingFaction.id === id) {
      setEditingFaction(null);
    }
    toast({
      title: "派系已删除",
      description: "该派系已成功删除"
    });
  };

  // 处理编辑派系
  const handleEditFaction = (faction: Faction) => {
    setEditingFaction({ ...faction });
  };

  // 处理保存编辑后的派系
  const handleSaveFaction = () => {
    if (!editingFaction) return;
    
    if (!editingFaction.name.trim()) {
      toast({
        title: "保存失败",
        description: "派系名称是必须的",
        variant: "destructive"
      });
      return;
    }
    
    updateFaction(editingFaction.id, editingFaction);
    toast({
      title: "派系已更新",
      description: `派系 "${editingFaction.name}" 已成功更新`
    });
    setEditingFaction(null);
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingFaction(null);
  };

  // 处理新派系字段更改
  const handleNewFactionChange = (field: keyof Omit<Faction, 'id'>, value: any) => {
    setNewFaction({
      ...newFaction,
      [field]: value
    });
  };

  // 处理编辑中的派系字段更改
  const handleEditingFactionChange = (field: keyof Faction, value: any) => {
    if (!editingFaction) return;
    
    setEditingFaction({
      ...editingFaction,
      [field]: value
    });
  };

  // 添加效果到新派系
  const addEffectToNew = () => {
    const newEffect: FactionEffect = {
      type: 'buff',
      value: 0.1,
      target: 'attack'
    };
    
    setNewFaction({
      ...newFaction,
      bonuses: [...newFaction.bonuses, newEffect]
    });
  };

  // 添加效果到编辑中的派系
  const addEffectToEditing = () => {
    if (!editingFaction) return;
    
    const newEffect: FactionEffect = {
      type: 'buff',
      value: 0.1,
      target: 'attack'
    };
    
    setEditingFaction({
      ...editingFaction,
      bonuses: [...editingFaction.bonuses, newEffect]
    });
  };

  // 更新新派系的效果
  const updateNewEffect = (index: number, field: string, value: any) => {
    const updatedEffects = [...newFaction.bonuses];
    if (field === 'type') {
      updatedEffects[index] = {
        ...updatedEffects[index],
        type: value as EffectType
      };
    } else if (field === 'target') {
      updatedEffects[index] = {
        ...updatedEffects[index],
        target: value as TargetType
      };
    } else if (field === 'value') {
      updatedEffects[index] = {
        ...updatedEffects[index],
        value: parseFloat(value)
      };
    }
    
    setNewFaction({
      ...newFaction,
      bonuses: updatedEffects
    });
  };

  // 更新编辑中派系的效果
  const updateEditingEffect = (index: number, field: string, value: any) => {
    if (!editingFaction) return;
    
    const updatedEffects = [...editingFaction.bonuses];
    if (field === 'type') {
      updatedEffects[index] = {
        ...updatedEffects[index],
        type: value as EffectType
      };
    } else if (field === 'target') {
      updatedEffects[index] = {
        ...updatedEffects[index],
        target: value as TargetType
      };
    } else if (field === 'value') {
      updatedEffects[index] = {
        ...updatedEffects[index],
        value: parseFloat(value)
      };
    }
    
    setEditingFaction({
      ...editingFaction,
      bonuses: updatedEffects
    });
  };

  // 删除新派系中的效果
  const removeNewEffect = (index: number) => {
    const updatedEffects = [...newFaction.bonuses];
    updatedEffects.splice(index, 1);
    
    setNewFaction({
      ...newFaction,
      bonuses: updatedEffects
    });
  };

  // 删除编辑中派系的效果
  const removeEditingEffect = (index: number) => {
    if (!editingFaction) return;
    
    const updatedEffects = [...editingFaction.bonuses];
    updatedEffects.splice(index, 1);
    
    setEditingFaction({
      ...editingFaction,
      bonuses: updatedEffects
    });
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>派系编辑器</CardTitle>
        <CardDescription>创建和管理游戏中的派系</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="factions">派系列表</TabsTrigger>
            <TabsTrigger value="add">添加派系</TabsTrigger>
          </TabsList>
          
          <TabsContent value="factions" className="space-y-4">
            {factions.length === 0 ? (
              <div className="text-center p-4 bg-muted rounded-md text-muted-foreground">
                <p className="mb-2">未添加任何派系，请切换到"添加派系"选项卡创建派系</p>
                <Button variant="outline" onClick={() => setActiveTab('add')}>
                  创建新派系
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {factions.map(faction => (
                  <div 
                    key={faction.id} 
                    className="border rounded-md p-3 flex flex-col gap-2"
                    style={{ borderLeftColor: faction.color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{faction.name}</div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleEditFaction(faction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDeleteFaction(faction.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm">{faction.description}</div>
                    
                    <div className="space-y-1 mt-2">
                      <div className="text-xs font-medium">效果:</div>
                      {faction.bonuses.map((effect, idx) => (
                        <div key={idx} className="text-xs pl-2 border-l-2 border-muted">
                          {effect.type === 'buff' ? '增益' : '减益'} {STAT_TARGETS.find(t => t.value === effect.target)?.label} 
                          {(effect.value > 0 ? '+' : '') + (effect.value * 100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add">
            <div className="space-y-4">
              <div>
                <Label htmlFor="faction-name">派系名称</Label>
                <Input 
                  id="faction-name" 
                  value={newFaction.name} 
                  onChange={(e) => handleNewFactionChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="faction-description">描述</Label>
                <Textarea 
                  id="faction-description" 
                  value={newFaction.description} 
                  onChange={(e) => handleNewFactionChange('description', e.target.value)}
                  className="min-h-20"
                />
              </div>
              
              <div>
                <Label htmlFor="faction-color">派系颜色</Label>
                <div className="flex gap-2">
                  <Input 
                    id="faction-color" 
                    type="color" 
                    value={newFaction.color} 
                    onChange={(e) => handleNewFactionChange('color', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input 
                    value={newFaction.color} 
                    onChange={(e) => handleNewFactionChange('color', e.target.value)}
                    className="flex-1"
                  />
                </div>
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
                
                {newFaction.bonuses.map((effect, index) => (
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
                <Button onClick={handleAddFaction}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加派系
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {editingFaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>编辑派系</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-faction-name">派系名称</Label>
                    <Input 
                      id="edit-faction-name" 
                      value={editingFaction.name} 
                      onChange={(e) => handleEditingFactionChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-faction-description">描述</Label>
                    <Textarea 
                      id="edit-faction-description" 
                      value={editingFaction.description} 
                      onChange={(e) => handleEditingFactionChange('description', e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-faction-color">派系颜色</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="edit-faction-color" 
                        type="color" 
                        value={editingFaction.color} 
                        onChange={(e) => handleEditingFactionChange('color', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        value={editingFaction.color} 
                        onChange={(e) => handleEditingFactionChange('color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
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
                    
                    {editingFaction.bonuses.map((effect, index) => (
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
                    <Button onClick={handleSaveFaction}>
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

export default FactionEditor;
