
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SimulationControls from './SimulationControls';
import BattleView from './BattleView';
import EconomyPanel from './EconomyPanel';

const mockData = Array.from({ length: 10 }, (_, i) => ({
  round: i + 1,
  balance: Math.random() * 100 + 50,
  winRate: Math.random() * 0.4 + 0.3,
}));

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Battle Economy Simulator</h1>
        <p className="text-muted-foreground">Real-time battle and economy simulation system</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Tabs defaultValue="battle" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="battle">Battle View</TabsTrigger>
              <TabsTrigger value="economy">Economy</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="battle">
              <BattleView />
            </TabsContent>
            
            <TabsContent value="economy">
              <EconomyPanel />
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="round" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="balance" stroke="#6366f1" />
                      <Line type="monotone" dataKey="winRate" stroke="#22c55e" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SimulationControls />
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Battle Duration</p>
                <p className="text-2xl font-semibold text-simulator-accent">127s</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate Variance</p>
                <p className="text-2xl font-semibold text-simulator-success">12.3%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economy Balance</p>
                <p className="text-2xl font-semibold text-simulator-warning">0.89</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
