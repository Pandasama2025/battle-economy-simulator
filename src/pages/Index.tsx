
import Dashboard from '@/components/Dashboard';
import { GameProvider } from '@/context/GameContext';

const Index = () => {
  return (
    <GameProvider>
      <Dashboard />
    </GameProvider>
  );
};

export default Index;
