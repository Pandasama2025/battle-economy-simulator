
import { BalanceSimulator } from './BalanceSimulator';
import { SimulationResult } from '@/types/balance';

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
   * 使用贝叶斯优化寻找最优参数
   */
  async optimize(
    initialParams: Record<string, number>,
    paramSpace: Record<string, [number, number]>,
    maxIterations: number = 50,
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

    try {
      // 初始测试 - 评估初始参数
      const initialResult = await this.simulator.runTest(initialParams);
      this.updateBest(initialResult);
      this.optimizationHistory.push(initialResult);
      
      if (this.iterationCallback) {
        this.iterationCallback(initialResult, 0);
      }
      
      // 主优化循环
      for (let i = 0; i < maxIterations && this.isRunning; i++) {
        console.log(`优化迭代 ${i+1}/${maxIterations}`);
        
        // 根据当前历史建议下一组参数
        const nextParams = this.suggestNextParams();
        
        // 测试新参数
        const result = await this.simulator.runTest(nextParams);
        
        // 更新历史和最佳结果
        this.optimizationHistory.push(result);
        this.updateBest(result);
        
        // 调用迭代回调
        if (this.iterationCallback) {
          this.iterationCallback(result, i + 1);
        }
        
        console.log(`迭代 ${i+1} 完成，平衡得分: ${result.balanceScore.toFixed(2)}`);
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
   * 这是一个简化版的贝叶斯优化算法
   */
  private suggestNextParams(): Record<string, number> {
    // 根据优化历史选择候选参数
    if (this.optimizationHistory.length <= 1) {
      // 首次迭代，随机生成参数
      return this.generateRandomParams();
    }
    
    // 选择参数生成策略
    const strategy = Math.random();
    
    if (strategy < 0.3) {
      // 30%概率: 探索 - 随机生成新参数
      return this.generateRandomParams();
    } else if (strategy < 0.7) {
      // 40%概率: 利用 - 基于最佳参数进行小幅改进
      return this.perturbBestParams();
    } else {
      // 30%概率: 混合 - 综合历史结果生成新参数
      return this.recombineHistoricalParams();
    }
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
  private perturbBestParams(): Record<string, number> {
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
    
    return params;
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
  generateSensitivityReport(): Record<string, number> {
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
    
    return sensitivity;
  }
}
