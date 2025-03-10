
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

const SimulationControls = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Simulation Controls</h3>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            Simulation Speed
          </label>
          <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            className="mb-6"
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
          <Button variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground block">
            Parameters
          </label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Physical Defense:</div>
            <div className="text-right">0.035</div>
            <div>Magic Resistance:</div>
            <div className="text-right">0.028</div>
            <div>Critical Rate:</div>
            <div className="text-right">0.15</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimulationControls;
