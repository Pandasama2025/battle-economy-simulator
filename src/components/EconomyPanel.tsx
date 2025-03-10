
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import { TrendingUp, Users, Coins, ChevronsUpDown, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlayerArchetype } from '@/types/economy';

// 模拟数据生成
const generateEconomyData = (round: number) => {
  return Array.from({ length: 8 }, (_, i) => ({
    player: `P${i + 1}`,
    gold: Math.floor(Math.random() * 50 + 50 + round * 5),
    units: Math.floor(Math.random() * 3 + 3 + Math.min(round * 0.5, 5)),
  }));
};

const generateTrendData = (rounds: number) => {
  return Array.from({ length: rounds }, (_, i) => ({
    round: i + 1,
    avgGold: Math.floor(70 + i * 8 + Math.random() * 20),
    avgUnits: Math.floor(3 + i * 0.5 + Math.random()),
    marketActivity: Math.floor(5 + i * 2 + Math.random() * 10),
  }));
};

// 模拟玩家类型数据
const archetypes: Record<string, string> = {
  'aggressive': '攻击型',
  'economy': '经济型',
  'balanced': '平衡型',
  'flexible': '灵活型',
  'conservative': '保守型',
  'opportunist': '机会型'
};

const EconomyPanel = () => {
  const [currentRound, setCurrentRound] = useState(5);
  const [economyData, setEconomyData] = useState(generateEconomyData(currentRound));
  const [trendData, setTrendData] = useState(generateTrendData(10));
  const [chartView, setChartView] = useState<'current' | 'trend'>('current');
  const [selectedArchetype, setSelectedArchetype] = useState<string>("all");
  
  const averageGold = economyData.reduce((sum, item) => sum + item.gold, 0) / economyData.length;
  const totalUnits = economyData.reduce((sum, item) => sum + item.units, 0);
  const growthRate = 1 + (currentRound * 0.05);
  
  // 更新经济数据
  const updateEconomy = () => {
    setCurrentRound(prev => prev + 1);
    setEconomyData(generateEconomyData(currentRound + 1));
    
    // 添加新的趋势数据点
    setTrendData(prev => [
      ...prev, 
      {
        round: prev.length + 1,
        avgGold: Math.floor(70 + prev.length * 8 + Math.random() * 20),
        avgUnits: Math.floor(3 + prev.length * 0.5 + Math.random()),
        marketActivity: Math.floor(5 + prev.length * 2 + Math.random() * 10),
      }
    ]);
  };
  
  // 过滤玩家类型
  const filterByArchetype = (value: string) => {
    setSelectedArchetype(value);
    // 在实际应用中，这里会根据所选类型过滤数据
  };

  return (
    <Card className="p-6 animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">经济分析</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm px-2 py-1 bg-muted/20 rounded-md">
            回合: {currentRound}
          </div>
          <Select value={selectedArchetype} onValueChange={filterByArchetype}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="所有玩家类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有类型</SelectItem>
              {Object.entries(archetypes).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-simulator-accent" />
            <h4 className="font-medium">平均金币</h4>
          </div>
          <p className="text-2xl font-semibold">{averageGold.toFixed(1)}</p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-simulator-success" />
            <h4 className="font-medium">总单位数</h4>
          </div>
          <p className="text-2xl font-semibold">{totalUnits}</p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-simulator-warning" />
            <h4 className="font-medium">增长率</h4>
          </div>
          <p className="text-2xl font-semibold">{growthRate.toFixed(2)}x</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button 
            variant={chartView === 'current' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setChartView('current')}
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            当前状态
          </Button>
          <Button 
            variant={chartView === 'trend' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setChartView('trend')}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            发展趋势
          </Button>
        </div>
        
        <Button size="sm" onClick={updateEconomy}>
          <ChevronsUpDown className="w-4 h-4 mr-1" />
          更新数据
        </Button>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'current' ? (
            <BarChart data={economyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="player" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar name="金币" dataKey="gold" fill="#6366f1" />
              <Bar name="单位数" dataKey="units" fill="#22c55e" />
            </BarChart>
          ) : (
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="round" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                name="平均金币" 
                type="monotone" 
                dataKey="avgGold" 
                stroke="#6366f1" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                name="平均单位" 
                type="monotone" 
                dataKey="avgUnits" 
                stroke="#22c55e" 
              />
              <Line 
                name="市场活跃度" 
                type="monotone" 
                dataKey="marketActivity" 
                stroke="#eab308" 
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-muted/10 rounded-lg">
        <h4 className="font-medium mb-2">经济摘要</h4>
        <div className="text-sm text-muted-foreground">
          <p>当前阶段的经济状况{averageGold > 80 ? "繁荣" : "平稳"}。</p>
          <p>玩家资源分配趋势:{currentRound > 5 ? "单位投入增加" : "金币积累阶段"}。</p>
          <p>市场活跃度:{Math.random() > 0.5 ? "高" : "中等"}，价格波动率:{(Math.random() * 5 + 10).toFixed(1)}%</p>
        </div>
      </div>
    </Card>
  );
};

export default EconomyPanel;
