
/**
 * 平衡模拟结果
 */
export interface SimulationResult {
  // 输入参数
  params: Record<string, number>;
  
  // 单位胜率数据
  winRates: Record<string, number>;
  
  // 经济指标
  economyMetrics: Record<string, number>;
  
  // 平衡性综合得分 (0-100)
  balanceScore: number;
  
  // 信心区间 (新增)
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  
  // 元数据
  metadata: {
    timestamp: number;
    configId: string;
    randomSeed?: number; // 新增随机种子
    iterationCount?: number; // 新增迭代次数
    [key: string]: any;
  };
}

/**
 * 参数敏感度分析结果
 */
export interface SensitivityAnalysis {
  // 参数名称及其敏感度分数
  parameters: Record<string, number>;
  
  // 参数排序 (从最敏感到最不敏感)
  rankedParameters: string[];
  
  // 分析元数据
  metadata: {
    sampleSize: number;
    timestamp: number;
    method: string;
  };
}

/**
 * 平衡优化结果
 */
export interface OptimizationResult {
  // 初始参数
  initialParams: Record<string, number>;
  
  // 优化后参数
  optimizedParams: Record<string, number>;
  
  // 参数变化百分比
  parameterChanges: Record<string, number>;
  
  // 性能改进
  improvement: {
    initialScore: number;
    finalScore: number;
    percentImprovement: number;
  };
  
  // 迭代历史摘要
  iterationSummary: {
    iterations: number;
    convergenceRate: number;
    timeElapsed: number;
  };
}

/**
 * 极端场景定义
 */
export interface ExtremeScenario {
  name: string;
  description: string;
  params: Record<string, number>;
  expectedOutcome?: {
    minBalanceScore: number;
    maxWinRateDelta: number;
  };
}

/**
 * 平衡验证结果
 */
export interface ValidationResult {
  passed: boolean;
  scenariosTotal: number;
  scenariosPassed: number;
  failedScenarios: {
    scenarioName: string;
    actualScore: number;
    expectedMinScore: number;
    reason: string;
  }[];
  kpiResults: {
    unitEfficiencyDelta: number; // 应小于15%
    factionWinRateDelta: number; // 应小于5%
    economyConversionVariance: number; // 应小于10%
  };
}

/**
 * 单位生态链关系
 */
export interface UnitEcosystem {
  // 单位克制关系图 (key: 单位类型, value: 被该单位克制的单位类型列表)
  counterRelationships: Record<string, string[]>;
  
  // 克制系数 (0.5-2.0)
  counterMultipliers: Record<string, number>;
  
  // 环境因素影响
  environmentalFactors: {
    [environment: string]: {
      [unitType: string]: number; // 影响百分比
    }
  };
  
  // 连击系数
  comboMultipliers: {
    base: number;
    decay: number; // 递减系数
    maxStack: number; // 最大叠加次数
  };
}

/**
 * 技能连携效果
 */
export interface SkillSynergy {
  // 元素反应定义
  elementalReactions: {
    [combination: string]: {
      name: string;
      multiplier: number;
      effectDuration: number;
    }
  };
  
  // 队伍羁绊加成
  teamBonds: {
    [bondName: string]: {
      units: string[];
      requiredCount: number;
      statBoosts: Record<string, number>;
      specialEffects?: string[];
    }
  };
}

/**
 * 玩家行为模拟配置
 */
export interface PlayerBehaviorSimulation {
  // 玩家类型及其决策权重
  archetypes: {
    [archetype: string]: {
      // 关键决策参数权重 (0-1)
      weights: Record<string, number>;
      // 风险偏好 (0-1, 0为极度保守, 1为极度激进)
      riskTolerance: number;
      // 资源分配倾向
      resourceAllocation: {
        economy: number;
        combat: number;
        longTerm: number;
      };
    }
  };
  
  // 模拟规模
  simulationSize: number;
  
  // 回合数
  roundsToSimulate: number;
}

/**
 * 派系定义 (新增)
 */
export interface Faction {
  id: string;
  name: string;
  description: string;
  
  // 羁绊阈值与效果
  bondThresholds: number[];
  bondEffects: {
    [threshold: number]: {
      description: string;
      statModifiers: Record<string, number>;
      specialEffects?: string[];
    }
  };
  
  // 派系特殊机制
  specialMechanics?: {
    name: string;
    description: string;
    triggerCondition: string;
    effect: string;
    scalingFactor?: number;
  }[];
  
  // 派系克制关系
  counterRelationships?: {
    strong: string[];
    weak: string[];
  };
}

