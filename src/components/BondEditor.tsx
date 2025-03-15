
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Edit, Save, X, Heart, Link } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UnitType } from '@/types/battle';

interface BondEffect {
  description: string;
  statModifiers: Record<string, number>;
  specialEffects?: string[];
}

interface Bond {
  id: string;
  name: string;
  description: string;
  unitTypes: UnitType[];
  requiredCount: number;
  effects: BondEffect;
}

const DEFAULT_BOND: Omit<Bond, 'id'> = {
  name: '',
  description: '',
  unitTypes: [],
  requiredCount: 2,
  effects: {
    description: '',
    statModifiers: {
      attack: 0,
      defense: 0,
      speed: 0
    },
    specialEffects: []
  }
};

const UNIT_TYPES: UnitType[] = [
  'Warrior', 'Mage', 'Archer', 'Knight', 'Priest', 'Assassin', 'Merchant'
];

const BondEditor: React.FC = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [editingBond, setEditingBond] = useState<Bond | null>(null);
  const [newBond, setNewBond] = useState<Omit<Bond, 'id'>>(DEFAULT_BOND);
  const [specialEffect, setSpecialEffect] = useState('');

  // Load initial demo bonds
  useEffect(() => {
    const demoBonds: Bond[] = [
      {
        id: 'bond-1',
        name: '战士之怒',
        description: '激活战士的潜力，提升团队攻击力',
        unitTypes: ['Warrior', 'Knight'],
        requiredCount: 2,
        effects: {
          description: '团队攻击力提升15%',
          statModifiers: {
            attack: 15
          },
          specialEffects: ['每次攻击有10%几率击晕敌人']
        }
      },
      {
        id: 'bond-2',
        name: '元素亲和',
        description: '法术单位之间形成魔法共鸣',
        unitTypes: ['Mage', 'Priest'],
        requiredCount: 2,
        effects: {
          description: '魔法攻击提升20%，魔法抗性提升10%',
          statModifiers: {
            magicPower: 20,
            magicResistance: 10
          },
          specialEffects: ['施放法术时有15%几率减少1回合冷却时间']
        }
      }
    ];
    setBonds(demoBonds);
  }, []);

  const handleAddBond = () => {
    const newBondWithId: Bond = {
      ...newBond,
      id: `bond-${Date.now()}`,
    };
    setBonds([...bonds, newBondWithId]);
    setNewBond(DEFAULT_BOND);
  };

  const handleDeleteBond = (id: string) => {
    setBonds(bonds.filter(bond => bond.id !== id));
    if (editingBond && editingBond.id === id) {
      setEditingBond(null);
    }
  };

  const handleEditBond = (bond: Bond) => {
    setEditingBond({ ...bond });
  };

  const handleSaveBond = () => {
    if (!editingBond) return;
    
    setBonds(bonds.map(bond => 
      bond.id === editingBond.id ? editingBond : bond
    ));
    setEditingBond(null);
  };

  const handleCancelEdit = () => {
    setEditingBond(null);
  };

  const handleNewBondChange = (field: keyof Omit<Bond, 'id'>, value: any) => {
    setNewBond({
      ...newBond,
      [field]: value
    });
  };

  const handleNewBondEffectChange = (field: keyof BondEffect, value: any) => {
    setNewBond({
      ...newBond,
      effects: {
        ...newBond.effects,
        [field]: value
      }
    });
  };

  const handleNewBondStatChange = (stat: string, value: number) => {
    setNewBond({
      ...newBond,
      effects: {
        ...newBond.effects,
        statModifiers: {
          ...newBond.effects.statModifiers,
          [stat]: value
        }
      }
    });
  };

  const handleEditingBondChange = (field: keyof Bond, value: any) => {
    if (!editingBond) return;
    
    setEditingBond({
      ...editingBond,
      [field]: value
    });
  };

  const handleEditingBondEffectChange = (field: keyof BondEffect, value: any) => {
    if (!editingBond) return;
    
    setEditingBond({
      ...editingBond,
      effects: {
        ...editingBond.effects,
        [field]: value
      }
    });
  };

  const handleEditingBondStatChange = (stat: string, value: number) => {
    if (!editingBond) return;
    
    setEditingBond({
      ...editingBond,
      effects: {
        ...editingBond.effects,
        statModifiers: {
          ...editingBond.effects.statModifiers,
          [stat]: value
        }
      }
    });
  };

  const handleAddSpecialEffect = () => {
    if (!specialEffect.trim()) return;
    
    if (editingBond) {
      const updatedEffects = editingBond.effects.specialEffects || [];
      setEditingBond({
        ...editingBond,
        effects: {
          ...editingBond.effects,
          specialEffects: [...updatedEffects, specialEffect]
        }
      });
    } else {
      const updatedEffects = newBond.effects.specialEffects || [];
      setNewBond({
        ...newBond,
        effects: {
          ...newBond.effects,
          specialEffects: [...updatedEffects, specialEffect]
        }
      });
    }
    setSpecialEffect('');
  };

  const handleRemoveSpecialEffect = (index: number) => {
    if (editingBond && editingBond.effects.specialEffects) {
      const updatedEffects = [...editingBond.effects.specialEffects];
      updatedEffects.splice(index, 1);
      setEditingBond({
        ...editingBond,
        effects: {
          ...editingBond.effects,
          specialEffects: updatedEffects
        }
      });
    } else if (newBond.effects.specialEffects) {
      const updatedEffects = [...newBond.effects.specialEffects];
      updatedEffects.splice(index, 1);
      setNewBond({
        ...newBond,
        effects: {
          ...newBond.effects,
          specialEffects: updatedEffects
        }
      });
    }
  };

  const handleToggleUnitType = (unitType: UnitType) => {
    const currentUnitTypes = editingBond ? editingBond.unitTypes : newBond.unitTypes;
    
    if (currentUnitTypes.includes(unitType)) {
      // Remove unit type
      const updatedTypes = currentUnitTypes.filter(type => type !== unitType);
      
      if (editingBond) {
        setEditingBond({
          ...editingBond,
          unitTypes: updatedTypes
        });
      } else {
        setNewBond({
          ...newBond,
          unitTypes: updatedTypes
        });
      }
    } else {
      // Add unit type
      const updatedTypes = [...currentUnitTypes, unitType];
      
      if (editingBond) {
        setEditingBond({
          ...editingBond,
          unitTypes: updatedTypes
        });
      } else {
        setNewBond({
          ...newBond,
          unitTypes: updatedTypes
        });
      }
    }
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>羁绊编辑器</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">羁绊名称</Label>
                <Input 
                  id="name" 
                  value={newBond.name} 
                  onChange={(e) => handleNewBondChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">羁绊描述</Label>
                <Textarea 
                  id="description" 
                  value={newBond.description}
                  onChange={(e) => handleNewBondChange('description', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="required">所需单位数量</Label>
                <Input 
                  id="required" 
                  type="number" 
                  min="2"
                  value={newBond.requiredCount}
                  onChange={(e) => handleNewBondChange('requiredCount', parseInt(e.target.value))} 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label>单位类型</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {UNIT_TYPES.map(type => (
                    <Button
                      key={type}
                      variant={newBond.unitTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => handleToggleUnitType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>属性加成</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label htmlFor="attack-bonus">攻击加成 (%)</Label>
                    <Input 
                      id="attack-bonus" 
                      type="number" 
                      value={newBond.effects.statModifiers.attack || 0}
                      onChange={(e) => handleNewBondStatChange('attack', parseInt(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="defense-bonus">防御加成 (%)</Label>
                    <Input 
                      id="defense-bonus" 
                      type="number" 
                      value={newBond.effects.statModifiers.defense || 0}
                      onChange={(e) => handleNewBondStatChange('defense', parseInt(e.target.value))} 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="effect-desc">效果描述</Label>
                <Textarea 
                  id="effect-desc" 
                  value={newBond.effects.description}
                  onChange={(e) => handleNewBondEffectChange('description', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>特殊效果</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={specialEffect}
                onChange={(e) => setSpecialEffect(e.target.value)}
                placeholder="输入特殊效果描述"
              />
              <Button onClick={handleAddSpecialEffect}>添加</Button>
            </div>
            
            {newBond.effects.specialEffects && newBond.effects.specialEffects.length > 0 && (
              <div className="space-y-1">
                {newBond.effects.specialEffects.map((effect, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/20 rounded p-2">
                    <span>{effect}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveSpecialEffect(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddBond}>
              <Plus className="h-4 w-4 mr-2" />
              添加羁绊
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">已创建的羁绊</h3>
          
          {bonds.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              还未添加任何羁绊关系
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>单位类型</TableHead>
                  <TableHead>要求</TableHead>
                  <TableHead>效果</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonds.map(bond => (
                  <TableRow key={bond.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        {bond.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {bond.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {bond.unitTypes.join(', ')}
                    </TableCell>
                    <TableCell>
                      {bond.requiredCount}个单位
                    </TableCell>
                    <TableCell>
                      <div>{bond.effects.description}</div>
                      {bond.effects.specialEffects && bond.effects.specialEffects.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {bond.effects.specialEffects[0]}
                          {bond.effects.specialEffects.length > 1 && '...'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {editingBond && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>编辑羁绊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-name">羁绊名称</Label>
                      <Input 
                        id="edit-name" 
                        value={editingBond.name} 
                        onChange={(e) => handleEditingBondChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-description">羁绊描述</Label>
                      <Textarea 
                        id="edit-description" 
                        value={editingBond.description}
                        onChange={(e) => handleEditingBondChange('description', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-required">所需单位数量</Label>
                      <Input 
                        id="edit-required" 
                        type="number" 
                        min="2"
                        value={editingBond.requiredCount}
                        onChange={(e) => handleEditingBondChange('requiredCount', parseInt(e.target.value))} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>单位类型</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {UNIT_TYPES.map(type => (
                          <Button
                            key={type}
                            variant={editingBond.unitTypes.includes(type) ? "default" : "outline"}
                            size="sm"
                            className="justify-start"
                            onClick={() => handleToggleUnitType(type)}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>属性加成</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label htmlFor="edit-attack-bonus">攻击加成 (%)</Label>
                          <Input 
                            id="edit-attack-bonus" 
                            type="number" 
                            value={editingBond.effects.statModifiers.attack || 0}
                            onChange={(e) => handleEditingBondStatChange('attack', parseInt(e.target.value))} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-defense-bonus">防御加成 (%)</Label>
                          <Input 
                            id="edit-defense-bonus" 
                            type="number" 
                            value={editingBond.effects.statModifiers.defense || 0}
                            onChange={(e) => handleEditingBondStatChange('defense', parseInt(e.target.value))} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-effect-desc">效果描述</Label>
                      <Textarea 
                        id="edit-effect-desc" 
                        value={editingBond.effects.description}
                        onChange={(e) => handleEditingBondEffectChange('description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>特殊效果</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={specialEffect}
                      onChange={(e) => setSpecialEffect(e.target.value)}
                      placeholder="输入特殊效果描述"
                    />
                    <Button onClick={handleAddSpecialEffect}>添加</Button>
                  </div>
                  
                  {editingBond.effects.specialEffects && editingBond.effects.specialEffects.length > 0 && (
                    <div className="space-y-1">
                      {editingBond.effects.specialEffects.map((effect, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/20 rounded p-2">
                          <span>{effect}</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveSpecialEffect(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button onClick={handleSaveBond}>
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

export default BondEditor;
