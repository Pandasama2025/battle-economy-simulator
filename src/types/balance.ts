
/**
 * 平衡模拟结果
 */
export interface SimulationResult {
  // 输入参数
  params: Record<string, number>;
  
  // 单位胜率数据
  winRates: Record<string, number>;
  
  // 经济指标
  economyMetrics: {
    goldEfficiency: number;
    itemUtilization: number;
    resourceBalance: number;
    [key: string]: number;
  };
  
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
