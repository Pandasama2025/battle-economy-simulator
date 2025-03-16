
import { BalanceParameters } from "@/context/GameContext";
import { ConfigVersioner } from "@/lib/utils/ConfigVersioner";

export interface GameFeatureFlag {
  enabled: boolean;
  name: string;
  description: string;
}

export interface GameConfig {
  version: string;
  balanceParameters: BalanceParameters;
  featureFlags: Record<string, GameFeatureFlag>;
  uiOptions: {
    showDetailedStats: boolean;
    animationSpeed: number;
    showBattleEffects: boolean;
    darkMode: boolean;
  };
}

// Default feature flags for the game
const DEFAULT_FEATURE_FLAGS: Record<string, GameFeatureFlag> = {
  advancedCombat: {
    enabled: false,
    name: "高级战斗系统",
    description: "启用更复杂的战斗机制，包括技能连招和元素反应"
  },
  economySystem: {
    enabled: true,
    name: "经济系统",
    description: "启用金币、商店和资源管理系统"
  },
  terrainEffects: {
    enabled: true,
    name: "地形效果",
    description: "战场地形会影响单位属性和战斗结果"
  },
  bondSystem: {
    enabled: true,
    name: "羁绊系统",
    description: "单位之间的关系会提供额外的战斗加成"
  },
  itemSystem: {
    enabled: false,
    name: "装备系统",
    description: "单位可以装备物品获得属性提升"
  }
};

// Default configuration with reasonable starting values
const DEFAULT_CONFIG: GameConfig = {
  version: "1.0.0",
  balanceParameters: {
    physicalDefense: 0.035,
    magicResistance: 0.028,
    criticalRate: 0.15,
    healingEfficiency: 1.0,
    goldScaling: 1.2,
    interestRate: 0.1
  },
  featureFlags: DEFAULT_FEATURE_FLAGS,
  uiOptions: {
    showDetailedStats: true,
    animationSpeed: 1.0,
    showBattleEffects: true,
    darkMode: false
  }
};

/**
 * 游戏配置管理器 - 负责管理游戏配置、特性开关和版本控制
 */
export class GameConfigManager {
  private config: GameConfig;
  private versioner: ConfigVersioner;
  private listeners: Array<(config: GameConfig) => void> = [];
  
  constructor() {
    this.versioner = new ConfigVersioner('game-config-history');
    
    // 尝试从localStorage加载配置，如果不存在则使用默认配置
    const savedConfig = this.loadConfig();
    if (savedConfig) {
      // 合并默认配置和保存的配置，确保新添加的字段也存在
      this.config = this.mergeConfigs(DEFAULT_CONFIG, savedConfig);
    } else {
      this.config = {...DEFAULT_CONFIG};
      this.saveConfig();
    }
  }
  
  /**
   * 获取当前配置
   */
  getConfig(): GameConfig {
    return {...this.config};
  }
  
  /**
   * 更新平衡参数
   */
  updateBalanceParameters(params: Partial<BalanceParameters>, comment: string = "更新平衡参数"): void {
    this.config = {
      ...this.config,
      balanceParameters: {
        ...this.config.balanceParameters,
        ...params
      }
    };
    
    this.versioner.commitChange(this.config.balanceParameters, comment);
    this.saveConfig();
    this.notifyListeners();
  }
  
  /**
   * 切换特性开关
   */
  toggleFeatureFlag(flagKey: string, enabled: boolean): void {
    if (!this.config.featureFlags[flagKey]) {
      console.warn(`Feature flag ${flagKey} does not exist`);
      return;
    }
    
    this.config.featureFlags[flagKey].enabled = enabled;
    this.saveConfig();
    this.notifyListeners();
  }
  
  /**
   * 添加新的特性开关
   */
  addFeatureFlag(key: string, flag: GameFeatureFlag): void {
    this.config.featureFlags[key] = flag;
    this.saveConfig();
    this.notifyListeners();
  }
  
  /**
   * 更新UI选项
   */
  updateUIOptions(options: Partial<GameConfig['uiOptions']>): void {
    this.config.uiOptions = {
      ...this.config.uiOptions,
      ...options
    };
    
    this.saveConfig();
    this.notifyListeners();
  }
  
  /**
   * 回滚到特定配置版本
   */
  rollbackToVersion(hash: string): boolean {
    const oldParams = this.versioner.rollbackTo(hash);
    if (!oldParams) return false;
    
    this.config.balanceParameters = {...oldParams as BalanceParameters};
    this.saveConfig();
    this.notifyListeners();
    return true;
  }
  
  /**
   * 获取配置历史记录
   */
  getConfigHistory() {
    return this.versioner.getHistory();
  }
  
  /**
   * 添加配置变更监听器
   */
  addListener(listener: (config: GameConfig) => void): () => void {
    this.listeners.push(listener);
    
    // 返回取消监听的函数
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * 合并配置，确保新添加的字段也存在
   */
  private mergeConfigs(defaultConfig: GameConfig, savedConfig: Partial<GameConfig>): GameConfig {
    const result = {...defaultConfig};
    
    // 合并平衡参数
    if (savedConfig.balanceParameters) {
      result.balanceParameters = {
        ...defaultConfig.balanceParameters,
        ...savedConfig.balanceParameters
      };
    }
    
    // 合并特性开关
    if (savedConfig.featureFlags) {
      result.featureFlags = {...defaultConfig.featureFlags};
      
      // 只合并已存在的特性开关
      Object.keys(savedConfig.featureFlags).forEach(key => {
        if (defaultConfig.featureFlags[key]) {
          result.featureFlags[key] = {
            ...defaultConfig.featureFlags[key],
            ...savedConfig.featureFlags![key]
          };
        }
      });
    }
    
    // 合并UI选项
    if (savedConfig.uiOptions) {
      result.uiOptions = {
        ...defaultConfig.uiOptions,
        ...savedConfig.uiOptions
      };
    }
    
    return result;
  }
  
  /**
   * 保存配置到localStorage
   */
  private saveConfig(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('game-config', JSON.stringify(this.config));
    }
  }
  
  /**
   * 从localStorage加载配置
   */
  private loadConfig(): Partial<GameConfig> | null {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('game-config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved game config', e);
        }
      }
    }
    return null;
  }
  
  /**
   * 通知所有监听器配置已更改
   */
  private notifyListeners(): void {
    const configCopy = this.getConfig();
    this.listeners.forEach(listener => {
      try {
        listener(configCopy);
      } catch (e) {
        console.error('Error in config change listener', e);
      }
    });
  }
}

// 创建单例实例
export const gameConfigManager = new GameConfigManager();

