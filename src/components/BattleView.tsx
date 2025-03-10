
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Swords } from 'lucide-react';

const BattleView = () => {
  return (
    <Card className="p-6 animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Battle Simulation</h3>
        <div className="text-sm text-muted-foreground">Round: 3/10</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Team Alpha
          </h4>
          
          {['Knight', 'Mage', 'Archer'].map((unit, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{unit}</span>
                <span>HP: 340/400</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Swords className="w-4 h-4" />
            Team Beta
          </h4>
          
          {['Warrior', 'Priest', 'Assassin'].map((unit, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{unit}</span>
                <span>HP: 280/300</span>
              </div>
              <Progress value={93} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/10 rounded-lg">
        <h4 className="font-medium mb-2">Battle Log</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>[Round 3] Knight attacks Assassin for 158 damage</p>
          <p>[Round 3] Priest heals Warrior for 75 HP</p>
          <p>[Round 3] Mage casts Fireball on Warrior</p>
        </div>
      </div>
    </Card>
  );
};

export default BattleView;
