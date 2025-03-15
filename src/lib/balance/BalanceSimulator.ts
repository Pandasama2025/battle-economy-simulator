
import { BattleConfiguration } from '@/types/battle';
import { EconomyConfiguration } from '@/types/economy';
import { generateSobolSequence, generateLatinHypercubeSampling } from './sampling/SobolSequence';
import { SimulationResult, UnitEcosystem, SkillSynergy } from '@/types/balance';

/**
 * 平衡模拟器 - 用于测试不同参数组合的平衡性
 */
export class BalanceSimulator {
  private paramSpace: Record<string, [number, number]> = {};
  private battleConfig: BattleConfiguration;
  private economyConfig: EconomyConfiguration;
  private unitEcosystem?: UnitEcosystem;
  private skillSynergy?: SkillSynergy;
  
  constructor(battleConfig: BattleConfiguration, economyConfig: EconomyConfiguration) {
    this.battleConfig = { ...battleConfig };
    this.economyConfig = { ...economyConfig };
    
    // 初始化默认参数空间 - 包含新的经济和战斗参数
    this.paramSpace = {
      // 战斗系统参数
      'physicalDefense': [0.01, 0.05],
      'magicResistance': [0.01, 0.04],
      'criticalRate': [0.1, 0.2],
      'healingEfficiency': [0.8, 1.2],
      
      // 经济系统参数
      'goldScaling': [0.9, 1.5],
      'interestRate': [0.05, 0.15],
      'unitCost': [2, 5],
      'sellingReturn': [0.5, 0.8],
      
      // 单位生态链参数
      'counterMultiplier': [1.2, 2.0],
      'comboDecayRate': [0.05, 0.3],
      
      // 羁绊与技能系统参数
      'bondBonus': [0.1, 0.3],
      'elementalReactionMultiplier': [1.1, 1.8],
    };
  }

  /**
   * 更新参数空间定义
   */
  setParameterSpace(paramSpace: Record<string, [number, number]>): void {
    this.paramSpace = { ...paramSpace };
  }

  /**
   * 设置单位生态链配置
   */
  setUnitEcosystem(ecosystem: UnitEcosystem): void {
    this.unitEcosystem = ecosystem;
  }

  /**
   * 设置技能连携配置
   */
  setSkillSynergy(synergy: SkillSynergy): void {
    this.skillSynergy = synergy;
  }

