
import Dashboard from '@/components/Dashboard';
import { GameProvider } from '@/context/GameContext';
import { GameConfigProvider } from '@/hooks/use-game-config';

const Index = () => {
  return (
    <GameConfigProvider>
      <GameProvider>
        <Dashboard />
      </GameProvider>
    </GameConfigProvider>
  );
};

export default Index;
