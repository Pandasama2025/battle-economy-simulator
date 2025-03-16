
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Unit } from '@/types/battle';

interface BattleUnitCardProps {
  unit: Unit;
  isSelected?: boolean;
  onClick?: () => void;
}

const BattleUnitCard: React.FC<BattleUnitCardProps> = ({ unit, isSelected, onClick }) => {
  const healthPercentage = (unit.currentHP / unit.maxHP) * 100;
  const manaPercentage = unit.maxMana ? (unit.currentMana / unit.maxMana) * 100 : 0;
  
  // 获取职业对应的颜色
  const getProfessionColor = (profession?: string) => {
    if (!profession) return 'bg-gray-500 hover:bg-gray-600';
    
    switch (profession) {
      case '坦克': return 'bg-blue-500 hover:bg-blue-600';
      case '输出': return 'bg-red-500 hover:bg-red-600';
      case '辅助': return 'bg-green-500 hover:bg-green-600';
      case '控制': return 'bg-purple-500 hover:bg-purple-600';
      case '刺客': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // 获取种族对应的图标
  const getRaceIcon = (race?: string) => {
    if (!race) return '❓';
    
    switch (race) {
      case '人类': return '👤';
      case '精灵': return '🧝';
      case '龙族': return '🐉';
      case '亡灵': return '💀';
      case '机械': return '🤖';
      case '元素': return '🔮';
      default: return '❓';
    }
  };
  
  return (
    <Card 
      className={`w-full h-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${unit.currentHP <= 0 ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="p-2 pb-0 space-y-0">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {unit.type} Lv.{unit.level}
          </Badge>
          <Badge className={`text-xs text-white ${getProfessionColor(unit.profession)}`}>
            {unit.profession}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <span className="text-lg font-medium">{getRaceIcon(unit.race)}</span>
            <span className="text-sm font-medium truncate">{unit.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">#{unit.id.slice(-4)}</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>生命</span>
            <span>{unit.currentHP}/{unit.maxHP}</span>
          </div>
          <Progress value={healthPercentage} className="h-1.5" />
          
          {unit.maxMana && (
            <>
              <div className="flex justify-between text-xs mt-1">
                <span>法力</span>
                <span>{unit.currentMana}/{unit.maxMana}</span>
              </div>
              <Progress value={manaPercentage} className="h-1.5 bg-secondary" />
            </>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>攻击</span>
            <span>{unit.attack}</span>
          </div>
          <div className="flex justify-between">
            <span>防御</span>
            <span>{unit.defense}</span>
          </div>
          <div className="flex justify-between">
            <span>速度</span>
            <span>{unit.speed}</span>
          </div>
        </div>
        
        {unit.status && unit.status !== 'idle' && unit.status !== 'dead' && (
          <Badge variant="secondary" className="w-full justify-center text-xs mt-1">
            {unit.status === 'attacking' ? '攻击中' : 
             unit.status === 'casting' ? '施法中' : 
             unit.status === 'defending' ? '防御中' : 
             unit.status === 'moving' ? '移动中' : 
             unit.status === 'stunned' ? '已眩晕' : ''}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default BattleUnitCard;
