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
  
  // 元数据
  metadata: {
    timestamp: number;
    configId: string;
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
