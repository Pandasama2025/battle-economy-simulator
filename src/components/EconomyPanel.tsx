
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Coins } from 'lucide-react';

const mockEconomyData = Array.from({ length: 8 }, (_, i) => ({
  player: `P${i + 1}`,
  gold: Math.random() * 100 + 50,
  units: Math.floor(Math.random() * 5 + 3),
}));

const EconomyPanel = () => {
  return (
    <Card className="p-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-simulator-accent" />
            <h4 className="font-medium">Average Gold</h4>
          </div>
          <p className="text-2xl font-semibold">78.5</p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-simulator-success" />
            <h4 className="font-medium">Total Units</h4>
          </div>
          <p className="text-2xl font-semibold">32</p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-simulator-warning" />
            <h4 className="font-medium">Growth Rate</h4>
          </div>
          <p className="text-2xl font-semibold">1.24x</p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockEconomyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="player" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="gold" fill="#6366f1" />
            <Bar dataKey="units" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default EconomyPanel;