  /**
   * 批量测试不同参数组合
   * @param scenarios 场景数量
   * @param samplingMethod 采样方法 ('sobol' | 'latin' | 'random')
   */
  async batchTest(
    scenarios: number = 100, 
    samplingMethod: 'sobol' | 'latin' | 'random' = 'sobol'
  ): Promise<SimulationResult[]> {
    console.log(`开始批量测试 ${scenarios} 个参数组合，采样方法: ${samplingMethod}`);
    
    // 根据选择的方法生成参数集
    let paramSets: Record<string, number>[];
    
    switch (samplingMethod) {
      case 'latin':
        paramSets = generateLatinHypercubeSampling(this.paramSpace, scenarios);
        break;
      case 'random':
        paramSets = this.generateRandomSamples(scenarios);
        break;
      case 'sobol':
      default:
        paramSets = generateSobolSequence(this.paramSpace, scenarios);
        break;
    }
    
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
   * 随机采样生成参数集
   */
  private generateRandomSamples(numSamples: number): Record<string, number>[] {
    const results: Record<string, number>[] = [];
    const dimensions = Object.keys(this.paramSpace);
    
    for (let i = 0; i < numSamples; i++) {
      const sample: Record<string, number> = {};
      
      for (const dimension of dimensions) {
        const [min, max] = this.paramSpace[dimension];
        sample[dimension] = min + Math.random() * (max - min);
      }
      
      results.push(sample);
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
    
    // 模拟羁绊和克制关系
    const bondEffects = this.simulateBondEffects(params);
    const counterEffects = this.simulateCounterEffects(params);
    
    // 单位胜率模拟
    const winRates: Record<string, number> = {};
    const unitTypes = ['Warrior', 'Mage', 'Archer', 'Knight', 'Priest', 'Assassin', 'Merchant'];
    unitTypes.forEach(type => {
      // 为每个单位生成一个模拟的胜率，加入一些与参数相关的变化
      let rate = 0.5; // 基准胜率50%
      
      // 根据不同参数调整胜率
      if (type === 'Warrior') rate += params.physicalDefense * 2;
      if (type === 'Mage') rate += params.magicResistance * -3;
      if (type === 'Archer') rate += params.criticalRate * 1.5;
      if (type === 'Priest') rate += params.healingEfficiency * 0.2 - 0.1;
      
      // 应用单位克制关系影响
      if (counterEffects[type]) {
        rate += counterEffects[type];
      }
      
      // 应用羁绊效果影响
      if (bondEffects[type]) {
        rate += bondEffects[type];
      }
      
      // 添加一些随机性
      rate += (Math.random() - 0.5) * 0.1;
      
      // 确保胜率在合理范围内
      winRates[type] = Math.max(0.1, Math.min(0.9, rate));
    });
    
    // 计算经济指标
    const economyMetrics = this.calculateEconomyMetrics(params, winRates);
    
    // 计算平衡性得分
    const balanceScore = this.evaluateBalance(winRates, economyMetrics, counterEffects, bondEffects);
    
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
   * 模拟羁绊效果
   */
  private simulateBondEffects(params: Record<string, number>): Record<string, number> {
    const effects: Record<string, number> = {};
    
    // 如果没有设置技能连携配置，则不计算羁绊效果
    if (!this.skillSynergy) return effects;
    
    // 羁绊加成系数
    const bondBonus = params.bondBonus || 0.15;
    
    // 模拟常见羁绊组合的影响
    const bonds = [
      { name: '连击', units: ['Assassin', 'Archer'], boost: bondBonus * 1.2 },
      { name: '屏护', units: ['Warrior', 'Knight'], boost: bondBonus * 1.1 },
      { name: '赐福', units: ['Priest', 'Mage'], boost: bondBonus * 1.3 },
      { name: '庇佑', units: ['Knight', 'Priest'], boost: bondBonus * 1.0 },
      { name: '贯穿', units: ['Archer', 'Warrior'], boost: bondBonus * 1.2 },
    ];
    
    // 随机选择2-3个羁绊进行模拟
    const selectedBonds = bonds.slice(0, Math.floor(Math.random() * 2) + 2);
    
    selectedBonds.forEach(bond => {
      bond.units.forEach(unit => {
        if (!effects[unit]) effects[unit] = 0;
        effects[unit] += bond.boost * 0.05; // 转化为胜率影响
      });
    });
    
    return effects;
  }

  /**
   * 模拟单位克制关系
   */
  private simulateCounterEffects(params: Record<string, number>): Record<string, number> {
    const effects: Record<string, number> = {};
    
    // 如果没有设置单位生态链配置，则使用默认的三角克制
    const counterMultiplier = params.counterMultiplier || 1.5;
    
    // 默认三角克制关系: 战士→法师→弓箭手→战士
    const defaultCounters = {
      'Warrior': ['Mage'],
      'Mage': ['Archer'],
      'Archer': ['Warrior'],
      'Knight': ['Assassin'],
      'Assassin': ['Priest'],
      'Priest': ['Merchant'],
      'Merchant': ['Knight']
    };
    
    // 计算克制带来的胜率影响
    Object.entries(defaultCounters).forEach(([unit, countered]) => {
      effects[unit] = 0;
      
      countered.forEach(target => {
        // 克制关系会提升自身胜率
        effects[unit] += (counterMultiplier - 1) * 0.1;
        
        // 如果存在对应的被克制单位，也会降低其胜率
        if (!effects[target]) effects[target] = 0;
        effects[target] -= (counterMultiplier - 1) * 0.05;
      });
    });
    
    return effects;
  }

  /**
   * 计算经济指标
   */
  private calculateEconomyMetrics(params: Record<string, number>, winRates: Record<string, number>): Record<string, number> {
    // 基础经济指标
    const metrics: Record<string, number> = {
      goldEfficiency: 0.7 + (params.goldScaling || 1.0) * 0.2,
      itemUtilization: 0.6 + (params.interestRate || 0.1) * 1.5,
      resourceBalance: Math.abs(0.5 - (params.interestRate || 0.1)),
      unitEconomy: 0.5 + (params.unitCost || 3) * 0.05,
      marketDynamics: 0.7 + (params.sellingReturn || 0.7) * 0.2,
    };
    
    // 羁绊和利息系统的经济影响
    if (params.bondBonus) {
      metrics['synergisticValue'] = 0.6 + params.bondBonus * 1.2;
    }
    
    // 单位胜率对经济的影响
    const avgWinRate = Object.values(winRates).reduce((sum, rate) => sum + rate, 0) / Object.values(winRates).length;
    metrics['victoryDividend'] = avgWinRate * 1.5;
    
    return metrics;
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
  private applyEconomyParams(params: Record<string, number>): EconomyConfiguration {
    const config = { ...this.economyConfig };
    
    // 应用经济相关参数
    if (params.goldScaling !== undefined) {
      config.goldScaling = params.goldScaling;
    }
    if (params.interestRate !== undefined) {
      config.interestRate = params.interestRate;
    }
    if (params.unitCost !== undefined) {
      config.unitCost = params.unitCost;
    }
    if (params.sellingReturn !== undefined) {
      config.sellingReturn = params.sellingReturn;
    }
    
    return config;
  }

  /**
   * 评估平衡性得分
   */
  private evaluateBalance(
    winRates: Record<string, number>, 
    economyMetrics: Record<string, number>,
    counterEffects: Record<string, number>,
    bondEffects: Record<string, number>
  ): number {
    // 计算胜率偏差 - 理想情况下所有单位胜率接近0.5
    const winRateValues = Object.values(winRates);
    const winRateDeviation = winRateValues.reduce(
      (sum, rate) => sum + Math.pow(rate - 0.5, 2), 
      0
    ) / winRateValues.length;
    
    // 计算经济指标平衡性
    const economyBalance = (
      economyMetrics.goldEfficiency * 0.3 + 
      economyMetrics.itemUtilization * 0.3 +
      (1 - economyMetrics.resourceBalance) * 0.2 +
      (economyMetrics.unitEconomy || 0) * 0.1 +
      (economyMetrics.marketDynamics || 0) * 0.1
    );
    
    // 评估克制系统平衡性 - 不应过强也不应过弱
    const counterEffectValues = Object.values(counterEffects);
    const counterBalanceScore = counterEffectValues.length > 0
      ? 1 - Math.sqrt(counterEffectValues.reduce((sum, effect) => sum + Math.pow(effect, 2), 0) / counterEffectValues.length) * 2
      : 0.5;
    
    // 评估羁绊系统平衡性
    const bondEffectValues = Object.values(bondEffects);
    const bondBalanceScore = bondEffectValues.length > 0
      ? 1 - Math.sqrt(bondEffectValues.reduce((sum, effect) => sum + Math.pow(effect, 2), 0) / bondEffectValues.length) * 3
      : 0.5;
    
    // 综合评分 (0-100)
    const score = (
      (1 - winRateDeviation * 10) * 50 + // 胜率平衡占50%
      economyBalance * 30 +              // 经济平衡占30%
      counterBalanceScore * 10 +         // 克制系统平衡占10%
      bondBalanceScore * 10              // 羁绊系统平衡占10%
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
      
      // 每10次迭代记录一次进度
      if (i % 10 === 0) {
        console.log(`蒙特卡洛模拟: 已完成 ${i}/${iterations} (${Math.round(i/iterations*100)}%)`);
      }
    }
    
    return results;
  }

  /**
   * 生成参数灵敏度热力图数据
   */
  async generateSensitivityHeatmap(
    baseParams: Record<string, number>,
    parameters: string[] = [],
    steps: number = 10
  ): Promise<Record<string, any>> {
    // 如果未指定参数，则使用所有参数
    if (parameters.length === 0) {
      parameters = Object.keys(this.paramSpace);
    }
    
    // 限制最多分析两个参数，以便于可视化
    if (parameters.length > 2) {
      parameters = parameters.slice(0, 2);
    }
    
    const heatmapData: any = {
      parameters: parameters,
      values: [],
      min: 100,
      max: 0
    };
    
    // 单参数分析
    if (parameters.length === 1) {
      const param = parameters[0];
      const [min, max] = this.paramSpace[param];
      const step = (max - min) / steps;
      
      for (let i = 0; i <= steps; i++) {
        const testParams = { ...baseParams };
        testParams[param] = min + i * step;
        
        const result = await this.runTest(testParams);
        heatmapData.values.push({
          [param]: testParams[param],
          balanceScore: result.balanceScore
        });
        
        heatmapData.min = Math.min(heatmapData.min, result.balanceScore);
        heatmapData.max = Math.max(heatmapData.max, result.balanceScore);
      }
    } 
    // 双参数分析
    else if (parameters.length === 2) {
      const [param1, param2] = parameters;
      const [min1, max1] = this.paramSpace[param1];
      const [min2, max2] = this.paramSpace[param2];
      const step1 = (max1 - min1) / steps;
      const step2 = (max2 - min2) / steps;
      
      const grid: number[][] = [];
      
      for (let i = 0; i <= steps; i++) {
        grid[i] = [];
        for (let j = 0; j <= steps; j++) {
          const testParams = { ...baseParams };
          testParams[param1] = min1 + i * step1;
          testParams[param2] = min2 + j * step2;
          
          const result = await this.runTest(testParams);
          grid[i][j] = result.balanceScore;
          
          heatmapData.min = Math.min(heatmapData.min, result.balanceScore);
          heatmapData.max = Math.max(heatmapData.max, result.balanceScore);
        }
      }
      
      heatmapData.grid = grid;
      heatmapData.xAxis = Array.from({ length: steps + 1 }, (_, i) => min1 + i * step1);
      heatmapData.yAxis = Array.from({ length: steps + 1 }, (_, i) => min2 + i * step2);
    }
    
    return heatmapData;
  }
}
