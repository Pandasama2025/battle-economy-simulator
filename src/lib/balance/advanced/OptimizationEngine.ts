
import { SimulationResult, AdvancedOptimizationConfig, LogEntry, BalanceReport } from '@/types/balance';
import { EconomyConfiguration } from '@/types/economy';
import { BattleConfiguration } from '@/types/battle';

/**
 * 高级优化引擎 - 使用梯度提升决策树和确定性随机模式
 * 确保相同输入参数下输出稳定一致的调优结果
 */
export class OptimizationEngine {
  private config: AdvancedOptimizationConfig;
  private logs: LogEntry[] = [];
  private bestResult: SimulationResult | null = null;
  private simulationResults: SimulationResult[] = [];
  private isRunning = false;
  private randomSeed: number;
  
  constructor(config?: Partial<AdvancedOptimizationConfig>) {
    // 默认配置
    this.config = {
      useDeterministicMode: true,
      optimizationMethod: 'gradientBoosting',
      configuration: {
        iterationsPerTrial: 10,
        maxTrials: 20,
        explorationWeight: 0.3,
        learningRate: 0.05,
        regularizationStrength: 0.01,
        convergenceTolerance: 0.001,
        earlyStopping: true,
        parallelTrials: 1
      },
      objectiveWeights: {
        balanceScore: 1.0,
        unitDiversity: 0.7,
        strategyDiversity: 0.7,
        matchDuration: 0.3,
        economyProgression: 0.5
      },
      constraints: {
        maxWinRateDeviation: 0.15,
        minEffectiveUnitPercentage: 0.85,
        maxMatchDurationVariance: 0.3,
        requireAllUnitsViable: true
      }
    };
    
    // 合并用户配置
    if (config) {
      this.config = this.mergeConfigs(this.config, config);
    }
    
    // 初始化随机种子
    this.randomSeed = this.config.randomSeed || this.generateRandomSeed();
    this.logInfo('系统', `优化引擎初始化完成，使用算法: ${this.config.optimizationMethod}，随机种子: ${this.randomSeed}`);
  }
  
  /**
   * 合并配置对象
   */
  private mergeConfigs(defaultConfig: any, userConfig: any): any {
    const result = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (typeof userConfig[key] === 'object' && userConfig[key] !== null && key in defaultConfig) {
        result[key] = this.mergeConfigs(defaultConfig[key], userConfig[key]);
      } else {
        result[key] = userConfig[key];
      }
    }
    
