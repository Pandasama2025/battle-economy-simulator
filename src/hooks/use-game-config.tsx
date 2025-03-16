
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameConfigManager, GameConfig, gameConfigManager } from '@/lib/config/GameConfigManager';

// 创建配置上下文
const GameConfigContext = createContext<{
  config: GameConfig;
  configManager: GameConfigManager;
}>({
  config: gameConfigManager.getConfig(),
  configManager: gameConfigManager
});

// 配置提供者组件
export const GameConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GameConfig>(gameConfigManager.getConfig());

  useEffect(() => {
    // 订阅配置变更
    const unsubscribe = gameConfigManager.addListener(newConfig => {
      setConfig(newConfig);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <GameConfigContext.Provider value={{ config, configManager: gameConfigManager }}>
      {children}
    </GameConfigContext.Provider>
  );
};

// 使用配置的钩子
export const useGameConfig = () => {
  const context = useContext(GameConfigContext);
  if (!context) {
    throw new Error('useGameConfig must be used within a GameConfigProvider');
  }
  return context;
};
