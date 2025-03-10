
// 贝叶斯参数优化器

interface ParameterSpace {
  name: string;
  min: number;
  max: number;
  step?: number;
  type: "continuous" | "discrete";
}

interface OptimizationResult {
  parameters: Record<string, number>;
  score: number;
  iteration: number;
}

// 简化版贝叶斯优化器
export class BayesianOptimizer {
  private bestResult: OptimizationResult | null = null;
  private allResults: OptimizationResult[] = [];
  private iteration = 0;
  
  constructor(
    private parameterSpace: ParameterSpace[],
    private evaluationFunction: (params: Record<string, number>) => Promise<number>
  ) {}
  
  // 生成下一组建议参数
  async suggestParameters(): Promise<Record<string, number>> {
    this.iteration++;
    
    // 简单实现：如果没有足够的数据，使用随机采样
    if (this.allResults.length < 5) {
      return this.randomSample();
    }
    
    // 否则，使用简化的探索-利用策略
    const exploreProb = Math.max(0.1, 1 - this.iteration / 30); // 随着迭代次数增加，降低探索概率
    
    if (Math.random() < exploreProb) {
      // 探索：生成随机参数，但避开已尝试区域
      return this.diversifiedSample();
    } else {
      // 利用：基于最佳结果进行局部搜索
      return this.localSearch();
    }
  }
  
  // 评估参数并更新结果
  async evaluateAndUpdate(parameters: Record<string, number>): Promise<OptimizationResult> {
    const score = await this.evaluationFunction(parameters);
    
    const result: OptimizationResult = {
      parameters,
      score,
      iteration: this.iteration
    };
    
    this.allResults.push(result);
    
    // 更新最佳结果
    if (!this.bestResult || score > this.bestResult.score) {
      this.bestResult = result;
    }
    
    return result;
  }
  
  // 获取最佳参数
  getBestParameters(): Record<string, number> | null {
    return this.bestResult ? this.bestResult.parameters : null;
  }
  
  // 随机采样
  private randomSample(): Record<string, number> {
    const result: Record<string, number> = {};
    
    this.parameterSpace.forEach(param => {
      if (param.type === "continuous") {
        result[param.name] = param.min + Math.random() * (param.max - param.min);
      } else {
        const steps = Math.floor((param.max - param.min) / (param.step || 1)) + 1;
        const step = Math.floor(Math.random() * steps);
        result[param.name] = param.min + step * (param.step || 1);
      }
    });
    
    return result;
  }
  
  // 多样化采样（避开已探索区域）
  private diversifiedSample(): Record<string, number> {
    // 简单实现：多次随机采样，选择与现有样本距离最远的
    const candidateCount = 10;
    let bestDistance = -1;
    let bestCandidate: Record<string, number> = {};
    
    for (let i = 0; i < candidateCount; i++) {
      const candidate = this.randomSample();
      const minDistance = this.minDistanceToExistingSamples(candidate);
      
      if (minDistance > bestDistance) {
        bestDistance = minDistance;
        bestCandidate = candidate;
      }
    }
    
    return bestCandidate;
  }
  
  // 计算参数集与现有样本的最小距离
  private minDistanceToExistingSamples(parameters: Record<string, number>): number {
    if (this.allResults.length === 0) return Infinity;
    
    return Math.min(...this.allResults.map(result => 
      this.parameterDistance(parameters, result.parameters)
    ));
  }
  
  // 计算两组参数间的标准化欧几里得距离
  private parameterDistance(params1: Record<string, number>, params2: Record<string, number>): number {
    let sumSquaredDiff = 0;
    
    this.parameterSpace.forEach(param => {
      const value1 = params1[param.name];
      const value2 = params2[param.name];
      const range = param.max - param.min;
      
      // 标准化差异
      const normalizedDiff = (value1 - value2) / range;
      sumSquaredDiff += normalizedDiff * normalizedDiff;
    });
    
    return Math.sqrt(sumSquaredDiff);
  }
  
  // 基于最佳结果的局部搜索
  private localSearch(): Record<string, number> {
    if (!this.bestResult) return this.randomSample();
    
    const result: Record<string, number> = {};
    const bestParams = this.bestResult.parameters;
    
    this.parameterSpace.forEach(param => {
      const range = param.max - param.min;
      // 在最佳值附近搜索（搜索范围随迭代减小）
      const searchRadius = range * Math.max(0.05, 0.5 * Math.exp(-this.iteration / 20));
      
      let value = bestParams[param.name] + (Math.random() * 2 - 1) * searchRadius;
      // 确保在参数范围内
      value = Math.max(param.min, Math.min(param.max, value));
      
      // 离散参数需要取步长的倍数
      if (param.type === "discrete" && param.step) {
        value = param.min + Math.round((value - param.min) / param.step) * param.step;
      }
      
      result[param.name] = value;
    });
    
    return result;
  }
  
  // 生成混沌测试参数
  generateChaosTest(): Record<string, any> {
    return {
      playerCount: [4, 8, 16][Math.floor(Math.random() * 3)],
      goldInflationRate: 0.5 + Math.random() * 2.5,
      unitSpawnAnomaly: Math.random() > 0.5,
      combatSpeedMultiplier: 0.5 + Math.random() * 2.0,
      environmentHazards: Math.random() > 0.7,
      economicShock: Math.random() > 0.8
    };
  }
}
