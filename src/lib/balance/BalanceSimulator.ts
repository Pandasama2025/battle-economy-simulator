
import { BattleConfiguration } from '@/types/battle';
import { EconomyConfiguration } from '@/types/economy';
import { generateSobolSequence } from './sampling/SobolSequence';
import { SimulationResult } from '@/types/balance';

/**
 * 平衡模拟器 - 用于测试不同参数组合的平衡性
 */
export class BalanceSimulator {
  private paramSpace: Record<string, [number, number]> = {};
  private battleConfig: BattleConfiguration;
  private economyConfig: any;

  constructor(battleConfig: BattleConfiguration, economyConfig: any) {
    this.battleConfig = { ...battleConfig };
    this.economyConfig = { ...economyConfig };
    
    // 初始化默认参数空间
    this.paramSpace = {
      'physicalDefense': [0.01, 0.05],
      'magicResistance': [0.01, 0.04],
      'criticalRate': [0.1, 0.2],
      'healingEfficiency': [0.8, 1.2],
      'goldScaling': [0.9, 1.5],
      'interestRate': [0.05, 0.15]
    };
  }

  /**
   * 更新参数空间定义
   */
  setParameterSpace(paramSpace: Record<string, [number, number]>): void {
    this.paramSpace = { ...paramSpace };
  }

  /**
   * 批量测试不同参数组合
   */
  async batchTest(scenarios: number = 100): Promise<SimulationResult[]> {
    console.log(`开始批量测试 ${scenarios} 个参数组合`);
    
    // 生成Sobol序列以均匀采样参数空间
    const paramSets = generateSobolSequence(this.paramSpace, scenarios);
    const results: SimulationResult[] = [];

    for (let i = 0; i < paramSets.length; i++) {
      const params = paramSets[i];
      const result = await this.runTest(params);
      results.push(result);
      
      // 每10个场景记录一次进度
      if (i % 10 === 0) {
        console.log(`已完成 ${i}/${scenarios} 个模拟 (${Math.round(i/scenarios*100)}%)`);
      }
    }

    return results;
  }

  /**
   * 运行单次测试
   */
  async runTest(params: Record<string, number>): Promise<SimulationResult> {
    // 应用参数到配置
    const testBattleConfig = this.applyBattleParams(params);
    const testEconomyConfig = this.applyEconomyParams(params);
    
    // TODO: 实际运行模拟，这里简单模拟一下结果
    const winRates: Record<string, number> = {};
    const unitTypes = ['Warrior', 'Mage', 'Archer', 'Knight', 'Priest', 'Assassin', 'Merchant'];
    unitTypes.forEach(type => {
      // 为每个单位生成一个模拟的胜率，加入一些与参数相关的变化
      let rate = 0.5; // 基准胜率50%
      
      // 根据不同参数调整胜率
      if (type === 'Warrior') rate += params.physicalDefense * 2;
      if (type === 'Mage') rate += params.magicResistance * -3;
      if (type === 'Priest') rate += params.healingEfficiency * 0.2 - 0.1;
      
      // 添加一些随机性
      rate += (Math.random() - 0.5) * 0.1;
      
      // 确保胜率在合理范围内
      winRates[type] = Math.max(0.1, Math.min(0.9, rate));
    });
    
    // 计算经济指标
    const economyMetrics = {
      goldEfficiency: 0.7 + params.goldScaling * 0.2,
      itemUtilization: 0.6 + params.interestRate * 1.5,
      resourceBalance: Math.abs(0.5 - params.interestRate),
    };
    
    // 计算平衡性得分
    const balanceScore = this.evaluateBalance(winRates, economyMetrics);
    
    return {
      params,
      winRates,
      economyMetrics,
      balanceScore,
      metadata: {
        timestamp: Date.now(),
        configId: Math.random().toString(36).substring(2, 9)
      }
    };
  }

  /**
   * 应用参数到战斗配置
   */
  private applyBattleParams(params: Record<string, number>): BattleConfiguration {
    const config = { ...this.battleConfig };
    
    // 应用战斗相关参数
    if (params.physicalDefense !== undefined) {
      config.combatParameters.physicalDefense = params.physicalDefense;
    }
    if (params.magicResistance !== undefined) {
      config.combatParameters.magicResistance = params.magicResistance;
    }
    if (params.criticalRate !== undefined) {
      config.combatParameters.criticalRate = params.criticalRate;
    }
    if (params.healingEfficiency !== undefined) {
      config.combatParameters.healingEfficiency = params.healingEfficiency;
    }
    
    return config;
  }

  /**
   * 应用参数到经济配置
   */
  private applyEconomyParams(params: Record<string, number>): any {
    const config = { ...this.economyConfig };
    
    // 应用经济相关参数
    if (params.goldScaling !== undefined) {
      config.goldScaling = params.goldScaling;
    }
    if (params.interestRate !== undefined) {
      config.interestRate = params.interestRate;
    }
    
    return config;
  }

  /**
   * 评估平衡性得分
   */
  private evaluateBalance(
    winRates: Record<string, number>, 
    economyMetrics: Record<string, number>
  ): number {
    // 计算胜率偏差 - 理想情况下所有单位胜率接近0.5
    const winRateValues = Object.values(winRates);
    const winRateDeviation = winRateValues.reduce(
      (sum, rate) => sum + Math.pow(rate - 0.5, 2), 
      0
    ) / winRateValues.length;
    
    // 计算经济指标平衡性
    const economyBalance = (
      economyMetrics.goldEfficiency * 0.4 + 
      economyMetrics.itemUtilization * 0.4 +
      (1 - economyMetrics.resourceBalance) * 0.2
    );
    
    // 综合评分 (0-100)
    const score = (
      (1 - winRateDeviation * 10) * 60 + // 胜率平衡占60%
      economyBalance * 40                // 经济平衡占40%
    );
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 生成蒙特卡洛模拟
   */
  async monteCarloSimulation(
    baseParams: Record<string, number>, 
    iterations: number = 100,
    variationFactor: number = 0.1
  ): Promise<SimulationResult[]> {
    const results: SimulationResult[] = [];
    
    for (let i = 0; i < iterations; i++) {
      // 生成带随机扰动的参数
      const perturbedParams: Record<string, number> = {};
      
      for (const [key, value] of Object.entries(baseParams)) {
        // 添加随机扰动，最大为基础值的variationFactor倍
        const perturbation = (Math.random() * 2 - 1) * value * variationFactor;
        perturbedParams[key] = value + perturbation;
        
        // 确保参数在允许范围内
        if (this.paramSpace[key]) {
          const [min, max] = this.paramSpace[key];
          perturbedParams[key] = Math.max(min, Math.min(max, perturbedParams[key]));
        }
      }
      
      // 运行模拟并收集结果
      const result = await this.runTest(perturbedParams);
      results.push(result);
    }
    
    return results;
  }
}