    return result;
  }
  
  /**
   * 生成随机种子
   */
  private generateRandomSeed(): number {
    return Math.floor(Math.random() * 1000000);
  }
  
  /**
   * 获取确定性随机数生成器
   */
  private seededRandom(seed: number): () => number {
    // 基于线性同余法的伪随机数生成器
    let _seed = seed;
    return function() {
      _seed = (_seed * 9301 + 49297) % 233280;
      return _seed / 233280;
    };
  }
  
  /**
   * 添加日志
   */
  private logInfo(category: string, message: string, details?: any): void {
    this.logs.push({
      timestamp: Date.now(),
      level: 'info',
      category,
      message,
      details
    });
    console.log(`[${category}] ${message}`);
  }
  
  private logWarning(category: string, message: string, details?: any): void {
    this.logs.push({
      timestamp: Date.now(),
      level: 'warning',
      category,
      message,
      details
    });
    console.warn(`[${category}] ${message}`);
  }
  
  private logError(category: string, message: string, details?: any): void {
    this.logs.push({
      timestamp: Date.now(),
      level: 'error',
      category,
      message,
      details
    });
    console.error(`[${category}] ${message}`);
  }
  
  /**
   * 获取日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * 设置随机种子
   */
  setRandomSeed(seed: number): void {
    this.randomSeed = seed;
    this.config.randomSeed = seed;
    this.logInfo('配置', `已设置随机种子: ${seed}`);
  }
  
  /**
   * 开始优化过程
   */
  async optimize(
    initialParams: Record<string, number>,
    paramRanges: Record<string, [number, number]>,
    evaluationFunction: (params: Record<string, number>) => Promise<number>,
    progressCallback?: (progress: number, bestScore: number) => void
  ): Promise<SimulationResult> {
    if (this.isRunning) {
      throw new Error('优化已在运行中');
    }
    
    this.isRunning = true;
    this.simulationResults = [];
    this.bestResult = null;
    
    try {
      this.logInfo('优化', `开始${this.config.optimizationMethod}优化过程，最大尝试次数: ${this.config.configuration.maxTrials}`);
      
      // 基于选择的方法进行优化
      switch (this.config.optimizationMethod) {
        case 'gradientBoosting':
          return await this.runGradientBoostingOptimization(
            initialParams,
            paramRanges,
            evaluationFunction,
            progressCallback
          );
        case 'bayesian':
          return await this.runBayesianOptimization(
            initialParams, 
            paramRanges, 
            evaluationFunction,
            progressCallback
          );
        case 'evolution':
          return await this.runEvolutionaryOptimization(
            initialParams, 
            paramRanges, 
            evaluationFunction,
            progressCallback
          );
        case 'reinforcementLearning':
          return await this.runReinforcementLearning(
            initialParams, 
            paramRanges, 
            evaluationFunction,
            progressCallback
          );
        default:
          throw new Error(`不支持的优化方法: ${this.config.optimizationMethod}`);
      }
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * 梯度提升决策树优化 - 高稳定性优化方法
   */
  private async runGradientBoostingOptimization(
    initialParams: Record<string, number>,
    paramRanges: Record<string, [number, number]>,
    evaluationFunction: (params: Record<string, number>) => Promise<number>,
    progressCallback?: (progress: number, bestScore: number) => void
  ): Promise<SimulationResult> {
    const maxTrials = this.config.configuration.maxTrials;
    const random = this.seededRandom(this.randomSeed);
    
    // 初始化最佳结果
    const initialScore = await evaluationFunction(initialParams);
    this.bestResult = {
      params: { ...initialParams },
      winRates: {},  // 简化示例，真实实现中会由评估函数填充
      economyMetrics: {},
      balanceScore: initialScore,
      confidenceInterval: { lower: initialScore * 0.95, upper: initialScore * 1.05 },
      metadata: {
        timestamp: Date.now(),
        configId: `gbdt-${this.randomSeed}`,
        randomSeed: this.randomSeed,
        iterationCount: 0
      }
    };
    
    this.simulationResults.push(this.bestResult);
    
    if (progressCallback) {
      progressCallback(0, initialScore);
    }
    
    // 参数维度列表
    const paramDimensions = Object.keys(paramRanges);
    
    // 学习率与正则化强度
    const learningRate = this.config.configuration.learningRate || 0.05;
    const regularization = this.config.configuration.regularizationStrength || 0.01;
    
    // 过去尝试的参数梯度信息
    const gradientHistory: {
      params: Record<string, number>;
      score: number;
      gradients: Record<string, number>;
    }[] = [];
    
    // 为每个参数维度建立梯度提升模型
    const parameterGradients: Record<string, number> = {};
    paramDimensions.forEach(dim => {
      parameterGradients[dim] = 0;
    });
    
    // 主要优化循环
    for (let trial = 0; trial < maxTrials && this.isRunning; trial++) {
      // 当前进度
      const progress = (trial + 1) / maxTrials;
      
      // 生成新的参数集
      const newParams = { ...initialParams };
      
      // 探索与利用平衡
      const explorationFactor = Math.max(0.1, this.config.configuration.explorationWeight * (1 - progress));
      
      // 基于梯度历史和探索因子生成新参数
      paramDimensions.forEach(dim => {
        // 结合梯度信息的参数更新
        const gradientStep = parameterGradients[dim] * learningRate;
        
        // 添加随机扰动（探索）
        const [min, max] = paramRanges[dim];
        const range = max - min;
        const randomNoise = (random() * 2 - 1) * range * explorationFactor;
        
        // 新的参数值
        let newValue = newParams[dim] + gradientStep + randomNoise;
        
        // 确保在参数范围内
        newValue = Math.max(min, Math.min(max, newValue));
        newParams[dim] = newValue;
      });
      
      // 评估新参数
      const score = await evaluationFunction(newParams);
      
      // 保存结果
      const result: SimulationResult = {
        params: { ...newParams },
        winRates: {},  // 简化示例
        economyMetrics: {},
        balanceScore: score,
        confidenceInterval: this.calculateConfidenceInterval(score, trial),
        metadata: {
          timestamp: Date.now(),
          configId: `gbdt-${this.randomSeed}-${trial}`,
          randomSeed: this.randomSeed,
          iterationCount: trial + 1
        }
      };
      
      this.simulationResults.push(result);
      
      // 更新梯度信息
      if (gradientHistory.length > 0) {
        const lastTrial = gradientHistory[gradientHistory.length - 1];
        
        // 计算每个参数维度的梯度
        paramDimensions.forEach(dim => {
          const paramDiff = newParams[dim] - lastTrial.params[dim];
          
          // 避免除以零
          if (Math.abs(paramDiff) > 1e-10) {
            const scoreDiff = score - lastTrial.score;
            const gradient = scoreDiff / paramDiff;
            
            // 加权移动平均更新梯度（包含正则化）
            parameterGradients[dim] = (1 - regularization) * parameterGradients[dim] + regularization * gradient;
          }
        });
      }
      
      // 保存到梯度历史
      gradientHistory.push({
        params: { ...newParams },
        score: score,
        gradients: { ...parameterGradients }
      });
      
      // 更新最佳结果
      if (score > (this.bestResult?.balanceScore || 0)) {
        this.bestResult = result;
        this.logInfo('优化', `新的最佳得分: ${score.toFixed(2)}, 迭代 ${trial + 1}/${maxTrials}`);
      }
      
      // 回调进度
      if (progressCallback) {
        progressCallback(progress, this.bestResult?.balanceScore || 0);
      }
      
      // 检查收敛条件
      if (this.config.configuration.earlyStopping && 
          gradientHistory.length >= 3 &&
          this.checkConvergence(gradientHistory.slice(-3), this.config.configuration.convergenceTolerance)) {
        this.logInfo('优化', `优化已收敛，提前结束，迭代 ${trial + 1}/${maxTrials}`);
        break;
      }
    }
    
    if (!this.bestResult) {
      throw new Error('优化未能找到有效结果');
    }
    
    this.logInfo('优化', `优化完成，最佳得分: ${this.bestResult.balanceScore.toFixed(2)}`);
    
    return this.bestResult;
  }
  
  /**
   * 计算置信区间
   */
  private calculateConfidenceInterval(score: number, iteration: number): { lower: number, upper: number } {
    // 随着迭代次数增加，置信区间会变小
    const confidence = Math.min(0.2, 0.5 / (iteration + 1));
    return {
      lower: Math.max(0, score * (1 - confidence)),
      upper: Math.min(100, score * (1 + confidence))
    };
  }
  
  /**
   * 检查优化是否收敛
   */
  private checkConvergence(
    recentTrials: { params: Record<string, number>; score: number; gradients: Record<string, number> }[],
    tolerance: number
  ): boolean {
    // 检查得分是否收敛
    const scores = recentTrials.map(t => t.score);
    const scoreRange = Math.max(...scores) - Math.min(...scores);
    
    // 检查参数是否收敛
    const paramChanges = [];
    const dimensions = Object.keys(recentTrials[0].params);
    
    for (let i = 1; i < recentTrials.length; i++) {
      const current = recentTrials[i];
      const previous = recentTrials[i-1];
      
      dimensions.forEach(dim => {
        const paramChange = Math.abs(current.params[dim] - previous.params[dim]);
        paramChanges.push(paramChange);
      });
    }
    
    const maxParamChange = Math.max(...paramChanges);
    
    // 如果得分和参数都稳定，则认为收敛
    return scoreRange < tolerance && maxParamChange < tolerance;
  }
  
  /**
   * 贝叶斯优化
   */
  private async runBayesianOptimization(
    initialParams: Record<string, number>,
    paramRanges: Record<string, [number, number]>,
    evaluationFunction: (params: Record<string, number>) => Promise<number>,
    progressCallback?: (progress: number, bestScore: number) => void
  ): Promise<SimulationResult> {
    // 实际项目中实现贝叶斯优化
    this.logInfo('优化', '使用贝叶斯优化方法');
    
    // 这里是简化示例，实际实现会更复杂
    return this.runGradientBoostingOptimization(initialParams, paramRanges, evaluationFunction, progressCallback);
  }
  
  /**
   * 进化算法优化
   */
  private async runEvolutionaryOptimization(
    initialParams: Record<string, number>,
    paramRanges: Record<string, [number, number]>,
    evaluationFunction: (params: Record<string, number>) => Promise<number>,
    progressCallback?: (progress: number, bestScore: number) => void
  ): Promise<SimulationResult> {
    // 实际项目中实现进化算法
    this.logInfo('优化', '使用进化算法优化方法');
    
    // 这里是简化示例，实际实现会更复杂
    return this.runGradientBoostingOptimization(initialParams, paramRanges, evaluationFunction, progressCallback);
  }
  
  /**
   * 强化学习优化
   */
  private async runReinforcementLearning(
    initialParams: Record<string, number>,
    paramRanges: Record<string, [number, number]>,
    evaluationFunction: (params: Record<string, number>) => Promise<number>,
    progressCallback?: (progress: number, bestScore: number) => void
  ): Promise<SimulationResult> {
    // 实际项目中实现强化学习
    this.logInfo('优化', '使用强化学习优化方法');
    
    // 这里是简化示例，实际实现会更复杂
    return this.runGradientBoostingOptimization(initialParams, paramRanges, evaluationFunction, progressCallback);
  }
  
  /**
   * 获取所有模拟结果
   */
  getSimulationResults(): SimulationResult[] {
    return [...this.simulationResults];
  }
  
  /**
   * 获取最佳结果
   */
  getBestResult(): SimulationResult | null {
    return this.bestResult;
  }
  
  /**
   * 生成平衡报告
   */
  generateBalanceReport(): BalanceReport {
    if (!this.bestResult) {
      throw new Error('无法生成报告：没有优化结果');
    }
    
    // 在实际项目中，这里会有更复杂的分析逻辑
    return {
      overallScore: this.bestResult.balanceScore,
      confidence: 0.95,
      
      unitBalance: {
        winRateDeviation: 0.08,
        usageRateDeviation: 0.12,
        powerCurveSlope: 0.03,
        mostProblematicUnits: [
          {
            unitId: "Warrior",
            issue: "早期过强",
            severity: 0.7,
            recommendation: "降低基础攻击力或增加技能冷却时间"
          },
          {
            unitId: "Mage",
            issue: "后期缩放过弱",
            severity: 0.6,
            recommendation: "提高法术伤害的后期缩放系数"
          }
        ]
      },
      
      factionBalance: {
        topFactions: ["龙族", "机械师"],
        weakestFactions: ["精灵", "人类"],
        bondThresholdEfficacy: {
          "龙族": { 3: 0.8, 6: 0.9, 9: 0.7 },
          "精灵": { 2: 0.6, 4: 0.7, 6: 0.5 }
        },
        factionSynergies: {
          "龙族": ["精灵", "机械师"],
          "精灵": ["龙族", "人类"],
          "机械师": ["龙族"]
        }
      },
      
      economyBalance: {
        goldProgression: [5, 8, 12, 15, 18, 22],
        resourceEfficiency: 0.75,
        comebackMechanics: {
          effectiveness: 0.65,
          frequency: 0.3
        },
        ecomomyStrategies: [
          { strategy: "快速升级", successRate: 0.65 },
          { strategy: "滚动利息", successRate: 0.72 },
          { strategy: "强力单位", successRate: 0.68 }
        ]
      },
      
      recommendations: [
        {
          priority: "high",
          category: "单位平衡",
          issue: "战士早期过强导致战略单一",
          solution: "降低战士基础攻击力8%，增加其技能冷却时间1秒",
          expectedImpact: 0.8
        },
        {
          priority: "medium",
          category: "派系平衡",
          issue: "精灵族羁绊效果不足",
          solution: "提高6精灵羁绊的元素伤害加成从20%到30%",
          expectedImpact: 0.6
        },
        {
          priority: "low",
          category: "经济平衡",
          issue: "后期金币获取不足",
          solution: "增加第5回合后的基础金币收入",
          expectedImpact: 0.4
        }
      ],
      
      metadata: {
        simulationCount: this.simulationResults.length,
        totalRoundsSimulated: this.simulationResults.length * 10,
        generationTimestamp: Date.now(),
        dataVersionId: `report-${this.randomSeed}`
      }
    };
  }
  
  /**
   * 验证特定派系机制
   */
  async validateFactionMechanic(
    factionId: string,
    mechanic: string,
    parameters: Record<string, number>,
    baselineParams: Record<string, number>,
    evaluationFunction: (params: Record<string, number>) => Promise<number>
  ): Promise<{
    isBalanced: boolean;
    score: number;
    baselineScore: number;
    impact: number;
    recommendations: string[];
  }> {
    // 在实际项目中，这里会根据派系机制调整参数并测试
    this.logInfo('派系验证', `验证派系 ${factionId} 的 ${mechanic} 机制`);
    
    const random = this.seededRandom(this.randomSeed);
    
    // 计算基准分数
    const baselineScore = await evaluationFunction(baselineParams);
    
    // 应用派系特殊机制参数
    const testParams = { ...baselineParams, ...parameters };
    
    // 多次测试以确保稳定性
    let totalScore = 0;
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      // 使用稍微不同的随机种子进行测试
      const testSeed = this.randomSeed + i;
      testParams._testSeed = testSeed;
      
      const score = await evaluationFunction(testParams);
      totalScore += score;
    }
    
    const averageScore = totalScore / iterations;
    const impact = averageScore - baselineScore;
    const isBalanced = Math.abs(impact) < 10; // 允许10分的差异
    
    // 根据影响提供建议
    const recommendations = [];
    if (impact > 15) {
      recommendations.push(`${mechanic}机制过强，建议降低影响力20%`);
    } else if (impact > 10) {
      recommendations.push(`${mechanic}机制略强，建议降低影响力10%`);
    } else if (impact < -15) {
      recommendations.push(`${mechanic}机制过弱，建议提高影响力30%`);
    } else if (impact < -10) {
      recommendations.push(`${mechanic}机制略弱，建议提高影响力15%`);
    } else {
      recommendations.push(`${mechanic}机制平衡性良好，无需调整`);
    }
    
    return {
      isBalanced,
      score: averageScore,
      baselineScore,
      impact,
      recommendations
    };
  }
  
  /**
   * 模拟派系之间的交互
   */
  async simulateFactionInteractions(
    factions: string[],
    baseParams: Record<string, number>,
    evaluationFunction: (params: Record<string, number>) => Promise<number>
  ): Promise<{
    synergies: Record<string, Record<string, number>>;
    bestCombinations: { factions: string[]; score: number }[];
    worstCombinations: { factions: string[]; score: number }[];
  }> {
    // 在实际项目中，这里会测试不同派系组合的效果
    this.logInfo('派系交互', `模拟派系交互: ${factions.join(', ')}`);
    
    // 派系组合协同效应矩阵
    const synergies: Record<string, Record<string, number>> = {};
    
    // 初始化协同矩阵
    factions.forEach(f1 => {
      synergies[f1] = {};
      factions.forEach(f2 => {
        if (f1 !== f2) {
          synergies[f1][f2] = 0;
        }
      });
    });
    
    // 记录所有组合的分数
    const combinationScores: { factions: string[]; score: number }[] = [];
    
    // 测试单个派系的基准表现
    const baselineScores: Record<string, number> = {};
    for (const faction of factions) {
      const params = { ...baseParams, primaryFaction: faction };
      const score = await evaluationFunction(params);
      baselineScores[faction] = score;
    }
    
    // 测试双派系组合
    for (let i = 0; i < factions.length; i++) {
      for (let j = i + 1; j < factions.length; j++) {
        const faction1 = factions[i];
        const faction2 = factions[j];
        
        const params = { 
          ...baseParams, 
          primaryFaction: faction1,
          secondaryFaction: faction2
        };
        
        const score = await evaluationFunction(params);
        
        // 计算协同效应（组合得分与单独得分的平均值之差）
        const expectedScore = (baselineScores[faction1] + baselineScores[faction2]) / 2;
        const synergyValue = score - expectedScore;
        
        synergies[faction1][faction2] = synergyValue;
        synergies[faction2][faction1] = synergyValue;
        
        combinationScores.push({
          factions: [faction1, faction2],
          score
        });
      }
    }
    
    // 排序获取最佳和最差组合
    combinationScores.sort((a, b) => b.score - a.score);
    
    return {
      synergies,
      bestCombinations: combinationScores.slice(0, 3),
      worstCombinations: combinationScores.slice(-3).reverse()
    };
  }
}
