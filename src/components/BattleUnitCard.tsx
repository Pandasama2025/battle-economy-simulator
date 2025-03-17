
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Unit } from '@/types/battle';
import { cn } from '@/lib/utils';
import { Heart, Zap, Sword, Shield, Wind } from 'lucide-react';

interface BattleUnitCardProps {
  unit: Unit;
  isSelected?: boolean;
  onClick?: () => void;
}

const BattleUnitCard: React.FC<BattleUnitCardProps> = ({ unit, isSelected, onClick }) => {
  const healthPercentage = (unit.currentHP / unit.maxHP) * 100;
  const manaPercentage = unit.maxMana ? (unit.currentMana / unit.maxMana) * 100 : 0;
  const isDead = unit.currentHP <= 0;
  
  // 获取职业对应的颜色
  const getProfessionColor = (profession?: string) => {
    if (!profession) return 'bg-gray-500';
    
    switch (profession) {
      case '坦克': return 'bg-blue-500';
      case '输出': return 'bg-red-500';
      case '辅助': return 'bg-green-500';
      case '控制': return 'bg-purple-500';
      case '刺客': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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

  // 获取状态对应的颜色和标签
  const getStatusBadge = () => {
    if (!unit.status || unit.status === 'idle' || unit.status === 'dead') return null;
    
    const statusMap = {
      'attacking': { label: '攻击中', variant: 'secondary', color: 'text-red-500' },
      'casting': { label: '施法中', variant: 'secondary', color: 'text-blue-500' },
      'defending': { label: '防御中', variant: 'secondary', color: 'text-green-500' },
      'moving': { label: '移动中', variant: 'secondary', color: 'text-yellow-500' },
      'stunned': { label: '已眩晕', variant: 'destructive', color: 'text-destructive' }
    };
    
    const status = statusMap[unit.status as keyof typeof statusMap];
    
    if (!status) return null;
    
    return (
      <Badge variant="outline" className={`w-full justify-center text-xs mt-1 ${status.color}`}>
        {status.label}
      </Badge>
    );
  };
  
  return (
    <Card 
      className={cn(
        "w-full h-full cursor-pointer transition-all hover:shadow-md",
        isSelected ? "ring-2 ring-primary shadow-md" : "",
        isDead ? "opacity-50" : "",
        "animate-in"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-2 pb-0 space-y-0">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {unit.type || "单位"} Lv.{unit.level}
          </Badge>
          <Badge 
            className={`text-xs text-white ${getProfessionColor(unit.profession)}`}
          >
            {unit.profession || "未知"}
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
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500" />
              生命
            </span>
            <span>{unit.currentHP}/{unit.maxHP}</span>
          </div>
          <Progress 
            value={healthPercentage} 
            className="h-1.5" 
            indicatorClassName={cn(
              healthPercentage > 60 ? "bg-green-500" : 
              healthPercentage > 30 ? "bg-amber-500" : 
              "bg-red-500"
            )}
          />
          
          {unit.maxMana && (
            <>
              <div className="flex justify-between text-xs mt-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-500" />
                  法力
                </span>
                <span>{unit.currentMana}/{unit.maxMana}</span>
              </div>
              <Progress 
                value={manaPercentage} 
                className="h-1.5" 
                indicatorClassName="bg-blue-500"
              />
            </>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-1 text-xs text-foreground">
          <div className="flex items-center gap-1 justify-between">
            <span className="flex items-center">
              <Sword className="w-3 h-3 text-red-400 mr-1" />
              攻击
            </span>
            <span>{unit.attack}</span>
          </div>
          <div className="flex items-center gap-1 justify-between">
            <span className="flex items-center">
              <Shield className="w-3 h-3 text-blue-400 mr-1" />
              防御
            </span>
            <span>{unit.defense}</span>
          </div>
          <div className="flex items-center gap-1 justify-between">
            <span className="flex items-center">
              <Wind className="w-3 h-3 text-green-400 mr-1" />
              速度
            </span>
            <span>{unit.speed}</span>
          </div>
        </div>
        
        {getStatusBadge()}
      </CardContent>
    </Card>
  );
};

export default BattleUnitCard;
