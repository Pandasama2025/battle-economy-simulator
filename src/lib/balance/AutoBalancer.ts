
import { BalanceSimulator } from './BalanceSimulator';
import { SimulationResult, SensitivityAnalysis } from '@/types/balance';

/**
 * 基于贝叶斯优化的自动平衡调整系统
 */
export class AutoBalancer {
  private simulator: BalanceSimulator;
  private optimizationHistory: SimulationResult[] = [];
  private bestParams: Record<string, number> | null = null;
  private bestScore: number = 0;
  private paramSpaceDimensions: string[] = [];
  private isRunning: boolean = false;
  private iterationCallback?: (result: SimulationResult, iteration: number) => void;
  private parallelRuns: number = 1;

  constructor(simulator: BalanceSimulator) {
    this.simulator = simulator;
  }

  /**
   * 设置优化完成后的回调函数
   */
  setIterationCallback(callback: (result: SimulationResult, iteration: number) => void): void {
    this.iterationCallback = callback;
  }

  /**
   * 设置并行运行数量
   */
  setParallelRuns(count: number): void {
    this.parallelRuns = Math.max(1, Math.min(count, 8)); // 限制最大并行数
  }

  /**
   * 使用贝叶斯优化寻找最优参数
   */
  async optimize(
    initialParams: Record<string, number>,
    paramSpace: Record<string, [number, number]>,
    maxIterations: number = 50,
    optimizationStrategy: 'bayesian' | 'evolution' | 'random' = 'bayesian'
  ): Promise<Record<string, number>> {
    if (this.isRunning) {
      throw new Error('优化已在运行中');
    }

    this.isRunning = true;
    this.optimizationHistory = [];
    this.paramSpaceDimensions = Object.keys(paramSpace);
    
    // 设置参数空间
    this.simulator.setParameterSpace(paramSpace);
    
    console.log('开始自动平衡优化过程...');
    console.log(`参数空间: ${JSON.stringify(paramSpace)}`);
    console.log(`最大迭代次数: ${maxIterations}`);
    console.log(`优化策略: ${optimizationStrategy}`);
    console.log(`并行运行数: ${this.parallelRuns}`);

    try {
      // 初始测试 - 评估初始参数
      const initialResult = await this.simulator.runTest(initialParams);
      this.updateBest(initialResult);
      this.optimizationHistory.push(initialResult);
      
      if (this.iterationCallback) {
        this.iterationCallback(initialResult, 0);
      }
      
      // 主优化循环
      for (let i = 0; i < maxIterations && this.isRunning; i += this.parallelRuns) {
        console.log(`优化迭代 ${i+1}/${maxIterations}`);
        
        // 生成并行测试的参数组
        const paramBatch: Record<string, number>[] = [];
        for (let j = 0; j < this.parallelRuns && i + j < maxIterations; j++) {
          // 根据当前历史建议下一组参数
          const nextParams = this.suggestNextParams(
            optimizationStrategy,
            j > 0 ? paramBatch : undefined // 避免同批次参数过于相似
          );
          paramBatch.push(nextParams);
        }
        
        // 并行执行测试
        const testPromises = paramBatch.map(params => this.simulator.runTest(params));
        const results = await Promise.all(testPromises);
        
        // 处理每个结果
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          
          // 更新历史和最佳结果
          this.optimizationHistory.push(result);
          this.updateBest(result);
          
          // 调用迭代回调
          if (this.iterationCallback) {
            this.iterationCallback(result, i + j + 1);
          }
          
          console.log(`迭代 ${i+j+1} 完成，平衡得分: ${result.balanceScore.toFixed(2)}`);
        }
        
        console.log(`当前最佳得分: ${this.bestScore.toFixed(2)}`);
      }
      
      console.log('优化完成!');
      console.log(`最终最佳参数: ${JSON.stringify(this.bestParams)}`);
      console.log(`最终最佳得分: ${this.bestScore.toFixed(2)}`);
      
      return this.bestParams || initialParams;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 停止正在进行的优化
   */
  stop(): void {
    if (this.isRunning) {
      console.log('正在停止优化过程...');
      this.isRunning = false;
    }
  }

  /**
   * 基于当前优化历史建议下一组参数
   * 根据不同策略选择下一组参数
   */
  private suggestNextParams(
    strategy: 'bayesian' | 'evolution' | 'random' = 'bayesian',
    existingBatch?: Record<string, number>[]
  ): Record<string, number> {
    // 根据优化历史选择候选参数
    if (this.optimizationHistory.length <= 1) {
      // 首次迭代，随机生成参数
      return this.generateRandomParams();
    }
    
    switch (strategy) {
      case 'evolution':
        return this.evolveParams(existingBatch);
      case 'random':
        return this.generateRandomParams();
      case 'bayesian':
      default:
        return this.bayesianOptimizationStep(existingBatch);
    }
  }

  /**
   * 贝叶斯优化策略
   */
  private bayesianOptimizationStep(existingBatch?: Record<string, number>[]): Record<string, number> {
    // 选择参数生成策略
    const strategy = Math.random();
    
    if (strategy < 0.3) {
      // 30%概率: 探索 - 随机生成新参数
      return this.generateRandomParams();
    } else if (strategy < 0.7) {
      // 40%概率: 利用 - 基于最佳参数进行小幅改进
      return this.perturbBestParams(existingBatch);
    } else {
      // 30%概率: 混合 - 综合历史结果生成新参数
      return this.recombineHistoricalParams();
    }
  }

  /**
   * 进化算法策略
   */
  private evolveParams(existingBatch?: Record<string, number>[]): Record<string, number> {
    // 按照得分排序优化历史
    const sortedHistory = [...this.optimizationHistory].sort((a, b) => b.balanceScore - a.balanceScore);
    
    // 精英选择: 从前30%的结果中随机选择两个父本
    const elitePoolSize = Math.max(2, Math.floor(sortedHistory.length * 0.3));
    const elitePool = sortedHistory.slice(0, elitePoolSize);
    
    const parent1Index = Math.floor(Math.random() * elitePool.length);
    let parent2Index = Math.floor(Math.random() * elitePool.length);
    while (parent2Index === parent1Index && elitePool.length > 1) {
      parent2Index = Math.floor(Math.random() * elitePool.length);
    }
    
    const parent1 = elitePool[parent1Index].params;
    const parent2 = elitePool[parent2Index].params;
    
    // 创建子代参数
    const childParams: Record<string, number> = {};
    
    this.paramSpaceDimensions.forEach(key => {
      const paramSpace = this.simulator['paramSpace'] as Record<string, [number, number]>;
      
      // 交叉：80%概率从一个父本取值，20%概率取父本平均值
      if (Math.random() < 0.8) {
        childParams[key] = Math.random() < 0.5 ? parent1[key] : parent2[key];
      } else {
        childParams[key] = (parent1[key] + parent2[key]) / 2;
      }
      
      // 变异：10%概率发生变异
      if (Math.random() < 0.1) {
        const [min, max] = paramSpace[key];
        const mutationRange = (max - min) * 0.2; // 变异范围为参数空间的20%
        const mutation = (Math.random() * 2 - 1) * mutationRange;
        childParams[key] += mutation;
        
        // 确保在参数范围内
        childParams[key] = Math.max(min, Math.min(max, childParams[key]));
      }
    });
    
    // 确保与已存在的批次参数不同
    if (existingBatch && existingBatch.length > 0) {
      // 添加一些随机扰动以增加多样性
      this.paramSpaceDimensions.forEach(key => {
        const paramSpace = this.simulator['paramSpace'] as Record<string, [number, number]>;
        const [min, max] = paramSpace[key];
        const perturbation = (Math.random() * 2 - 1) * (max - min) * 0.05;
        childParams[key] += perturbation;
        childParams[key] = Math.max(min, Math.min(max, childParams[key]));
      });
    }
    
    return childParams;
  }

  /**
   * 随机生成参数
   */
  private generateRandomParams(): Record<string, number> {
    const params: Record<string, number> = {};
    
    this.paramSpaceDimensions.forEach(key => {
      const paramSpace = this.simulator['paramSpace'] as Record<string, [number, number]>;
      if (paramSpace[key]) {
        const [min, max] = paramSpace[key];
        params[key] = min + Math.random() * (max - min);
      }
    });
    
    return params;
  }

  /**
   * 在最佳参数基础上添加小幅扰动
   */
  private perturbBestParams(existingBatch?: Record<string, number>[]): Record<string, number> {
    const params: Record<string, number> = {};
    const paramSpace = this.simulator['paramSpace'] as Record<string, [number, number]>;
    
    if (!this.bestParams) {
      return this.generateRandomParams();
    }
    
    // 为每个参数添加小扰动
    this.paramSpaceDimensions.forEach(key => {
      if (this.bestParams && paramSpace[key]) {
        const [min, max] = paramSpace[key];
        const range = max - min;
        
        // 添加最大为参数范围10%的扰动
        const perturbation = (Math.random() * 2 - 1) * range * 0.1;
        let value = (this.bestParams[key] || 0) + perturbation;
        
        // 确保在参数范围内
        value = Math.max(min, Math.min(max, value));
        params[key] = value;
      }
    });
    
    // 如果与已存在的批次参数太相似，增加扰动
    if (existingBatch && this.isTooSimilar(params, existingBatch)) {
      this.paramSpaceDimensions.forEach(key => {
        if (paramSpace[key]) {
          const [min, max] = paramSpace[key];
          const range = max - min;
          const extraPerturbation = (Math.random() * 2 - 1) * range * 0.2;
          params[key] += extraPerturbation;
          params[key] = Math.max(min, Math.min(max, params[key]));
        }
      });
    }
    
    return params;
  }

  /**
   * 检查参数是否与已有批次太相似
   */
  private isTooSimilar(params: Record<string, number>, batch: Record<string, number>[]): boolean {
    const similarityThreshold = 0.05; // 相似度阈值
    
    for (const existingParams of batch) {
      let similarity = 0;
      let count = 0;
      
      for (const key of this.paramSpaceDimensions) {
        if (params[key] !== undefined && existingParams[key] !== undefined) {
          const paramSpace = this.simulator['paramSpace'] as Record<string, [number, number]>;
          const [min, max] = paramSpace[key];
          const range = max - min;
          const diff = Math.abs(params[key] - existingParams[key]) / range;
          similarity += diff;
          count++;
        }
      }
      
      const avgDifference = similarity / count;
      if (avgDifference < similarityThreshold) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 从历史结果中组合参数
   */
  private recombineHistoricalParams(): Record<string, number> {
    const params: Record<string, number> = {};
    const paramSpace = this.simulator['paramSpace'] as Record<string, [number, number]>;
    
    // 计算每个结果的权重，得分越高权重越大
    const totalResults = this.optimizationHistory.length;
    const weights: number[] = this.optimizationHistory.map(
      result => Math.pow(result.balanceScore / 100, 2)
    );
    const sumWeights = weights.reduce((sum, w) => sum + w, 0);
    
    // 为每个参数选择一个历史结果
    this.paramSpaceDimensions.forEach(key => {
      // 按权重随机选择一个历史结果
      let r = Math.random() * sumWeights;
      let selectedIdx = 0;
      
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          selectedIdx = i;
          break;
        }
      }
      
      // 获取选中结果的参数值
      let value = this.optimizationHistory[selectedIdx].params[key];
      
      // 确保在参数范围内
      if (paramSpace[key]) {
        const [min, max] = paramSpace[key];
        value = Math.max(min, Math.min(max, value));
      }
      
      params[key] = value;
    });
    
    return params;
  }

  /**
   * 更新最佳参数
   */
  private updateBest(result: SimulationResult): void {
    if (result.balanceScore > this.bestScore) {
      this.bestScore = result.balanceScore;
      this.bestParams = { ...result.params };
    }
  }

  /**
   * 获取优化历史
   */
  getHistory(): SimulationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * 生成参数影响度报告
   */
  generateSensitivityReport(): SensitivityAnalysis {
    if (this.optimizationHistory.length < 10) {
      throw new Error('需要至少10次优化迭代才能生成影响度报告');
    }
    
    const sensitivity: Record<string, number> = {};
    const paramCorrelations: Record<string, number[]> = {};
    
    // 初始化相关性数组
    this.paramSpaceDimensions.forEach(param => {
      paramCorrelations[param] = [];
    });
    
    // 计算每个参数变化与分数变化的相关性
    for (let i = 1; i < this.optimizationHistory.length; i++) {
      const prev = this.optimizationHistory[i-1];
      const curr = this.optimizationHistory[i];
      
      const scoreDiff = curr.balanceScore - prev.balanceScore;
      
      this.paramSpaceDimensions.forEach(param => {
        if (prev.params[param] !== undefined && curr.params[param] !== undefined) {
          const paramDiff = curr.params[param] - prev.params[param];
          
          // 避免除以零
          if (Math.abs(paramDiff) > 1e-6) {
            // 参数变化率与分数变化的相关性
            const correlation = scoreDiff / paramDiff;
            paramCorrelations[param].push(correlation);
          }
        }
      });
    }
    
    // 计算平均相关性的绝对值作为敏感度
    this.paramSpaceDimensions.forEach(param => {
      const correlations = paramCorrelations[param];
      if (correlations.length > 0) {
        // 使用平均绝对相关性
        const avgCorrelation = correlations.reduce(
          (sum, value) => sum + Math.abs(value), 
          0
        ) / correlations.length;
        
        sensitivity[param] = avgCorrelation;
      } else {
        sensitivity[param] = 0;
      }
    });
    
    // 按敏感度排序参数
    const rankedParameters = Object.keys(sensitivity).sort(
      (a, b) => sensitivity[b] - sensitivity[a]
    );
    
    return {
      parameters: sensitivity,
      rankedParameters,
      metadata: {
        sampleSize: this.optimizationHistory.length,
        timestamp: Date.now(),
        method: 'correlation-analysis'
      }
    };
  }

  /**
   * 生成参数影响力热力图数据
   */
  async generateParameterHeatmap(
    topParameters: number = 2
  ): Promise<Record<string, any>> {
    if (this.optimizationHistory.length < 10) {
      throw new Error('需要至少10次优化迭代才能生成热力图数据');
    }
    
    // 生成敏感度报告
    const sensitivityReport = this.generateSensitivityReport();
    
    // 选择影响最大的两个参数
    const parameters = sensitivityReport.rankedParameters.slice(0, Math.min(topParameters, 2));
    
    // 如果能找到最佳参数，则以它为基础
    const baseParams = this.bestParams || this.optimizationHistory[0].params;
    
    // 使用平衡模拟器生成热力图数据
    return await this.simulator.generateSensitivityHeatmap(baseParams, parameters);
  }

  /**
   * 生成参数平行坐标图数据
   */
  generateParallelCoordinatesData(): Record<string, any> {
    if (this.optimizationHistory.length < 5) {
      throw new Error('需要至少5次优化迭代才能生成平行坐标图');
    }
    
    // 选择分数最高的20%结果和分数最低的20%结果进行对比
    const sortedHistory = [...this.optimizationHistory]
      .sort((a, b) => b.balanceScore - a.balanceScore);
    
    const topCount = Math.max(1, Math.floor(sortedHistory.length * 0.2));
    const topResults = sortedHistory.slice(0, topCount);
    const bottomResults = sortedHistory.slice(-topCount);
    
    // 提取参数域范围
    const domains: Record<string, [number, number]> = {};
    this.paramSpaceDimensions.forEach(param => {
      let min = Infinity;
      let max = -Infinity;
      
      this.optimizationHistory.forEach(result => {
        if (result.params[param] !== undefined) {
          min = Math.min(min, result.params[param]);
          max = Math.max(max, result.params[param]);
        }
      });
      
      domains[param] = [min, max];
    });
    
    return {
      dimensions: this.paramSpaceDimensions,
      domains,
      topResults: topResults.map(result => ({
        ...result.params,
        balanceScore: result.balanceScore,
        category: 'top'
      })),
      bottomResults: bottomResults.map(result => ({
        ...result.params,
        balanceScore: result.balanceScore,
        category: 'bottom'
      }))
    };
  }

  /**
   * 生成单位克制关系优化建议
   */
  generateCounterRelationshipSuggestions(): Record<string, any> {
    if (!this.bestParams || this.optimizationHistory.length < 10) {
      throw new Error('需要至少10次优化迭代和有效的最佳参数才能生成单位克制建议');
    }
    
    // 基于最佳参数的克制系数
    const counterMultiplier = this.bestParams.counterMultiplier || 1.5;
    
    // 典型的单位类型
    const unitTypes = ['Warrior', 'Mage', 'Archer', 'Knight', 'Priest', 'Assassin', 'Merchant'];
    
    // 生成优化后的三角克制关系
    const optimizedCounters: Record<string, string[]> = {
      'Warrior': ['Mage'],
      'Mage': ['Archer'],
      'Archer': ['Warrior'],
      'Knight': ['Assassin'],
      'Assassin': ['Priest'],
      'Priest': ['Merchant'],
      'Merchant': ['Knight']
    };
    
    // 基于敏感度分析调整克制强度
    const sensitivity = this.generateSensitivityReport();
    const counterStrength: Record<string, number> = {};
    
    unitTypes.forEach(unit => {
      // 基础克制系数
      counterStrength[unit] = counterMultiplier;
      
      // 根据参数敏感度微调克制系数
      if (sensitivity.parameters.counterMultiplier) {
        const adjustment = (sensitivity.parameters.counterMultiplier / 10) * (Math.random() * 0.4 - 0.2);
        counterStrength[unit] += adjustment;
      }
      
      // 确保在合理范围内
      counterStrength[unit] = Math.max(1.2, Math.min(2.0, counterStrength[unit]));
    });
    
    return {
      counterRelationships: optimizedCounters,
      counterStrengths: counterStrength,
      balanceScore: this.bestScore,
      recommendations: [
        `现有三角克制基础系数 ${counterMultiplier.toFixed(2)} 已具有良好平衡性`,
        `建议战士克制法师系数设为 ${counterStrength['Warrior'].toFixed(2)}`,
        `建议法师克制弓箭手系数设为 ${counterStrength['Mage'].toFixed(2)}`,
        `建议弓箭手克制战士系数设为 ${counterStrength['Archer'].toFixed(2)}`
      ]
    };
  }
}