/**
 * 装备系统 (新增)
 */
export interface EquipmentSystem {
  // 装备定义
  items: {
    [itemId: string]: {
      name: string;
      rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
      statModifiers: Record<string, number>;
      specialEffects?: {
        description: string;
        conditions?: string;
        scaling?: Record<string, number>;
      }[];
    }
  };
  
  // 装备组合效果
  setCombinations: {
    [setName: string]: {
      requiredItems: string[];
      bonusEffect: {
        description: string;
        statModifiers: Record<string, number>;
        specialEffect?: string;
      }
    }
  };
  
  // 单位-装备适配性
  equipmentAffinities: {
    [unitType: string]: {
      [itemId: string]: number; // 适配系数 (0.5-2.0)
    }
  };
}

/**
 * 战斗分析结果 (新增)
 */
export interface BattleAnalysis {
  // 战斗概述
  summary: {
    totalRounds: number;
    winner: string;
    winningTeamRemaining: number; // 胜利方剩余单位百分比
    averageDamagePerRound: number;
    totalDamageDealt: Record<string, number>; // 按单位类型
    totalHealing: Record<string, number>; // 按单位类型
    criticalHitRate: number;
    crowdControlDuration: number; // 总控制时长(秒)
  };
  
  // 回合分析
  roundByRound: {
    round: number;
    dominanceScore: number; // -1到1, 负数表示B队占优势
    keyEvents: string[];
    damageDistribution: Record<string, number>;
  }[];
  
  // 单位表现
  unitPerformance: {
    unitId: string;
    unitType: string;
    damageDone: number;
    damageTaken: number;
    healing: number;
    crowdControlInflicted: number;
    crowdControlReceived: number;
    survivalTime: number;
    effectiveValue: number; // 综合战斗价值
  }[];
  
  // 技能使用分析
  skillAnalysis: {
    skillId: string;
    useCount: number;
    averageValue: number;
    hitRate: number;
    criticalRate: number;
  }[];
}

/**
 * 高级平衡优化配置 (新增)
 */
export interface AdvancedOptimizationConfig {
  // 随机种子设置
  randomSeed?: number;
  useDeterministicMode: boolean;
  
  // 优化算法选择
  optimizationMethod: 'bayesian' | 'evolution' | 'gradientBoosting' | 'reinforcementLearning';
  
  // 高级配置
  configuration: {
    iterationsPerTrial: number;
    maxTrials: number;
    explorationWeight: number;
    learningRate?: number;
    regularizationStrength?: number;
    convergenceTolerance: number;
    earlyStopping: boolean;
    parallelTrials: number;
  };
  
  // 目标指标权重
  objectiveWeights: {
    balanceScore: number;
    unitDiversity: number;
    strategyDiversity: number;
    matchDuration: number;
    economyProgression: number;
    [key: string]: number;
  };
  
  // 约束条件
  constraints: {
    maxWinRateDeviation: number;
    minEffectiveUnitPercentage: number;
    maxMatchDurationVariance: number;
    requireAllUnitsViable: boolean;
    [key: string]: any;
  };
}

/**
 * 日志系统 (新增)
 */
export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warning' | 'error';
  category: string;
  message: string;
  details?: any;
}

/**
 * 平衡报告 (新增)
 */
export interface BalanceReport {
  // 总体评分
  overallScore: number;
  confidence: number;
  
  // 单位平衡性评估
  unitBalance: {
    winRateDeviation: number;
    usageRateDeviation: number;
    powerCurveSlope: number; // 早期到后期的强度曲线
    mostProblematicUnits: {
      unitId: string;
      issue: string;
      severity: number;
      recommendation: string;
    }[];
  };
  
  // 派系平衡性评估
  factionBalance: {
    topFactions: string[];
    weakestFactions: string[];
    bondThresholdEfficacy: Record<string, Record<number, number>>;
    factionSynergies: Record<string, string[]>;
  };
  
  // 经济平衡性评估
  economyBalance: {
    goldProgression: number[];
    resourceEfficiency: number;
    comebackMechanics: {
      effectiveness: number;
      frequency: number;
    };
    ecomomyStrategies: {
      strategy: string;
      successRate: number;
    }[];
  };
  
  // 解决方案建议
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    solution: string;
    expectedImpact: number;
  }[];
  
  // 元数据
  metadata: {
    simulationCount: number;
    totalRoundsSimulated: number;
    generationTimestamp: number;
    dataVersionId: string;
  };
}
